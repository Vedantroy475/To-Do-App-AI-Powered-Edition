// src/components/TodoItem.jsx
import React from 'react';
// Make sure you have included the Material Symbols Outlined font in your public/index.html or equivalent
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
function TodoItem({
  item,
  showFinished,
  handleCheckbox,
  handleEdit,
  handleDelete,
  summarizeTodo,
  improveTodoGrammar,
  buttonLoading
}) {
  if (!showFinished && item.isCompleted) return null;
  // Base classes for icon buttons
  const iconButtonBaseClasses =
    "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform";
  const iconStyle = { fontSize: "20px" };
  const isImproving = buttonLoading.improve === item.id;
  const isSummarizing = buttonLoading.summarize === item.id;
  return (
    <div
      key={item.id}
      className="
        group relative
        flex flex-col sm:flex-row
        items-start sm:items-center
        gap-4
        p-4
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700
        transition-all duration-200
      "
    >
      {/* Checkbox + Text */}
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        <input
          type="checkbox"
          name={item.id}
          checked={item.isCompleted}
          onChange={handleCheckbox}
          className="form-checkbox h-6 w-6 rounded-full text-primary bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary checked:bg-primary cursor-pointer shrink-0"
        />
        <span
          className={`flex-1 min-w-0 text-sm whitespace-normal break-words ${
            item.isCompleted ? "line-through text-gray-500 dark:text-gray-400" : "text-[#111618] dark:text-white"
          }`}
        >
          {item.todo}
        </span>
      </div>
      {/* Action buttons container:
          - w-full on small screens so we can justify to right (bottom-right alignment)
          - sm:w-auto restores natural width on larger screens
          - Always visible on sm/md (opacity-100)
          - Hidden on lg+ until hover (lg:opacity-0 lg:group-hover:opacity-100)
      */}
      <div
        className="
          w-full sm:w-auto
          flex justify-end items-center gap-1 flex-shrink-0 mt-2 sm:mt-0 sm:ml-2
          z-10 overflow-visible
          opacity-100 lg:opacity-0 lg:group-hover:opacity-100
          transition-opacity
        "
        role="group"
        aria-label="Todo actions"
      >
        {/* Improve */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => improveTodoGrammar(item.todo, item.id)}
            disabled={isImproving || isSummarizing}
            className={`${iconButtonBaseClasses} text-purple-500 transform hover:scale-105`}
            title={isImproving ? "Improving..." : "Improve with AI"}
          >
            <span
              className={`material-symbols-outlined ${isImproving ? 'loading-spinner' : ''}`}
              style={iconStyle}
            >
              auto_awesome
            </span>
          </button>
          {/* Mobile label: Visible on small screens, hidden on desktop */}
          <span className="block lg:hidden text-xs text-gray-700 dark:text-gray-400 font-medium px-1">
            Improve
          </span>
        </div>

        {/* Summarize (long todos only) */}
        {item.todo.length > 50 && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => summarizeTodo(item.todo, item.id)}
              disabled={isImproving || isSummarizing}
              className={`${iconButtonBaseClasses} text-blue-500 transform hover:scale-105`}
              title={isSummarizing ? "Summarizing..." : "Summarize"}
            >
              <span
                className={`material-symbols-outlined ${isSummarizing ? 'loading-spinner' : ''}`}
                style={iconStyle}
              >
                summarize
              </span>
            </button>
            {/* Mobile label */}
            <span className="block lg:hidden text-xs text-gray-700 dark:text-gray-400 font-medium px-1">
              Summarize
            </span>
          </div>
        )}

        {/* Edit */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => handleEdit(e, item.id)}
            disabled={isImproving || isSummarizing}
            className={`${iconButtonBaseClasses} text-[#4A4A4A] dark:text-gray-300 transform hover:scale-105`}
            title="Edit"
          >
            <span className="material-symbols-outlined" style={iconStyle}>
              edit
            </span>
          </button>
          {/* Mobile label */}
          <span className="block lg:hidden text-xs text-gray-700 dark:text-gray-400 font-medium px-1">
            Edit
          </span>
        </div>

        {/* Delete */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => handleDelete(e, item.id)}
            disabled={isImproving || isSummarizing}
            className={`${iconButtonBaseClasses} text-red-500 transform hover:scale-105`}
            title="Delete"
          >
            <span className="material-symbols-outlined" style={iconStyle}>
              delete
            </span>
          </button>
          {/* Mobile label */}
          <span className="block lg:hidden text-xs text-gray-700 dark:text-gray-400 font-medium  px-1">
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}
export default TodoItem;