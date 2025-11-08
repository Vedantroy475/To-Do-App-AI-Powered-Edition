// src/components/useTodoOperations.js
import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook to handle all todo CRUD operations
 * Separates business logic from UI components
 */
export const useTodoOperations = (todoTextareaRef) => {
  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Use ref to always have the latest editingId value
  const editingIdRef = useRef(null);
  editingIdRef.current = editingId;

  const fetchTodos = useCallback(async () => {
    try {
      setTodosLoading(true);
      const res = await fetch("/api/getTodos", { credentials: "include" });
      if (res.ok) {
        const { todos: fetchedTodos = [] } = await res.json();
        setTodos(fetchedTodos);
      } else if (res.status === 401) {
        console.error("Unauthorized fetching todos");
      } else {
        console.warn("Failed to fetch todos, status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
    } finally {
      setTodosLoading(false);
    }
  }, []);

  const handleAdd = useCallback(async (todo, setSummaries) => {
    if (!todo.trim()) return { success: false };

    const currentEditingId = editingIdRef.current;

    if (currentEditingId) {
      // Update Logic
      try {
        const res = await fetch("/api/updateTodo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: currentEditingId, todo: todo.trim() })
        });
        if (res.ok) {
          const { todo: updated } = await res.json();
          setTodos(prev => prev.map(t => (t.id === currentEditingId ? updated : t)));
          setEditingId(null);
          if (todoTextareaRef.current) todoTextareaRef.current.blur();
          return { success: true, clear: true };
        } else {
          const err = await res.json().catch(() => ({ error: 'Failed to update' }));
          alert(err.error || "Failed to update todo");
          return { success: false };
        }
      } catch (err) {
        console.error("Update error:", err);
        alert('Network error updating todo.');
        return { success: false };
      }
    }

    // Add Logic
    try {
      const res = await fetch("/api/addTodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ todo: todo.trim() })
      });
      if (res.ok) {
        const { todo: newTodo } = await res.json();
        setTodos(prev => [newTodo, ...prev]);
        if (todoTextareaRef.current) {
          todoTextareaRef.current.blur();
        }
        return { success: true, clear: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to add' }));
        alert(err.error || "Failed to add todo");
        return { success: false };
      }
    } catch (err) {
      console.error("Add todo error:", err);
      alert('Network error adding todo.');
      return { success: false };
    }
  }, [todoTextareaRef]); // Removed editingId from dependencies

  const handleEdit = useCallback((id) => {
    const targetTodo = todos.find(i => i.id === id);
    if (!targetTodo) return null;
    setEditingId(id);
    if (todoTextareaRef.current) {
      setTimeout(() => todoTextareaRef.current.focus(), 0);
    }
    return targetTodo.todo;
  }, [todos, todoTextareaRef]);

  const handleDelete = useCallback(async (id, setSummaries) => {
    try {
      const res = await fetch(`/api/deleteTodo/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setTodos(prev => prev.filter(item => item.id !== id));
        setSummaries(prev => {
          const newS = { ...prev };
          delete newS[id];
          return newS;
        });
        if (editingIdRef.current === id) {
          setEditingId(null);
          return true; // Signal to clear input
        }
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to delete' }));
        alert(err.error || "Failed to delete todo");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert('Network error deleting todo.');
    }
    return false;
  }, []); // Removed editingId from dependencies

  const handleCheckbox = useCallback(async (id, isCompleted) => {
    setTodos(prevTodos =>
      prevTodos.map(item =>
        item.id === id ? { ...item, isCompleted: isCompleted } : item
      )
    );

    try {
      const res = await fetch("/api/updateTodo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, isCompleted })
      });
      if (!res.ok) {
        console.warn("Failed to update todo completion status on backend");
        setTodos(prevTodos =>
          prevTodos.map(item =>
            item.id === id ? { ...item, isCompleted: !isCompleted } : item
          )
        );
        alert('Failed to save completion status.');
      }
    } catch (err) {
      console.error("Update completion error:", err);
      setTodos(prevTodos =>
        prevTodos.map(item =>
          item.id === id ? { ...item, isCompleted: !isCompleted } : item
        )
      );
      alert('Network error updating completion status.');
    }
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    if (todoTextareaRef.current) todoTextareaRef.current.blur();
  }, [todoTextareaRef]);

  return {
    todos,
    setTodos,
    todosLoading,
    editingId,
    fetchTodos,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCheckbox,
    cancelEdit
  };
};