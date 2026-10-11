import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (!allowedOrigins.length || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '2mb' }));

function getFirebaseCredential() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccount) {
    try {
      return admin.credential.cert(JSON.parse(serviceAccount));
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
    }
  }

  const rawPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (rawPath) {
    const candidates = [
      rawPath,
      `${rawPath}.json`,
      path.resolve(process.cwd(), rawPath),
      path.resolve(process.cwd(), `${rawPath}.json`),
      path.resolve(__dirname, rawPath),
      path.resolve(__dirname, `${rawPath}.json`),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        try {
          const serviceAccountObj = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          process.env.GOOGLE_APPLICATION_CREDENTIALS = candidate;
          console.log(`Loaded Firebase Admin credentials from: ${candidate}`);
          return admin.credential.cert(serviceAccountObj);
        } catch (e) {
          console.warn(`Error reading credential file at ${candidate}:`, e.message);
        }
      }
    }
  }

  try {
    const files = fs.readdirSync(__dirname);
    const discovered = files.find((f) => f.includes('firebase-adminsdk') && f.endsWith('.json'));
    if (discovered) {
      const fullPath = path.resolve(__dirname, discovered);
      const serviceAccountObj = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = fullPath;
      console.log(`Auto-detected Firebase Admin credentials at: ${fullPath}`);
      return admin.credential.cert(serviceAccountObj);
    }
  } catch {
    // ignore directory scan errors
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getFirebaseCredential(),
  });
}

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '', index: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'], default: 'customer' },
  isOnline: { type: Boolean, default: false },
  addresses: { type: [mongoose.Schema.Types.Mixed], default: [] },
  favorites: { type: [String], default: [] },
  loyaltyPoints: { type: Number, default: 250 },
}, { timestamps: true, versionKey: false });

const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  banner: { type: String, default: '' },
  cuisines: { type: [String], default: [] },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: { type: Number, default: 30 },
  deliveryFee: { type: Number, default: 35 },
  minOrder: { type: Number, default: 150 },
  priceForTwo: { type: Number, default: 400 },
  isVegOnly: { type: Boolean, default: false },
  dietaryPreferences: { type: [String], default: [] },
  isApproved: { type: Boolean, default: true },
  isPromoted: { type: Boolean, default: false },
  openingHours: {
    open: { type: String, default: '10:00 AM' },
    close: { type: String, default: '11:00 PM' }
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: 'Bengaluru' },
    coordinates: { type: [Number], default: [12.9716, 77.5946] }
  },
  ownerId: { type: String, default: null, index: true },
}, { timestamps: true, versionKey: false });

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  restaurantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  category: { type: String, required: true, index: true },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  isChefPick: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 10 },
  image: { type: String, default: '' },
  has3DModel: { type: Boolean, default: false },
  modelType: { type: String, default: null },
  calories: { type: Number, default: 350 },
  preparationTime: { type: String, default: '20 min' },
  ingredients: { type: [String], default: [] },
  dietaryPreferences: { type: [String], default: [] },
  variants: [{ id: String, name: String, priceDelta: Number }],
  addOns: [{ id: String, name: String, price: Number }],
  availableVariants: [{ name: String, price: Number }],
  availableAddOns: [{ name: String, price: Number }]
}, { timestamps: true, versionKey: false });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  discountPercentage: { type: Number, required: true },
  maxDiscount: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  description: { type: String, required: true },
  expiryDate: { type: String, default: '2026-12-31' },
  category: { type: String, default: 'general' },
  bankName: { type: String, default: '' },
  terms: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  restaurantId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  foodRating: { type: Number, default: 5 },
  deliveryRating: { type: Number, default: 5 },
  packagingRating: { type: Number, default: 5 },
  comment: { type: String, required: true },
  dishName: { type: String, default: '' },
  date: { type: String, default: 'Just now' },
  helpfulVotes: { type: Number, default: 0 },
  helpfulUsers: { type: [String], default: [] },
  ownerReply: {
    author: { type: String, default: '' },
    text: { type: String, default: '' },
    date: { type: String, default: '' }
  }
}, { timestamps: true, versionKey: false });

const supportTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, default: '' },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'rejected'], default: 'open' },
  compensationGranted: { type: Number, default: 0 },
  resolutionNote: { type: String, default: '' },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: false },
  image: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  modelType: { type: String, default: null },
  customization: {
    variant: { name: String, price: Number },
    addOns: [{ name: String, price: Number }],
    spiceLevel: String,
    removedIngredients: [String],
    specialInstructions: String
  }
}, { _id: false });

const orderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, default: null, sparse: true },
  orderNumber: { type: String, required: true },
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  restaurantId: { type: String, required: true, index: true },
  restaurantName: { type: String, required: true },
  restaurantLocation: { type: [Number], required: true },
  items: { type: [orderItemSchema], required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  packagingFee: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsRedeemed: { type: Number, default: 0 },
  loyaltyDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: null },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod', 'upi', 'card', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: String, default: null },
  razorpayOrderId: { type: String, default: null, index: true },
  deliveryPartnerId: { type: String, default: null, index: true },
  deliveryPartnerName: { type: String, default: null },
  deliveryPartnerPhone: { type: String, default: null },
  deliveryAddress: {
    id: String,
    label: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    lat: Number,
    lng: Number,
    landmark: String,
    apartment: String
  },
  deliveryInstructions: { type: String, default: '' },
  scheduledFor: { type: String, default: null },
  currentLocation: { type: [Number], default: null },
  estimatedDeliveryTime: { type: String, default: '25-30 mins' },
  statusTimeline: { type: [orderTimelineSchema], default: [] },
  cancellationReason: { type: String, default: null },
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['none', 'pending', 'completed', 'failed'], default: 'none' },
  supportTicket: {
    id: String,
    issueType: String,
    description: String,
    status: String,
    compensationGranted: Number,
    createdAt: String
  },
  reviewSubmitted: { type: Boolean, default: false },
  idempotencyKey: { type: String, default: null, sparse: true, index: true }
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Review = mongoose.model('Review', reviewSchema);
const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
const Order = mongoose.model('Order', orderSchema);

// ==========================================
// MIDDLEWARES & HELPERS
// ==========================================

async function requireUser(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Authentication required.' });
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(403).json({ error: 'Account profile has not been initialized.' });
    req.authUser = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

async function optionalUser(req, _res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (token) {
      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (user) req.authUser = user;
    }
  } catch {
    // proceed as guest
  }
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.authUser) return res.status(401).json({ error: 'Authentication required.' });
    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ error: `Permission denied. Required role: ${allowedRoles.join(' or ')}.` });
    }
    next();
  };
}

async function ownedRestaurantIds(uid) {
  const list = await Restaurant.find({ ownerId: uid }).select('id').lean();
  return list.map((r) => r.id);
}

function toClientUser(user) {
  return {
    id: user.firebaseUid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isOnline: user.isOnline,
    addresses: user.addresses,
    favorites: user.favorites,
    loyaltyPoints: user.loyaltyPoints,
    isGuest: false,
  };
}

// Auto-seed persistent mock data if database is empty
async function seedDatabaseIfEmpty() {
  try {
    const count = await Restaurant.countDocuments();
    if (count > 0) return;

    const seedFile = path.resolve(__dirname, 'server_seed.json');
    if (!fs.existsSync(seedFile)) return;

    console.log('Seeding initial restaurants, dishes, coupons, and reviews into MongoDB...');
    const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

    if (Array.isArray(seedData.restaurants) && seedData.restaurants.length > 0) {
      await Restaurant.insertMany(seedData.restaurants);
    }
    if (Array.isArray(seedData.menuItems) && seedData.menuItems.length > 0) {
      await MenuItem.insertMany(seedData.menuItems);
    }
    if (Array.isArray(seedData.coupons) && seedData.coupons.length > 0) {
      await Coupon.insertMany(seedData.coupons);
    }
    if (Array.isArray(seedData.reviews) && seedData.reviews.length > 0) {
      await Review.insertMany(seedData.reviews);
    }

    console.log(`Successfully seeded ${seedData.restaurants.length} restaurants and ${seedData.menuItems.length} dishes.`);
  } catch (err) {
    console.warn('Seeding warning:', err.message);
  }
}

