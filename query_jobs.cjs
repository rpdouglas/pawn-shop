const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
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
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
