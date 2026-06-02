import axios from "axios";
import { BASE_URL } from "../../../utils/api";

const NOTES_URL = `${BASE_URL}/notes`;

/**
 * Fetch all notes for a specific PDF
 * @param {string} pdfId
 */
export const getNotesForPdf = async (pdfId) => {
  const response = await axios.get(`${NOTES_URL}/${pdfId}`);
  return response.data;
};

/**
 * Create a new note
 * @param {object} payload - pdfId, pageNumber, content, color, width, height, x, y
 */
export const createNote = async (payload) => {
  const response = await axios.post(NOTES_URL, payload);
  return response.data;
};

/**
 * Update an existing note
 * @param {string} id
 * @param {object} updateFields - fields to update
 */
export const updateNote = async (id, updateFields) => {
  const response = await axios.put(`${NOTES_URL}/${id}`, updateFields);
  return response.data;
};

/**
 * Delete a note by its ID
 * @param {string} id
 */
export const deleteNote = async (id) => {
  const response = await axios.delete(`${NOTES_URL}/${id}`);
  return response.data;
};
