import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Only use emulator if explicitly requested
if (process.env.USE_EMULATORS === 'true') {
  console.log('Using Firestore Emulator (localhost:8080)');
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
} else {
  console.log('Seeding LIVE project: nats-rack');
  // Use discovered credentials if in Codespace
  if (process.env.CODESPACES === 'true') {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/codespace/.config/firebase/rpdouglas_gmail_com_application_default_credentials.json';
  }
}

initializeApp({
  projectId: 'nats-rack'
});

const db = getFirestore();

const strains = [
  {
    id: "blue-dream",
    strainName: "Blue Dream",
    brand: null,
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    geneticLineage: "Blueberry x Haze",
    effectProfile: ["Creative", "Uplifted", "Energetic"],
    thcMin: 17,
    thcMax: 24,
    cbdMin: 0,
    cbdMax: 2,
    cannabinoidUnit: "%",
    strainType: "hybrid"
  },
  {
    id: "sour-diesel",
    strainName: "Sour Diesel",
    brand: null,
    terpenes: ["Caryophyllene", "Limonene", "Myrcene"],
    geneticLineage: "Chemdawg x Super Skunk",
    effectProfile: ["Energetic", "Talkative", "Creative"],
    thcMin: 18,
    thcMax: 26,
    cbdMin: 0,
    cbdMax: 1,
    cannabinoidUnit: "%",
    strainType: "sativa"
  },
  {
    id: "granddaddy-purple",
    strainName: "Granddaddy Purple",
    brand: null,
    terpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    geneticLineage: "Purple Urkle x Big Bud",
    effectProfile: ["Sleepy", "Relaxed", "Hungry"],
    thcMin: 17,
    thcMax: 23,
    cbdMin: 0,
    cbdMax: 1,
    cannabinoidUnit: "%",
    strainType: "indica"
  }
];

async function seed() {
  const batch = db.batch();
  const collectionRef = db.collection('cannabisStrains');

  for (const strain of strains) {
    const docRef = collectionRef.doc(strain.id);
    batch.set(docRef, {
      ...strain,
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`Prepared strain: ${strain.strainName}`);
  }

  await batch.commit();
  console.log('Seeding complete.');
}

seed().catch(console.error);
