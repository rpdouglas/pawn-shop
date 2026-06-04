import type { CallableRequest } from 'firebase-functions/v2/https';
export declare function assertMfaEnrolled(request: CallableRequest): void;
export declare function assertStaff(request: CallableRequest): {
    uid: string;
};
