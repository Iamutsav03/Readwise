// services/promptBuilder.js
// Centralized utility for constructing AI prompts based on feature types.

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
🌎 Example`;

const FORMAT_EXPLAIN_SENTENCE = `Return exactly this format:
📘 Explain Sentence
🎯 Simplify Sentence
🌎 Example`;

const FORMAT_EXPLAIN_PARAGRAPH = `Return exactly this format:
📘 Summary
🎯 Detailed Explanation
📝 Key Takeaway`;

const FORMAT_EXPLAIN_FORMULA = `Return exactly this format:
📘 What It Means
🎯 Variables Explained
🌎 Worked Example`;

// ── Importance Preambles ──────────────────────────────────────────────────────
const IMPORTANCE_PREAMBLES = {
  high: `IMPORTANT INSTRUCTION: Focus ONLY on definitions, key concepts, exam topics, critical formulas, and interview-relevant content. Completely ignore examples, filler text, and minor side notes.`,
  medium: `IMPORTANT INSTRUCTION: Include key concepts and their supporting examples. Balance depth with brevity.`,
  low: `IMPORTANT INSTRUCTION: Be comprehensive. Include all main concepts, examples, analogies, side notes, and interesting facts. This is for deep learning.`,
};

/**
 * Formats the conversation history into a string, truncating if it gets too long.
 * @param {Array} messages - Array of message objects { role, content }
 * @returns {string} Formatted history
 */
function buildHistoryContext(messages) {
  if (!messages || messages.length === 0) return "";

  // Keep max 10 messages
  const recentMessages = messages.slice(-10);
  
  let historyString = "";
  let estimatedChars = 0;
  const MAX_HISTORY_CHARS = 4000;

  // Iterate backwards to keep the newest messages if we hit the limit
  const selected = [];
  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    const msgText = `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    if (estimatedChars + msgText.length > MAX_HISTORY_CHARS) {
      break; // Stop adding older messages if we exceed token safety limit
    }
    selected.unshift(msgText);
    estimatedChars += msgText.length;
  }

  if (selected.length === 0) return "";

  return `\n--- PREVIOUS CONVERSATION HISTORY ---\n${selected.join("")}--- END HISTORY ---\n`;
}

/**
 * Builds the final prompt for Gemini based on feature type, context, and query.
 * @param {string} featureType
 * @param {string} contextText
 * @param {string} query
 * @param {Array} historyMessages
 * @param {object} options - { importance, featureOptions: { summaryLength, difficulty, questionCount, cardCount } }
 */
function buildPrompt(featureType, contextText, query, historyMessages = [], options = {}) {
  const { importance = "high", featureOptions = {} } = options;
  const importancePreamble = IMPORTANCE_PREAMBLES[importance] || IMPORTANCE_PREAMBLES.high;
  
  let formatInstruction = FORMAT_CHAT;

  switch (featureType) {
    case "summary": {
      const length = featureOptions.summaryLength || "standard";
      let summaryExtra = "";
      if (length === "quick") summaryExtra = "\nKEEP IT BRIEF: Bullet points only. Maximum 5 bullets per section.";
      else if (length === "detailed") summaryExtra = "\nBE COMPREHENSIVE: Expand every section with depth and detail.";
      formatInstruction = FORMAT_SUMMARY + summaryExtra;
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
      let diffInstruction = "";
      if (diff === "easy") diffInstruction = `Generate ${count} BEGINNER-level questions only.`;
      else if (diff === "medium") diffInstruction = `Generate ${count} INTERMEDIATE-level questions only.`;
      else if (diff === "hard") diffInstruction = `Generate ${count} ADVANCED-level questions only.`;
      else diffInstruction = `Generate ${count} questions total, mixed difficulty (Beginner, Intermediate, Advanced).`;
      
      let typeInstruction = "";
      if (qType === "mcq") typeInstruction = "Format all questions as Multiple Choice Questions (with 4 options and the correct answer).";
      else if (qType === "short") typeInstruction = "Format all questions as Short Answer questions.";
      else typeInstruction = "Mix question types (Multiple Choice, Short Answer, True/False).";

      formatInstruction = `${diffInstruction}\n${typeInstruction}\n\n${FORMAT_INTERVIEW}`;
      break;
    }
    case "flashcards": {
      const cardCount = featureOptions.cardCount || 20;
      const style = featureOptions.flashcardStyle || "exam";
      let styleInstruction = "";
      if (style === "interview") styleInstruction = "Focus on practical, interview-style Q&A.";
      else if (style === "concept") styleInstruction = "Focus on deep conceptual understanding and analogies.";
      else styleInstruction = "Focus on rapid exam revision and memorization.";
      
      formatInstruction = `Generate exactly ${cardCount} high-quality flashcards.\n${styleInstruction}\n${FORMAT_FLASHCARDS}`;
      break;
    }
    case "explain-selection": {
      const wordCount = contextText.trim().split(/\s+/).length;
      const isFormula = /[\+\-\=\/\*\^\(\)\[\]]/.test(contextText) && wordCount < 15;
      if (isFormula) formatInstruction = FORMAT_EXPLAIN_FORMULA;
      else if (wordCount <= 3) formatInstruction = FORMAT_EXPLAIN_WORD;
      else if (wordCount <= 25) formatInstruction = FORMAT_EXPLAIN_SENTENCE;
      else formatInstruction = FORMAT_EXPLAIN_PARAGRAPH;
      break;
    }
    case "chat":
    default:
      formatInstruction = FORMAT_CHAT;
      break;
  }

  const historyBlock = buildHistoryContext(historyMessages);

  if (featureType === "explain-selection") {
    return `${TEACHER_PERSONA}

${formatInstruction}

--- SELECTED TEXT ---
${contextText}
--- END SELECTED TEXT ---

Please explain the selected text above based on the format provided.`;
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

module.exports = {
  buildPrompt
};