// Server-side Authoritative Price & Coupon Calculator
async function calculateOrderBill({ restaurantId, items, couponCode, pointsRedeemed, tipAmount, customerUid, customerLoyaltyPoints }) {
  if (!items || !items.length) {
    throw new Error('Cart is empty.');
  }

  const restaurant = await Restaurant.findOne({ id: restaurantId });
  if (!restaurant) {
    throw new Error('Restaurant not found.');
  }

  // Fetch verified menu items from database
  const menuItemIds = items.map((i) => i.menuItemId);
  const dbMenuItems = await MenuItem.find({ id: { $in: menuItemIds } });
  const dbItemMap = new Map(dbMenuItems.map((m) => [m.id, m]));

  const verifiedItems = [];
  let subtotal = 0;

  for (const clientItem of items) {
    const dbItem = dbItemMap.get(clientItem.menuItemId);
    if (!dbItem) {
      throw new Error(`Item ${clientItem.name || clientItem.menuItemId} does not exist in catalog.`);
    }
    if (dbItem.restaurantId !== restaurantId) {
      throw new Error(`Item "${dbItem.name}" does not belong to ${restaurant.name}.`);
    }
    if (!dbItem.isAvailable) {
      throw new Error(`Item "${dbItem.name}" is currently sold out and unavailable.`);
    }

    const qty = Math.max(1, Math.floor(Number(clientItem.quantity) || 1));
    let unitPrice = dbItem.price;

    // Validate variant
    if (clientItem.customization?.variant) {
      const selectedVariant = clientItem.customization.variant;
      const validVariant = (dbItem.availableVariants || []).find((v) => v.name === selectedVariant.name);
      if (validVariant) {
        unitPrice = validVariant.price;
      }
    }

    // Validate add-ons
    let addOnsPrice = 0;
    if (Array.isArray(clientItem.customization?.addOns)) {
      for (const addon of clientItem.customization.addOns) {
        const validAddon = (dbItem.availableAddOns || []).find((a) => a.name === addon.name);
        if (validAddon) {
          addOnsPrice += validAddon.price;
        }
      }
    }

    const effectivePrice = unitPrice + addOnsPrice;
    subtotal += effectivePrice * qty;

    verifiedItems.push({
      menuItemId: dbItem.id,
      name: dbItem.name,
      price: effectivePrice,
      quantity: qty,
      isVeg: dbItem.isVeg,
      image: dbItem.image,
      specialInstructions: clientItem.specialInstructions || '',
      modelType: dbItem.modelType,
      customization: clientItem.customization,
    });
  }

  if (subtotal < restaurant.minOrder) {
    throw new Error(`Minimum order for ${restaurant.name} is ₹${restaurant.minOrder}. Current subtotal is ₹${subtotal}.`);
  }

  // Validate coupon
  let discountAmount = 0;
  let appliedCode = null;
  if (couponCode && couponCode.trim()) {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
    if (!coupon) {
      throw new Error(`Invalid or expired coupon code: ${couponCode}`);
    }
    if (subtotal < coupon.minOrder) {
      throw new Error(`Coupon ${coupon.code} requires a minimum order of ₹${coupon.minOrder}.`);
    }
    if (coupon.category === 'first_order' && customerUid) {
      const pastOrders = await Order.countDocuments({ customerId: customerUid, status: { $ne: 'cancelled' } });
      if (pastOrders > 0) {
        throw new Error(`Coupon ${coupon.code} is valid only on inaugural first-time orders.`);
      }
    }
    const rawDisc = (subtotal * coupon.discountPercentage) / 100;
    discountAmount = Math.min(rawDisc, coupon.maxDiscount);
    appliedCode = coupon.code;
  }

  // Validate loyalty points
  const availablePoints = Math.max(0, Number(customerLoyaltyPoints) || 0);
  const remainingBillBeforeLoyalty = Math.max(0, subtotal - discountAmount);
  const maxRedeemable = Math.min(availablePoints, remainingBillBeforeLoyalty);

  let verifiedPointsRedeemed = 0;
  let loyaltyDiscount = 0;
  if (pointsRedeemed && pointsRedeemed > 0) {
    verifiedPointsRedeemed = Math.min(Math.floor(pointsRedeemed), maxRedeemable);
    loyaltyDiscount = verifiedPointsRedeemed; // 1 point = ₹1
  }

  // Delivery & Platform fees
  const deliveryFee = subtotal > 499 ? 0 : 35;
  const packagingFee = 20;
  const platformFee = 5;
  const sanitizedTip = Math.max(0, Math.floor(Number(tipAmount) || 0));
  const tax = Number((Math.max(0, subtotal - discountAmount - loyaltyDiscount) * 0.05).toFixed(2));
  const totalAmount = Math.max(0, subtotal - discountAmount - loyaltyDiscount + deliveryFee + packagingFee + platformFee + sanitizedTip + tax);

  // Points to earn
  const pointsToEarn = Math.max(10, Math.floor(Math.max(0, subtotal - discountAmount - loyaltyDiscount) * 0.1));

  return {
    restaurant,
    items: verifiedItems,
    subtotal,
    deliveryFee,
    packagingFee,
    platformFee,
    tipAmount: sanitizedTip,
    tax,
    discountAmount,
    couponCode: appliedCode,
    loyaltyDiscount,
    loyaltyPointsRedeemed: verifiedPointsRedeemed,
    loyaltyPointsEarned: pointsToEarn,
    totalAmount,
  };
}

// Razorpay Helpers
function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!orderId || !paymentId || !signature || !secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    razorpayConfigured: isRazorpayConfigured(),
  });
});

// 2. Profile Bootstrap
app.post('/api/profile/bootstrap', async (req, res) => {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Authentication required.' });
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    const email = (decoded.email || '').toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $set: {
          email,
          name: decoded.name || req.body.name || '',
          phone: decoded.phone_number || req.body.phone || '',
          avatar: decoded.picture || req.body.avatar || '',
        },
        $setOnInsert: { role: adminEmails.includes(email) ? 'admin' : 'customer', loyaltyPoints: 250 },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ user: toClientUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load account profile.' });
  }
});

// 3. Profile Update
app.patch('/api/profile', requireUser, async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'addresses', 'favorites', 'isOnline'];
  for (const key of Object.keys(req.body || {})) {
    if (!allowed.includes(key)) return res.status(400).json({ error: `Profile field cannot be changed: ${key}` });
  }
  if (Object.hasOwn(req.body || {}, 'isOnline') && req.authUser.role !== 'delivery_partner') {
    return res.status(403).json({ error: 'Only delivery partners can change online status.' });
  }
  try {
    Object.assign(req.authUser, req.body);
    await req.authUser.save();
    if (req.body?.isOnline === true && req.authUser.role === 'delivery_partner') {
      await Order.updateMany(
        { deliveryPartnerId: null, status: { $in: ['placed', 'accepted', 'preparing'] } },
        { $set: {
          deliveryPartnerId: req.authUser.firebaseUid,
          deliveryPartnerName: req.authUser.name || 'Fleet Courier',
          deliveryPartnerPhone: req.authUser.phone || '',
        } }
      );
    }
    res.json({ user: toClientUser(req.authUser) });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update profile.' });
  }
});

