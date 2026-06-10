/**
 * delete-seed-items.mjs
 * Permanently deletes the 36 confirmed fake seed items from Firestore.
 * Also cleans up internal/ai and internal/staff subcollection docs.
 * Run: node scripts/delete-seed-items.mjs
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (process.env.CODESPACES === 'true') {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/codespace/.config/firebase/rpdouglas_gmail_com_application_default_credentials.json';
}

initializeApp({ projectId: 'nats-rack' });
const db = getFirestore();

const SEED_IDS = [
  '0HMmpnZeQE9UnmhXH7Dr',
  '11JcvYLSLtekA5Ere9w7',
  '1g8Jbs3bkz7l8VtpIDpZ',
  '1ppPwzeCze8u7A2LnHFw',
  '3W2Xqud26ankFHuPRfgG',
  '48LPYK5XUZKawNAJaZsC',
  '5FpTJs8fTYtDICkWM58z',
  '9BfsinwhAoWWsc8Co8Ir',
  '9UuHWdlQn3vqSEv8nXYI',
  'B75Ib4I288luY1oz8XIz',
  'BYCG4MHygQJvzzc4L47G',
  'CDazu2Vg5FwixBINQKd0',
  'Cmrt6gOX2pOzLKHHbXTC',
  'E1JoMd1WZcDay3jqLMbu',
  'EDXlnSyCoaMJLVpoJ51a',
  'FBBZ8eDue8XysaQln46g',
  'GMqvzpb6OnUj76m3UpK8',
  'GZTOEzihJjdWlYD8BBp8',
  'I3y987n62QzAlZf42GgU',
  'Kh2mPuwJJ7vUnYFWyGBs',
  'LurTdAcETvNawCrHVMSI',
  'LwCpEfIrUA40nNDmoLe9',
  'MyN17pAsSqOGweXlxpG5',
  'V2XWs9RWIgo1B6YA7GIv',
  'WTppln3XCu4zcMrWyGTh',
  'YttMpIS8YN2Q6q7RKSRt',
  'aSIFfDS2weruDOb9zSTt',
  'cDjbFc6spghsVy8j7qKx',
  'ctWs5YYMSTDcPuHi0ALt',
  'fUl0DeBPAoY7FhVSyCoP',
  'gNd9u7qHt9wmOIpEoTH7',
  'irAmScduSRO1fX6pRlGQ',
  'kGpwOSA0MiT4wrkiq53p',
  'mAbv5RqwwNy09SWPKg1U',
  'mxH4lE9MIEs2ULCFxOqp',
  'nhT66beS12vbq7JvBsHi',
];

const INTERNAL_DOCS = ['ai', 'staff'];

async function deleteSeedItems() {
  let deleted = 0;
  let subcollectionsCleaned = 0;
  let reservationsDeleted = 0;

  for (const id of SEED_IDS) {
    // Delete internal subcollection docs
    for (const docName of INTERNAL_DOCS) {
      const ref = db.doc(`items/${id}/internal/${docName}`);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.delete();
        subcollectionsCleaned++;
      }
    }

    // Delete the item itself
    await db.doc(`items/${id}`).delete();
    deleted++;
    console.log(`✓ Deleted items/${id}`);
  }

  // Clean up orphaned reservations referencing these item IDs
  const seedIdSet = new Set(SEED_IDS);
  const resSnap = await db.collection('reservations').get();
  for (const doc of resSnap.docs) {
    if (seedIdSet.has(doc.data().itemId)) {
      await doc.ref.delete();
      reservationsDeleted++;
      console.log(`  ↳ Deleted orphaned reservation ${doc.id} (itemId: ${doc.data().itemId})`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Items deleted:              ${deleted}`);
  console.log(`  Subcollection docs removed: ${subcollectionsCleaned}`);
  console.log(`  Orphaned reservations:      ${reservationsDeleted}`);
}

deleteSeedItems().catch(err => {
  console.error(err);
  process.exit(1);
});
