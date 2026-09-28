import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Type, RotateCcw } from 'lucide-react';

export interface FontOption {
  id: string;
  name: string;
  category: string;
  headingFont: string;
  bodyFont: string;
  headingFontFamily: string;
  bodyFontFamily: string;
  description: string;
  sampleHeading: string;
  sampleBody: string;
  imageSrc: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'syne-inter',
    name: 'Syne + Inter',
    category: 'Modern Tech & Gourmet Editorial',
    headingFont: 'Syne',
    bodyFont: 'Inter',
    headingFontFamily: "'Syne', sans-serif",
    bodyFontFamily: "'Inter', sans-serif",
    description: 'High-contrast, avant-garde headings with clean, razor-sharp body text. Perfect for trendy gourmet concepts.',
    sampleHeading: 'Truffle Smash Burger Royale • ₹349',
    sampleBody: 'Charcoal flame-grilled Angus patty with melted vintage cheddar, truffle glaze & toasted brioche.',
    imageSrc: '/assets/fonts/sample-1-syne-inter.svg',
  },
  {
    id: 'playfair-jakarta',
    name: 'Playfair Display + Plus Jakarta',
    category: 'Luxury Michelin & Artisanal',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    headingFontFamily: "'Playfair Display', Georgia, serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    description: 'Refined editorial serif paired with smooth modern sans. Gives a Michelin-star, fine-dining magazine feel.',
    sampleHeading: 'Artisanal Slow-Braised Biryani • ₹499',
    sampleBody: 'Fragrant aged basmati infused with hand-pounded saffron, whole spices, and tender bone-in cuts.',
    imageSrc: '/assets/fonts/sample-2-playfair-jakarta.svg',
  },
  {
    id: 'urbanist',
    name: 'Urbanist (Pure Geometric)',
    category: 'Vibrant Street Food & Burger Bar',
    headingFont: 'Urbanist',
    bodyFont: 'Urbanist',
    headingFontFamily: "'Urbanist', sans-serif",
    bodyFontFamily: "'Urbanist', sans-serif",
    description: 'Sleek, geometric, high-energy typography. Ideal for fast-casual burger joints and punchy street food.',
    sampleHeading: 'Double Smashed Cheeseburger • ₹299',
    sampleBody: 'Crispy caramelized crust, grilled red onions, house special smoky sauce on a warm potato bun.',
    imageSrc: '/assets/fonts/sample-3-urbanist.svg',
  },
  {
    id: 'fraunces-dmsans',
    name: 'Fraunces + DM Sans',
    category: 'Warm Bistro & Artisan Bakery',
    headingFont: 'Fraunces',
    bodyFont: 'DM Sans',
    headingFontFamily: "'Fraunces', Georgia, serif",
    bodyFontFamily: "'DM Sans', sans-serif",
    description: 'Appetizing, soft-curved organic serif paired with approachable, friendly sans. Radiates warmth and craftsmanship.',
    sampleHeading: 'Wood-Fired Neapolitan Margherita • ₹380',
    sampleBody: 'Slow-fermented sourdough crust with San Marzano tomatoes, fresh fior di latte & basil.',
    imageSrc: '/assets/fonts/sample-4-fraunces-dmsans.svg',
  },
  {
    id: 'space-jakarta',
    name: 'Space Grotesk + Plus Jakarta',
    category: 'Neo-Grotesque & Bold FoodVerse',
    headingFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    headingFontFamily: "'Space Grotesk', sans-serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    description: 'Distinctive, tech-forward monospace-inspired accents with balanced readability.',
    sampleHeading: 'Hyper-Crisp Baja Fish Tacos • ₹320',
    sampleBody: 'Tempura battered catch of the day, zesty pickled slaw, avocado crema & handmade corn tortillas.',
    imageSrc: '/assets/fonts/sample-5-space-jakarta.svg',
  },
  {
    id: 'outfit-jakarta',
    name: 'Outfit + Plus Jakarta Sans',
    category: 'Original Balanced Experience',
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    headingFontFamily: "'Outfit', sans-serif",
    bodyFontFamily: "'Plus Jakarta Sans', sans-serif",
    description: 'Friendly, rounded modern display typography. Highly readable on all devices.',
    sampleHeading: 'Smoked Honey Glazed Wings • ₹280',
    sampleBody: 'Tender chicken wings tossed in smoked chipotle honey BBQ glaze served with gorgonzola dip.',
    imageSrc: '/assets/fonts/sample-6-outfit-jakarta.svg',
  },
];

interface FontSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FontSelectorModal: React.FC<FontSelectorModalProps> = ({ isOpen, onClose }) => {
  const [currentFontId, setCurrentFontId] = useState<string>('outfit-jakarta');
  const [customText, setCustomText] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('foodverse_font') || 'outfit-jakarta';
    setCurrentFontId(saved);
  }, []);

  const handleSelectFont = (fontId: string) => {
    setCurrentFontId(fontId);
    document.documentElement.setAttribute('data-font', fontId);
    localStorage.setItem('foodverse_font', fontId);
  };

  const handleReset = () => {
    handleSelectFont('outfit-jakarta');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between bg-stone-50/70 dark:bg-stone-900/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-500/10 text-orange-500">
                <Type className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                Choose App Typography
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
              Preview each font pairing live with actual gourmet menu specimens. Selecting an option updates the entire website instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset to default font"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Custom Text Tester */}
        <div className="px-6 py-3 bg-stone-100/60 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type custom text to preview across all font options (optional)..."
            className="w-full bg-transparent text-xs sm:text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none"
          />
          {customText && (
            <button
              onClick={() => setCustomText('')}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Scrollable Font Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FONT_OPTIONS.map((font) => {
              const isSelected = currentFontId === font.id;
              const displayText = customText.trim() || font.sampleHeading;

              return (
                <div
                  key={font.id}
                  onClick={() => handleSelectFont(font.id)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-orange-300 dark:hover:border-stone-700 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-orange-500 animate-pulse' : 'bg-stone-300 dark:bg-stone-700'
                          }`}
                        />
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {font.name}
                        </h3>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        {font.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">
                      {font.description}
                    </p>

                    {/* Visual Specimen Graphic Image Card */}
                    <div className="rounded-xl overflow-hidden mb-3 border border-stone-200 dark:border-stone-800 shadow-sm bg-stone-950 group-hover:border-orange-500/50 transition-colors">
                      <img
                        src={font.imageSrc}
                        alt={`${font.name} Visual Sample`}
                        className="w-full h-auto object-cover block"
                        loading="lazy"
                      />
                    </div>

                    {/* Optional Custom Text Preview (when user types in test box) */}
                    {customText.trim() && (
                      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 mb-3 space-y-1.5">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-orange-500">
                          Custom Live Preview
                        </div>
                        <div
                          style={{ fontFamily: font.headingFontFamily }}
                          className="text-base font-bold text-stone-900 dark:text-stone-50 leading-snug"
                        >
                          {customText}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action footer */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-stone-400">
                      Headings: <strong className="text-stone-700 dark:text-stone-300">{font.headingFont}</strong> • Body: <strong className="text-stone-700 dark:text-stone-300">{font.bodyFont}</strong>
                    </span>

                    <button
                      type="button"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-orange-950/40 hover:text-orange-600'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active Font</span>
                        </>
                      ) : (
                        <span>Select Font</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 flex items-center justify-between">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Currently active: <strong className="text-orange-600 dark:text-orange-400 font-semibold">{FONT_OPTIONS.find(f => f.id === currentFontId)?.name || 'Default'}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
