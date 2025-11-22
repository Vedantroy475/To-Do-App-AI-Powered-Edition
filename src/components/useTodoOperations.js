// src/components/useTodoOperations.js
import { useState, useCallback, useRef } from 'react';
/**
 * Custom hook to handle all todo CRUD operations
 * STRATEGY: Refetching (Pessimistic/Hybrid Updates)
 * This ensures the UI stays perfectly in sync with the server,
 * preventing duplicates and ghost items.
 */
export const useTodoOperations = (todoTextareaRef) => {
  const [todos, setTodos] = useState([]);
  const [todosLoading, setTodosLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // NEW: Used to lock UI during add
  // Use ref to always have the latest editingId value
  const editingIdRef = useRef(null);
  editingIdRef.current = editingId;
  // Modified to accept 'showLoading' argument for silent background refreshes
  const fetchTodos = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setTodosLoading(true);
      const res = await fetch("/api/getTodos", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // Handle case where data might be { todos: [...] } or just [...]
        const fetchedTodos = data.todos || data || [];
        setTodos(fetchedTodos);
      } else if (res.status === 401) {
        console.error("Unauthorized fetching todos");
      } else {
        console.warn("Failed to fetch todos, status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching todos:", err);
    } finally {
      if (showLoading) setTodosLoading(false);
    }
  }, []);
  const handleAdd = useCallback(async (todo, setSummaries) => {
    if (!todo.trim()) return { success: false };
    const currentEditingId = editingId; // Use state directly from dependency
    // --- UPDATE LOGIC ---
    if (currentEditingId) {
      try {
        const res = await fetch("/api/updateTodo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: currentEditingId, todo: todo.trim() })
        });
        if (res.ok) {
          // Success: Silent Refresh to ensure DB sync
          await fetchTodos(false);
         
          setEditingId(null);
          if (todoTextareaRef.current) todoTextareaRef.current.blur();
          return { success: true, clear: true };
        } else {
          const err = await res.json().catch(() => ({ error: 'Failed to update' }));
          await fetchTodos(false);
          alert(err.error || "Failed to update todo");
          return { success: false };
        }
      } catch (err) {
        await fetchTodos(false);
        console.error("Update error:", err);
        alert('Network error updating todo.');
        return { success: false };
      }
    }
    // --- ADD LOGIC ---
    try {
      setIsAdding(true); // Lock the button
      const res = await fetch("/api/addTodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ todo: todo.trim() })
      });
      if (res.ok) {
        // Success: Silent Refresh (This fixes the duplicate bug)
        await fetchTodos(false);
        if (todoTextareaRef.current) {
          todoTextareaRef.current.blur();
        }
        return { success: true, clear: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to add' }));
        await fetchTodos(false);
        alert(err.error || "Failed to add todo");
        return { success: false };
      }
    } catch (err) {
      await fetchTodos(false);
      console.error("Add todo error:", err);
      alert('Network error adding todo.');
      return { success: false };
    } finally {
      setIsAdding(false); // Unlock the button
    }
  }, [todoTextareaRef, fetchTodos, editingId]);
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
    // 1. Optimistic Update: Remove visually immediately for speed
    setTodos(prev => prev.filter(item => item && item.id !== id));
   
    // Remove summary locally
    setSummaries(prev => {
      const newS = { ...prev };
      delete newS[id];
      return newS;
    });
    if (editingIdRef.current === id) {
      setEditingId(null);
    }
    // 2. Network Request
    try {
      const res = await fetch(`/api/deleteTodo/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
     
      if (!res.ok) {
        // If server failed, force a refresh to show the item again (rollback)
        if (res.status !== 404) {
            await fetchTodos(false);
            alert("Failed to delete todo on server.");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      await fetchTodos(false); // Sync on error
      alert('Network error deleting todo.');
    }
    return true;
  }, [fetchTodos, editingIdRef]);
  const handleCheckbox = useCallback(async (id, isCompleted) => {
    // Optimistic UI update
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
        // Revert by refreshing
        await fetchTodos(false);
      }
    } catch (err) {
      console.error("Update completion error:", err);
      await fetchTodos(false);
      alert('Network error updating completion status.');
    }
  }, [fetchTodos]);
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    if (todoTextareaRef.current) todoTextareaRef.current.blur();
  }, [todoTextareaRef]);
  return {
    todos,
    setTodos,
    todosLoading,
    editingId,
    isAdding, // Exported for UI loading state
    fetchTodos,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCheckbox,
    cancelEdit
  };
};