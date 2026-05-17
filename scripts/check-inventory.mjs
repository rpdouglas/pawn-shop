import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

initializeApp({
  projectId: 'nats-rack'
});

const db = getFirestore();

async function checkInventory() {
  try {
    const snap = await db.collection('items').count().get();
    console.log(`Total items in inventory: ${snap.data().count}`);
  } catch (error) {
    console.error('Error checking inventory:', error.message);
  }
}

checkInventory();
