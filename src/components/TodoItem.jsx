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
  // Return null if the item is finished and showFinished is false
  if (!showFinished && item.isCompleted) return null;

  // Define base classes for icon buttons for consistency
  const iconButtonBaseClasses = "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"; // Added transition-opacity
  const iconStyle = { fontSize: "20px" }; // Consistent icon size

  // Determine loading states based on buttonLoading prop and item ID
  const isImproving = buttonLoading.improve === item.id;
  const isSummarizing = buttonLoading.summarize === item.id;

  return (
    // Main container for the todo item
    <div key={item.id} className="group relative flex items-center gap-4 p-4 bg-background-light dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow">

      {/* Checkbox and Todo Text Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0"> {/* flex-1 and min-w-0 allow text to wrap properly */}
        {/* Checkbox */}
        <input
          type="checkbox"
          name={item.id} // Use ID for identifying which checkbox was changed
          checked={item.isCompleted}
          onChange={handleCheckbox}
          // Apply styling consistent with the Stitch design
          className="form-checkbox h-6 w-6 rounded-full text-primary bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-primary checked:bg-primary cursor-pointer shrink-0"
        />
        {/* Todo Text */}
        <span className={`whitespace-pre-wrap wrap-break-word ${item.isCompleted ? "line-through text-gray-500 dark:text-gray-400" : "text-[#111618] dark:text-white"}`}>
          {item.todo}
        </span>
      </div>

      {/* Action Buttons Section - Aligned to the right */}
      {/* Buttons appear on hover over the parent group */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">

         {/* Improve Button */}
         <button
          onClick={() => improveTodoGrammar(item.todo, item.id)}
          // Disable if either AI action is loading for this item
          disabled={isImproving || isSummarizing}
          className={`${iconButtonBaseClasses} text-purple-500`}
          title={isImproving ? "Improving..." : "Improve with AI"}
        >
          {/* Icon with conditional spinner class */}
          <span
             className={`material-symbols-outlined ${isImproving ? 'loading-spinner' : ''}`} // Apply spinner class if improving
             style={iconStyle}
          >
             auto_awesome {/* Material Symbols icon name */}
          </span>
        </button>

        {/* Summarize Button - Conditionally rendered if todo is long enough */}
        {item.todo.length > 50 && (
          <button
            onClick={() => summarizeTodo(item.todo, item.id)}
             // Disable if either AI action is loading for this item
            disabled={isImproving || isSummarizing}
            className={`${iconButtonBaseClasses} text-blue-500`}
            title={isSummarizing ? "Summarizing..." : "Summarize"}
          >
             {/* Icon with conditional spinner class */}
            <span
               className={`material-symbols-outlined ${isSummarizing ? 'loading-spinner' : ''}`} // Apply spinner class if summarizing
               style={iconStyle}
            >
               summarize {/* Material Symbols icon name */}
            </span>
          </button>
        )}

         {/* Edit Button */}
        <button
          onClick={(e) => handleEdit(e, item.id)}
           // Disable if an AI action is loading for this item
          disabled={isImproving || isSummarizing}
          className={`${iconButtonBaseClasses} text-[#4A4A4A] dark:text-gray-300`}
          title="Edit"
        >
          <span className="material-symbols-outlined" style={iconStyle}>
            edit {/* Material Symbols icon name */}
          </span>
        </button>

         {/* Delete Button */}
        <button
          onClick={(e) => handleDelete(e, item.id)}
           // Disable if an AI action is loading for this item
          disabled={isImproving || isSummarizing}
          className={`${iconButtonBaseClasses} text-red-500`}
          title="Delete"
        >
          <span className="material-symbols-outlined" style={iconStyle}>
            delete {/* Material Symbols icon name */}
          </span>
        </button>
      </div>
    </div>
  );
}

export default TodoItem;