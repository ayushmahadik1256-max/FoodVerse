/**
 * FoodVerse VIP Loyalty System
 * Multi-tier rewards, points calculations, and tier progression logic
 */

export type VIPTierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface VIPTier {
  level: VIPTierLevel;
  name: string;
  minPoints: number;
  maxPoints: number; // For diamond, use Infinity
  icon: string; // Emoji
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgGradient: string;
  cashbackPercent: number; // e.g., 5%, 8%, 10%, 15%, 20%
  perks: {
    title: string;
    description: string;
    unlocked: boolean;
  }[];
  tagline: string;
}

export const VIP_TIERS: VIPTier[] = [
  {
    level: 'bronze',
    name: 'Bronze Foodie',
    minPoints: 0,
    maxPoints: 249,
    icon: '🥉',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60',
    textColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-800',
    bgGradient: 'from-amber-600/20 via-amber-700/10 to-transparent',
    cashbackPercent: 5,
    tagline: 'The starting step of your culinary journey',
    perks: [
      {
        title: '5% Loyalty Cashback',
        description: 'Earn 5 points for every ₹100 spent on completed orders',
        unlocked: true,
      },
      {
        title: 'Instant ₹1 Redemption',
        description: '1 point = ₹1 direct bill deduction during checkout',
        unlocked: true,
      },
      {
        title: 'Interactive 3D Dish Previews',
        description: 'Inspect menu creations in full 3D before placing orders',
        unlocked: true,
      },
    ],
  },
  {
    level: 'silver',
    name: 'Silver Gourmet',
    minPoints: 250,
    maxPoints: 499,
    icon: '🥈',
    badgeColor: 'bg-slate-200 dark:bg-slate-800',
    textColor: 'text-slate-800 dark:text-slate-200',
    borderColor: 'border-slate-400 dark:border-slate-700',
    bgGradient: 'from-slate-400/20 via-slate-500/10 to-transparent',
    cashbackPercent: 8,
    tagline: 'Elevated dining rewards with bonus promo vouchers',
    perks: [
      {
        title: '8% Loyalty Cashback',
        description: 'Earn 8 points per ₹100 spent on all completed orders',
        unlocked: true,
      },
      {
        title: 'Exclusive Promo Access',
        description: 'Access secret 15% discount codes like FEAST15 & TASTY20',
        unlocked: true,
      },
      {
        title: 'Birthday Sweet Treat',
        description: 'Free artisan pastry reward on your registered anniversary',
        unlocked: true,
      },
    ],
  },
  {
    level: 'gold',
    name: 'Gold Epicure',
    minPoints: 500,
    maxPoints: 999,
    icon: '🥇',
    badgeColor: 'bg-amber-200/80 dark:bg-amber-900/60',
    textColor: 'text-amber-900 dark:text-amber-200',
    borderColor: 'border-amber-400 dark:border-amber-600',
    bgGradient: 'from-amber-400/25 via-orange-500/15 to-transparent',
    cashbackPercent: 10,
    tagline: 'Preferred status with priority kitchen dispatch & double points',
    perks: [
      {
        title: '10% Loyalty Cashback',
        description: 'Earn 10 points per ₹100 spent on every completed order',
        unlocked: true,
      },
      {
        title: 'Priority Kitchen Queuing',
        description: 'Your tickets skip the queue and are prioritized by chefs',
        unlocked: true,
      },
      {
        title: 'Secret 3D Chef Specials',
        description: 'Unlock hidden menu items with high-poly 3D models',
        unlocked: true,
      },
      {
        title: '50% Off Surge Fees',
        description: 'Cut peak bad-weather delivery charges in half',
        unlocked: true,
      },
    ],
  },
  {
    level: 'platinum',
    name: 'Platinum VIP',
    minPoints: 1000,
    maxPoints: 2499,
    icon: '💎',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60',
    textColor: 'text-cyan-800 dark:text-cyan-300',
    borderColor: 'border-cyan-400 dark:border-cyan-700',
    bgGradient: 'from-cyan-500/25 via-blue-500/15 to-transparent',
    cashbackPercent: 15,
    tagline: 'Elite status with FREE Priority Delivery on all orders',
    perks: [
      {
        title: '15% Loyalty Cashback',
        description: 'Earn 15 points per ₹100 spent on completed orders',
        unlocked: true,
      },
      {
        title: 'FREE Priority Express Delivery',
        description: 'Zero delivery fees on all orders, regardless of distance',
        unlocked: true,
      },
      {
        title: 'Dedicated VIP Courier Dispatch',
        description: 'Assigned to our top-rated 5-star courier riders first',
        unlocked: true,
      },
      {
        title: 'Instant Refund Guarantee',
        description: 'One-click instant credit for any packaging or delivery delays',
        unlocked: true,
      },
    ],
  },
  {
    level: 'diamond',
    name: 'Diamond Connoisseur',
    minPoints: 2500,
    maxPoints: Infinity,
    icon: '👑',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60',
    textColor: 'text-purple-900 dark:text-purple-200',
    borderColor: 'border-purple-400 dark:border-purple-700',
    bgGradient: 'from-purple-600/30 via-pink-500/15 to-transparent',
    cashbackPercent: 20,
    tagline: 'The pinnacle of dining royalty with zero fees & chef tasting gifts',
    perks: [
      {
        title: '20% Mega Cashback',
        description: 'Earn 20 points per ₹100 spent on every completed order',
        unlocked: true,
      },
      {
        title: 'Zero Platform & Delivery Fees Forever',
        description: 'Pay only for food and government taxes, nothing else',
        unlocked: true,
      },
      {
        title: 'Monthly Complimentary Tasting Gift',
        description: 'Curated dessert or specialty appetizer sent by our master chefs',
        unlocked: true,
      },
      {
        title: '24/7 Dedicated Culinary Concierge',
        description: 'Direct phone line for custom bookings and dietary curation',
        unlocked: true,
      },
    ],
  },
];

