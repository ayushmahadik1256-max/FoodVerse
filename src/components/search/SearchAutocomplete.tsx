import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  isFuzzyMatch,
  TRENDING_SEARCHES,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from '../../utils/searchUtils';
import { Search, Mic, MicOff, Clock, TrendingUp, X, Sparkles, Utensils, Store } from 'lucide-react';
import { MenuItem, Restaurant } from '../../types';

interface SearchAutocompleteProps {
  onSelectRestaurant?: (restaurantId: string) => void;
  onSelectDish?: (dish: MenuItem) => void;
  isMobile?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  onSelectRestaurant,
  onSelectDish,
  isMobile = false,
}) => {
  const { filters, setFilters, restaurants, menuItems, openCustomizationModal } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Typewriter effect phrases
  const [typewriterText, setTypewriterText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const TYPEWRITER_LIST = [
    'dum biryani...',
    'woodfired pizza...',
    'smash cheeseburger...',
    'tandoori momos...',
    'butter chicken...',
    'masala dosa...',
    'royal malai kulfi...',
  ];

  useEffect(() => {
    const current = TYPEWRITER_LIST[phraseIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && charIdx < current.length) {
      timer = setTimeout(() => {
        setTypewriterText(current.substring(0, charIdx + 1));
        setCharIdx((prev) => prev + 1);
      }, 80);
    } else if (!isDeleting && charIdx === current.length) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && charIdx > 0) {
      timer = setTimeout(() => {
        setTypewriterText(current.substring(0, charIdx - 1));
        setCharIdx((prev) => prev - 1);
      }, 45);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPEWRITER_LIST.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, phraseIdx]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const query = filters.searchQuery.trim().toLowerCase();

  // Fuzzy matching items
  const matchingDishes = query
    ? menuItems
        .filter((d) => isFuzzyMatch(query, d.name) || isFuzzyMatch(query, d.description) || isFuzzyMatch(query, d.category))
        .slice(0, 5)
    : [];

  const matchingRestaurants = query
    ? restaurants
        .filter((r) => isFuzzyMatch(query, r.name) || r.cuisines.some((c) => isFuzzyMatch(query, c)))
        .slice(0, 4)
    : [];

  const handleExecuteSearch = (text: string) => {
    const updated = saveRecentSearch(text);
    setRecentSearches(updated);
    setFilters((prev) => ({ ...prev, searchQuery: text }));
    setIsOpen(false);
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Web Speech API Voice Search
  const toggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search is not supported in this browser. Please type your query.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... speak your dish or cuisine now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleExecuteSearch(transcript);
          setVoiceNotice(`Searched for: "${transcript}"`);
          setTimeout(() => setVoiceNotice(null), 3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceNotice('Could not hear voice clearly or mic access denied. Try again.');
        setTimeout(() => setVoiceNotice(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      console.error(e);
      setIsListening(false);
      setVoiceNotice('Microphone unavailable.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filters.searchQuery.trim()) {
              handleExecuteSearch(filters.searchQuery);
            }
          }}
          placeholder={isMobile ? `Search for ${typewriterText}` : `Search for ${typewriterText} (voice supported)`}
          className="w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />

        {/* Clear & Voice buttons */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {filters.searchQuery && (
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, searchQuery: '' }));
              }}
              className="w-6 h-6 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mic Button */}
          <button
            onClick={toggleVoiceSearch}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-stone-400 hover:text-orange-500 hover:bg-stone-200/60 dark:hover:bg-stone-700'
            }`}
            title="Search by Voice (Web Speech API)"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Voice feedback banner */}
      {voiceNotice && (
        <div className="absolute left-0 right-0 top-full mt-1.5 p-2 rounded-xl bg-stone-900 text-white text-[11px] font-bold text-center z-50 shadow-xl border border-stone-800 animate-in fade-in">
          {voiceNotice}
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 py-3 z-50 overflow-hidden max-h-[75vh] overflow-y-auto animate-in fade-in">
          {/* If user is typing query */}
          {query ? (
            <div className="space-y-3">
              {/* Matching Dishes */}
              {matchingDishes.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Utensils className="w-3 h-3 text-orange-500" />
                    <span>Dishes ({matchingDishes.length})</span>
                  </div>
                  <div className="divide-y divide-stone-50 dark:divide-stone-800/60">
                    {matchingDishes.map((dish) => (
                      <div
                        key={dish.id}
                        onClick={() => {
                          handleExecuteSearch(dish.name);
                          if (onSelectDish) onSelectDish(dish);
                          else openCustomizationModal(dish);
                        }}
                        className="px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                                  dish.isVeg ? 'border-emerald-500' : 'border-rose-500'
                                }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${
                                    dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                              </span>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1">
                                {dish.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {dish.category} • ⭐ {dish.rating}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100 shrink-0">
                          ₹{dish.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Restaurants */}
              {matchingRestaurants.length > 0 && (
                <div>
                  <div className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <Store className="w-3 h-3 text-blue-500" />
                    <span>Restaurants ({matchingRestaurants.length})</span>
                  </div>
                  <div className="divide-y divide-stone-50 dark:divide-stone-800/60">
                    {matchingRestaurants.map((rest) => (
                      <div
                        key={rest.id}
                        onClick={() => {
                          handleExecuteSearch(rest.name);
                          if (onSelectRestaurant) onSelectRestaurant(rest.id);
                        }}
                        className="px-4 py-2 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rest.image}
                            alt={rest.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1">
                              {rest.name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {rest.cuisines.slice(0, 2).join(', ')} • {rest.deliveryTime} mins
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                          ★ {rest.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchingDishes.length === 0 && matchingRestaurants.length === 0 && (
                <div className="p-6 text-center text-xs text-stone-400">
                  No direct matches for "{filters.searchQuery}". Press Enter to search everywhere.
                </div>
              )}
            </div>
          ) : (
            /* User hasn't typed anything yet: Show Recent Searches & Trending */
            <div className="space-y-4 px-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((rec) => (
                      <button
                        key={rec}
                        onClick={() => handleExecuteSearch(rec)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:border-orange-400 hover:text-orange-500 border border-stone-200/60 dark:border-stone-700 transition-colors"
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span>Trending Gourmet Cravings</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleExecuteSearch(trend)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 text-xs font-bold border border-orange-200/50 dark:border-orange-800/40 hover:bg-orange-100 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      <span>{trend}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
