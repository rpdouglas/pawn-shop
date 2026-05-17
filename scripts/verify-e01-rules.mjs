/**
 * E01 emulator verification — firestore rules for policeHold and aiDescription subcollection.
 * Run from repo root: node scripts/verify-e01-rules.mjs
 *
 * Requires: firebase-admin (dev dep) and @firebase/rules-unit-testing
 */

import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesPath = resolve(__dirname, '../firestore.rules');

let testEnv;

async function main() {
  console.log('\n── E01 Firestore Rules Verification ──────────────────────────\n');

  testEnv = await initializeTestEnvironment({
    projectId: 'nats-rack-test',
    firestore: {
      rules: readFileSync(rulesPath, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });

  // ── Seed: create an active item and a policeHold item ──────────────────────
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await db.collection('items').doc('active-item').set({
      title: 'Test Watch',
      status: 'active',
      policeHold: false,
    });
    await db.collection('items').doc('held-item').set({
      title: 'Seized Laptop',
      status: 'active',
      policeHold: true,
    });
    // Seed the internal subcollection on the active item
    await db.collection('items').doc('active-item')
      .collection('internal').doc('ai').set({
        aiDescription: 'AI draft text — staff only',
        aiPriceSuggestion: { low: 5000, high: 8000, source: 'ebay-comps' },
      });
  });

  let pass = 0;
  let fail = 0;

  async function check(label, fn, shouldSucceed) {
    try {
      if (shouldSucceed) {
        await assertSucceeds(fn());
        console.log(`  ✓  ${label}`);
        pass++;
      } else {
        await assertFails(fn());
        console.log(`  ✓  ${label}`);
        pass++;
      }
    } catch {
      console.log(`  ✗  ${label}`);
      fail++;
    }
  }

  // ── Test 1: policeHold — public read must be denied ────────────────────────
  console.log('policeHold');
  const unauthed = testEnv.unauthenticatedContext();
  await check(
    'unauthenticated read of policeHold: true item → denied',
    () => unauthed.firestore().collection('items').doc('held-item').get(),
    false,
  );
  await check(
    'unauthenticated read of active item (no policeHold) → allowed',
    () => unauthed.firestore().collection('items').doc('active-item').get(),
    true,
  );

  // ── Test 2: aiDescription — parent doc must NOT contain aiDescription ──────
  console.log('\naiDescription on parent document');
  let parentFields = [];
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const snap = await ctx.firestore().collection('items').doc('active-item').get();
    parentFields = Object.keys(snap.data() || {});
  });
  if (parentFields.includes('aiDescription')) {
    console.log('  ✗  parent items/{id} doc contains aiDescription — must be in subcollection');
    fail++;
  } else {
    console.log('  ✓  parent items/{id} doc does not contain aiDescription');
    pass++;
  }

  // ── Test 3: internal subcollection — unauthenticated read must be denied ───
  console.log('\nitems/{id}/internal/ai subcollection');
  await check(
    'unauthenticated read of internal/ai → denied',
    () => unauthed.firestore()
      .collection('items').doc('active-item')
      .collection('internal').doc('ai').get(),
    false,
  );

  // Staff context (custom claim: inventory_staff = true)
  const staff = testEnv.authenticatedContext('staff-uid', { inventory_staff: true });
  await check(
    'staff read of internal/ai → allowed',
    () => staff.firestore()
      .collection('items').doc('active-item')
      .collection('internal').doc('ai').get(),
    true,
  );
  await check(
    'staff write to internal/ai → allowed',
    () => staff.firestore()
      .collection('items').doc('active-item')
      .collection('internal').doc('ai').set({ aiDescription: 'updated draft' }),
    true,
  );

  // Authenticated customer (no staff claim)
  const customer = testEnv.authenticatedContext('customer-uid', { customer: true });
  await check(
    'authenticated customer read of internal/ai → denied',
    () => customer.firestore()
      .collection('items').doc('active-item')
      .collection('internal').doc('ai').get(),
    false,
  );

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n── Results: ${pass} passed · ${fail} failed ──────────────────────────────\n`);
  await testEnv.cleanup();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Test runner error:', err.message);
  if (testEnv) await testEnv.cleanup();
  process.exit(1);
});
