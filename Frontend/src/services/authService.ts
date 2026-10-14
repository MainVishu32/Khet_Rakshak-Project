import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User,
  browserSessionPersistence,
  linkWithPhoneNumber,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  setPersistence,
  signOut,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';

export type AppRole = 'FARMER' | 'DRONE_PILOT' | 'OUTLET_MANAGER' | 'ADMIN';

export interface AppUser {
  id: string;
  email: string | null;
  fullName: string;
  mobileNumber: string | null;
  village: string;
  role: AppRole;
  accountStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

export interface AdminAccount {
  id: string;
  email: string | null;
  full_name: string;
  mobile_number: string | null;
  village: string;
  role: AppRole;
  account_status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  created_at: string;
}

export interface PilotRoleRequest {
  id: string;
  requested_role: 'DRONE_PILOT';
  status: 'PENDING';
  created_at: string;
  user_id: string;
  full_name: string;
  email: string | null;
  mobile_number: string | null;
  village: string;
}

export interface OperatorAssignment {
  id: string;
  farmerName: string;
  farmName: string;
  village: string;
  crop: string;
  scheduledAt: string;
  status: string;
}

const apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/+$/, '');

function requireAuth() {
  if (!firebaseAuth) throw new Error('Authentication is not configured. Contact the site administrator.');
  return firebaseAuth;
}

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(requireAuth(), callback);
}

export async function signInWithGoogle() {
  const auth = requireAuth();
  await setPersistence(auth, browserSessionPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export function normalizeIndianPhoneNumber(value: string) {
  const compact = value.replace(/[\s()-]/g, '');
  if (/^[6-9]\d{9}$/.test(compact)) return `+91${compact}`;
  if (/^\+91[6-9]\d{9}$/.test(compact)) return compact;
  throw new Error('Enter a valid Indian mobile number, including +91 if needed.');
}

export function createPhoneVerifier(elementId: string) {
  const auth = requireAuth();
  return new RecaptchaVerifier(auth, elementId, { size: 'invisible' });
}

export async function sendPhoneOtp(phoneNumber: string, verifier: RecaptchaVerifier) {
  const auth = requireAuth();
  await setPersistence(auth, browserSessionPersistence);
  return signInWithPhoneNumber(auth, normalizeIndianPhoneNumber(phoneNumber), verifier);
}

export async function verifyPhoneOtp(result: ConfirmationResult, code: string) {
  const credential = await result.confirm(code);
  return credential.user;
}

export async function sendPhoneLinkOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier,
) {
  const user = requireAuth().currentUser;
  if (!user) throw new Error('Sign in before linking a mobile number.');
  return linkWithPhoneNumber(user, normalizeIndianPhoneNumber(phoneNumber), verifier);
}

export async function getApplicationUser(user: User): Promise<AppUser> {
  return authenticatedRequest<AppUserResponse>('/api/auth/me', user).then((data) => data.user);
}

export async function updateProfile(
  user: User,
  profile: { fullName: string; village: string },
): Promise<AppUser> {
  const data = await authenticatedRequest<AppUserResponse>('/api/auth/profile', user, {
    method: 'PATCH',
    body: JSON.stringify(profile),
  });
  return data.user;
}

export async function requestDronePilotAccess(user: User) {
  return authenticatedRequest<{ status: 'PENDING' | 'APPROVED' }>(
    '/api/auth/role-requests/drone-pilot',
    user,
    { method: 'POST' },
  );
}

export async function getAdminAccounts(user: User) {
  return authenticatedRequest<{ users: AdminAccount[] }>('/api/auth/admin/users', user);
}

export async function getPilotRoleRequests(user: User) {
  return authenticatedRequest<{ requests: PilotRoleRequest[] }>('/api/auth/admin/role-requests', user);
}

export async function getOperatorAssignments(user: User) {
  return authenticatedRequest<{ assignments: OperatorAssignment[] }>('/api/operator/assignments', user);
}

export async function decidePilotRoleRequest(user: User, requestId: string, status: 'APPROVED' | 'REJECTED') {
  return authenticatedRequest<{ success: boolean; status: string }>(
    `/api/auth/admin/role-requests/${requestId}`,
    user,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  );
}

export async function updateAccountRole(user: User, userId: string, role: AppRole) {
  return authenticatedRequest<{ success: boolean }>(
    `/api/auth/admin/users/${userId}/role`,
    user,
    { method: 'PATCH', body: JSON.stringify({ role }) },
  );
}

export async function logout(user: User) {
  let serverError: unknown;
  try {
    await authenticatedRequest<void>('/api/auth/logout', user, { method: 'POST' });
  } catch (error) {
    serverError = error;
  } finally {
    await signOut(requireAuth());
  }
  if (serverError) throw serverError;
}

async function authenticatedRequest<T>(
  path: string,
  user: User,
  options: RequestInit = {},
): Promise<T> {
  if (!apiUrl) {
    throw new Error('The API server is not configured for this deployment. Set VITE_API_URL to the deployed Khet Rakshak API URL and rebuild the frontend.');
  }
  const token = await user.getIdToken();
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach the Khet Rakshak API at ${apiUrl}. Start the backend at http://localhost:5000 for local development, or set VITE_API_URL to the deployed API URL. If the API is running, check its CORS FRONTEND_URL setting.`);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status}) at ${path}.`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface AppUserResponse {
  user: AppUser;
}
