import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const knownSectionTitles = [
  "Overview",
  "Learning Objectives",
  "Core Concepts",
  "Step-by-Step Explanation",
  "Practical Examples",
  "Common Mistakes",
  "Real-World Application",
  "Practice Tasks",
  "Quick Self-Test",
  "Summary",
];

const knownSectionTitleParts = [
  "overview",
  "learning objective",
  "learning objectives",
  "objective",
  "objectives",
  "core concept",
  "core concepts",
  "step-by-step",
  "step by step",
  "practical example",
  "practical examples",
  "common mistake",
  "common mistakes",
  "real-world",
  "real world",
  "practice task",
  "practice tasks",
  "quick self-test",
  "self-test",
  "self test",
  "summary",
  "introduction",
  "conclusion",
];

function getSafeContent(content) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!content) {
    return "";
  }

  return String(content).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFlexibleTitlePattern(title) {
  const titleParts = title.split(/[\s-]+/);
  const escapedParts = titleParts.map((part) => {
    return escapeRegExp(part);
  });

  return escapedParts.join("[\\s-]+");
}

function normalizeChapterContent(content) {
  let normalizedContent = getSafeContent(content);
  normalizedContent = normalizedContent.replace(/\r\n/g, "\n");
  normalizedContent = normalizedContent.replace(/\u00a0/g, " ");

  for (const title of knownSectionTitles) {
    const titlePattern = getFlexibleTitlePattern(title);
    const headingRegex = new RegExp(
      `(^|\\s)((\\d{1,2})[.)]\\s+${titlePattern})(?=\\s|:|\\n|$)`,
      "gi"
    );

    normalizedContent = normalizedContent.replace(
      headingRegex,
      (match, prefix, heading) => {
        if (!prefix) {
          return heading;
        }

        if (prefix.includes("\n")) {
          return `${prefix}${heading}`;
        }

        return `${prefix}\n\n${heading}`;
      }
    );
  }

  normalizedContent = normalizedContent.replace(/([:.])\s+([-*\u2022])\s+/g, "$1\n$2 ");
  normalizedContent = normalizedContent.replace(/\n{3,}/g, "\n\n");

  return normalizedContent.trim();
}

function cleanSectionTitle(title) {
  let cleanTitle = title.trim();
  cleanTitle = cleanTitle.replace(/^#+\s*/, "");
  cleanTitle = cleanTitle.replace(/^\*\*/, "");
  cleanTitle = cleanTitle.replace(/\*\*$/, "");
  cleanTitle = cleanTitle.trim();

  if (cleanTitle.endsWith(":")) {
    cleanTitle = cleanTitle.slice(0, -1).trim();
  }

  return cleanTitle;
}

function isLikelySectionHeading(title) {
  const cleanTitle = cleanSectionTitle(title);
  const lowerTitle = cleanTitle.toLowerCase();
  const words = cleanTitle.split(/\s+/);

  if (!cleanTitle) {
    return false;
  }

  if (cleanTitle.length > 90) {
    return false;
  }

  if (cleanTitle.endsWith(".")) {
    return false;
  }

  if (words.length > 8) {
    return false;
  }

  for (const titlePart of knownSectionTitleParts) {
    if (lowerTitle === titlePart) {
      return true;
    }

    if (lowerTitle.startsWith(`${titlePart} `)) {
      return true;
    }
  }

  return false;
}

function getKnownHeadingFromLine(line) {
  for (const title of knownSectionTitles) {
    const titlePattern = getFlexibleTitlePattern(title);
    const headingRegex = new RegExp(
      `^\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?(\\d{1,2})[.)]\\s+(${titlePattern})(?:\\*\\*)?:?\\s*(.*)$`,
      "i"
    );

    const headingMatch = line.match(headingRegex);

    if (headingMatch) {
      return {
        number: headingMatch[1],
        title: title,
        body: headingMatch[3].trim(),
      };
    }
  }

  return null;
}

function parseChapterSections(content) {
  const safeContent = normalizeChapterContent(content);
  const lines = safeContent.split(/\r?\n/);
  const sections = [];
  const introLines = [];
  let currentSection = null;

  for (const line of lines) {
    const knownHeading = getKnownHeadingFromLine(line);

    if (knownHeading) {
      if (currentSection) {
        currentSection.body = currentSection.lines.join("\n").trim();
        sections.push(currentSection);
      }

      currentSection = {
        number: knownHeading.number,
        title: knownHeading.title,
        lines: [],
        body: "",
      };

      if (knownHeading.body) {
        currentSection.lines.push(knownHeading.body);
      }

      continue;
    }

    const headingMatch = line.match(/^\s*(?:#{1,6}\s*)?(?:\*\*)?(\d{1,2})[.)]\s+(.+?)(?:\*\*)?\s*$/);

    if (headingMatch && isLikelySectionHeading(headingMatch[2])) {
      if (currentSection) {
        currentSection.body = currentSection.lines.join("\n").trim();
        sections.push(currentSection);
      }

      currentSection = {
        number: headingMatch[1],
        title: cleanSectionTitle(headingMatch[2]),
        lines: [],
        body: "",
      };
    } else {
      if (currentSection) {
        currentSection.lines.push(line);
      } else {
        introLines.push(line);
      }
    }
  }

  if (currentSection) {
    currentSection.body = currentSection.lines.join("\n").trim();
    sections.push(currentSection);
  }

  const introBody = introLines.join("\n").trim();

  if (introBody && sections.length > 0) {
    sections.unshift({
      number: "",
      title: "Before You Start",
      body: introBody,
    });
  }

  return sections;
}

function splitCodeBlocks(body) {
  const parts = [];
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let match = codeBlockRegex.exec(body);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: body.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: "code",
      value: match[1],
    });

    lastIndex = codeBlockRegex.lastIndex;
    match = codeBlockRegex.exec(body);
  }

  if (lastIndex < body.length) {
    parts.push({
      type: "text",
      value: body.slice(lastIndex),
    });
  }

  return parts;
}

