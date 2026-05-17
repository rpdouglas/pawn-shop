import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'nats-rack',
  apiKey: 'fake-api-key' // Emulator doesn't care
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

connectFirestoreEmulator(db, 'localhost', 8080);

async function checkInventory() {
  try {
    const q = query(
      collection(db, 'items'),
      where('status', '==', 'active'),
      where('policeHold', '==', false)
    );
    const snap = await getDocs(q);
    console.log(`Total items in inventory: ${snap.size}`);
  } catch (error) {
    console.error('Error checking inventory:', error.message);
  }
}

checkInventory();
