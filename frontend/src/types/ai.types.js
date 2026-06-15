// src/types/ai.types.js
// JSDoc typedefs for AI chat and study tool data structures.

/**
 * @typedef {'user'|'assistant'} MessageRole
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string}      _id               - MongoDB ObjectId string
 * @property {string}      pdfId             - Parent PDF id
 * @property {MessageRole} role              - 'user' or 'assistant'
 * @property {string}      content           - Message body text
 * @property {string}      featureType       - e.g. 'chat' | 'summary' | 'flashcards' | 'explain-selection'
 * @property {number[]}    [contextPages]    - Pages used as RAG context
 * @property {number}      [contextParagraphs] - Number of paragraphs used
 * @property {'pending'|'completed'|'failed'} status
 * @property {string}      [errorCode]       - Set when status === 'failed'
 * @property {string}      createdAt         - ISO date string
 */

/**
 * @typedef {Object} StudyResult
 * @property {boolean} success
 * @property {ChatMessage} [userMessage]
 * @property {ChatMessage} [assistantMessage]
 * @property {string} [error]
 * @property {string} [code]
 */

export {};
