// Admin Dashboard v2 - Restarting
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT, 10) || 5001;
const primaryMongoUri = process.env.MONGO_URI;
const fallbackMongoUri = process.env.STANDARD_MONGO_URI;
const dbName = process.env.DB_NAME || 'Parisu_Ulagam';
const appName = process.env.APP_NAME || 'Parisu Ulagam';
const supportEmail = process.env.SUPPORT_EMAIL || 'parisuulagam@gmail.com';
const adminEmail = process.env.ADMIN_EMAIL || 'parisuulagam@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'TSMGPVT@2026';
const appPassword = process.env.APP_PASSWORD || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: supportEmail,
    pass: appPassword
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['x-rtb-fingerprint-id', 'request-id'],
}));

// Allow Razorpay iframe to use device sensors & prevent mixed-content issues
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'accelerometer=*, gyroscope=*, magnetometer=*, camera=(), microphone=()');
  res.setHeader('Access-Control-Expose-Headers', 'x-rtb-fingerprint-id, request-id');
  next();
});

app.use(express.json({ limit: '10mb' }));


/* ═══════════ UPLOADS CONFIG ═══════════ */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images at the path stored in the DB (/images/uploads/...)
app.use('/images/uploads', express.static(uploadsDir));
// Backward compat: also serve at /uploads
app.use('/uploads', express.static(uploadsDir));
// Serve static product images (earrings.png, etc.) that the frontend/public/images holds
const staticImagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images');
if (fs.existsSync(staticImagesDir)) {
  app.use('/images', express.static(staticImagesDir));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/* ═══════════ ADMIN AUTH ═══════════ */
let adminTokens = new Set();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !adminTokens.has(token)) {
    return res.status(200).json({ success: false, message: 'Admin authentication required.' });
  }
  next();
}

/* ═══════════ FALLBACK DATA ═══════════ */
const fallbackProducts = [
  {
    id: 'earrings-001',
    name: 'Royal Pearl Earrings',
    category: 'Earrings',
    price: 1499,
    badge: 'In Stock',
    badgeClass: 'instock',
    rating: 4.8,
    reviews: 128,
    stock: 50,
    status: 'Active',
    description: 'Beautifully crafted earrings with royal finish, perfect for every occasion.',
    image: '/images/earrings.png',
    images: ['/images/earrings.png']
  },
  {
    id: 'wood-art-001',
    name: 'Floral Wood Engraving',
    category: 'Wood Engravings',
    price: 2199,
    badge: 'Limited',
    badgeClass: 'limited',
    rating: 4.9,
    reviews: 94,
    stock: 12,
    status: 'Active',
    description: 'Handmade engraved wood wall art with intricate royal floral patterns.',
    image: '/images/woodbox.png',
    images: ['/images/woodbox.png']
  },
  {
    id: 'keychain-001',
    name: 'Vintage Key Chain',
    category: 'Key Chains',
    price: 599,
    badge: 'Best Seller',
    badgeClass: 'bestseller',
    rating: 4.7,
    reviews: 76,
    stock: 200,
    status: 'Active',
    description: 'Elegant vintage key chain crafted with charm and premium finish.',
    image: '/images/keychain.png',
    images: ['/images/keychain.png']
  },
  {
    id: 'wood-art-002',
    name: 'Wooden Wall Art',
    category: 'Wood Engravings',
    price: 2899,
    badge: 'New',
    badgeClass: 'new',
    rating: 4.6,
    reviews: 54,
    stock: 30,
    status: 'Active',
    description: 'Sculpted wooden wall art with rich royal silhouettes and warm finish.',
    image: '/images/woodbox.png',
    images: ['/images/woodbox.png']
  },
  {
    id: 'keychain-002',
    name: 'Leather Key Chain',
    category: 'Key Chains',
    price: 699,
    badge: 'New',
    badgeClass: 'new',
    rating: 4.5,
    reviews: 42,
    stock: 80,
    status: 'Active',
    description: 'Premium leather key chain with gold-toned hardware and smooth finish.',
    image: '/images/keychain.png',
    images: ['/images/keychain.png']
  },
  {
    id: 'soft-toy-mr1uzpfr',
    name: 'Soft Toy',
    category: 'Toys',
    price: 999,
    badge: 'New',
    badgeClass: 'new',
    rating: 4.2,
    reviews: 0,
    stock: 100,
    status: 'Active',
    description: 'A soft plush toy.',
    image: '/images/soft-toy.png',
    images: ['/images/soft-toy.png']
  }
];

/* ═══════════ MONGOOSE SCHEMA ═══════════ */
const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    collection: { type: String, default: '' },
    brand: { type: String, default: 'Parisu Ulagam' },
    price: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    badge: { type: String, default: '' },
    badgeClass: { type: String, default: 'new' },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    description: { type: String, default: '' },
    specifications: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
    image: { type: String, default: '' },
    images: { type: [String], default: [] },
    discountPercentage: { type: Number, default: 0 },
    offerId: { type: String, default: '' }
  },
  { timestamps: true }
);

// Ensure image field is always synced with images[0]
productSchema.pre('save', function () {
  if (this.images && this.images.length > 0 && !this.image) {
    this.image = this.images[0];
  }
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const offerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    discountPercentage: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);
const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);

const customRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    productType: { type: String, required: true },
    description: { type: String, required: true },
    referenceImages: { type: [String], default: [] },
    status: { type: String, enum: ['Pending', 'Reviewed', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' }
  },
  { timestamps: true }
);
const CustomRequest = mongoose.models.CustomRequest || mongoose.model('CustomRequest', customRequestSchema);

const querySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' }
  },
  { timestamps: true }
);
const Query = mongoose.models.Query || mongoose.model('Query', querySchema);

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    desc: { type: String, default: '' },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, default: '' },
    addresses: { type: [{ label: String, name: String, address: String, phone: String }], default: [] },
    extraDetails: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    cart: { type: [{ productId: String, quantity: Number, name: String, price: Number, image: String, selectedImage: String }], default: [] },
    wishlist: { type: [String], default: [] },
    totalSpent: { type: Number, default: 0 }
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    items: { type: Array, required: true },
    subtotal: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    shippingMethod: { type: String, default: '' },
    status: { type: String, enum: ['Payment Verification', 'Packing', 'On the way', 'Delivered', 'Cancelled'], default: 'Payment Verification' },
    shippingAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    courierName: { type: String, default: '' },
    courierTrackingId: { type: String, default: '' }
  },
  { timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const shippingSchema = new mongoose.Schema(
  {
    providerName: { type: String, required: true, trim: true },
    shippingCharge: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
const Shipping = mongoose.models.Shipping || mongoose.model('Shipping', shippingSchema);

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    userEmail: { type: String, required: true }
  },
  { timestamps: true }
);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userEmail: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);
const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' } // Auto-approve for simplicity, but leave option
  },
  { timestamps: true }
);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
// Site Settings model (hero & banner content)
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    heroTitle: { type: String, default: 'Crafted for Royalty, Made for You.' },
    heroEyebrow: { type: String, default: 'Timeless · Elegant · Royal' },
    heroDescription: { type: String, default: 'Discover our premium collection of handcrafted earrings, wood engravings & exquisite key chains — where tradition meets luxury.' },
    heroImageLight: { type: [String], default: ['/images/hero.png'] },
    heroImage: { type: [String], default: ['/images/hero.png'] },
    heroClassicImage: { type: [String], default: ['/images/hero-classic.png'] },
    bannerEnabled: { type: Boolean, default: true },
    bannerTitle: { type: String, default: 'Royal Collection Sale' },
    bannerDiscount: { type: String, default: '' },
    bannerExtraDiscount: { type: String, default: 'Limited Time Only' },
    bannerDescription: { type: String, default: 'Discover exquisite craftsmanship at unprecedented prices. Elevate your elegance today.' },
    bannerImageLight: { type: [String], default: ['/images/offer_light.png'] },
        bannerImageClassic: { type: [String], default: ['/images/offer_classic.png'] },
    aboutTitle: { type: String, default: 'Where Tradition meets Elegance' },
    aboutDescription: { type: String, default: 'Born from a passion for timeless artistry, Parisu Ulagam is a celebration of heritage craftsmanship and modern luxury.' },
    contactPhone: { type: String, default: '+91 94883 16728' },
    contactEmail: { type: String, default: 'thesmgroups@gmail.com' },
    contactAddress: { type: String, default: 'IInd Floor, OM Shiva Towers, 259-B, Advaitha Ashram Rd, Fairlands, Salem - 636004' },
    aboutImage: { type: [String], default: ['/images/toy-classic.png'] },
    aboutAccentNum: { type: String, default: '5+' },
    aboutAccentLabel: { type: String, default: 'Years of Craftsmanship' }
  },
  { timestamps: true }
);
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

/* ═══════════ DB CONNECTION ═══════════ */
let dbConnected = false;
let dbError = null;

async function connectMongo(uri) {
  if (!uri) throw new Error('No MongoDB URI provided.');
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
  });
}

async function startServer() {
  const uri = primaryMongoUri || fallbackMongoUri;

  if (uri) {
    try {
      await connectMongo(uri);
      dbConnected = true;
      console.log(`Connected to MongoDB (${uri.startsWith('mongodb+srv://') ? 'SRV' : 'standard'})`);
      await seedCategories();
    } catch (primaryError) {
      dbError = primaryError.message;
      console.error('Primary MongoDB connection failed:', dbError);

      if (primaryMongoUri && fallbackMongoUri && primaryMongoUri !== fallbackMongoUri) {
        try {
          await connectMongo(fallbackMongoUri);
          dbConnected = true;
          dbError = null;
          console.log('Connected to MongoDB using fallback standard connection.');
          await seedCategories();
        } catch (fallbackError) {
          dbError = fallbackError.message;
          console.error('Fallback MongoDB connection failed:', dbError);
        }
      }
    }
  }

  if (!dbConnected) {
    console.warn('Running without MongoDB connection. /api/products will return fallback data.');
  }

  // Monolith mode: serve frontend dist files directly in production (if built locally/mono-deployed)
  if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
    const indexHtmlPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      app.use(express.static(frontendDist));
      app.get('*', (req, res) => {
        res.sendFile(indexHtmlPath);
      });
    } else {
      // If index.html is missing (e.g. backend deployed alone on Render), serve API details at root
      app.get('/', (req, res) => {
        res.json({ message: "Parisu Ulagam Backend API is running successfully." });
      });
    }
  }

  // Bind to 0.0.0.0 so Render (and similar PaaS) can reach the port
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });

  server.on('error', (error) => {
    console.error('Server failed to start:', error.message);
  });
}

async function seedCategories() {
  if (!dbConnected) return;
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const fallbackCategories = [
        {
          id: 'Earrings',
          label: 'Earrings',
          desc: 'Elegant designs that add charm to you.',
          image: '/images/earrings.png'
        },
        {
          id: 'Wood Engravings',
          label: 'Wood Engravings',
          desc: 'Royal craftsmanship in every detail.',
          image: '/images/woodbox.png'
        },
        {
          id: 'Key Chains',
          label: 'Key Chains',
          desc: 'Carry elegance everywhere you go.',
          image: '/images/keychain.png'
        }
      ];
      await Category.insertMany(fallbackCategories);
      console.log('Seed categories inserted into DB');
    }
  } catch (err) {
    console.error('Error seeding categories:', err.message);
  }
}

/* ═══════════ PUBLIC ROUTES ═══════════ */

// Admin login — returns token
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (email === adminEmail && password === adminPassword) {
    const token = generateToken();
    adminTokens.add(token);
    return res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      appName,
      supportEmail
    });
  }

  return res.status(200).json({
    success: false,
    message: 'Invalid admin credentials.'
  });
});

// Public products list (only Active status shown to customers)
app.get('/api/products', async (req, res) => {
  if (dbConnected) {
    try {
      const products = await Product.find({ status: 'Active' }).sort({ createdAt: -1 }).lean();
      if (products.length > 0) {
        return res.json(products);
      }
      console.warn('No active products found in MongoDB; returning fallback product set.');
    } catch (error) {
      console.error('Failed to load products from DB:', error.message);
    }
  }

  return res.json(fallbackProducts);
});

// Single product detail (Public)
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  if (dbConnected) {
    try {
      const product = await Product.findOne({ id, status: 'Active' }).lean();
      if (product) {
        return res.json(product);
      }
    } catch (error) {
      console.error(`Failed to load product ${id} from DB:`, error.message);
    }
  }

  // Fallback
  const fallbackProduct = fallbackProducts.find(p => p.id === id || p._id === id);
  if (fallbackProduct) {
    return res.json(fallbackProduct);
  }

  return res.status(404).json({ error: 'Product not found' });
});

