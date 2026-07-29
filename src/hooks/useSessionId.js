import { useState, useEffect } from 'react';

const SESSION_KEY = 'ucp_session_id';

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {
    /* fall through to legacy generator */
  }
  return 'sess_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

/**
 * Returns a persistent anonymous session id stored in localStorage. Used to
 * rate-limit free-tier queries for visitors who are not logged in.
 */
export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return generateId();
  try {
    let id = window.localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateId();
      window.localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (e) {
    return generateId();
  }
}

/**
 * React hook returning a stable session id (after mount) for anonymous
 * rate limiting.
 */
export function useSessionId() {
  const [sessionId, setSessionId] = useState(null);
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);
  return sessionId;
}