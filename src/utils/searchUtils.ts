// Fuzzy search matching and typography helpers

export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

export function isFuzzyMatch(query: string, target: string, threshold = 2): boolean {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();

  if (!q) return true;
  if (t.includes(q)) return true;

  // Split query and target into words
  const qWords = q.split(/\s+/);
  const tWords = t.split(/\s+/);

  for (const qw of qWords) {
    if (qw.length < 3) {
      if (t.includes(qw)) return true;
      continue;
    }
    // Check against each word in target
    for (const tw of tWords) {
      if (tw.startsWith(qw) || qw.startsWith(tw)) return true;
      const dist = levenshteinDistance(qw, tw);
      if (dist <= threshold) return true;
    }
  }

  return false;
}

export const TRENDING_SEARCHES = [
  'Smash Burger',
  'Truffle Pizza',
  'Dum Biryani',
  'Ghee Roast Dosa',
  'Blueberry Cheesecake',
  'Sashimi Poke Bowl',
  'Penne Pasta',
];

export const RECENT_SEARCHES_KEY = 'foodverse_recent_searches';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : ['Burgers', 'Artisan Pizza', 'Biryani'];
  } catch {
    return ['Burgers', 'Artisan Pizza', 'Biryani'];
  }
}

export function saveRecentSearch(query: string): string[] {
  if (!query.trim()) return getRecentSearches();
  try {
    const current = getRecentSearches().filter((s) => s.toLowerCase() !== query.trim().toLowerCase());
    const updated = [query.trim(), ...current].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [query.trim()];
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