// 4. Platform Users (Admin only)
app.get('/api/users', requireUser, requireRole(['admin']), async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({
    users: users.map((user) => ({
      id: user.firebaseUid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
});

// 5. Update User Role (Admin only)
app.patch('/api/users/:uid/role', requireUser, requireRole(['admin']), async (req, res) => {
  if (req.params.uid === req.authUser.firebaseUid) {
    return res.status(400).json({ error: 'You cannot change your own administrator role.' });
  }
  const { role } = req.body || {};
  if (!['customer', 'restaurant_owner', 'delivery_partner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid account role.' });
  }
  const user = await User.findOneAndUpdate({ firebaseUid: req.params.uid }, { $set: { role } }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user: toClientUser(user) });
});

// 6. Restaurants (Public + Auth filters)
app.get('/api/restaurants', optionalUser, async (req, res) => {
  try {
    const user = req.authUser;
    let query = { isApproved: true };

    if (user && user.role === 'admin') {
      query = {}; // Admin sees all
    } else if (user && user.role === 'restaurant_owner') {
      // Owner sees all approved restaurants PLUS any unapproved ones they own
      query = { $or: [{ isApproved: true }, { ownerId: user.firebaseUid }] };
    }

    const restaurants = await Restaurant.find(query).sort({ rating: -1 }).lean();
    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load restaurants.' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id }).lean();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load restaurant details.' });
  }
});

// Create Restaurant (Owner or Admin)
app.post('/api/restaurants', requireUser, requireRole(['restaurant_owner', 'admin']), async (req, res) => {
  try {
    const { name, description, image, banner, cuisines, priceForTwo, deliveryTime, location } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Restaurant name is required.' });

    const newId = `rest_${Date.now()}`;
    const isApproved = req.authUser.role === 'admin'; // Auto-approve if created by admin

    const restaurant = await Restaurant.create({
      id: newId,
      name: name.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      banner: banner || image || '',
      cuisines: Array.isArray(cuisines) ? cuisines : ['Multi-Cuisine'],
      priceForTwo: Number(priceForTwo) || 400,
      deliveryTime: Number(deliveryTime) || 30,
      isApproved,
      ownerId: req.authUser.firebaseUid,
      location: location || { address: 'Main Street', city: 'Bengaluru', coordinates: [12.9716, 77.5946] },
    });

    res.status(201).json({ restaurant });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not create restaurant.' });
  }
});

// Update Restaurant (Assigned Owner or Admin)
app.patch('/api/restaurants/:id', requireUser, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const isAuthorized = req.authUser.role === 'admin' || (req.authUser.role === 'restaurant_owner' && (restaurant.ownerId === req.authUser.firebaseUid || !restaurant.ownerId));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to update this restaurant.' });
    }

    // Auto-claim if unassigned
    if (req.authUser.role === 'restaurant_owner' && !restaurant.ownerId) {
      restaurant.ownerId = req.authUser.firebaseUid;
    }

    const allowed = ['name', 'description', 'image', 'banner', 'cuisines', 'priceForTwo', 'deliveryTime', 'isVegOnly', 'openingHours', 'location'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        restaurant[key] = req.body[key];
      }
    }

    await restaurant.save();
    res.json({ restaurant });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update restaurant.' });
  }
});

// Approve/Reject Restaurant (Admin only)
app.patch('/api/restaurants/:id/approval', requireUser, requireRole(['admin']), async (req, res) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') return res.status(400).json({ error: 'isApproved boolean required.' });

    const restaurant = await Restaurant.findOneAndUpdate(
      { id: req.params.id },
      { $set: { isApproved } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    res.json({ restaurant });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update approval status.' });
  }
});

// Assign Restaurant Owner (Admin only)
app.patch('/api/restaurants/:id/owner', requireUser, requireRole(['admin']), async (req, res) => {
  try {
    const { ownerId } = req.body;
    const restaurant = await Restaurant.findOneAndUpdate(
      { id: req.params.id },
      { $set: { ownerId: ownerId || null } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ restaurant });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not assign owner.' });
  }
});

// 7. Menu Items
app.get('/api/restaurants/:id/menu', optionalUser, async (req, res) => {
  try {
    const user = req.authUser;
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    let query = { restaurantId: req.params.id };
    const isOwnerOrAdmin = user && (user.role === 'admin' || (user.role === 'restaurant_owner' && restaurant.ownerId === user.firebaseUid));
    if (!isOwnerOrAdmin) {
      query.isAvailable = true; // Customers see available items
    }

    const items = await MenuItem.find(query).lean();
    res.json({ menuItems: items });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load menu items.' });
  }
});

app.get('/api/menu', async (_req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).lean();
    res.json({ menuItems: items });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load menu items.' });
  }
});

