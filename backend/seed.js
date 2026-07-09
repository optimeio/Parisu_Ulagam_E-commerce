import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const primaryMongoUri = process.env.MONGO_URI;
const fallbackMongoUri = process.env.STANDARD_MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'Parisu_Ulagam';

const products = [
  {
    id: 'earrings-001',
    name: 'Royal Pearl Earrings',
    category: 'Earrings',
    price: 1499,
    badge: 'In Stock',
    rating: 4.8,
    reviews: 128,
    description: 'Beautifully crafted earrings with royal finish, perfect for every occasion.',
    image: '/images/earrings.png'
  },
  {
    id: 'wood-art-001',
    name: 'Floral Wood Engraving',
    category: 'Wood Engravings',
    price: 2199,
    badge: 'Limited',
    rating: 4.9,
    reviews: 94,
    description: 'Handmade engraved wood wall art with intricate royal floral patterns.',
    image: '/images/woodbox.png'
  },
  {
    id: 'keychain-001',
    name: 'Vintage Key Chain',
    category: 'Key Chains',
    price: 599,
    badge: 'Best Seller',
    rating: 4.7,
    reviews: 76,
    description: 'Elegant vintage key chain crafted with charm and premium finish.',
    image: '/images/keychain.png'
  },
  {
    id: 'wood-art-002',
    name: 'Wooden Wall Art',
    category: 'Wood Engravings',
    price: 2899,
    badge: 'New',
    rating: 4.6,
    reviews: 54,
    description: 'Sculpted wooden wall art with rich royal silhouettes and warm finish.',
    image: '/images/woodbox.png'
  }
];

const productSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    category: String,
    price: Number,
    badge: String,
    rating: Number,
    reviews: Number,
    description: String,
    image: String
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function connectDB(uri) {
  if (!uri) {
    throw new Error('MongoDB URI is not configured.');
  }

  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
  });
}

async function seed() {
  if (!primaryMongoUri && !fallbackMongoUri) {
    console.error('MONGO_URI or STANDARD_MONGO_URI is not set in environment.');
    process.exit(1);
  }

  let connectedUri = null;
  let lastError = null;

  try {
    if (primaryMongoUri) {
      console.log('Attempting MongoDB SRV connection...');
      await connectDB(primaryMongoUri);
      connectedUri = primaryMongoUri;
    }
  } catch (err) {
    lastError = err;
    console.warn('Primary MongoDB connection failed:', err.message || err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected failed SRV attempt before fallback.');
    }
  }

  if (!connectedUri && fallbackMongoUri) {
    try {
      console.log('Attempting MongoDB standard connection fallback...');
      await connectDB(fallbackMongoUri);
      connectedUri = fallbackMongoUri;
    } catch (err) {
      lastError = err;
      console.error('Fallback MongoDB connection failed:', err.message || err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  }

  if (!connectedUri) {
    console.error('Seeding failed: unable to connect to MongoDB.');
    process.exit(1);
  }

  try {
    console.log('Connected to MongoDB. Seeding products...');
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);

    console.log(`Inserted ${inserted.length} products.`);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

seed();
