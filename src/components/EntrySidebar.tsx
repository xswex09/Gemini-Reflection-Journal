import React, { useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import {
  Plus,
  Search,
  BookOpen,
  MessageSquare,
  Trash2,
  Calendar,
  Sparkles,
  Tag
} from 'lucide-react';

interface EntrySidebarProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  loading: boolean;
}

const CATEGORIES = ['All', 'Reflection', 'Gratitude', 'Brainstorming', 'Decision', 'Personal'] as const;

export const EntrySidebar: React.FC<EntrySidebarProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'All' || entry.category === selectedCategory;
      const matchesSearch =
        !searchTerm.trim() ||
        (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [entries, selectedCategory, searchTerm]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEntryToDelete(id);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entryToDelete) {
      onDeleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEntryToDelete(null);
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-stone-50 border-r border-stone-200 flex flex-col h-[calc(100vh-4rem)] shrink-0">
      {/* Top Header & New Entry Button */}
      <div className="p-4 border-b border-stone-200 bg-white">
        <button
          id="sidebar-new-entry-btn"
          onClick={onNewEntry}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all duration-150 space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Reflection</span>
        </button>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Search past entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center py-12 text-stone-400 text-xs">
            <div className="inline-block w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Syncing Firestore records...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-stone-700">No reflections found</p>
            <p className="text-[11px] text-stone-500 mt-1">
              {entries.length === 0
                ? 'Begin your first journal entry to brainstorm and reflect with Gemini.'
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = entry.id === selectedEntryId;
            const messageCount = entry.messages ? entry.messages.length : 0;
            const dateStr = entry.createdAt
              ? new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Draft';

            return (
              <div
                key={entry.id}
                id={`entry-item-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-white border-stone-400 shadow-xs ring-1 ring-stone-400/20'
                    : 'bg-white/80 hover:bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-stone-900 line-clamp-1">
                    {entry.title || 'Untitled Reflection'}
                  </h3>

                  {/* Delete Trigger */}
                  <button
                    onClick={(e) => handleDeleteClick(e, entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity rounded-md"
                    title="Delete reflection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Snippet */}
                <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                  {entry.content || 'No written thoughts yet...'}
                </p>

                {/* Metadata badges */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-500">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="inline-flex items-center text-stone-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {dateStr}
                    </span>
                    {entry.mood && (
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                        {entry.mood}
                      </span>
                    )}
                  </div>

                  {messageCount > 0 && (
                    <span className="inline-flex items-center text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-600" />
                      {messageCount} {messageCount === 1 ? 'turn' : 'turns'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xs w-full p-5 border border-stone-200 shadow-lg text-center">
            <h4 className="text-sm font-semibold text-stone-900">Delete this entry?</h4>
            <p className="text-xs text-stone-600 mt-1.5">
              This will permanently remove the reflection and its associated Gemini conversations from Cloud Firestore.
            </p>
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-entry-btn"
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