// Add Menu Item (Assigned Owner or Admin)
app.post('/api/restaurants/:id/menu', requireUser, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.params.id });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const isAuthorized = req.authUser.role === 'admin' || (req.authUser.role === 'restaurant_owner' && restaurant.ownerId === req.authUser.firebaseUid);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to add menu items to this restaurant.' });
    }

    const { name, description, price, category, isVeg, image, modelType, has3DModel } = req.body || {};
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Item name, price, and category are required.' });
    }

    const newItem = await MenuItem.create({
      id: `menu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: restaurant.id,
      name: name.trim(),
      description: description || '',
      price: Number(price),
      category: category.trim(),
      isVeg: Boolean(isVeg),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      modelType: modelType || null,
      has3DModel: Boolean(has3DModel),
      isAvailable: true,
    });

    res.status(201).json({ menuItem: newItem });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not add menu item.' });
  }
});

// Update Menu Item
app.patch('/api/menu/:id', requireUser, async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Menu item not found.' });

    const restaurant = await Restaurant.findOne({ id: item.restaurantId });
    const isAuthorized = req.authUser.role === 'admin' || (req.authUser.role === 'restaurant_owner' && restaurant && restaurant.ownerId === req.authUser.firebaseUid);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to update this menu item.' });
    }

    const allowed = ['name', 'description', 'price', 'category', 'isVeg', 'isAvailable', 'image', 'modelType', 'has3DModel'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key];
      }
    }

    await item.save();
    res.json({ menuItem: item });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update menu item.' });
  }
});

// Delete Menu Item
app.delete('/api/menu/:id', requireUser, async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Menu item not found.' });

    const restaurant = await Restaurant.findOne({ id: item.restaurantId });
    const isAuthorized = req.authUser.role === 'admin' || (req.authUser.role === 'restaurant_owner' && restaurant && restaurant.ownerId === req.authUser.firebaseUid);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'You are not authorized to delete this menu item.' });
    }

    await MenuItem.deleteOne({ id: req.params.id });
    res.json({ success: true, deletedId: req.params.id });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not delete menu item.' });
  }
});

// 8. Coupons
app.get('/api/coupons', async (_req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).lean();
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load coupons.' });
  }
});

app.post('/api/coupons', requireUser, requireRole(['admin']), async (req, res) => {
  try {
    const { code, discountPercentage, minOrder, maxDiscount, description, expiryDate, category } = req.body || {};
    if (!code || !discountPercentage || !minOrder) {
      return res.status(400).json({ error: 'Coupon code, discount percentage, and minimum order are required.' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountPercentage: Number(discountPercentage),
      minOrder: Number(minOrder),
      maxDiscount: Number(maxDiscount) || 100,
      description: description || `${discountPercentage}% off on orders above ₹${minOrder}`,
      expiryDate: expiryDate || '2026-12-31',
      category: category || 'general',
      isActive: true,
    });

    res.status(201).json({ coupon });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not create coupon.' });
  }
});

app.delete('/api/coupons/:code', requireUser, requireRole(['admin']), async (req, res) => {
  try {
    const result = await Coupon.findOneAndDelete({ code: req.params.code.toUpperCase() });
    if (!result) return res.status(404).json({ error: 'Coupon not found.' });
    res.json({ success: true, deletedCode: req.params.code.toUpperCase() });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not delete coupon.' });
  }
});

// 9. Reviews & Ratings
app.get('/api/reviews', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const query = restaurantId ? { restaurantId: String(restaurantId) } : {};
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load reviews.' });
  }
});

app.post('/api/reviews', requireUser, requireRole(['customer']), async (req, res) => {
  try {
    const { restaurantId, rating, comment, dishName, foodRating, deliveryRating, packagingRating } = req.body || {};
    if (!restaurantId || !rating || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'Restaurant, star rating, and review comment are required.' });
    }

    const restaurant = await Restaurant.findOne({ id: restaurantId });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const newRev = await Review.create({
      id: `rev_${Date.now()}`,
      restaurantId,
      userId: req.authUser.firebaseUid,
      userName: req.authUser.name || 'Gourmet Diner',
      userAvatar: req.authUser.avatar || '',
      rating: Math.min(5, Math.max(1, Number(rating))),
      foodRating: Number(foodRating) || Number(rating),
      deliveryRating: Number(deliveryRating) || 5,
      packagingRating: Number(packagingRating) || 5,
      comment: comment.trim(),
      dishName: dishName || '',
      date: 'Just now',
    });

    // Update restaurant rolling rating
    const currentCount = restaurant.reviewCount || 0;
    const currentRating = restaurant.rating || 4.5;
    const newRating = Number(((currentRating * currentCount + newRev.rating) / (currentCount + 1)).toFixed(1));

    restaurant.rating = newRating;
    restaurant.reviewCount = currentCount + 1;
    await restaurant.save();

    res.status(201).json({ review: newRev, updatedRestaurantRating: newRating });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not submit review.' });
  }
});

app.post('/api/reviews/:id/helpful', requireUser, async (req, res) => {
  try {
    const review = await Review.findOne({ id: req.params.id });
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    const uid = req.authUser.firebaseUid;
    if (review.helpfulUsers.includes(uid)) {
      return res.status(400).json({ error: 'You have already marked this review as helpful.' });
    }

    review.helpfulVotes += 1;
    review.helpfulUsers.push(uid);
    await review.save();

    res.json({ review });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not vote review.' });
  }
});

app.post('/api/reviews/:id/reply', requireUser, async (req, res) => {
  try {
    const { replyText } = req.body || {};
    if (!replyText || !replyText.trim()) return res.status(400).json({ error: 'Reply text is required.' });

    const review = await Review.findOne({ id: req.params.id });
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    const restaurant = await Restaurant.findOne({ id: review.restaurantId });
    const isAuthorized = req.authUser.role === 'admin' || (req.authUser.role === 'restaurant_owner' && restaurant && restaurant.ownerId === req.authUser.firebaseUid);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Only the restaurant owner or platform administrator can reply to reviews.' });
    }

    review.ownerReply = {
      author: req.authUser.name || 'Kitchen Manager',
      text: replyText.trim(),
      date: 'Just now',
    };
    await review.save();

    res.json({ review });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not post reply.' });
  }
});

// 10. Orders (Server Authoritative)
app.get('/api/orders', requireUser, async (req, res) => {
  try {
    const user = req.authUser;
    let query = {};

    if (user.role === 'admin') {
      query = {}; // All orders
    } else if (user.role === 'restaurant_owner') {
      const owned = await ownedRestaurantIds(user.firebaseUid);
      query = { restaurantId: { $in: owned } };
    } else if (user.role === 'delivery_partner') {
      query = { deliveryPartnerId: user.firebaseUid };
    } else {
      query = { customerId: user.firebaseUid };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load orders.' });
  }
});

app.get('/api/orders/:id', requireUser, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const user = req.authUser;
    const ownsRestaurant = user.role === 'restaurant_owner' && (await ownedRestaurantIds(user.firebaseUid)).includes(order.restaurantId);
    const isCourier = user.role === 'delivery_partner' && order.deliveryPartnerId === user.firebaseUid;
    const isCustomer = user.role === 'customer' && order.customerId === user.firebaseUid;
    const isAllowed = user.role === 'admin' || ownsRestaurant || isCourier || isCustomer;

    if (!isAllowed) return res.status(403).json({ error: 'You do not have permission to view this order.' });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load order.' });
  }
});

// Server-authoritative Order Creation
app.post('/api/orders', requireUser, requireRole(['customer']), async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, couponCode, pointsRedeemed, tipAmount, deliveryInstructions, scheduledFor, idempotencyKey } = req.body || {};

    if (!restaurantId) return res.status(400).json({ error: 'Restaurant ID is required.' });
    if (!deliveryAddress || !deliveryAddress.street) return res.status(400).json({ error: 'A valid delivery address is required.' });
    if (!['cod', 'razorpay', 'upi', 'card', 'wallet'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) {
        return res.status(200).json({ order: existing, duplicate: true });
      }
    }

    // Server-side calculation & verification
    const bill = await calculateOrderBill({
      restaurantId,
      items,
      couponCode,
      pointsRedeemed,
      tipAmount,
      customerUid: req.authUser.firebaseUid,
      customerLoyaltyPoints: req.authUser.loyaltyPoints,
    });

    // Assign the order to the online courier with the fewest active deliveries.
    let availablePartners = await User.find({ role: 'delivery_partner', isOnline: true })
      .select('firebaseUid name phone')
      .lean();
    // Keep new orders deliverable when every partner is currently offline.
    if (!availablePartners.length) {
      availablePartners = await User.find({ role: 'delivery_partner' })
        .select('firebaseUid name phone')
        .lean();
    }
    let assignedPartner = null;
    if (availablePartners.length) {
      const activeCounts = await Order.aggregate([
        { $match: { deliveryPartnerId: { $in: availablePartners.map((partner) => partner.firebaseUid) }, status: { $in: ['placed', 'accepted', 'preparing', 'out_for_delivery'] } } },
        { $group: { _id: '$deliveryPartnerId', count: { $sum: 1 } } },
      ]);
      const countsByPartner = new Map(activeCounts.map(({ _id, count }) => [_id, count]));
      assignedPartner = availablePartners.reduce((best, partner) =>
        !best || (countsByPartner.get(partner.firebaseUid) || 0) < (countsByPartner.get(best.firebaseUid) || 0) ? partner : best, null);
    }

    // Deduct redeemed loyalty points from customer
    if (bill.loyaltyPointsRedeemed > 0) {
      req.authUser.loyaltyPoints = Math.max(0, (req.authUser.loyaltyPoints || 0) - bill.loyaltyPointsRedeemed);
      await req.authUser.save();
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = `FV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await Order.create({
      id: orderId,
      orderId: orderId,
      orderNumber,
      customerId: req.authUser.firebaseUid,
      customerName: req.authUser.name || 'Gourmet Diner',
      customerPhone: req.authUser.phone || deliveryAddress.phone || '',
      restaurantId: bill.restaurant.id,
      restaurantName: bill.restaurant.name,
      restaurantLocation: bill.restaurant.location.coordinates,
      items: bill.items,
      subtotal: bill.subtotal,
      deliveryFee: bill.deliveryFee,
      packagingFee: bill.packagingFee,
      platformFee: bill.platformFee,
      tipAmount: bill.tipAmount,
      tax: bill.tax,
      discountAmount: bill.discountAmount,
      couponCode: bill.couponCode,
      loyaltyDiscount: bill.loyaltyDiscount,
      loyaltyPointsRedeemed: bill.loyaltyPointsRedeemed,
      loyaltyPointsEarned: bill.loyaltyPointsEarned,
      totalAmount: bill.totalAmount,
      status: 'placed',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (req.body.paymentStatus || 'paid'),
      paymentId: req.body.paymentId || (paymentMethod !== 'cod' ? `pay_${Date.now()}` : null),
      deliveryPartnerId: assignedPartner?.firebaseUid || null,
      deliveryPartnerName: assignedPartner?.name || null,
      deliveryPartnerPhone: assignedPartner?.phone || null,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || '',
      scheduledFor: scheduledFor || null,
      currentLocation: bill.restaurant.location.coordinates,
      estimatedDeliveryTime: scheduledFor ? `Scheduled for ${scheduledFor}` : '25-30 mins',
      statusTimeline: [
        {
          status: 'placed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: scheduledFor ? `Order confirmed & scheduled for ${scheduledFor}.` : 'Your gourmet ticket has been placed with the restaurant.',
        },
      ],
      idempotencyKey: idempotencyKey || null,
    });

    res.status(201).json({ order: newOrder });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not process order.' });
  }
});

