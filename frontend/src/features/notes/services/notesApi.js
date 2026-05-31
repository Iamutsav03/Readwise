import axios from "axios";

const BASE_URL = "http://localhost:5000/api/notes";

/**
 * Fetch all notes for a specific PDF
 * @param {string} pdfId
 */
export const getNotesForPdf = async (pdfId) => {
  const response = await axios.get(`${BASE_URL}/${pdfId}`);
  return response.data;
};

/**
 * Create a new note
 * @param {object} payload - pdfId, pageNumber, content, color, width, height, x, y
 */
export const createNote = async (payload) => {
  const response = await axios.post(BASE_URL, payload);
  return response.data;
};

/**
 * Update an existing note
 * @param {string} id
 * @param {object} updateFields - fields to update
 */
export const updateNote = async (id, updateFields) => {
  const response = await axios.put(`${BASE_URL}/${id}`, updateFields);
  return response.data;
};

/**
 * Delete a note by its ID
 * @param {string} id
 */
export const deleteNote = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};
