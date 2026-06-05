const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Connect to the local emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const app = initializeApp({ projectId: "demo-pawn-shop" });
const db = getFirestore(app);

async function main() {
  const items = await db.collection('items').get();
  for (const item of items.docs) {
    const jobs = await item.ref.collection('imageJobs').get();
    jobs.forEach(job => {
      console.log(`Job in item ${item.id}:`, job.data());
    });
  }
}
main().catch(console.error);