// Update Order Status (Enforcing Transition Machine & Role Guards)
app.patch('/api/orders/:id/status', requireUser, async (req, res) => {
  try {
    const { status, partnerLocation } = req.body || {};
    const allowedStatuses = ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid order status value.' });

    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const user = req.authUser;
    const ownsRestaurant = user.role === 'restaurant_owner' && (await ownedRestaurantIds(user.firebaseUid)).includes(order.restaurantId);
    const isAssignedCourier = user.role === 'delivery_partner' && order.deliveryPartnerId === user.firebaseUid;
    const isCustomer = user.role === 'customer' && order.customerId === user.firebaseUid;

    // Check transition validity
    const validTransitions = {
      placed: ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      accepted: ['preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      preparing: ['out_for_delivery', 'delivered', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition order from "${order.status}" to "${status}".` });
    }

    // Role check per transition
    let hasPermission = false;
    if (user.role === 'admin') {
      hasPermission = true;
    } else if (status === 'accepted' || status === 'preparing') {
      hasPermission = ownsRestaurant;
    } else if (status === 'out_for_delivery') {
      hasPermission = ownsRestaurant || isAssignedCourier;
    } else if (status === 'delivered') {
      hasPermission = isAssignedCourier || isCustomer || ownsRestaurant;
    } else if (status === 'cancelled') {
      hasPermission = ownsRestaurant || isCustomer;
    }

    if (!hasPermission) {
      return res.status(403).json({ error: `You do not have permission to change order status to "${status}".` });
    }

    order.status = status;
    if (partnerLocation && Array.isArray(partnerLocation)) {
      order.currentLocation = partnerLocation;
    }

    order.statusTimeline.push({
      status,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: status === 'delivered' && isCustomer
        ? 'Customer confirmed delivery receipt. Bonus points unlocked!'
        : `Order advanced to ${status.replace(/_/g, ' ')}.`,
    });

    // Credit loyalty points to customer on final delivery
    if (status === 'delivered') {
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
      const customer = await User.findOne({ firebaseUid: order.customerId });
      if (customer) {
        customer.loyaltyPoints = (customer.loyaltyPoints || 0) + (order.loyaltyPointsEarned || 0);
        await customer.save();
      }
    }

    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update order status.' });
  }
});

// Order Cancellation
app.post('/api/orders/:id/cancel', requireUser, async (req, res) => {
  try {
    const { reason } = req.body || {};
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const user = req.authUser;
    const isCustomer = user.role === 'customer' && order.customerId === user.firebaseUid;
    const ownsRestaurant = user.role === 'restaurant_owner' && (await ownedRestaurantIds(user.firebaseUid)).includes(order.restaurantId);
    const isAdmin = user.role === 'admin';

    if (!isCustomer && !ownsRestaurant && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
    }

    if (order.status !== 'placed' && order.status !== 'accepted') {
      return res.status(400).json({ error: 'Order cannot be cancelled after kitchen preparation has commenced.' });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || (isCustomer ? 'Cancelled by customer' : 'Cancelled by restaurant');
    order.statusTimeline.push({
      status: 'cancelled',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: `Order cancelled (${order.cancellationReason}).`,
    });

    // Refund redeemed points
    if (order.loyaltyPointsRedeemed > 0) {
      const customer = await User.findOne({ firebaseUid: order.customerId });
      if (customer) {
        customer.loyaltyPoints = (customer.loyaltyPoints || 0) + order.loyaltyPointsRedeemed;
        await customer.save();
      }
    }

    // Handle payment refund status
    if (order.paymentStatus === 'paid') {
      order.refundAmount = order.totalAmount;
      order.refundStatus = 'completed'; // or pending verification
    }

    await order.save();
    res.json({ order, refundAmount: order.refundAmount });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not cancel order.' });
  }
});

// Order Issue Reporting
app.post('/api/orders/:id/issue', requireUser, requireRole(['customer']), async (req, res) => {
  try {
    const { issueType, description } = req.body || {};
    if (!issueType || !description || !description.trim()) {
      return res.status(400).json({ error: 'Issue type and description are required.' });
    }

    const order = await Order.findOne({ id: req.params.id, customerId: req.authUser.firebaseUid });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const ticketId = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const compensation = 100; // Flat ₹100 FoodVerse credit

    const ticket = await SupportTicket.create({
      id: ticketId,
      orderId: order.id,
      customerId: req.authUser.firebaseUid,
      customerName: req.authUser.name || 'Customer',
      issueType,
      description: description.trim(),
      status: 'resolved',
      compensationGranted: compensation,
      resolvedAt: new Date(),
    });

    order.supportTicket = {
      id: ticketId,
      issueType,
      description: description.trim(),
      status: 'resolved',
      compensationGranted: compensation,
      createdAt: new Date().toISOString(),
    };
    await order.save();

    // Award loyalty points compensation
    req.authUser.loyaltyPoints = (req.authUser.loyaltyPoints || 0) + compensation;
    await req.authUser.save();

    res.status(201).json({ ticket, compensation });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not report issue.' });
  }
});

// 11. Delivery Partner Workflow
app.get('/api/delivery/available-orders', requireUser, requireRole(['delivery_partner', 'admin']), async (_req, res) => {
  try {
    // Orders ready for pickup and not yet assigned to a delivery partner
    const orders = await Order.find({
      status: { $in: ['accepted', 'preparing'] },
      deliveryPartnerId: null,
    }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load available delivery tickets.' });
  }
});

app.post('/api/orders/:id/claim-delivery', requireUser, requireRole(['delivery_partner']), async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id, deliveryPartnerId: null, status: { $in: ['accepted', 'preparing'] } });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    order.deliveryPartnerId = req.authUser.firebaseUid;
    order.deliveryPartnerName = req.authUser.name || 'Fleet Courier';
    order.deliveryPartnerPhone = req.authUser.phone || '+91 98888 11223';
    const claimed = await Order.findOneAndUpdate(
      { id: req.params.id, deliveryPartnerId: null, status: { $in: ['accepted', 'preparing'] } },
      { $set: { deliveryPartnerId: req.authUser.firebaseUid, deliveryPartnerName: req.authUser.name || 'Fleet Courier', deliveryPartnerPhone: req.authUser.phone || '+91 98888 11223' } },
      { new: true }
    );
    if (!claimed) return res.status(409).json({ error: 'Order has already been assigned to another courier.' });

    res.json({ order: claimed });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not accept delivery.' });
  }
});

