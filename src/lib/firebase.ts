import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { JournalEntry } from '../types';
import { stripUndefined } from './sanitize';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore with dedicated databaseId
export const db = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Sign In with Google via Firebase Auth
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out current authenticated user
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to current user's journal entries in real-time.
 * Strictly isolated to /users/{userId}/interactions
 */
export function subscribeToUserInteractions(
  userId: string,
  onData: (entries: JournalEntry[]) => void,
  onError: (err: Error) => void
): () => void {
  if (!userId) {
    onData([]);
    return () => {};
  }

  const interactionsRef = collection(db, 'users', userId, 'interactions');
  // Order by creation time descending
  const q = query(interactionsRef, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<JournalEntry, 'id'>;
        items.push({
          id: docSnap.id,
          ...data
        });
      });
      onData(items);
    },
    (error) => {
      console.error('Error fetching user interactions from Firestore:', error);
      onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a journal interaction for the isolated user.
 * Strips any undefined fields to guarantee zero-crash write hygiene.
 */
export async function saveUserInteraction(
  userId: string,
  entry: JournalEntry
): Promise<void> {
  if (!userId) {
    throw new Error('Cannot save interaction: User is not authenticated.');
  }

  const docRef = doc(db, 'users', userId, 'interactions', entry.id);
  const cleanPayload = stripUndefined({
    userId,
    title: entry.title || 'Untitled Reflection',
    content: entry.content || '',
    category: entry.category || 'Reflection',
    mood: entry.mood || 'Thoughtful',
    summary: entry.summary || '',
    messages: entry.messages || [],
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await setDoc(docRef, cleanPayload, { merge: true });
}

/**
 * Delete a user's isolated journal interaction
 */
export async function deleteUserInteraction(
  userId: string,
  entryId: string
): Promise<void> {
  if (!userId || !entryId) return;
  const docRef = doc(db, 'users', userId, 'interactions', entryId);
  await deleteDoc(docRef);
}
