export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'Reflection' | 'Gratitude' | 'Brainstorming' | 'Decision' | 'Personal';
  mood?: 'Peaceful' | 'Focused' | 'Anxious' | 'Grateful' | 'Excited' | 'Tired' | 'Thoughtful';
  summary?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ReflectionMode = 'reflect' | 'brainstorm' | 'summarize' | 'chat';
