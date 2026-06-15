// src/services/notesService.js
// Notes CRUD API calls.
// Moved from features/notes/services/notesApi.js into the shared services layer.

import httpClient from "./httpClient";

const NOTES_URL = "/notes";

/** Fetch all notes for a specific PDF. */
export const getNotesForPdf = async (pdfId) => {
  const res = await httpClient.get(`${NOTES_URL}/${pdfId}`);
  return res.data;
};

/**
 * Create a new note.
 * @param {{ pdfId, pageNumber, content, color?, width?, height?, x?, y? }} payload
 */
export const createNote = async (payload) => {
  const res = await httpClient.post(NOTES_URL, payload);
  return res.data;
};

/**
 * Update an existing note.
 * @param {string} id
 * @param {object} updateFields
 */
export const updateNote = async (id, updateFields) => {
  const res = await httpClient.put(`${NOTES_URL}/${id}`, updateFields);
  return res.data;
};

/** Delete a note by its ID. */
export const deleteNote = async (id) => {
  const res = await httpClient.delete(`${NOTES_URL}/${id}`);
  return res.data;
};
