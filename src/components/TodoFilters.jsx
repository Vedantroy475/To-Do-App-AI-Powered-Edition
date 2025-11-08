import React from 'react';

function TodoFilters({ showFinished, toggleFinished }) {
  return (
    <div className="flex items-center mb-4 shrink-0">
      <input 
        type="checkbox" 
        checked={showFinished} 
        onChange={toggleFinished} 
        className="mr-2 cursor-pointer" 
      />
      <label>Show Finished</label>
    </div>
  );
}

export default TodoFilters;