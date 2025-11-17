// src/utils/chains.js
import { db, serverTimestamp } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { nanoid } from "nanoid";

const chainsCol = collection(db, "chains");

export async function createChain(ownerId, title = "Untitled") {
  const code = nanoid(8);
  const data = {
    ownerId,
    title,
    isPublic: false,
    code,
    checkpoints: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(chainsCol, data);
  const snap = await getDoc(ref);
  return { id: ref.id, ...data };
}

export async function getChainById(id) {
  const ref = doc(db, "chains", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getChainByCode(code) {
  const q = query(chainsCol, where("code", "==", code));
  const res = await getDocs(q);
  if (res.empty) return null;
  const s = res.docs[0];
  return { id: s.id, ...s.data() };
}

export async function updateChain(id, patch) {
  const ref = doc(db, "chains", id);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
  return getChainById(id);
}

export async function listChainsForOwner(ownerId) {
  const q = query(chainsCol, where("ownerId", "==", ownerId), orderBy("createdAt", "desc"));
  const res = await getDocs(q);
  return res.docs.map((d) => ({ id: d.id, ...d.data() }));
}
