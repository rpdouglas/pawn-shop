import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Only use emulator if explicitly requested
if (process.env.USE_EMULATORS === 'true') {
  console.log('Using Firestore Emulator (localhost:8080)');
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
} else {
  console.log('Seeding LIVE project: nats-rack');
  if (process.env.CODESPACES === 'true') {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/codespace/.config/firebase/rpdouglas_gmail_com_application_default_credentials.json';
  }
}

initializeApp({ projectId: 'nats-rack' });
const db = getFirestore();

// Helper to normalize strings into arrays
function parseCommaSeparated(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

// Helper to convert to a valid strain type
function normalizeType(typeStr) {
  if (!typeStr) return 'hybrid';
  const lower = typeStr.toLowerCase();
  if (lower.includes('indica')) return 'indica';
  if (lower.includes('sativa')) return 'sativa';
  return 'hybrid';
}

async function fetchDataset() {
  const url = process.env.DATASET_URL || 'https://raw.githubusercontent.com/kushyapp/cannabis-dataset/master/Dataset/Strains/strains.csv';
  console.log(`Fetching dataset from ${url}...`);
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
    console.warn(`Failed to fetch from URL (${response.status}). Falling back to local file.`);
  } catch (err) {
    console.warn(`Fetch error: ${err.message}. Falling back to local file.`);
  }
  
  // Fallback to local strains.csv
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const localPath = path.join(__dirname, 'strains.csv');
  console.log(`Reading local fallback dataset from ${localPath}...`);
  return fs.readFileSync(localPath, 'utf8');
}

async function seed() {
  const csvText = await fetchDataset();
  
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true
  });

  console.log(`Parsed ${records.length} records. Beginning batch insertion...`);

  const collectionRef = db.collection('cannabisStrains');
  let batch = db.batch();
  let count = 0;
  let totalImported = 0;

  for (const row of records) {
    // Skip rows without a name
    if (!row.name || !row.name.trim()) continue;

    const strainName = row.name.trim();
    // Use the slug or a sanitized name for the ID to avoid duplicates
    const docId = (row.slug || strainName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const docRef = collectionRef.doc(docId);

    const thcNum = parseFloat(row.thc);
    const cbdNum = parseFloat(row.cbd);

    const mappedData = {
      strainName: strainName,
      brand: row.breeder ? row.breeder.trim() : null,
      terpenes: parseCommaSeparated(row.flavor),
      geneticLineage: row.crosses ? row.crosses.trim().replace(/,/g, ' x ') : null,
      effectProfile: parseCommaSeparated(row.effects),
      thcMin: isNaN(thcNum) ? null : thcNum,
      thcMax: isNaN(thcNum) ? null : thcNum,
      cbdMin: isNaN(cbdNum) ? null : cbdNum,
      cbdMax: isNaN(cbdNum) ? null : cbdNum,
      cannabinoidUnit: '%',
      strainType: normalizeType(row.type),
      createdAt: FieldValue.serverTimestamp()
    };

    batch.set(docRef, mappedData, { merge: true });
    count++;
    totalImported++;

    // Commit every 500 documents (Firestore limit)
    if (count === 500) {
      await batch.commit();
      console.log(`Committed batch of 500 records. Total so far: ${totalImported}`);
      batch = db.batch();
      count = 0;
    }
  }

  // Commit remaining documents
  if (count > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${count} records. Total: ${totalImported}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
