// services/gemini/promptBuilder.js
// Builds Gemini prompt strings for every AI feature type.
// Extracted from services/promptBuilder.js.

const { wordCount, containsMath } = require("../../utils/textUtils");
const { MAX_HISTORY_MESSAGES } = require("../../constants/aiConstants");

// ── Persona ───────────────────────────────────────────────────────────────────

const TEACHER_PERSONA = `You are an expert teacher helping a student understand a PDF.

Rules:
* Never simply copy text from the PDF.
* If the answer can be explained simply, always prefer the simpler explanation.
* Assume the student is a beginner.
* Use simple words and short paragraphs.
* If a technical term appears, explain it.
* Give a real-world analogy whenever possible.
* Mention why the concept matters.
* Use examples from daily life.
* Be accurate to the PDF context.
* If the PDF does not contain enough information, clearly say so.
* Use emojis only in your responses to make them engaging.
`;

// ── Format templates ──────────────────────────────────────────────────────────

const FORMAT_CHAT = `Response structure:
📘 Simple Explanation
🎯 Why It Matters
🌎 Real-World Example
📝 Key Takeaway`;

const FORMAT_SUMMARY = `Return the summary strictly with these exact headings:
1. What This PDF Is About
2. Key Concepts
3. Most Important Exam Topics
4. Frequently Asked Interview Topics
5. 5-Minute Revision Notes
6. Important Definitions
7. Important Formulas (if present)`;

const FORMAT_CONCEPTS = `Limit to the top 10 most important concepts found in the context.
For every concept, return exactly this format:
Concept Name
Simple Explanation
Why Important
Real-World Example
Exam Tip`;

const FORMAT_INTERVIEW = `Generate interview questions based on the context. Return exactly this format:

BEGINNER (10)
[Question]
[Answer]
...

INTERMEDIATE (10)
[Question]
[Answer]
...

ADVANCED (5)
[Question]
[Answer]
...

COMMON MISTAKES
* Mistake 1
* Mistake 2
* Mistake 3`;

const FORMAT_FLASHCARDS = `Generate 15-25 high quality flashcards.
Include Definition cards, Concept cards, Difference cards, and Interview cards.
Keep answers short and revision-friendly.

Format strictly as:
Q: [Question]
A: [Answer]`;

const FORMAT_EXPLAIN_WORD = `Return exactly this format:
📘 Meaning
🎯 Why It Matters
🌎 Context-Related Short Example`;

const FORMAT_EXPLAIN_SENTENCE = `Return exactly this format:
📘 Explain Sentence
🎯 Simplify Sentence
🌎 Context-Related Short Example`;

const FORMAT_EXPLAIN_PARAGRAPH = `Return exactly this format:
📘 Summary
🎯 Detailed Explanation
📝 Key Takeaway`;

const FORMAT_EXPLAIN_FORMULA = `Return exactly this format:
📘 What It Means
🎯 Variables Explained
🌎 Context-Related Short Example`;

// ── Importance preambles ──────────────────────────────────────────────────────

