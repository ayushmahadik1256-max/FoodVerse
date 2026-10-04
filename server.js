import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));

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

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '', index: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'], default: 'customer' },
  addresses: { type: [mongoose.Schema.Types.Mixed], default: [] },
  favorites: { type: [String], default: [] },
  loyaltyPoints: { type: Number, default: 250 },
}, { timestamps: true, versionKey: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customerUid: { type: String, required: true, index: true },
  restaurantId: { type: String, required: true, index: true },
  deliveryPartnerUid: { type: String, default: null, index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

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

app.get('/api/health', (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

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
      { $set: { email, name: decoded.name || req.body.name || '', phone: decoded.phone_number || req.body.phone || '', avatar: decoded.picture || '' },
        $setOnInsert: { role: adminEmails.includes(email) ? 'admin' : 'customer' } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    res.json({ user: toClientUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not load account profile.' });
  }
});

app.patch('/api/profile', requireUser, async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'addresses', 'favorites'];
  for (const key of Object.keys(req.body || {})) {
    if (!allowed.includes(key)) return res.status(400).json({ error: `Profile field cannot be changed: ${key}` });
  }
  try {
    Object.assign(req.authUser, req.body);
    await req.authUser.save();
    res.json({ user: toClientUser(req.authUser) });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update profile.' });
  }
});

app.patch('/api/users/:uid/role', requireUser, async (req, res) => {
  if (req.authUser.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
  if (req.params.uid === req.authUser.firebaseUid) return res.status(400).json({ error: 'You cannot change your own administrator role.' });
  const { role } = req.body || {};
  if (!['customer', 'restaurant_owner', 'delivery_partner'].includes(role)) return res.status(400).json({ error: 'Invalid account role.' });
  const user = await User.findOneAndUpdate({ firebaseUid: req.params.uid }, { $set: { role } }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user: toClientUser(user) });
});

app.get('/api/users', requireUser, async (req, res) => {
  if (req.authUser.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
  const users = await User.find().sort({ createdAt: -1 }).limit(500).lean();
  res.json({ users: users.map((user) => ({ id: user.firebaseUid, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt })) });
});

app.get('/api/orders', requireUser, async (req, res) => {
  const user = req.authUser;
  const query = user.role === 'admin' ? {} : user.role === 'restaurant_owner'
    ? { restaurantId: { $in: await ownedRestaurantIds(user.firebaseUid) } }
    : user.role === 'delivery_partner' ? { deliveryPartnerUid: user.firebaseUid } : { customerUid: user.firebaseUid };
  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ orders: orders.map((order) => order.payload) });
});

app.post('/api/orders', requireUser, async (req, res) => {
  if (req.authUser.role !== 'customer') return res.status(403).json({ error: 'Only customers can create orders.' });
  if (!req.body?.id || !req.body?.restaurantId) return res.status(400).json({ error: 'Order ID and restaurant are required.' });
  try {
    const order = await Order.create({ orderId: req.body.id, customerUid: req.authUser.firebaseUid, restaurantId: req.body.restaurantId, payload: req.body });
    res.status(201).json({ order: order.payload });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not save order.' });
  }
});

app.patch('/api/orders/:id/status', requireUser, async (req, res) => {
  const { status } = req.body || {};
  const allowedStatuses = ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid order status.' });
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  const ownsRestaurant = req.authUser.role === 'restaurant_owner' && (await ownedRestaurantIds(req.authUser.firebaseUid)).includes(order.restaurantId);
  const allowed = req.authUser.role === 'admin' || ownsRestaurant ||
    (req.authUser.role === 'delivery_partner' && order.deliveryPartnerUid === req.authUser.firebaseUid) ||
    (req.authUser.role === 'customer' && order.customerUid === req.authUser.firebaseUid && status === 'cancelled');
  if (!allowed) return res.status(403).json({ error: 'You cannot update this order.' });
  order.payload = { ...order.payload, status };
  await order.save();
  res.json({ order: order.payload });
});

async function ownedRestaurantIds(uid) {
  const restaurants = await mongoose.connection.collection('restaurants').find({ ownerId: uid }).project({ _id: 0, id: 1 }).toArray();
  return restaurants.map((restaurant) => restaurant.id);
}

function toClientUser(user) {
  return { id: user.firebaseUid, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar,
    role: user.role, addresses: user.addresses, favorites: user.favorites, loyaltyPoints: user.loyaltyPoints, isGuest: false };
}

const port = Number(process.env.API_PORT || 4000);
mongoose.connect(process.env.MONGODB_URI || '').then(() => {
  app.listen(port, () => console.log(`FoodVerse API listening on ${port}`));
}).catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
