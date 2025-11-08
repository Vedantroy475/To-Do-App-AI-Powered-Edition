import React from 'react';
import TodoItem from './TodoItem';

function TodoList({ 
  todos, 
  todosLoading, 
  showFinished, 
  handleCheckbox, 
  handleEdit, 
  handleDelete, 
  summarizeTodo, 
  improveTodoGrammar, 
  buttonLoading 
}) {
  return (
    <div className="todos space-y-4 overflow-y-auto pr-2 flex-1 min-h-0">
      {todosLoading ? (
        <p className="text-center text-gray-500">Loading todos...</p>
      ) : todos.length === 0 ? (
        <p className="text-center text-gray-500">No todos yet</p>
      ) : (
        todos.map(item => (
          <TodoItem
            key={item.id}
            item={item}
            showFinished={showFinished}
            handleCheckbox={handleCheckbox}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            summarizeTodo={summarizeTodo}
            improveTodoGrammar={improveTodoGrammar}
            buttonLoading={buttonLoading}
          />
        ))
      )}
    </div>
  );
}

export default TodoList;