import "server-only";

export function parseAiJson(rawText) {
  if (typeof rawText !== "string") {
    throw new Error("AI response was not text.");
  }

  let cleanedText = rawText.trim();

  if (cleanedText.toLowerCase().startsWith("```json")) {
    cleanedText = cleanedText.replace(/^```json\s*/i, "");
  }

  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/^```\s*/, "");
  }

  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.slice(0, -3);
  }

  cleanedText = cleanedText.trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse AI JSON:", error);
    throw new Error("AI did not return valid JSON.");
  }
}