export interface TierProgression {
  currentTier: VIPTier;
  nextTier: VIPTier | null;
  currentPoints: number;
  lifetimePoints: number;
  pointsToNextTier: number;
  progressPercent: number;
  tierIndex: number;
}

/**
 * Calculates current VIP tier and progress to next tier based on lifetime points
 */
export function calculateTierProgression(
  lifetimePoints: number,
  availablePoints: number
): TierProgression {
  let tierIndex = 0;

  for (let i = 0; i < VIP_TIERS.length; i++) {
    const tier = VIP_TIERS[i];
    if (lifetimePoints >= tier.minPoints && lifetimePoints <= tier.maxPoints) {
      tierIndex = i;
      break;
    }
  }

  const currentTier = VIP_TIERS[tierIndex];
  const nextTier = tierIndex < VIP_TIERS.length - 1 ? VIP_TIERS[tierIndex + 1] : null;

  let progressPercent = 100;
  let pointsToNextTier = 0;

  if (nextTier) {
    const tierRange = nextTier.minPoints - currentTier.minPoints;
    const pointsAboveCurrentTier = Math.max(0, lifetimePoints - currentTier.minPoints);
    progressPercent = Math.min(100, Math.max(0, Math.round((pointsAboveCurrentTier / tierRange) * 100)));
    pointsToNextTier = Math.max(0, nextTier.minPoints - lifetimePoints);
  }

  return {
    currentTier,
    nextTier,
    currentPoints: availablePoints,
    lifetimePoints,
    pointsToNextTier,
    progressPercent,
    tierIndex,
  };
}

/**
 * Calculate points earned for a completed order amount based on VIP tier
 */
export function calculateOrderEarnedPoints(totalAmount: number, tierLevel: VIPTierLevel): number {
  const tier = VIP_TIERS.find((t) => t.level === tierLevel) || VIP_TIERS[0];
  const points = Math.round((totalAmount * tier.cashbackPercent) / 100);
  return Math.max(10, points);
}
