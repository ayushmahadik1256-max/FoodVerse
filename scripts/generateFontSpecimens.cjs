const fs = require('fs');
const path = require('path');

const fonts = [
  {
    id: 'syne-inter',
    filename: 'sample-1-syne-inter',
    num: '1',
    name: 'Syne + Inter',
    category: 'Modern Tech & Gourmet Editorial',
    headingFont: 'Syne',
    bodyFont: 'Inter',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap');",
    headingFamily: "'Syne', sans-serif",
    bodyFamily: "'Inter', sans-serif",
    dish: 'Truffle Smash Burger Royale',
    price: '₹349',
    rating: '★ 4.9 (1.2k+)',
    desc: 'Charcoal flame-grilled Angus patty with melted vintage cheddar, black truffle glaze, house smoked garlic aioli & toasted brioche bun.',
    accentColor: '#f97316',
    tag: 'TRENDY & AVANT-GARDE',
  },
  {
    id: 'playfair-jakarta',
    filename: 'sample-2-playfair-jakarta',
    num: '2',
    name: 'Playfair Display + Plus Jakarta',
    category: 'Luxury Michelin & Fine Dining',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');",
    headingFamily: "'Playfair Display', Georgia, serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    dish: 'Artisanal Slow-Braised Biryani',
    price: '₹499',
    rating: '★ 5.0 (850+)',
    desc: 'Fragrant aged Dehradun basmati infused with hand-pounded Kashmiri saffron, rose petals, whole roasted spices & tender shank cuts.',
    accentColor: '#fbbf24',
    tag: 'ELEGANT & LUXURIOUS',
  },
  {
    id: 'urbanist',
    filename: 'sample-3-urbanist',
    num: '3',
    name: 'Urbanist (Pure Geometric)',
    category: 'Vibrant Street Food & Burger Bar',
    headingFont: 'Urbanist',
    bodyFont: 'Urbanist',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap');",
    headingFamily: "'Urbanist', sans-serif",
    bodyFamily: "'Urbanist', sans-serif",
    dish: 'Double Smashed Cheeseburger',
    price: '₹299',
    rating: '★ 4.8 (2.4k+)',
    desc: 'Crispy caramelized beef crust, double melted American cheese, pickled jalapenos, secret burger sauce on a golden potato bun.',
    accentColor: '#ef4444',
    tag: 'HIGH-ENERGY & GEOMETRIC',
  },
  {
    id: 'fraunces-dmsans',
    filename: 'sample-4-fraunces-dmsans',
    num: '4',
    name: 'Fraunces + DM Sans',
    category: 'Warm Bistro & Artisan Bakery',
    headingFont: 'Fraunces',
    bodyFont: 'DM Sans',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,700&display=swap');",
    headingFamily: "'Fraunces', Georgia, serif",
    bodyFamily: "'DM Sans', sans-serif",
    dish: 'Wood-Fired Neapolitan Margherita',
    price: '₹380',
    rating: '★ 4.9 (1.8k+)',
    desc: 'Slow-fermented sourdough crust blistered at 450°C with sweet San Marzano tomatoes, artisanal fior di latte mozzarella & fresh basil leaves.',
    accentColor: '#f59e0b',
    tag: 'ORGANIC & ARTISANAL',
  },
  {
    id: 'space-jakarta',
    filename: 'sample-5-space-jakarta',
    num: '5',
    name: 'Space Grotesk + Plus Jakarta',
    category: 'Neo-Grotesque & Bold FoodVerse',
    headingFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');",
    headingFamily: "'Space Grotesk', sans-serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    dish: 'Hyper-Crisp Baja Fish Tacos',
    price: '₹320',
    rating: '★ 4.7 (950+)',
    desc: 'Tempura beer-battered fresh catch, charred corn & cabbage slaw, smoked chipotle crema, cotija cheese in handmade stone-ground tortillas.',
    accentColor: '#3b82f6',
    tag: 'TECH-FORWARD & DISTINCTIVE',
  },
  {
    id: 'outfit-jakarta',
    filename: 'sample-6-outfit-jakarta',
    num: '6',
    name: 'Outfit + Plus Jakarta Sans',
    category: 'Original Balanced Experience',
    headingFont: 'Outfit',
    bodyFont: 'Plus Jakarta Sans',
    googleImport: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');",
    headingFamily: "'Outfit', sans-serif",
    bodyFamily: "'Plus Jakarta Sans', sans-serif",
    dish: 'Smoked Honey Glazed Wings',
    price: '₹280',
    rating: '★ 4.8 (1.5k+)',
    desc: 'Tender hickory-smoked wings glazed in wild honey & habanero BBQ sauce, topped with toasted sesame seeds & creamy scallion dip.',
    accentColor: '#10b981',
    tag: 'ROUNDED & APPROACHABLE',
  },
];

