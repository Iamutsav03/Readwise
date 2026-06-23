import httpClient from "./httpClient";

/**
 * Fetch the reading progress for a specific PDF.
 * @param {string} pdfId
 * @returns {Promise<Object>} The reading progress object
 */
export const getProgress = async (pdfId) => {
  const response = await httpClient.get(`/progress/${pdfId}`);
  return response.data.progress;
};

/**
 * Save the reading progress for a specific PDF.
 * @param {string} pdfId
 * @param {Object} data { pageNumber, numPages, scale, fitMode, focusMode, activeTab }
 * @returns {Promise<Object>} The updated reading progress object
 */
export const saveProgress = async (pdfId, data) => {
  const response = await httpClient.put(`/progress/${pdfId}`, data);
  return response.data.progress;
};
