// src/services/apiService.js

import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// =============================
// 🔧 COMPONENTS
// =============================

// Get all components
export async function fetchComponents() {
  const snap = await getDocs(collection(db, "components"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get component by ID
export async function fetchComponentById(id) {
  const ref = doc(db, "components", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Component not found");
  return { id: snap.id, ...snap.data() };
}

// =============================
// 🎯 IDEAS
// =============================

// Get all saved ideas
export async function fetchIdeas() {
  const snap = await getDocs(collection(db, "ideas"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Save a new idea
export async function saveIdea(idea) {
  const docRef = await addDoc(collection(db, "ideas"), idea);
  return { id: docRef.id, ...idea };
}

// Update an existing idea
export async function updateIdea(id, updates) {
  const ref = doc(db, "ideas", id);
  await updateDoc(ref, updates);
  return { id, ...updates };
}

// Delete idea
export async function deleteIdea(id) {
  const ref = doc(db, "ideas", id);
  await deleteDoc(ref);
  return true;
}

// =============================
// 👤 USER PREFERENCES
// =============================

// For simplicity, we’ll keep preferences in a single "preferences" collection
export async function fetchPreferences(userId) {
  const ref = doc(db, "preferences", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function savePreferences(userId, preferences) {
  const ref = doc(db, "preferences", userId);
  await updateDoc(ref, preferences).catch(async () => {
    // If no preferences exist yet, create them
    await addDoc(collection(db, "preferences"), { userId, ...preferences });
  });
}

// =============================
// 📊 (OPTIONAL) STATS
// =============================

export async function fetchStats() {
  // Example: number of ideas and components
  const ideasSnap = await getDocs(collection(db, "ideas"));
  const compsSnap = await getDocs(collection(db, "components"));
  return {
    ideasCount: ideasSnap.size,
    componentsCount: compsSnap.size,
  };
}
