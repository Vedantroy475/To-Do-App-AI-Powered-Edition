// src/components/SummaryAccordion.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

function SummaryAccordion({ todoId, summary, isLoading, collapsed, onClose }) {
  return (
    <div
      className={`ml-10 pl-4 border-l-2 border-gray-300 dark:border-gray-600 transition-all duration-500 ease-in-out overflow-hidden ${
        collapsed ? 'max-h-0 opacity-0' : 'max-h-48 opacity-100'
      }`}
    >
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: '-0.3s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: '-0.15s' }}
                ></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Generating summary...</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : summary ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">AI Summary</h4>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SummaryAccordion;