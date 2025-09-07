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
// 🔧 COMPONENTS (Direct Firebase)
// These can be used as fallback or for direct Firebase operations
// =============================

// Get all components from Firebase
export async function fetchComponentsFromFirebase() {
  const snap = await getDocs(collection(db, "components"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get component by ID from Firebase
export async function fetchComponentByIdFromFirebase(id) {
  const ref = doc(db, "components", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Component not found");
  return { id: snap.id, ...snap.data() };
}

// Add component to Firebase
export async function addComponentToFirebase(component) {
  const docRef = await addDoc(collection(db, "components"), component);
  return { id: docRef.id, ...component };
}

// =============================
// 🎯 IDEAS (Direct Firebase)
// =============================

// Get all saved ideas from Firebase
export async function fetchIdeasFromFirebase() {
  const snap = await getDocs(collection(db, "ideas"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Save a new idea to Firebase
export async function saveIdeaToFirebase(idea) {
  const docRef = await addDoc(collection(db, "ideas"), idea);
  return { id: docRef.id, ...idea };
}

// Update an existing idea in Firebase
export async function updateIdeaInFirebase(id, updates) {
  const ref = doc(db, "ideas", id);
  await updateDoc(ref, updates);
  return { id, ...updates };
}

// Delete idea from Firebase
export async function deleteIdeaFromFirebase(id) {
  const ref = doc(db, "ideas", id);
  await deleteDoc(ref);
  return true;
}

// =============================
// 👤 USER PREFERENCES (Direct Firebase)
// =============================

// Get user preferences from Firebase
export async function fetchPreferencesFromFirebase(userId = "default_user") {
  const ref = doc(db, "preferences", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Save user preferences to Firebase
export async function savePreferencesToFirebase(userId = "default_user", preferences) {
  const ref = doc(db, "preferences", userId);
  await updateDoc(ref, preferences).catch(async () => {
    // If no preferences exist yet, create them
    await addDoc(collection(db, "preferences"), { userId, ...preferences });
  });
}

// =============================
// 📊 STATS (Direct Firebase)
// =============================

export async function fetchStatsFromFirebase() {
  // Example: number of ideas and components
  const ideasSnap = await getDocs(collection(db, "ideas"));
  const compsSnap = await getDocs(collection(db, "components"));
  return {
    ideasCount: ideasSnap.size,
    componentsCount: compsSnap.size,
  };
}