const IMPORTANCE_PREAMBLES = {
  high: `IMPORTANT INSTRUCTION: Focus ONLY on definitions, key concepts, exam topics, critical formulas, and interview-relevant content. Completely ignore examples, filler text, and minor side notes.`,
  medium: `IMPORTANT INSTRUCTION: Include key concepts and their supporting examples. Balance depth with brevity.`,
  low: `IMPORTANT INSTRUCTION: Be comprehensive. Include all main concepts, examples, analogies, side notes, and interesting facts. This is for deep learning.`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Serialises conversation history into a prompt block, honouring char limits.
 * @param {Array<{ role: string, content: string }>} messages
 * @returns {string}
 */
function buildHistoryContext(messages) {
  if (!messages || messages.length === 0) return "";

  const recent = messages.slice(-MAX_HISTORY_MESSAGES);
  const MAX_HISTORY_CHARS = 4000;
  let estimatedChars = 0;
  const selected = [];

  for (let i = recent.length - 1; i >= 0; i--) {
    const msg = recent[i];
    const msgText = `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    if (estimatedChars + msgText.length > MAX_HISTORY_CHARS) break;
    selected.unshift(msgText);
    estimatedChars += msgText.length;
  }

  if (selected.length === 0) return "";
  return `\n--- PREVIOUS CONVERSATION HISTORY ---\n${selected.join("")}--- END HISTORY ---\n`;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build the final Gemini prompt for any feature type.
 *
 * @param {string}   featureType
 * @param {string}   contextText      - PDF context or selected text
 * @param {string}   query            - User question or request
 * @param {Array}    [historyMessages] - Prior conversation messages
 * @param {object}   [options]
 * @param {string}   [options.importance]
 * @param {object}   [options.featureOptions]
 * @returns {string}
 */
function buildPrompt(
  featureType,
  contextText,
  query,
  historyMessages = [],
  options = {}
) {
  const { importance = "high", featureOptions = {} } = options;
  const importancePreamble =
    IMPORTANCE_PREAMBLES[importance] || IMPORTANCE_PREAMBLES.high;

  let formatInstruction = FORMAT_CHAT;

  switch (featureType) {
    case "summary": {
      const length = featureOptions.summaryLength || "standard";
      let extra = "";
      if (length === "quick")
        extra = "\nKEEP IT BRIEF: Bullet points only. Maximum 5 bullets per section.";
      else if (length === "detailed")
        extra = "\nBE COMPREHENSIVE: Expand every section with depth and detail.";
      formatInstruction = FORMAT_SUMMARY + extra;
      break;
    }
    case "concepts":
      formatInstruction = FORMAT_CONCEPTS;
      break;
    case "quiz":
    case "interview": {
      const diff = featureOptions.difficulty || "mixed";
      const qType = featureOptions.questionType || "mixed";
      const count = featureOptions.questionCount || 20;
      let diffInstr =
        diff === "easy"
          ? `Generate ${count} BEGINNER-level questions only.`
          : diff === "medium"
          ? `Generate ${count} INTERMEDIATE-level questions only.`
          : diff === "hard"
          ? `Generate ${count} ADVANCED-level questions only.`
          : `Generate ${count} questions total, mixed difficulty (Beginner, Intermediate, Advanced).`;
      let typeInstr =
        qType === "mcq"
          ? "Format all questions as Multiple Choice Questions (with 4 options and the correct answer)."
          : qType === "short"
          ? "Format all questions as Short Answer questions."
          : "Mix question types (Multiple Choice, Short Answer, True/False).";
      formatInstruction = `${diffInstr}\n${typeInstr}\n\n${FORMAT_INTERVIEW}`;
      break;
    }
    case "flashcards": {
      const cardCount = featureOptions.cardCount || 20;
      const style = featureOptions.flashcardStyle || "exam";
      const styleInstr =
        style === "interview"
          ? "Focus on practical, interview-style Q&A."
          : style === "concept"
          ? "Focus on deep conceptual understanding and analogies."
          : "Focus on rapid exam revision and memorization.";
      formatInstruction = `Generate exactly ${cardCount} high-quality flashcards.\n${styleInstr}\n${FORMAT_FLASHCARDS}`;
      break;
    }
    case "explain-selection": {
      const wc = wordCount(contextText);
      const isMath = containsMath(contextText);
      if (isMath) formatInstruction = FORMAT_EXPLAIN_FORMULA;
      else if (wc <= 3) formatInstruction = FORMAT_EXPLAIN_WORD;
      else if (wc <= 25) formatInstruction = FORMAT_EXPLAIN_SENTENCE;
      else formatInstruction = FORMAT_EXPLAIN_PARAGRAPH;
      break;
    }
    case "chat":
    default:
      formatInstruction = FORMAT_CHAT;
  }

  const historyBlock = buildHistoryContext(historyMessages);

  if (featureType === "explain-selection") {
    return `${TEACHER_PERSONA}

${formatInstruction}

--- SELECTED TEXT ---
${contextText}
--- END SELECTED TEXT ---

Please explain the selected text above based on the format provided. Ensure that your explanation is short (2-4 lines per section) and any examples provided are short and strictly related to the context of the selected text.`;
  }

  return `${TEACHER_PERSONA}

${importancePreamble}

${formatInstruction}

--- DOCUMENT CONTEXT (Top relevant paragraphs) ---
${contextText}
--- END CONTEXT ---
${historyBlock}
User question/request: ${query}`;
}

module.exports = { buildPrompt, TEACHER_PERSONA };
