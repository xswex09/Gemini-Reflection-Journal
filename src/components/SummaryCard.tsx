import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface SummaryCardProps {
  summary: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-6 my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-semibold tracking-tight">
            Gemini Reflection Synthesis
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="p-1 text-amber-800 hover:text-amber-950 text-[11px] inline-flex items-center space-x-1 rounded hover:bg-amber-100 transition-colors"
            title="Copy summary text"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-amber-700" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-amber-800 hover:text-amber-950 rounded hover:bg-amber-100 transition-colors"
            title={collapsed ? 'Expand summary' : 'Collapse summary'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans border-t border-amber-200/60 pt-3">
          {summary}
        </div>
      )}
    </div>
  );
};