function buildTextBlocks(text) {
  const blocks = [];
  const paragraphLines = [];
  let currentList = null;

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines.length = 0;
  }

  function flushList() {
    if (!currentList) {
      return;
    }

    blocks.push(currentList);
    currentList = null;
  }

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = trimmedLine.match(/^[-*\u2022]\s+(.+)/);
    const orderedMatch = trimmedLine.match(/^\d+[.)]\s+(.+)/);

    if (unorderedMatch) {
      flushParagraph();

      if (!currentList || currentList.type !== "unordered") {
        flushList();
        currentList = {
          type: "unordered",
          items: [],
        };
      }

      currentList.items.push(unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();

      if (!currentList || currentList.type !== "ordered") {
        flushList();
        currentList = {
          type: "ordered",
          items: [],
        };
      }

      currentList.items.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(trimmedLine);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function renderInlineCode(text) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      const codeText = part.slice(1, -1);

      return (
        <code
          key={index}
          className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.88em] text-white"
        >
          {codeText}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function TextBlock({ text }) {
  const blocks = buildTextBlocks(text);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className="text-[0.98rem] leading-8 text-white/72">
              {renderInlineCode(block.text)}
            </p>
          );
        }

        if (block.type === "unordered") {
          return (
            <ul key={index} className="space-y-2 pl-1">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex gap-3 text-[0.98rem] leading-7 text-white/72"
                >
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                  <span>{renderInlineCode(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol key={index} className="space-y-2 pl-1">
              {block.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex gap-3 text-[0.98rem] leading-7 text-white/72"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-xs font-semibold text-white/70">
                    {itemIndex + 1}
                  </span>
                  <span>{renderInlineCode(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        return null;
      })}
    </div>
  );
}

function CodeBlock({ code }) {
  const trimmedCode = code.replace(/^\n/, "").replace(/\n$/, "");
  const lines = trimmedCode.split(/\r?\n/);
  let language = "";
  let codeLines = lines;

  if (lines.length > 1) {
    const firstLine = lines[0].trim();

    if (/^[a-zA-Z0-9#+.-]{1,20}$/.test(firstLine)) {
      language = firstLine;
      codeLines = lines.slice(1);
    }
  }

  const displayCode = codeLines.join("\n").trimEnd();
  let languageLabel = null;

  if (language) {
    languageLabel = (
      <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/50">
        {language}
      </span>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-[0_18px_50px_-34px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <span className="text-xs font-medium text-white/50">Code example</span>
        {languageLabel}
      </div>

      <pre className="overflow-x-auto p-4 text-sm leading-7 text-white/82">
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}

function FormattedContent({ body }) {
  const parts = splitCodeBlocks(body);

  return (
    <div className="space-y-5">
      {parts.map((part, index) => {
        if (part.type === "code") {
          return <CodeBlock key={index} code={part.value} />;
        }

        return <TextBlock key={index} text={part.value} />;
      })}
    </div>
  );
}

function SectionNumber({ number }) {
  if (!number) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-xs font-semibold text-white/72">
        AI
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white text-sm font-semibold text-black">
      {number}
    </span>
  );
}

export default function ChapterContentRenderer({ content }) {
  const safeContent = getSafeContent(content);
  const sections = parseChapterSections(safeContent);

  if (!safeContent) {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardContent className="p-6">
          <p className="text-sm leading-7 text-white/58">
            This chapter does not have learning notes yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (sections.length === 0) {
    return (
      <Card className="glass-panel-strong rounded-[2rem]">
        <CardHeader className="border-b border-white/8 pb-5">
          <Badge variant="secondary" className="w-fit">
            Learning Notes
          </Badge>
          <CardTitle className="text-2xl">Chapter Content</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <FormattedContent body={safeContent} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section, index) => (
        <Card key={index} className="glass-panel-strong rounded-[2rem]">
          <CardHeader className="border-b border-white/8 pb-5">
            <div className="flex items-start gap-4">
              <SectionNumber number={section.number} />

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/38">
                  Learning Section
                </p>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <FormattedContent body={section.body} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
