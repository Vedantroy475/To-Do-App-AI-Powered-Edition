// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import TodoSection from "../components/TodoSection";
import { useTodoOperations } from "../components/useTodoOperations";
import { useAIOperations } from "../components/useAIOperations";

function HomePage({ user }) {
  const [todo, setTodo] = useState("");
  const [showFinished, setShowFinished] = useState(true);
  const todoTextareaRef = useRef(null);

  // Custom hooks for business logic
  const {
    todos,
    setTodos,
    todosLoading,
    editingId,
    fetchTodos,
    handleAdd: handleAddTodo,
    handleEdit: handleEditTodo,
    handleDelete: handleDeleteTodo,
    handleCheckbox,
    cancelEdit
  } = useTodoOperations(todoTextareaRef);

  const {
    buttonLoading,
    summaries,
    setSummaries,
    summarizeTodo,
    improveTodoGrammar,
    handleSummaryClose
  } = useAIOperations(setTodos);

  // Fetch todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Wrapper functions to handle state updates
  const handleAdd = async () => {
    const result = await handleAddTodo(todo, setSummaries);
    if (result?.clear) {
      setTodo("");
    }
  };

  // This wrapper receives (event, id) from the TodoItem button click
  const handleEdit = (e, id) => {
    const todoText = handleEditTodo(id);
    if (todoText) {
      setTodo(todoText);
    }
  };

  // This wrapper receives (event, id) from the TodoItem button click
  const handleDelete = async (e, id) => {
    // Pass strictly the ID and the setSummaries function to the hook
    const shouldClearInput = await handleDeleteTodo(id, setSummaries);
    if (shouldClearInput) {
      setTodo("");
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (if not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    // Cancel edit on Escape key
    if (e.key === 'Escape' && editingId) {
      setTodo('');
      cancelEdit();
    }
  };

  const handleCheckboxChange = (e) => {
    const id = e.target.name;
    const isCompleted = e.target.checked;
    handleCheckbox(id, isCompleted);
  };

  const toggleFinished = () => setShowFinished(!showFinished);

  return (
    <>
      <TodoSection
        todo={todo}
        setTodo={setTodo}
        handleAdd={handleAdd}
        handleKeyDown={handleKeyDown}
        editingId={editingId}
        todoTextareaRef={todoTextareaRef}
        showFinished={showFinished}
        toggleFinished={toggleFinished}
        todos={todos}
        todosLoading={todosLoading}
        handleCheckbox={handleCheckboxChange}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        summarizeTodo={summarizeTodo}
        improveTodoGrammar={improveTodoGrammar}
        buttonLoading={buttonLoading}
        summaries={summaries}
        handleSummaryClose={handleSummaryClose}
        className="w-full"
      />
    </>
  );
}

export default HomePage;