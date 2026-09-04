import React from 'react';
import { JournalEntry } from '../types';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  Smile,
  Calendar
} from 'lucide-react';

interface EntryEditorProps {
  entry: JournalEntry;
  onChange: (updated: Partial<JournalEntry>) => void;
  onSave: () => Promise<void>;
  onSummarize: () => Promise<void>;
  saving: boolean;
  saveError: string | null;
  summarizing: boolean;
  hasUnsavedChanges: boolean;
}

const CATEGORIES: JournalEntry['category'][] = [
  'Reflection',
  'Gratitude',
  'Brainstorming',
  'Decision',
  'Personal'
];

const MOODS: NonNullable<JournalEntry['mood']>[] = [
  'Peaceful',
  'Focused',
  'Thoughtful',
  'Grateful',
  'Excited',
  'Anxious',
  'Tired'
];

export const EntryEditor: React.FC<EntryEditorProps> = ({
  entry,
  onChange,
  onSave,
  onSummarize,
  saving,
  saveError,
  summarizing,
  hasUnsavedChanges
}) => {
  const wordCount = entry.content.trim() ? entry.content.trim().split(/\s+/).length : 0;
  const charCount = entry.content.length;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      {/* Top Action Bar */}
      <div className="px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50">
        <div className="flex items-center space-x-3 text-xs text-stone-500">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Draft'}
          </span>
          <span className="text-stone-300">•</span>
          <span>{wordCount} words</span>
          <span className="text-stone-300">•</span>
          <span>{charCount} characters</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Save Status & Button */}
          {saving ? (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-stone-500" />
              <span>Saving to Firestore...</span>
            </div>
          ) : saveError ? (
            <button
              id="retry-save-btn"
              onClick={onSave}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              <span>Retry Save</span>
            </button>
          ) : hasUnsavedChanges ? (
            <button
              id="manual-save-btn"
              onClick={onSave}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
              <span>Save Entry</span>
            </button>
          ) : (
            <div className="inline-flex items-center px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Saved in Cloud Firestore</span>
            </div>
          )}

          {/* Quick Summarize Action */}
          <button
            id="editor-summarize-btn"
            onClick={onSummarize}
            disabled={summarizing || !entry.content.trim()}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Generate AI summary and reflection takeaways"
          >
            {summarizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-700" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                <span>AI Summary & Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Error Alert Banner */}
      {saveError && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>Save failed:</strong> {saveError}. Your input is preserved. Click Retry Save to commit.</span>
          </div>
          <button
            onClick={onSave}
            className="ml-3 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs whitespace-nowrap"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Metadata Form: Category & Mood */}
      <div className="px-6 py-4 border-b border-stone-100 flex flex-wrap items-center gap-4 text-xs">
        {/* Category Selector */}
        <div className="flex items-center space-x-2">
          <Tag className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-medium text-stone-600">Category:</span>
          <select
            id="entry-category-select"
            value={entry.category}
            onChange={(e) => onChange({ category: e.target.value as JournalEntry['category'] })}
            className="bg-stone-50 border border-stone-200 text-stone-800 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Selector */}
        <div className="flex items-center space-x-2">
          <Smile className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-medium text-stone-600">Mood:</span>
          <select
            id="entry-mood-select"
            value={entry.mood || 'Thoughtful'}
            onChange={(e) => onChange({ mood: e.target.value as JournalEntry['mood'] })}
            className="bg-stone-50 border border-stone-200 text-stone-800 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-stone-400 text-xs"
          >
            {MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Title & Body Inputs */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <input
          id="entry-title-input"
          type="text"
          placeholder="Title of this reflection or topic..."
          value={entry.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="text-xl sm:text-2xl font-bold text-stone-900 placeholder-stone-400 border-none focus:outline-none focus:ring-0 w-full"
        />

        <textarea
          id="entry-content-textarea"
          placeholder="Write your thoughts, daily reflections, decisions, or ideas freely here. Converse with Gemini on the right panel anytime to unpack your reflections or brainstorm solutions..."
          value={entry.content}
          onChange={(e) => onChange({ content: e.target.value })}
          rows={14}
          className="w-full flex-1 resize-none text-stone-800 placeholder-stone-400 text-sm leading-relaxed border-none focus:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
};
