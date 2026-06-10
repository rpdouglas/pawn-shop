/**
 * find-seed-items.mjs
 * Queries Firestore for fake seed items added by seed-inventory.mjs.
 * Identifies items by picsum.photos images or template description pattern.
 * Run: node scripts/find-seed-items.mjs
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (process.env.CODESPACES === 'true') {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/codespace/.config/firebase/rpdouglas_gmail_com_application_default_credentials.json';
}

initializeApp({ projectId: 'nats-rack' });
const db = getFirestore();

const SEED_TITLES = new Set([
  // Pawn
  'Vintage Gibson Les Paul', 'Rolex Submariner Date', 'Leica M10-R Camera',
  'Dewalt Brushless Drill Set', 'Apple MacBook Pro M3', 'Antique Gold Pocket Watch',
  'Fender Stratocaster 1964', 'Bose QuietComfort Headphones', 'Canon EOS R5 Body',
  'Snap-on Socket Set', 'Tiffany & Co. Diamond Ring', 'Sony PlayStation 5 Console',
  // Cannabis
  'Akwesasne Gold Flower', 'River Mist Indica', 'Northern Lights CBD',
  'Sweetgrass Sativa Blend', 'Medicine Woods Topical', 'Island Breeze Edibles',
  'Spirit Bear Concentrate', 'Moonlight Harvest Pre-rolls', 'Sunrise Wellness Oil',
  'Thunderbird Terpene Vape', 'Cedar Creek Flower', 'Earth Mother Tea',
  // Fireworks
  'Midnight Thunder Cake', 'Solar Flare Sparklers', 'River Glow Fountain',
  'Grand Finale Bundle', 'Dragon Fire Rockets', 'Starlight Symphony',
  'Comet Catcher Assortment', 'Galaxy Burst Cake', 'Neon Night Sky',
  'Emerald Eye Fountain', 'Ruby Rain Rockets', 'Gold Rush Sparklers',
]);

async function findSeedItems() {
  const snap = await db.collection('items').get();
  const seedItems = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const images = d.images ?? [];
    const description = d.description ?? '';

    const hasPicsumImage = images.some(url => typeof url === 'string' && url.includes('picsum.photos'));
    const hasTemplateDescription = /^A premium .+ from our .+ collection\. Professionally inspected and verified\.$/.test(description);
    const hasSeedTitle = SEED_TITLES.has(d.title);

    if (hasPicsumImage || hasTemplateDescription || hasSeedTitle) {
      seedItems.push({
        id: doc.id,
        title: d.title,
        viewTag: d.viewTag,
        status: d.status,
        price: d.price,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? '(no timestamp)',
        matchedBy: [
          hasPicsumImage && 'picsum image',
          hasTemplateDescription && 'template description',
          hasSeedTitle && 'seed title',
        ].filter(Boolean).join(', '),
      });
    }
  }

  seedItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  console.log(`\nFound ${seedItems.length} suspected seed item(s):\n`);
  console.log(
    ['ID', 'Title', 'View', 'Status', 'Price (cents)', 'Created At', 'Matched By']
      .join('\t')
  );
  console.log('—'.repeat(120));
  for (const item of seedItems) {
    console.log(
      [item.id, item.title, item.viewTag, item.status, item.price, item.createdAt, item.matchedBy]
        .join('\t')
    );
  }

  console.log(`\nTotal: ${seedItems.length} items`);
}

findSeedItems().catch(err => {
  console.error(err);
  process.exit(1);
});
