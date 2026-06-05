import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({ projectId: 'nats-rack' });
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

async function check() {
  const pawnSnap = await getDoc(doc(db, 'items', 'test-pawn-item-123'));
  console.log('Pawn item exists:', pawnSnap.exists());
  if (pawnSnap.exists()) {
    console.log('Pawn data:', pawnSnap.data());
  }

  const cannabisSnap = await getDoc(doc(db, 'items', 'test-cannabis-123'));
  console.log('Cannabis item exists:', cannabisSnap.exists());
  if (cannabisSnap.exists()) {
    console.log('Cannabis data:', cannabisSnap.data());
  }
}

check().catch(console.error);
