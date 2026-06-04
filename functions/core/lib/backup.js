"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupFirestoreDaily = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("@google-cloud/firestore");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
const firestore_2 = require("firebase-admin/firestore");
const client = new firestore_1.v1.FirestoreAdminClient();
// ── backupFirestoreDaily ──────────────────────────────────────────────────────
// Scheduled daily at 02:00 UTC. Triggers a Google Cloud Firestore Export
// operation to the specified Cloud Storage bucket.
// 
// Requires the default Cloud Functions service account to have:
// - roles/datastore.importExportAdmin
// - roles/storage.admin (on the backup bucket)
exports.backupFirestoreDaily = (0, scheduler_1.onSchedule)({ schedule: '0 2 * * *', timeoutSeconds: 60 }, async () => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
        throw new Error('Project ID not found in environment.');
    }
    const bucketName = secrets_1.backupBucketName.value();
    if (!bucketName || bucketName === 'dummy') {
        console.warn('[backupFirestoreDaily] Backup bucket name not configured. Skipping.');
        return;
    }
    const databaseName = client.databasePath(projectId, '(default)');
    const bucketUri = `gs://${bucketName}`;
    try {
        const [operation] = await client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucketUri,
            collectionIds: [] // Leave empty to export all collections
        });
        console.info(`[backupFirestoreDaily] Started export operation: ${operation.name} to ${bucketUri}`);
        const db = (0, firestore_2.getFirestore)();
        await db.collection('auditLogs').add({
            eventType: 'database_backup_started',
            uid: 'system',
            targetId: 'firestore',
            details: { bucketUri, operationName: operation.name },
            createdAt: firestore_2.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error('[backupFirestoreDaily] Export failed:', error);
        throw error;
    }
});
//# sourceMappingURL=backup.js.map