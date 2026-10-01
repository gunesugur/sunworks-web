import { useCallback, useEffect, useReducer } from "react";

import { createHistory, editKey, push, redo, undo, type History } from "../lib/history";

type Action<T> =
  | { type: "set"; next: T | ((current: T) => T); now: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; value: T };

function reducer<T extends object>(state: History<T>, action: Action<T>): History<T> {
  switch (action.type) {
    case "set": {
      const next = typeof action.next === "function" ? (action.next as (current: T) => T)(state.present) : action.next;
      return push(state, next, editKey(state.present, next), action.now);
    }
    case "undo":
      return undo(state);
    case "redo":
      return redo(state);
    case "reset":
      return createHistory(action.value);
  }
}

/**
 * State with undo and redo. Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z or Ctrl+Y
 * redoes, anywhere on the page.
 */
export function useHistory<T extends object>(initial: T) {
  const [state, dispatch] = useReducer(reducer<T>, initial, createHistory);
  const set = useCallback((next: T | ((current: T) => T)) => dispatch({ type: "set", next, now: Date.now() }), []);
  const doUndo = useCallback(() => dispatch({ type: "undo" }), []);
  const doRedo = useCallback(() => dispatch({ type: "redo" }), []);
  const reset = useCallback((value: T) => dispatch({ type: "reset", value }), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        doUndo();
      } else if ((key === "z" && event.shiftKey) || (key === "y" && event.ctrlKey)) {
        event.preventDefault();
        doRedo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doUndo, doRedo]);

  return {
    value: state.present,
    set,
    undo: doUndo,
    redo: doRedo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
