// src/components/useAIOperations.js
import { useState, useCallback } from 'react';
import { callOpenRouterAPI } from '../utils/api';

/**
 * Custom hook to handle AI-powered operations (summarize, improve grammar)
 * Separates AI logic from UI components
 */
export const useAIOperations = (setTodos) => {
  const [buttonLoading, setButtonLoading] = useState({ summarize: null, improve: null });
  const [summaries, setSummaries] = useState({});

  const updateSummary = useCallback((id, updates) => {
    setSummaries(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates }
    }));
  }, []);

  const summarizeTodo = useCallback(async (todoText, id) => {
    setButtonLoading(prev => ({ ...prev, summarize: id }));
    updateSummary(id, { loading: true, collapsed: false });
    const prompt = `Please summarize this todo in a concise way: "${todoText}"`;

    try {
      const summary = await callOpenRouterAPI(prompt);
      updateSummary(id, { loading: false, summary });
    } catch (error) {
      console.error("Summarize error:", error);
      updateSummary(id, { loading: false, summary: 'Sorry, I couldn\'t summarize that todo.' });
    } finally {
      setButtonLoading(prev => ({ ...prev, summarize: null }));
    }
  }, [updateSummary]);

  const improveTodoGrammar = useCallback(async (todoText, id) => {
    setButtonLoading(prev => ({ ...prev, improve: id }));

    const prompt = `Please improve the grammar and polish this todo. 
Respond with ONLY the rewritten todo text and nothing else. 
Do not add any preamble, explanation, or markdown.
Original todo: "${todoText}"`;

    let cleanedImproved = '';

    try {
      const improved = await callOpenRouterAPI(prompt);

      cleanedImproved = improved
        .replace(/^(Polished version:|Here's the polished version:|Improved:|["*#]+)/i, "")
        .replace(/["*]+$/, "")
        .trim();

      if (!cleanedImproved) {
        throw new Error("AI returned empty improvement.");
      }

      // Update the todo on the backend
      const res = await fetch("/api/updateTodo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, todo: cleanedImproved })
      });

      if (res.ok) {
        const { todo: updated } = await res.json();
        setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
      } else {
        const errData = await res.json().catch(() => ({ error: 'Failed to save improvement' }));
        console.warn("Failed to persist improved todo", errData);
        throw new Error(errData.error || 'Failed to save improvement.');
      }
    } catch (err) {
      console.error("Improve/Update error:", err);
      alert(`Sorry, I couldn't improve that todo. ${err.message}`);
    } finally {
      setButtonLoading(prev => ({ ...prev, improve: null }));
    }
  }, [setTodos]);

  const handleSummaryClose = useCallback((id) => {
    updateSummary(id, { collapsed: true });
    setTimeout(() => {
      setSummaries(prev => {
        const newSummaries = { ...prev };
        delete newSummaries[id];
        return newSummaries;
      });
    }, 500);
  }, [updateSummary]);

  return {
    buttonLoading,
    summaries,
    setSummaries,
    summarizeTodo,
    improveTodoGrammar,
    handleSummaryClose
  };
};