// Product reviews (Public)
app.get('/api/products/:id/reviews', async (req, res) => {
  if (!dbConnected) {
    return res.json({ success: true, reviews: [] });
  }
  try {
    const { id } = req.params;
    // We want to fetch the customer name as well. We can do a manual lookup or just use "Customer"
    const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 }).lean();
    
    // We can fetch user names for these reviews
    const emails = [...new Set(reviews.map(r => r.userEmail))];
    const users = await User.find({ email: { $in: emails } }).select('email name').lean();
    const userMap = users.reduce((acc, u) => { acc[u.email] = u.name; return acc; }, {});

    const enrichedReviews = reviews.map(r => ({
      ...r,
      customerName: userMap[r.userEmail] || 'Verified Customer'
    }));

    return res.json({ success: true, reviews: enrichedReviews });
  } catch (error) {
    console.error('Failed to load reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    appName,
    dbConnected,
    dbError: dbConnected ? null : dbError
  });
});

app.get('/api/settings', (req, res) => {
  res.json({ appName, supportEmail, dbConnected });
});

// Get Offers (Public)
app.get('/api/offers', async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const activeOffers = await Offer.find({ status: 'Active' }).sort({ createdAt: -1 }).lean();
    return res.json(activeOffers);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


// Get Categories (Public)
app.get('/api/categories', async (req, res) => {
  const fallbackCategories = [
    {
      id: 'Earrings',
      label: 'Earrings',
      desc: 'Elegant designs that add charm to you.',
      image: '/images/earrings.png'
    },
    {
      id: 'Wood Engravings',
      label: 'Wood Engravings',
      desc: 'Royal craftsmanship in every detail.',
      image: '/images/woodbox.png'
    },
    {
      id: 'Key Chains',
      label: 'Key Chains',
      desc: 'Carry elegance everywhere you go.',
      image: '/images/keychain.png'
    }
  ];
  if (dbConnected) {
    try {
      const list = await Category.find().sort({ createdAt: 1 }).lean();
      if (list.length > 0) {
        return res.json(list);
      }
    } catch (err) {
      console.error('Failed to load categories from DB:', err.message);
    }
  }
  return res.json(fallbackCategories);
});

/* ═══════════ USER AUTHENTICATION & PROFILE ═══════════ */
const userVerificationCodes = new Map(); // email -> otp
const userRegistrationTokens = new Set(); // verified tokens
const userSessions = new Map(); // token -> email
const passwordResetCodes = new Map(); // email -> { otp, expiresAt }
const passwordResetTokens = new Map(); // token -> email

// Helper middleware for users
const requireUser = async (req, res, next) => {
  const token = req.headers['x-user-token'];
  if (!token || !userSessions.has(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }
  req.userEmail = userSessions.get(token);
  next();
};

// 1. Request verification OTP
app.post('/api/users/register-request', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { name, email, mobile } = req.body;
    if (!name || !email || !mobile) {
      return res.status(400).json({ success: false, message: 'Name, email, and mobile are required.' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Generate 6 digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    userVerificationCodes.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    console.log(`[USER VERIFICATION] Generated Code for ${email}: ${otp}`);

    // Send the OTP via email
    try {
      console.log(`[SMTP] Attempting to send OTP email to ${email}...`);
      await transporter.sendMail({
        from: `"${appName}" <${supportEmail}>`,
        to: email,
        subject: `${appName} - Your Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #c9a84c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${appName}</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #ffffff;">
              <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
              <p style="color: #475569; line-height: 1.6;">Hello ${name},</p>
              <p style="color: #475569; line-height: 1.6;">Thank you for registering at ${appName}. Please use the following 6-digit verification code to complete your registration:</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${otp}</span>
              </div>
              
              <p style="color: #475569; line-height: 1.6; font-size: 0.9em;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 0.8em; margin: 0;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        `
      });
      console.log(`[SMTP] Email successfully sent to ${email}`);
    } catch (emailError) {
      console.error(`[SMTP ERROR] Failed to send email to ${email}:`, emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email. Please check the email address or contact support.',
        error: emailError.message 
      });
    }

    return res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Verify code
app.post('/api/users/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const record = userVerificationCodes.get(email);
    if (!record || record.otp !== code || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    // Generate registration token
    const regToken = `reg-${Math.random().toString(36).substring(2, 15)}`;
    userRegistrationTokens.add(regToken);
    userVerificationCodes.delete(email);

    return res.json({ success: true, message: 'Email verified successfully.', registrationToken: regToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Complete Registration
app.post('/api/users/complete-register', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { name, email, mobile, password, address, extraDetails, registrationToken } = req.body;

    if (!name || !email || !mobile || !password || !registrationToken) {
      return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    if (!userRegistrationTokens.has(registrationToken)) {
      return res.status(400).json({ success: false, message: 'Invalid registration flow token.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const newUser = new User({
      name,
      email,
      mobile,
      password,
      address: address || '',
      extraDetails: extraDetails || '',
      isVerified: true
    });

    await newUser.save();
    userRegistrationTokens.delete(registrationToken);

    // Send admin notification email
    try {
      await transporter.sendMail({
        from: `"${appName}" <${supportEmail}>`,
        to: adminEmail,
        subject: `${appName} - New User Registered`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
            <h2 style="color:#1e293b;">New User Registration</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
          </div>
        `
      });
      console.log(`[ADMIN NOTIFY] Email sent for new user ${email}`);
    } catch (emailErr) {
      console.error(`[ADMIN NOTIFY] Failed to send email for ${email}:`, emailErr);
    }

    // Auto login
    const sessionToken = `usr-${Math.random().toString(36).substring(2, 15)}`;
    userSessions.set(sessionToken, email);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: sessionToken,
      user: { name: newUser.name, email: newUser.email, mobile: newUser.mobile, address: newUser.address, addresses: newUser.addresses || [], extraDetails: newUser.extraDetails }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. User Login
app.post('/api/users/login', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Check for Admin login first
    if (email === adminEmail && password === adminPassword) {
      const token = generateToken();
      adminTokens.add(token);
      return res.json({
        success: true,
        message: 'Admin login successful.',
        token,
        isAdmin: true,
        appName,
        supportEmail
      });
    }

    // Standard User login
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const sessionToken = `usr-${Math.random().toString(36).substring(2, 15)}`;
    userSessions.set(sessionToken, email);

    return res.json({
      success: true,
      message: 'Login successful.',
      token: sessionToken,
      isAdmin: false,
      user: { name: user.name, email: user.email, mobile: user.mobile, address: user.address, addresses: user.addresses || [], extraDetails: user.extraDetails, cart: user.cart || [], wishlist: user.wishlist || [] }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4a. Forgot Password - Request OTP
app.post('/api/users/forgot-password', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    passwordResetCodes.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    console.log(`[PASSWORD RESET] Generated Code for ${email}: ${otp}`);

    try {
      await transporter.sendMail({
        from: `"${appName}" <${supportEmail}>`,
        to: email,
        subject: `${appName} - Password Reset Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #c9a84c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${appName}</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #ffffff;">
              <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #475569; line-height: 1.6;">Hello ${user.name},</p>
              <p style="color: #475569; line-height: 1.6;">We received a request to reset the password for your ${appName} account. Please use the following 6-digit verification code to proceed:</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c9a84c;">${otp}</span>
              </div>
              
              <p style="color: #475569; line-height: 1.6; font-size: 0.9em;">This code will expire in 10 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 0.8em; margin: 0;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error(`[SMTP ERROR] Failed to send password reset email to ${email}:`, emailError);
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again later.' });
    }

    return res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4b. Verify Reset OTP
app.post('/api/users/verify-reset-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and verification code are required.' });

    const record = passwordResetCodes.get(email);
    if (!record || record.otp !== code || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
    }

    const resetToken = `rst-${Math.random().toString(36).substring(2, 15)}`;
    passwordResetTokens.set(resetToken, email);
    passwordResetCodes.delete(email);

    return res.json({ success: true, message: 'Email verified successfully.', resetToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4c. Reset Password
app.post('/api/users/reset-password', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ success: false, message: 'Missing token or password.' });

    const email = passwordResetTokens.get(resetToken);
    if (!email) return res.status(400).json({ success: false, message: 'Invalid or expired reset session. Please try again.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.password = newPassword;
    await user.save();

    passwordResetTokens.delete(resetToken);

    return res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. User Profile
app.get('/api/users/profile', requireUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.userEmail }).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Update Profile
app.put('/api/users/profile', requireUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.userEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const { address, extraDetails, mobile, addresses } = req.body;
    if (address !== undefined) user.address = address;
    if (addresses !== undefined && Array.isArray(addresses)) user.addresses = addresses;
    if (extraDetails !== undefined) user.extraDetails = extraDetails;
    if (mobile !== undefined) {
      if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
      }
      user.mobile = mobile;
    }

    await user.save();
    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: { name: user.name, email: user.email, mobile: user.mobile, address: user.address, addresses: user.addresses, extraDetails: user.extraDetails }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Sync Cart
app.post('/api/users/sync-cart', requireUser, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart)) return res.status(400).json({ success: false, message: 'cart must be an array.' });
    await User.updateOne({ email: req.userEmail }, { cart });
    return res.json({ success: true, message: 'Cart synced.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Sync Wishlist
app.post('/api/users/sync-wishlist', requireUser, async (req, res) => {
  try {
    const { wishlist } = req.body;
    if (!Array.isArray(wishlist)) return res.status(400).json({ success: false, message: 'wishlist must be an array.' });
    await User.updateOne({ email: req.userEmail }, { wishlist });
    return res.json({ success: true, message: 'Wishlist synced.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Place Order (Checkout) - Updated with shipping + payment
app.post('/api/users/checkout', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { items, subtotal, shippingCharge, totalAmount, shippingMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature, shippingAddress, customerPhone } = req.body;
    if (!items || !totalAmount) return res.status(400).json({ success: false, message: 'Items and totalAmount are required.' });
    const user = await User.findOne({ email: req.userEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = new Order({
      orderId,
      userEmail: req.userEmail,
      customerName: user.name,
      items,
      subtotal: subtotal || 0,
      shippingCharge: shippingCharge || 0,
      totalAmount,
      shippingMethod: shippingMethod || '',
      shippingAddress: shippingAddress || user.address || '',
      customerPhone: customerPhone || user.mobile || '',
      status: 'Payment Verification',
      paymentStatus: razorpayPaymentId ? 'Paid' : 'Pending',
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      razorpaySignature: razorpaySignature || ''
    });
    await order.save();
    // Clear cart, update totalSpent, and save the shipping address for future use
    user.cart = [];
    user.totalSpent += totalAmount;
    
    // Automatically save this address so it's recommended/auto-filled next time
    if (shippingAddress) {
      if (!user.address) user.address = shippingAddress;
      const isAddressSaved = user.addresses && user.addresses.some(a => a.address === shippingAddress);
      if (!isAddressSaved) {
        user.addresses = user.addresses || [];
        user.addresses.push({
          label: 'Recent Shipping Address',
          name: user.name,
          address: shippingAddress,
          phone: customerPhone || user.mobile || ''
        });
      }
    }
    await user.save();

    // Send invoice confirmation email to customer
    if (razorpayPaymentId && user.email) {
      try {
        const itemsHtml = (items || []).map(item =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">&#8377;${(item.price || 0).toLocaleString('en-IN')}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">&#8377;${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</td>
          </tr>`
        ).join('');

        await transporter.sendMail({
          from: `"${appName}" <${supportEmail}>`,
          to: user.email,
          subject: `✅ Order Confirmed & Invoice — ${orderId} | ${appName}`,
          html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:0 auto;background:#fafafa;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#b5882e 0%,#d4a843 100%);padding:30px;text-align:center;">
                <h1 style="margin:0;color:#000;font-size:1.8rem;font-weight:700;">${appName}</h1>
                <p style="margin:6px 0 0;color:rgba(0,0,0,0.7);font-size:0.9rem;">Payment Confirmed — Tax Invoice</p>
              </div>
              <div style="padding:30px;">
                <p style="margin:0 0 6px;">Hello <strong>${user.name}</strong>,</p>
                <p style="margin:0 0 24px;color:#555;">Thank you for your order! Your payment was successful. Here is your invoice:</p>

                <div style="display:flex;justify-content:space-between;margin-bottom:20px;gap:16px;flex-wrap:wrap;">
                  <div style="background:#f0f4ff;border-radius:8px;padding:14px 18px;flex:1;min-width:180px;">
                    <div style="font-size:0.75rem;color:#666;margin-bottom:4px;text-transform:uppercase;font-weight:600;">Order ID</div>
                    <div style="font-family:monospace;font-size:1rem;font-weight:700;">${orderId}</div>
                  </div>
                  <div style="background:#f0fff4;border-radius:8px;padding:14px 18px;flex:1;min-width:180px;">
                    <div style="font-size:0.75rem;color:#666;margin-bottom:4px;text-transform:uppercase;font-weight:600;">Payment Status</div>
                    <div style="color:#16a34a;font-weight:700;">✅ Paid</div>
                  </div>
                  <div style="background:#fff8f0;border-radius:8px;padding:14px 18px;flex:1;min-width:180px;">
                    <div style="font-size:0.75rem;color:#666;margin-bottom:4px;text-transform:uppercase;font-weight:600;">Date</div>
                    <div style="font-weight:600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                  <thead>
                    <tr style="background:#f9f9f9;">
                      <th style="padding:10px 12px;text-align:left;font-size:0.8rem;color:#555;border-bottom:2px solid #eee;">Item</th>
                      <th style="padding:10px 12px;text-align:center;font-size:0.8rem;color:#555;border-bottom:2px solid #eee;">Qty</th>
                      <th style="padding:10px 12px;text-align:right;font-size:0.8rem;color:#555;border-bottom:2px solid #eee;">Price</th>
                      <th style="padding:10px 12px;text-align:right;font-size:0.8rem;color:#555;border-bottom:2px solid #eee;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div style="max-width:300px;margin-left:auto;">
                  <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:0.9rem;">
                    <span style="color:#555;">Subtotal</span>
                    <span>&#8377;${(subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:0.9rem;">
                    <span style="color:#555;">Shipping (${shippingMethod || 'Standard'})</span>
                    <span>&#8377;${(shippingCharge || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:700;font-size:1rem;border-top:2px solid #333;margin-top:4px;">
                    <span>Grand Total</span>
                    <span style="color:#b5882e;">&#8377;${(totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                ${shippingAddress ? `<div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px;font-size:0.88rem;"><strong>Shipping To:</strong><br/>${shippingAddress}</div>` : ''}
                <p style="margin-top:24px;font-size:0.85rem;color:#666;">If you have any questions about your order, please contact us at <a href="mailto:${supportEmail}" style="color:#b5882e;">${supportEmail}</a></p>
              </div>
              <div style="background:#f0f0f0;padding:16px;text-align:center;font-size:0.78rem;color:#888;">
                &copy; ${new Date().getFullYear()} ${appName}. All Rights Reserved. | thesmgroups@gmail.com | +91 94883 16728
              </div>
            </div>
          `
        });
        console.log(`[INVOICE EMAIL] Sent to ${user.email} for order ${orderId}`);
      } catch (emailErr) {
        console.error('[INVOICE EMAIL] Failed to send:', emailErr.message);
      }
    }

    return res.status(201).json({ success: true, message: 'Order placed successfully.', orderId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Get User Orders (all)
app.get('/api/users/orders', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const orders = await Order.find({ userEmail: req.userEmail }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 10. Get single User Order by orderId (for invoice)
app.get('/api/users/orders/:orderId', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, userEmail: req.userEmail }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Cancel Order
app.post('/api/users/orders/cancel', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required.' });

    const order = await Order.findOne({ orderId, userEmail: req.userEmail });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }
    if (['On the way', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
    }

    order.status = 'Cancelled';
    await order.save();
    return res.json({ success: true, message: 'Order has been cancelled successfully.', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 12. Submit Return Request
app.post('/api/users/returns', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) return res.status(400).json({ success: false, message: 'Order ID and reason are required.' });

    const order = await Order.findOne({ orderId, userEmail: req.userEmail });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });
    }

    const existingRequest = await ReturnRequest.findOne({ orderId, userEmail: req.userEmail });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'A return request already exists for this order.' });
    }

    const returnReq = new ReturnRequest({ orderId, userEmail: req.userEmail, reason });
    await returnReq.save();
    return res.json({ success: true, message: 'Return request submitted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 13. Submit Product Review
app.post('/api/users/reviews', requireUser, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ success: false, message: 'Product ID and rating are required.' });
    
    // Create the review
    const review = new Review({ productId, userEmail: req.userEmail, rating: Number(rating), comment: comment || '' });
    await review.save();

    // Update Product average rating & count
    const product = await Product.findOne({ id: productId });
    if (product) {
      const productReviews = await Review.find({ productId });
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = parseFloat((totalRating / productReviews.length).toFixed(1));
      product.reviews = productReviews.length;
      await product.save();
    }

    return res.json({ success: true, message: 'Review submitted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Submit a query (Public)
app.post('/api/queries', async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected.' });
  }
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const queryId = `query-${Date.now().toString(36)}`;
    const query = new Query({
      id: queryId,
      name, email, subject: subject || '', message
    });
    await query.save();
    return res.status(201).json({ success: true, message: 'Query submitted successfully.', query });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ ADMIN CRUD ROUTES ═══════════ */

// List ALL products (including Draft/Archived) for admin
app.get('/api/admin/products', requireAdmin, async (req, res) => {
  if (!dbConnected) {
    return res.json(fallbackProducts);
  }
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/products', requireAdmin, upload.array('images', 10), async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected. Cannot create products.' });
  }

  try {
    const { name, category, collection, brand, price, shippingCharge, stock, badge, badgeClass, description, specifications, status, discountPercentage, offerId } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    // Build image URLs from uploaded files
    const imageUrls = (req.files || []).map(f => `/images/uploads/${f.filename}`);

    // Also handle existing image URLs passed as JSON
    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch { /* ignore */ }
    }

    const allImages = [...existingImages, ...imageUrls];

    // Generate sequential custom product ID: e.g. category-collection-001 or category-001
    const cleanCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanCollection = (collection || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const baseId = cleanCollection ? `${cleanCategory}-${cleanCollection}` : cleanCategory;

    const regex = new RegExp(`^${baseId}-(\\d+)$`);
    const matchingProducts = await Product.find({ id: { $regex: regex } }).lean();
    let maxNum = 0;
    for (const p of matchingProducts) {
      const match = p.id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextNum = maxNum + 1;
    const padNum = String(nextNum).padStart(3, '0');
    const productId = `${baseId}-${padNum}`;

    const product = new Product({
      id: productId,
      name,
      category,
      collection: collection || '',
      brand: brand || 'Parisu Ulagam',
      price: parseFloat(price),
      shippingCharge: parseFloat(shippingCharge) || 0,
      stock: parseInt(stock, 10) || 0,
      badge: badge || '',
      badgeClass: badgeClass || 'new',
      rating: 0,
      reviews: 0,
      description: description || '',
      specifications: specifications || '',
      status: status || 'Active',
      image: allImages[0] || '',
      images: allImages,
      discountPercentage: Number(discountPercentage) || 0,
      offerId: offerId || ''
    });

    await product.save();

    return res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAdmin, upload.array('images', 10), async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected.' });
  }

  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, category, collection, brand, price, shippingCharge, stock, badge, badgeClass, description, specifications, status, discountPercentage, offerId } = req.body;

    if (name) product.name = name;
    if (category) product.category = category;
    if (collection !== undefined) product.collection = collection;
    if (brand !== undefined) product.brand = brand;
    if (price) product.price = parseFloat(price);
    if (shippingCharge !== undefined) product.shippingCharge = parseFloat(shippingCharge) || 0;
    if (stock !== undefined) product.stock = parseInt(stock, 10) || 0;
    if (badge !== undefined) product.badge = badge;
    if (badgeClass !== undefined) product.badgeClass = badgeClass;
    if (description !== undefined) product.description = description;
    if (specifications !== undefined) product.specifications = specifications;
    if (status) product.status = status;
    if (discountPercentage !== undefined) product.discountPercentage = Number(discountPercentage) || 0;
    if (offerId !== undefined) product.offerId = offerId || '';

    // Handle images
    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch { /* ignore */ }
    }
    const newImageUrls = (req.files || []).map(f => `/images/uploads/${f.filename}`);
    const allImages = [...existingImages, ...newImageUrls];

    if (allImages.length > 0) {
      // Delete removed images from disk
      const removedImages = (product.images || []).filter(img => !allImages.includes(img));
      removedImages.forEach(img => {
        if (img.startsWith('/images/uploads/')) {
          const filePath = path.join(uploadsDir, path.basename(img));
          fs.unlink(filePath, () => {});
        }
      });

      product.images = allImages;
      product.image = allImages[0];
    }

    await product.save();

    return res.json({ success: true, message: 'Product updated successfully.', product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected.' });
  }

  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Delete images from disk
    (product.images || []).forEach(img => {
      if (img.startsWith('/images/uploads/')) {
        const filePath = path.join(uploadsDir, path.basename(img));
        fs.unlink(filePath, () => {});
      }
    });

    await Product.deleteOne({ id: req.params.id });

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ SHIPPING ROUTES (PUBLIC) ═══════════ */
// Get all active shipping methods (for checkout)
app.get('/api/shipping/active', async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const methods = await Shipping.find({ isActive: true }).sort({ shippingCharge: 1 }).lean();
    return res.json(methods);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ SHIPPING ROUTES (ADMIN) ═══════════ */
// Get all shipping methods (admin)
app.get('/api/admin/shipping', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const methods = await Shipping.find().sort({ createdAt: -1 }).lean();
    return res.json(methods);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create shipping method (admin)
app.post('/api/admin/shipping', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { providerName, shippingCharge, isActive } = req.body;
    if (!providerName || shippingCharge === undefined || shippingCharge === null) {
      return res.status(400).json({ success: false, message: 'Provider name and shipping charge are required.' });
    }
    const charge = parseFloat(shippingCharge);
    if (isNaN(charge) || charge < 0) {
      return res.status(400).json({ success: false, message: 'Shipping charge must be a valid non-negative number.' });
    }
    const method = new Shipping({
      providerName: providerName.trim(),
      shippingCharge: charge,
      isActive: isActive !== false
    });
    await method.save();
    return res.status(201).json({ success: true, message: 'Shipping method created.', method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update shipping method (admin)
app.put('/api/admin/shipping/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const method = await Shipping.findById(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: 'Shipping method not found.' });
    const { providerName, shippingCharge, isActive } = req.body;
    if (providerName !== undefined) method.providerName = providerName.trim();
    if (shippingCharge !== undefined) {
      const charge = parseFloat(shippingCharge);
      if (isNaN(charge) || charge < 0) {
        return res.status(400).json({ success: false, message: 'Shipping charge must be a valid non-negative number.' });
      }
      method.shippingCharge = charge;
    }
    if (isActive !== undefined) method.isActive = Boolean(isActive);
    await method.save();
    return res.json({ success: true, message: 'Shipping method updated.', method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete shipping method (admin)
app.delete('/api/admin/shipping/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const method = await Shipping.findByIdAndDelete(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: 'Shipping method not found.' });
    return res.json({ success: true, message: 'Shipping method deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle shipping method active status (admin)
app.patch('/api/admin/shipping/:id/toggle', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const method = await Shipping.findById(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: 'Shipping method not found.' });
    method.isActive = !method.isActive;
    await method.save();
    return res.json({ success: true, message: `Shipping method ${method.isActive ? 'enabled' : 'disabled'}.`, method });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ PAYMENT ROUTES ═══════════ */
// Create Razorpay order
app.post('/api/payments/create-order', requireUser, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' });
    }
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `rcpt_${Date.now().toString(36)}`,
      payment_capture: 1
    };
    const razorpayOrder = await razorpay.orders.create(options);
    return res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('[RAZORPAY] Order creation failed:', error);
    return res.status(500).json({ success: false, message: 'Payment initiation failed. Please try again.' });
  }
});

// Verify Razorpay payment signature
app.post('/api/payments/verify', requireUser, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification data is incomplete.' });
    }
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }
    // Update order payment status if orderId is provided
    if (orderId && dbConnected) {
      await Order.findOneAndUpdate(
        { orderId },
        { paymentStatus: 'Paid', razorpayOrderId, razorpayPaymentId, razorpaySignature }
      );
    }
    return res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('[RAZORPAY] Payment verification failed:', error);
    return res.status(500).json({ success: false, message: 'Payment verification error.' });
  }
});

startServer();

/* ═══════════ OFFERS CRUD (ADMIN) ═══════════ */
app.get('/api/admin/offers', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();
    return res.json(offers);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/offers', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { title, description, discountPercentage, validUntil, status } = req.body;
    if (!title || discountPercentage === undefined || !validUntil) {
      return res.status(400).json({ success: false, message: 'Title, discountPercentage, and validUntil are required.' });
    }
    const offerId = `offer-${Date.now().toString(36)}`;
    const offer = new Offer({
      id: offerId, title, description: description || '', discountPercentage: Number(discountPercentage), validUntil: new Date(validUntil), status: status || 'Active'
    });
    await offer.save();
    return res.status(201).json({ success: true, message: 'Offer created.', offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/offers/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const offer = await Offer.findOne({ id: req.params.id });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    
    const { title, description, discountPercentage, validUntil, status } = req.body;
    if (title) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (discountPercentage !== undefined) offer.discountPercentage = Number(discountPercentage);
    if (validUntil) offer.validUntil = new Date(validUntil);
    if (status) offer.status = status;
    
    await offer.save();
    return res.json({ success: true, message: 'Offer updated.', offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/offers/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const offer = await Offer.findOneAndDelete({ id: req.params.id });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    return res.json({ success: true, message: 'Offer deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ QUERIES (ADMIN) ═══════════ */
app.get('/api/admin/queries', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const queries = await Query.find().sort({ createdAt: -1 }).lean();
    return res.json(queries);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/queries/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const query = await Query.findOne({ id: req.params.id });
    if (!query) return res.status(404).json({ success: false, message: 'Query not found.' });
    
    if (req.body.status) query.status = req.body.status;
    
    await query.save();
    return res.json({ success: true, message: 'Query updated.', query });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ CATEGORIES CRUD (ADMIN) ═══════════ */
app.get('/api/admin/categories', requireAdmin, async (req, res) => {
  if (!dbConnected) {
    return res.json([
      { id: 'Earrings', label: 'Earrings', desc: 'Elegant designs that add charm to you.', image: '/images/earrings.png' },
      { id: 'Wood Engravings', label: 'Wood Engravings', desc: 'Royal craftsmanship in every detail.', image: '/images/woodbox.png' },
      { id: 'Key Chains', label: 'Key Chains', desc: 'Carry elegance everywhere you go.', image: '/images/keychain.png' }
    ]);
  }
  try {
    const list = await Category.find().sort({ createdAt: 1 }).lean();
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/categories', requireAdmin, upload.single('image'), async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected. Cannot create categories.' });
  }
  try {
    const { label, desc, imageUrl } = req.body;
    if (!label) {
      return res.status(400).json({ success: false, message: 'Category label is required.' });
    }
    const categoryId = label.trim();
    const finalImage = req.file ? `/images/uploads/${req.file.filename}` : (imageUrl || '/images/hero.png');
    
    const existing = await Category.findOne({ id: categoryId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = new Category({
      id: categoryId,
      label,
      desc: desc || '',
      image: finalImage
    });
    await category.save();
    return res.status(201).json({ success: true, message: 'Category created successfully.', category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/categories/:id', requireAdmin, upload.single('image'), async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected. Cannot edit categories.' });
  }
  try {
    const oldId = req.params.id;
    const cat = await Category.findOne({ id: oldId });
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { label, desc, imageUrl } = req.body;
    if (!label) {
      return res.status(400).json({ success: false, message: 'Category label is required.' });
    }

    const newId = label.trim();

    if (newId !== oldId) {
      const existing = await Category.findOne({ id: newId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another category with this name already exists.' });
      }
      await Product.updateMany({ category: oldId }, { $set: { category: newId } });
      cat.id = newId;
    }

    cat.label = label;
    cat.desc = desc || '';

    if (req.file) {
      cat.image = `/images/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      cat.image = imageUrl || '/images/hero.png';
    }

    await cat.save();
    return res.json({ success: true, message: 'Category updated successfully.', category: cat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) {
    return res.status(503).json({ success: false, message: 'Database not connected. Cannot delete categories.' });
  }
  try {
    const cat = await Category.findOne({ id: req.params.id });
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    await Category.deleteOne({ id: req.params.id });
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ ADMIN CUSTOMERS & ORDERS ═══════════ */
app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json([]);
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/orders/:orderId', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const newStatus = req.body.status;
    if (newStatus) order.status = newStatus;
    if (req.body.courierName !== undefined) order.courierName = req.body.courierName;
    if (req.body.courierTrackingId !== undefined) order.courierTrackingId = req.body.courierTrackingId;
    await order.save();

    // Send status update email to customer
    if (newStatus && order.userEmail) {
      const statusMessages = {
        'Payment Verification': { emoji: '🔍', msg: 'We have received your order and are verifying your payment.' },
        'Packing': { emoji: '📦', msg: 'Great news! Your order is currently being packed with care.' },
        'On the way': { emoji: '🚚', msg: 'Your order is on its way! Our delivery partner is heading to you.' },
        'Delivered': { emoji: '✅', msg: 'Your order has been delivered! We hope you love it.' },
        'Cancelled': { emoji: '❌', msg: 'Unfortunately, your order has been cancelled. Please contact us for assistance.' }
      };
      const statusInfo = statusMessages[newStatus] || { emoji: '📋', msg: `Your order status has been updated to "${newStatus}".` };
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e8e0d5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #b5882e 0%, #d4a843 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 1.8rem; font-weight: 700;">Parisu Ulagam</h1>
            <p style="margin: 5px 0 0; color: rgba(0,0,0,0.7); font-size: 0.9rem;">Order Status Update</p>
          </div>
          <div style="padding: 35px 30px;">
            <div style="text-align: center; font-size: 3rem; margin-bottom: 15px;">${statusInfo.emoji}</div>
            <h2 style="text-align: center; color: #d4a843; margin: 0 0 10px;">Order Status: ${newStatus}</h2>
            <p style="text-align: center; color: #a0a0b0; margin-bottom: 30px;">${statusInfo.msg}</p>
            <div style="background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
              <p style="margin: 0 0 8px; font-size: 0.85rem; color: #7a7a8a;">ORDER DETAILS</p>
              <p style="margin: 0 0 5px;"><strong>Order ID:</strong> ${order.orderId}</p>
              <p style="margin: 0 0 5px;"><strong>Total Amount:</strong> ₹${order.totalAmount?.toLocaleString('en-IN')}</p>
              <p style="margin: 0;"><strong>Shipping Via:</strong> ${order.shippingMethod || 'Standard Delivery'}</p>
            </div>
            <p style="text-align: center; font-size: 0.85rem; color: #7a7a8a;">Thank you for shopping with <strong style="color: #d4a843;">Parisu Ulagam</strong>!<br/>If you have any questions, reply to this email.</p>
          </div>
          <div style="background: #1a1a2e; padding: 20px; text-align: center; font-size: 0.8rem; color: #7a7a8a;">
            © ${new Date().getFullYear()} Parisu Ulagam. All Rights Reserved.
          </div>
        </div>
      `;
      try {
        await transporter.sendMail({
          from: `"Parisu Ulagam" <${supportEmail}>`,
          to: order.userEmail,
          subject: `${statusInfo.emoji} Order Update: ${newStatus} — Order ${order.orderId}`,
          html: emailHtml
        });
        console.log(`Status email sent to ${order.userEmail} for order ${order.orderId}`);
      } catch (emailErr) {
        console.error('Failed to send status email:', emailErr.message);
      }
    }

    return res.json({ success: true, message: 'Order updated.', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: get all return requests
app.get('/api/admin/returns', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json({ success: true, returns: [] });
  try {
    const returns = await ReturnRequest.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, returns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: update return request status
app.put('/api/admin/returns/:id/status', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { status } = req.body;
    const reqDoc = await ReturnRequest.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ success: false, message: 'Return request not found.' });
    reqDoc.status = status;
    await reqDoc.save();
    return res.json({ success: true, message: 'Status updated successfully.', returnRequest: reqDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: get all reviews
app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.json({ success: true, reviews: [] });
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: delete review
app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) {
      // Re-calculate product rating
      const product = await Product.findOne({ id: review.productId });
      if (product) {
        const productReviews = await Review.find({ productId: product.id });
        if (productReviews.length > 0) {
          const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
          product.rating = parseFloat((totalRating / productReviews.length).toFixed(1));
          product.reviews = productReviews.length;
        } else {
          product.rating = 0;
          product.reviews = 0;
        }
        await product.save();
      }
    }
    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


/* ═══════════ SITE SETTINGS ═══════════ */
// Public: get site settings
app.get('/api/site-settings', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' }).lean();
    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' });
    }
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: update site settings
app.put('/api/admin/site-settings', requireAdmin, upload.fields([
  { name: 'heroImageLightFiles', maxCount: 5 },
  { name: 'heroImageDarkFiles', maxCount: 5 },
  { name: 'heroImageFiles', maxCount: 5 },
  { name: 'heroClassicImageFiles', maxCount: 5 },
  { name: 'bannerImageLightFiles', maxCount: 5 },
  { name: 'bannerImageDarkFiles', maxCount: 5 },
  { name: 'bannerImageClassicFiles', maxCount: 5 },
  { name: 'aboutImageFiles', maxCount: 5 }
]), async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const allowedTextObjectFields = [
      'heroTitle', 'heroEyebrow', 'heroDescription',
      'bannerEnabled', 'bannerTitle', 'bannerDiscount', 'bannerExtraDiscount', 'bannerDescription',
      'aboutTitle', 'aboutDescription', 'contactPhone', 'contactEmail', 'contactAddress',
      'aboutAccentNum', 'aboutAccentLabel'
    ];
    const imageFields = [
      'heroImageLight', 'heroImageDark', 'heroImage', 'heroClassicImage', 'bannerImageLight', 'bannerImageDark', 'bannerImageClassic',
      'aboutImage'
    ];
    
    const updates = {};
    for (const field of allowedTextObjectFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Handle existing image URLs (passed as JSON stringified arrays) + newly uploaded files
    for (const field of imageFields) {
      let finalImages = [];
      if (req.body[field]) {
        try {
          finalImages = JSON.parse(req.body[field]);
        } catch (e) {
          finalImages = [req.body[field]]; // Fallback if someone sends a single string
        }
      }
      // Add newly uploaded files
      const fileField = `${field}Files`;
      if (req.files && req.files[fileField]) {
        req.files[fileField].forEach(file => {
          finalImages.push(`/images/uploads/${file.filename}`);
        });
      }
      if (finalImages.length > 0 || req.body[field] !== undefined) {
        updates[field] = finalImages;
      }
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { $set: updates },
      { new: true, upsert: true }
    );
    return res.json({ success: true, message: 'Settings saved.', settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════ CUSTOM REQUESTS ═══════════ */
// Submit Custom Request (Customer)
app.post('/api/custom-requests', upload.array('referenceImages', 5), async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { customerName, customerEmail, customerPhone, productType, description, userId } = req.body;
    const referenceImages = req.files ? req.files.map(file => `/images/uploads/${file.filename}`) : [];
    
    const newRequest = new CustomRequest({
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      productType,
      description,
      referenceImages
    });
    await newRequest.save();

    const mailOptions = {
      from: supportEmail,
      to: adminEmail,
      subject: `New Custom Request from ${customerName}`,
      html: `
        <h3>New Custom Request Received</h3>
        <p><strong>Customer Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Product Type:</strong> ${productType}</p>
        <p><strong>Description:</strong> ${description}</p>
        ${referenceImages.length > 0 ? `<p><strong>Reference Images:</strong> ${referenceImages.length} images uploaded.</p>` : ''}
        <p>Log in to the admin panel to view details and update status.</p>
      `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error('Error sending custom request email to admin:', error);
    });

    return res.json({ success: true, message: 'Custom request submitted successfully.', data: newRequest });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get User's Custom Requests
app.get('/api/users/:userId/custom-requests', async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { userId } = req.params;
    const requests = await CustomRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Custom Requests (Admin)
app.get('/api/admin/custom-requests', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 }).lean();
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update Custom Request Status (Admin)
app.put('/api/admin/custom-requests/:id/status', requireAdmin, async (req, res) => {
  if (!dbConnected) return res.status(503).json({ success: false, message: 'Database not connected.' });
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await CustomRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    return res.json({ success: true, message: 'Status updated successfully.', data: request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});
