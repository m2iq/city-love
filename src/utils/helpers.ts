import { nanoid } from 'nanoid';

// Generate a short unique slug (8 chars)
export function generateSlug(): string {
  return nanoid(8);
}

// Format date nicely
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Simple rate limiter using localStorage
const RATE_LIMIT_KEY = 'cl_rate';
const RATE_LIMIT_MAX = 5; // max messages
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    if (!data) return true;
    const { count, timestamp } = JSON.parse(data);
    if (Date.now() - timestamp > RATE_LIMIT_WINDOW) return true;
    return count < RATE_LIMIT_MAX;
  } catch {
    return true;
  }
}

export function incrementRateLimit(): void {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    if (!data) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: Date.now() }));
      return;
    }
    const { count, timestamp } = JSON.parse(data);
    if (Date.now() - timestamp > RATE_LIMIT_WINDOW) {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, timestamp: Date.now() }));
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: count + 1, timestamp }));
    }
  } catch {
    // Fail silently
  }
}

// ── Local message history ──────────────────────────────────────────

const HISTORY_KEY = 'cl_messages';

export interface SavedMessage {
  slug: string;
  sender_name: string;
  receiver_name: string;
  sender_province: string;
  receiver_province: string;
  heart_color: string;
  theme: string;
  created_at: string;
}

export function getMessageHistory(): SavedMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedMessage[];
  } catch {
    return [];
  }
}

export function saveMessageToHistory(msg: Omit<SavedMessage, 'created_at'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMessageHistory();
    history.unshift({ ...msg, created_at: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Fail silently
  }
}

export function deleteMessageFromHistory(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMessageHistory().filter((m) => m.slug !== slug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Fail silently
  }
}

export function updateMessageInHistory(slug: string, updates: Partial<Omit<SavedMessage, 'slug' | 'created_at'>>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMessageHistory().map((m) =>
      m.slug === slug ? { ...m, ...updates } : m
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Fail silently
  }
}