app.patch('/api/orders/:id/location', requireUser, requireRole(['delivery_partner']), async (req, res) => {
  try {
    const { coordinates } = req.body || {};
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Valid [lat, lng] coordinates are required.' });
    }

    const order = await Order.findOne({ id: req.params.id, deliveryPartnerId: req.authUser.firebaseUid });
    if (!order) return res.status(404).json({ error: 'Active order not found for this courier.' });

    order.currentLocation = coordinates;
    await order.save();

    res.json({ success: true, currentLocation: coordinates });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update location.' });
  }
});

// 12. Razorpay Payments
app.get('/api/payments/config', (_req, res) => {
  res.json({
    configured: isRazorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID || null,
  });
});

app.post('/api/payments/create-order', requireUser, requireRole(['customer']), async (req, res) => {
  try {
    const { restaurantId, items, couponCode, pointsRedeemed, tipAmount } = req.body || {};

    // First compute authentic order bill
    const bill = await calculateOrderBill({
      restaurantId,
      items,
      couponCode,
      pointsRedeemed,
      tipAmount,
      customerUid: req.authUser.firebaseUid,
      customerLoyaltyPoints: req.authUser.loyaltyPoints,
    });

    if (!isRazorpayConfigured()) {
      return res.status(400).json({
        configured: false,
        error: 'Razorpay payment gateway credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured on the server. Please select Cash on Delivery (COD) to test complete delivery or set API keys in .env.',
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const amountInPaise = Math.round(bill.totalAmount * 100);
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          customerUid: req.authUser.firebaseUid,
          restaurantId,
        },
      }),
    });

    const rzpData = await rzpResponse.json();
    if (!rzpResponse.ok) {
      return res.status(400).json({ error: rzpData.error?.description || 'Failed to create Razorpay payment order.' });
    }

    res.json({
      configured: true,
      keyId,
      razorpayOrderId: rzpData.id,
      amount: bill.totalAmount,
      amountInPaise,
      currency: 'INR',
      bill,
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Payment initiation failed.' });
  }
});

