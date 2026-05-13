import { doc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase"; // імпортуй Firestore
import { auth } from "../firebase";

const saveHistoryItem = async (type, input, result) => {
  if (!auth.currentUser) return;

  await addDoc(collection(db, "users", auth.currentUser.uid, "history"), {
    type,            // "Комбінаторика", "Логіка", тощо
    input,           // Вхідні дані задачі
    result,          // Результат
    timestamp: Timestamp.now()
  });
};
