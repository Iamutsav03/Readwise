// src/services/vocabularyService.js
import { API_BASE_URL } from "../config";

const BASE = `${API_BASE_URL}/api/vocabulary`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("rw_token")}`
});

export async function getVocabulary() {
  const res = await fetch(BASE, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return data.vocabulary;
}

export async function deleteVocabulary(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function submitReview(id, score) {
  const res = await fetch(`${BASE}/${id}/review`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ score })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data.vocabulary;
}

export async function getVocabularyStats() {
  const res = await fetch(`${BASE}/stats`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return data.stats;
}
