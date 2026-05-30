import "server-only";

import dns from "node:dns";
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

dns.setDefaultResultOrder?.("ipv4first");

const RETRYABLE_NETWORK_CODES = new Set([
  "ABORT_ERR",
  "EAI_AGAIN",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

const DB_FETCH_TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasRetryableNetworkError(error) {
  const errors = collectNestedErrors(error);

  return errors.some((currentError) => {
    const message = String(currentError?.message ?? "").toLowerCase();

    return (
      RETRYABLE_NETWORK_CODES.has(currentError?.code) ||
      message.includes("fetch failed") ||
      message.includes("network") ||
      message.includes("timeout")
    );
  });
}

function hasDnsResolutionError(error) {
  const errors = collectNestedErrors(error);

  return errors.some((currentError) => {
    return currentError?.code === "EAI_AGAIN";
  });
}

function collectNestedErrors(error) {
  if (!error) {
    return [];
  }

  const nestedErrors = [];
  const pendingErrors = [error];

  while (pendingErrors.length > 0) {
    const currentError = pendingErrors.pop();

    if (!currentError) {
      continue;
    }

    nestedErrors.push(currentError);

    if (currentError.cause) {
      pendingErrors.push(currentError.cause);
    }

    if (Array.isArray(currentError.errors)) {
      pendingErrors.push(...currentError.errors);
    }
  }

  return nestedErrors;
}

function isReadOnlySql(sql) {
  const normalizedSql = sql.trim().toLowerCase();

  return (
    normalizedSql.startsWith("select") ||
    normalizedSql.startsWith("with") ||
    normalizedSql.startsWith("show") ||
    normalizedSql.startsWith("explain")
  );
}

function isReadOnlyNeonRequest(init) {
  if (typeof init?.body !== "string") {
    return false;
  }

  try {
    const body = JSON.parse(init.body);
    let queries = [body];

    if (Array.isArray(body)) {
      queries = body;
    }

    if (Array.isArray(body.queries)) {
      queries = body.queries;
    }

    return queries.every((query) => {
      const sql = typeof query === "string" ? query : query.query ?? query.sql ?? "";

      return isReadOnlySql(sql);
    });
  } catch {
    return false;
  }
}

neonConfig.fetchFunction = async (input, init) => {
  const canRetry = isReadOnlyNeonRequest(init);
  let maxAttempts = 2;

  if (canRetry) {
    maxAttempts = 5;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const requestInit = {
        ...init,
      };

      if (
        !requestInit.signal &&
        typeof AbortSignal !== "undefined" &&
        AbortSignal.timeout
      ) {
        requestInit.signal = AbortSignal.timeout(DB_FETCH_TIMEOUT_MS);
      }

      return await fetch(input, requestInit);
    } catch (error) {
      const canRetryThisError =
        hasRetryableNetworkError(error) &&
        (canRetry || hasDnsResolutionError(error));

      if (attempt === maxAttempts || !canRetryThisError) {
        throw error;
      }

      await sleep(300 * attempt);
    }
  }
};

export const db = drizzle(process.env.DATABASE_URL);
