// src/components/TodoSection.jsx
import React from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import TodoFilters from './TodoFilters';
import SpeechRecognitionHandler from './SpeechRecognitionHandler';
import SummaryAccordion from './SummaryAccordion';

/**
 * TodoSection component - Renders the main todo management interface
 * Encapsulates the entire todo section UI
 */
function TodoSection({
  todo,
  setTodo,
  handleAdd,
  handleKeyDown: originalHandleKeyDown, // <-- Rename original prop
  editingId,
  todoTextareaRef,
  showFinished,
  toggleFinished,
  todos,
  todosLoading,
  handleCheckbox,
  handleEdit,
  handleDelete,
  summarizeTodo,
  improveTodoGrammar,
  buttonLoading,
  summaries,
  handleSummaryClose
}) {
  return (
    <div className="todo-section bg-violet-100 rounded-xl p-6 shadow-md max-w-3xl mx-auto w-full max-h-[90vh] flex flex-col md:flex-1">
      <h1 className="text-center text-3xl font-bold mb-6 shrink-0">
        Manage your todos
      </h1>

      {/* Speech Recognition wraps ONLY the Input */}
      <SpeechRecognitionHandler
        currentValue={todo}
        setCurrentValue={setTodo}
        isEditing={!!editingId} // Pass boolean indicating if editing
      >
        {/* Render prop function provides speech state & controls */}
        {({ listening, startListening, stopListening, browserSupportsSpeechRecognition }) => {
          // Wrapper to stop listening on Enter press before handling add/save
          const handleKeyDownWrapper = (e) => {
            if (e.key === 'Enter' && !e.shiftKey && listening) {
              stopListening(); // Stop mic first
            }
            // Then call the original handler from HomePage
            originalHandleKeyDown(e);
          };

          // Return the TodoInput component from within the render prop
          return (
            <TodoInput
              todo={todo}
              setTodo={setTodo}
              handleAdd={handleAdd}
              handleKeyDown={handleKeyDownWrapper} // Pass the wrapper
              listening={listening}
              startListening={startListening}
              stopListening={stopListening}
              editingId={editingId}
              todoTextareaRef={todoTextareaRef}
              // Pass browser support flag if TodoInput needs it
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
            />
          );
        }}
      </SpeechRecognitionHandler>

      <TodoFilters
        showFinished={showFinished}
        toggleFinished={toggleFinished}
      />

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0">
        {todosLoading ? (
          <p className="text-center text-gray-500">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-gray-500">No todos yet</p>
        ) : (
          todos.map(item => (
            <div key={item.id} className="space-y-2">
              <TodoList
                todos={[item]}
                todosLoading={false}
                showFinished={showFinished}
                handleCheckbox={handleCheckbox}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                summarizeTodo={summarizeTodo}
                improveTodoGrammar={improveTodoGrammar}
                buttonLoading={buttonLoading}
              />
              {summaries[item.id] && (
                <SummaryAccordion
                  todoId={item.id}
                  summary={summaries[item.id].summary}
                  isLoading={summaries[item.id].loading}
                  collapsed={summaries[item.id].collapsed || false}
                  onClose={() => handleSummaryClose(item.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoSection;