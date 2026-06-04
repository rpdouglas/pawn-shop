const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('fs');

async function main() {
  const testEnv = await initializeTestEnvironment({
    projectId: "pawn-shop",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080
    },
  });

  const adminAuth = testEnv.authenticatedContext('admin_user', { admin: true });
  
  try {
    const doc = adminAuth.firestore().collection('users').doc('employee_123').collection('hrData').doc('profile');
    await doc.get();
    console.log("SUCCESS: Admin can read HR profile.");
  } catch (e) {
    console.error("ERROR: Admin cannot read HR profile.", e);
  }

  await testEnv.cleanup();
}

main().catch(console.error);
