import axios from 'axios';
import { auth } from '../firebase';

export async function addHistoryRecord(record) {
  // Зберігаємо локально
  const history = JSON.parse(localStorage.getItem('history') || '[]');
  history.push(record);
  localStorage.setItem('history', JSON.stringify(history));

  // Надсилаємо на бекенд
  try {
    // Використовуємо axios, бо ти імпортував його, але в коді використовуєш fetch — треба обрати одне
    await axios.post('http://localhost:5000/api/logic', record);
  } catch (error) {
    console.error('Помилка збереження в MongoDB:', error);
  }
}

export function getPathFromURL(url) {
  const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
  if (!url.startsWith(baseUrl)) return null;

  const decoded = decodeURIComponent(url);
  const matches = decoded.match(/\/o\/(.*?)\?/);
  return matches?.[1] || null;
}
