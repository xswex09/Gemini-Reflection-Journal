import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  subscribeToUserInteractions,
  saveUserInteraction,
  deleteUserInteraction
} from './lib/firebase';
import { JournalEntry, UserProfile, ChatMessage, ReflectionMode } from './types';
import { Navbar } from './components/Navbar';
import { AuthCard } from './components/AuthCard';
import { EntrySidebar } from './components/EntrySidebar';
import { EntryEditor } from './components/EntryEditor';
import { AiChatCompanion } from './components/AiChatCompanion';
import { SummaryCard } from './components/SummaryCard';
import { BookOpen, MessageSquare, Loader2 } from 'lucide-react';

function createNewEntry(userId: string): JournalEntry {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `entry_${Date.now()}`;
  const now = new Date().toISOString();
  return {
    id,
    userId,
    title: '',
    content: '',
    category: 'Reflection',
    mood: 'Thoughtful',
    summary: '',
    messages: [],
    createdAt: now,
    updatedAt: now
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [sendingChat, setSendingChat] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // Mobile layout tab toggle: 'entries' | 'editor' | 'chat'
  const [mobileTab, setMobileTab] = useState<'entries' | 'editor' | 'chat'>('editor');

  const activeEntryRef = useRef<JournalEntry | null>(null);
  activeEntryRef.current = selectedEntry;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
          setAuthError(null);
        } else {
          setCurrentUser(null);
          setEntries([]);
          setSelectedEntry(null);
        }
        setAuthLoading(false);
      },
      (error) => {
        console.error('Auth state listener error:', error);
        setAuthError(error.message);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to Cloud Firestore user-isolated entries
  useEffect(() => {
    if (!currentUser) return;

    setEntriesLoading(true);
    const unsubscribe = subscribeToUserInteractions(
      currentUser.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setEntriesLoading(false);

        // Maintain selection or select first
        setSelectedEntry((current) => {
          if (!current) {
            return fetchedEntries.length > 0
              ? fetchedEntries[0]
              : createNewEntry(currentUser.uid);
          }
          const matched = fetchedEntries.find((e) => e.id === current.id);
          // If the entry was updated remotely and user has no local unsaved edits, sync
          if (matched && !hasUnsavedChanges) {
            return matched;
          }
          return current;
        });
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setEntriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please allow popups or open in a new tab.');
      } else if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in was cancelled before completion.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Please verify network and credentials.');
      }
    }
  };

  // Handle Sign out
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Create a new blank reflection
  const handleNewEntry = () => {
    if (!currentUser) return;
    const newEntry = createNewEntry(currentUser.uid);
    setSelectedEntry(newEntry);
    setHasUnsavedChanges(true);
    setSaveError(null);
    setMobileTab('editor');
  };

  // Select an existing reflection from sidebar
  const handleSelectEntry = (entry: JournalEntry) => {
    // If current entry has unsaved changes, trigger background save before switching
    if (hasUnsavedChanges && selectedEntry && currentUser) {
      saveUserInteraction(currentUser.uid, selectedEntry).catch(console.error);
    }
    setSelectedEntry(entry);
    setHasUnsavedChanges(false);
    setSaveError(null);
    setMobileTab('editor');
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteUserInteraction(currentUser.uid, entryId);
      if (selectedEntry?.id === entryId) {
        const remaining = entries.filter((e) => e.id !== entryId);
        if (remaining.length > 0) {
          setSelectedEntry(remaining[0]);
        } else {
          setSelectedEntry(createNewEntry(currentUser.uid));
        }
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
    }
  };

  // Update fields of the active entry
  const handleEntryChange = (updated: Partial<JournalEntry>) => {
    if (!selectedEntry) return;
    setSelectedEntry({
      ...selectedEntry,
      ...updated,
      updatedAt: new Date().toISOString()
    });
    setHasUnsavedChanges(true);
    setSaveError(null);
  };

  // Explicit Save to Cloud Firestore
  const handleSaveEntry = async () => {
    if (!currentUser || !selectedEntry) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveUserInteraction(currentUser.uid, selectedEntry);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Error saving entry to Firestore:', err);
      setSaveError(err?.message || 'Database write rejected.');
    } finally {
      setSaving(false);
    }
  };

  // Multi-Turn Chat with Gemini Companion
  const handleSendChatMessage = async (userText: string, mode: ReflectionMode) => {
    if (!currentUser || !selectedEntry || sendingChat) return;

    setSendingChat(true);
    const userMessage: ChatMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_u`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    const updatedMessagesWithUser = [...(selectedEntry.messages || []), userMessage];
    const temporaryEntryState: JournalEntry = {
      ...selectedEntry,
      messages: updatedMessagesWithUser
    };
    setSelectedEntry(temporaryEntryState);

    try {
      // Call Express /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessagesWithUser.map((m) => ({
            role: m.role,
            content: m.content
          })),
          journalTitle: selectedEntry.title,
          journalContent: selectedEntry.content,
          mode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_m`,
        role: 'model',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        modelUsed: data.modelUsed
      };

      const finalMessages = [...updatedMessagesWithUser, modelMessage];
      const finalEntryState: JournalEntry = {
        ...selectedEntry,
        messages: finalMessages,
        updatedAt: new Date().toISOString()
      };

      setSelectedEntry(finalEntryState);

      // Guaranteed Transaction Verification: Persist immediately to Firestore
      await saveUserInteraction(currentUser.uid, finalEntryState);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Error in chat interaction:', err);
      setSaveError(`AI Interaction error: ${err?.message || 'Failed to communicate with Gemini.'}`);
    } finally {
      setSendingChat(false);
    }
  };

  // Summarize Entry with Gemini
  const handleSummarizeEntry = async () => {
    if (!currentUser || !selectedEntry || !selectedEntry.content.trim() || summarizing) return;

    setSummarizing(true);
    setSaveError(null);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEntry.title || 'Untitled Reflection',
          content: selectedEntry.content
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Summarization failed with status ${response.status}`);
      }

      const data = await response.json();
      const updatedEntry: JournalEntry = {
        ...selectedEntry,
        summary: data.summary,
        updatedAt: new Date().toISOString()
      };

      setSelectedEntry(updatedEntry);

      // Guaranteed Transaction Verification: persist summary to Firestore
      await saveUserInteraction(currentUser.uid, updatedEntry);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Summarization error:', err);
      setSaveError(`Failed to generate summary: ${err?.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  // Initial loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin" />
          <p className="text-xs font-medium text-stone-600">Initializing Gemini Reflection Journal...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated: show Landing & Google Sign-In Card
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
        <Navbar user={null} onSignOut={handleSignOut} entryCount={0} />
        <AuthCard
          onSignIn={handleSignIn}
          loading={authLoading}
          authError={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onSignOut={handleSignOut}
        entryCount={entries.length}
      />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex border-b border-stone-200 bg-white px-2 py-1.5 text-xs font-medium">
        <button
          onClick={() => setMobileTab('entries')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 ${
            mobileTab === 'entries' ? 'bg-stone-900 text-white' : 'text-stone-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Entries ({entries.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 ${
            mobileTab === 'editor' ? 'bg-stone-900 text-white' : 'text-stone-600'
          }`}
        >
          <span>Reflection Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 ${
            mobileTab === 'chat' ? 'bg-stone-900 text-white' : 'text-stone-600'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Gemini AI</span>
        </button>
      </div>

      {/* Main Responsive Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Entries History Sidebar */}
        <div className={`${mobileTab === 'entries' ? 'block w-full' : 'hidden'} md:block`}>
          <EntrySidebar
            entries={entries}
            selectedEntryId={selectedEntry?.id || null}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleNewEntry}
            onDeleteEntry={handleDeleteEntry}
            loading={entriesLoading}
          />
        </div>

        {/* Center: Active Journal Editor & Summary */}
        <div className={`${mobileTab === 'editor' ? 'flex-1 flex flex-col' : 'hidden'} md:flex md:flex-1 md:flex-col overflow-y-auto`}>
          {selectedEntry ? (
            <div className="flex-1 flex flex-col">
              {/* Optional Gemini Executive Summary Header */}
              {selectedEntry.summary && (
                <SummaryCard summary={selectedEntry.summary} />
              )}

              {/* Main Content Area */}
              <EntryEditor
                entry={selectedEntry}
                onChange={handleEntryChange}
                onSave={handleSaveEntry}
                onSummarize={handleSummarizeEntry}
                saving={saving}
                saveError={saveError}
                summarizing={summarizing}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-400">
              <div>
                <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-3" />
                <h3 className="text-sm font-semibold text-stone-700">No Entry Selected</h3>
                <p className="text-xs text-stone-500 mt-1">Select an entry from the left or create a new reflection.</p>
                <button
                  onClick={handleNewEntry}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Create New Reflection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Multi-turn Gemini Companion */}
        <div className={`${mobileTab === 'chat' ? 'block w-full' : 'hidden'} md:block`}>
          <AiChatCompanion
            messages={selectedEntry?.messages || []}
            onSendMessage={handleSendChatMessage}
            sending={sendingChat}
            journalTitle={selectedEntry?.title || ''}
            journalContent={selectedEntry?.content || ''}
          />
        </div>
      </main>
    </div>
  );
}