app.post('/api/payments/verify', requireUser, requireRole(['customer']), async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Incomplete payment authorization parameters.' });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Cryptographic payment signature verification failed.' });
    }

    // Update the order in database
    const order = await Order.findOne({ id: orderId, customerId: req.authUser.firebaseUid });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    order.paymentStatus = 'paid';
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    await order.save();

    res.json({ verified: true, order });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Payment verification failed.' });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  // Webhook for asynchronous provider events
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    if (event === 'payment.captured' && payment?.order_id) {
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        { $set: { paymentStatus: 'paid', paymentId: payment.id } }
      );
    }

    res.json({ received: true });
  } catch {
    res.status(400).json({ error: 'Webhook processing error.' });
  }
});

// 13. Support & Moderation Tickets
app.get('/api/support/tickets', requireUser, async (req, res) => {
  try {
    const query = req.authUser.role === 'admin' ? {} : { customerId: req.authUser.firebaseUid };
    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load support tickets.' });
  }
});

// Health check endpoints
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'FoodVerse API', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FoodVerse API', timestamp: new Date().toISOString() });
});

// ==========================================
// STARTUP & LISTEN
// ==========================================

const port = Number(process.env.PORT || process.env.API_PORT || 4000);
mongoose
  .connect(process.env.MONGODB_URI || '')
  .then(async () => {
    try {
      await mongoose.connection.collection('orders').dropIndex('orderId_1');
      console.log('Cleaned up legacy orderId_1 index from orders collection.');
    } catch {
      // index not present or already removed
    }
    await seedDatabaseIfEmpty();
    app.listen(port, () => console.log(`FoodVerse API listening on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