const outputDir = path.join(__dirname, '../public/assets/fonts');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fonts.forEach((f) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <style>
      ${f.googleImport}
      .heading {
        font-family: ${f.headingFamily};
        font-weight: 700;
        fill: #f8fafc;
      }
      .body {
        font-family: ${f.bodyFamily};
        font-weight: 400;
        fill: #94a3b8;
      }
      .badge-text {
        font-family: ${f.bodyFamily};
        font-weight: 700;
        letter-spacing: 1.5px;
      }
      .specimen {
        font-family: ${f.headingFamily};
        letter-spacing: 2px;
      }
    </style>
    <linearGradient id="bg-${f.num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141416" />
      <stop offset="60%" stop-color="#0c0d0e" />
      <stop offset="100%" stop-color="#1c1917" />
    </linearGradient>
    <linearGradient id="glow-${f.num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${f.accentColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${f.accentColor}" stop-opacity="0" />
    </linearGradient>
    <filter id="shadow-${f.num}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Card -->
  <rect x="0" y="0" width="800" height="480" rx="28" fill="url(#bg-${f.num})" stroke="#292524" stroke-width="2" />
  
  <!-- Subtle Ambient Glow -->
  <circle cx="700" cy="80" r="220" fill="url(#glow-${f.num})" />
  <circle cx="80" cy="400" r="160" fill="url(#glow-${f.num})" opacity="0.4" />

  <!-- Top Bar: Option Pill & Category -->
  <g transform="translate(48, 44)">
    <!-- Option Number Pill -->
    <rect x="0" y="0" width="105" height="32" rx="16" fill="${f.accentColor}" />
    <text x="52" y="21" text-anchor="middle" class="badge-text" font-size="12" fill="#ffffff">OPTION ${f.num}</text>

    <!-- Category Tag -->
    <rect x="117" y="0" width="220" height="32" rx="16" fill="#262626" stroke="#404040" stroke-width="1" />
    <text x="227" y="20" text-anchor="middle" class="badge-text" font-size="10.5" fill="#e5e5e5">${f.tag}</text>

    <!-- Font Family Meta in top right -->
    <text x="704" y="21" text-anchor="end" class="body" font-size="13" fill="#a8a29e">
      <tspan font-weight="600" fill="#f5f5f4">${f.headingFont}</tspan> + <tspan font-weight="500">${f.bodyFont}</tspan>
    </text>
  </g>

  <!-- Inner Specimen Preview Box -->
  <g transform="translate(48, 100)" filter="url(#shadow-${f.num})">
    <rect x="0" y="0" width="704" height="260" rx="20" fill="#1c1917" stroke="#38332e" stroke-width="1.5" />

    <!-- Dish Title Header -->
    <text x="36" y="58" class="heading" font-size="28" letter-spacing="-0.5">${f.dish}</text>

    <!-- Price Tag & Rating Row -->
    <g transform="translate(36, 86)">
      <rect x="0" y="0" width="82" height="28" rx="8" fill="${f.accentColor}" opacity="0.18" />
      <text x="41" y="19" text-anchor="middle" class="heading" font-size="15" fill="${f.accentColor}">${f.price}</text>

      <text x="100" y="19" class="body" font-size="14" fill="#fbbf24">${f.rating}</text>
      <text x="210" y="19" class="body" font-size="13" fill="#78716c">• Chef's Special Gourmet Blend</text>
    </g>

    <!-- Food Description Paragraph -->
    <foreignObject x="36" y="130" width="632" height="60">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${f.bodyFamily}; font-size: 14.5px; line-height: 1.55; color: #d6d3d1;">
        ${f.desc}
      </div>
    </foreignObject>

    <!-- Divider Line -->
    <line x1="36" y1="205" x2="668" y2="205" stroke="#2e2a26" stroke-width="1.5" />

    <!-- Alphabet & Numeric Glyph Strip -->
    <text x="36" y="235" class="specimen" font-size="13" fill="${f.accentColor}">
      Aa Bb Cc Dd Ee Gg Hh Rr 1234567890 • ₹ $ % &amp; ★
    </text>
  </g>

  <!-- Bottom CTA and Selection Prompt -->
  <g transform="translate(48, 396)">
    <!-- Category description -->
    <text x="0" y="24" class="body" font-size="13" fill="#78716c">
      Recommended for: <tspan fill="#d6d3d1" font-weight="500">${f.category}</tspan>
    </text>

    <!-- Select Action Button Simulation -->
    <g transform="translate(560, 0)">
      <rect x="0" y="0" width="144" height="42" rx="14" fill="${f.accentColor}" />
      <text x="72" y="26" text-anchor="middle" class="badge-text" font-size="12" fill="#ffffff">CHOOSE OPTION ${f.num}</text>
    </g>
  </g>
</svg>`;

  fs.writeFileSync(path.join(outputDir, `${f.filename}.svg`), svg, 'utf8');
  console.log(`Created ${f.filename}.svg`);
});
