// src/components/TodoSection.jsx
import React from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import TodoFilters from './TodoFilters';
import SpeechRecognitionHandler from './SpeechRecognitionHandler';
import SummaryAccordion from './SummaryAccordion';
/**
 * TodoSection component - Renders the main todo management interface
 */
function TodoSection({
  todo,
  setTodo,
  handleAdd,
  handleKeyDown: originalHandleKeyDown,
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
    <div className="todo-section bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto w-full h-[85dvh] md:h-auto md:max-h-[90vh] flex flex-col md:flex-1 relative overflow-y-hidden">
      <h1 className="text-center text-3xl font-bold mb-6 shrink-0">
        Manage your todos
      </h1>
   
      <SpeechRecognitionHandler
        currentValue={todo}
        setCurrentValue={setTodo}
        isEditing={!!editingId}
      >
        {({ listening, startListening, stopListening, browserSupportsSpeechRecognition, permissionState }) => {
          const handleKeyDownWrapper = (e) => {
            if (e.key === 'Enter' && !e.shiftKey && listening) {
              stopListening();
            }
            originalHandleKeyDown(e);
          };
          return (
            <TodoInput
              todo={todo}
              setTodo={setTodo}
              handleAdd={handleAdd}
              handleKeyDown={handleKeyDownWrapper}
              listening={listening}
              startListening={startListening}
              stopListening={stopListening}
              editingId={editingId}
              todoTextareaRef={todoTextareaRef}
              browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
              permissionState={permissionState}
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
          <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
             {/* Flattened rendering: Render TodoItem directly */}
             {todos.map(item => (
                <div key={item.id} className="space-y-2 pt-2 first:pt-0">
                  <TodoItem
                    item={item}
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
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default TodoSection;