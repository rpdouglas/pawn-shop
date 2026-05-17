import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Point to the local emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

initializeApp({
  projectId: 'nats-rack'
});

const db = getFirestore();

const PAWN_CATEGORIES = ['electronics', 'jewellery', 'tools', 'instruments', 'watches'];
const CANNABIS_CATEGORIES = ['flower', 'edibles', 'concentrates', 'topicals', 'vapes'];
const FIREWORKS_CATEGORIES = ['cakes', 'fountains', 'sparklers', 'rockets', 'bundles'];

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'];
const STATUSES = ['active', 'sold', 'reserved'];
const MERCH_TAGS = ['just-arrived', 'rare-find', 'limited-edition', 'staff-pick'];

const PAWN_TITLES = [
  'Vintage Gibson Les Paul', 'Rolex Submariner Date', 'Leica M10-R Camera',
  'Dewalt Brushless Drill Set', 'Apple MacBook Pro M3', 'Antique Gold Pocket Watch',
  'Fender Stratocaster 1964', 'Bose QuietComfort Headphones', 'Canon EOS R5 Body',
  'Snap-on Socket Set', 'Tiffany & Co. Diamond Ring', 'Sony PlayStation 5 Console'
];

const CANNABIS_TITLES = [
  'Akwesasne Gold Flower', 'River Mist Indica', 'Northern Lights CBD',
  'Sweetgrass Sativa Blend', 'Medicine Woods Topical', 'Island Breeze Edibles',
  'Spirit Bear Concentrate', 'Moonlight Harvest Pre-rolls', 'Sunrise Wellness Oil',
  'Thunderbird Terpene Vape', 'Cedar Creek Flower', 'Earth Mother Tea'
];

const FIREWORKS_TITLES = [
  'Midnight Thunder Cake', 'Solar Flare Sparklers', 'River Glow Fountain',
  'Grand Finale Bundle', 'Dragon Fire Rockets', 'Starlight Symphony',
  'Comet Catcher Assortment', 'Galaxy Burst Cake', 'Neon Night Sky',
  'Emerald Eye Fountain', 'Ruby Rain Rockets', 'Gold Rush Sparklers'
];

function generateSearchTokens(title, category) {
  const words = `${title} ${category}`.toLowerCase().split(/\s+/);
  const tokens = new Set();
  words.forEach(word => {
    for (let i = 1; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  });
  return Array.from(tokens);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateItem(viewTag) {
  let titles, categories;
  if (viewTag === 'pawn') {
    titles = PAWN_TITLES;
    categories = PAWN_CATEGORIES;
  } else if (viewTag === 'cannabis') {
    titles = CANNABIS_TITLES;
    categories = CANNABIS_CATEGORIES;
  } else {
    titles = FIREWORKS_TITLES;
    categories = FIREWORKS_CATEGORIES;
  }

  const title = getRandom(titles);
  const category = getRandom(categories);
  const condition = getRandom(CONDITIONS);
  const status = getRandom(STATUSES);
  const price = (Math.floor(Math.random() * 500) + 10) * 100; // $10 to $510
  
  const item = {
    title,
    description: `A premium ${title} from our ${category} collection. Professionally inspected and verified.`,
    category,
    viewTag,
    status,
    price,
    condition,
    images: [`https://picsum.photos/seed/${Math.random()}/800/600`],
    searchTokens: generateSearchTokens(title, category),
    merchandisingTags: Math.random() > 0.5 ? [getRandom(MERCH_TAGS)] : [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    viewCount: Math.floor(Math.random() * 100)
  };

  if (viewTag === 'pawn' && price > 10000) {
    item.provenanceNotes = "Sourced from a private collection in the Cornwall area. Authenticated by our senior appraiser.";
  }

  return item;
}

async function seed() {
  console.log('Starting seed process...');
  const batch = db.batch();
  
  // Generate 20 items for each storefront
  const views = ['pawn', 'cannabis', 'fireworks'];
  for (const view of views) {
    for (let i = 0; i < 20; i++) {
      const item = generateItem(view);
      const docRef = db.collection('items').doc();
      batch.set(docRef, item);
    }
  }

  await batch.commit();
  console.log('Successfully seeded 60 items across 3 storefronts.');
}

seed().catch(console.error);
