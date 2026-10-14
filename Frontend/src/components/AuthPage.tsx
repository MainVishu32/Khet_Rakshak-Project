import { useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, User } from 'firebase/auth';
import { ArrowLeft, CheckCircle2, CircleHelp, Shield, UserRound, Plane } from 'lucide-react';
import {
  AppRole,
  createPhoneVerifier,
  sendPhoneOtp,
  signInWithGoogle,
  verifyPhoneOtp,
} from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

interface AuthPageProps {
  onAuthenticated: (user: User, requestedRole: AppRole) => Promise<void>;
  onBack: () => void;
}

const roleOptions: { role: AppRole; title: string; description: string; icon: typeof UserRound }[] = [
  { role: 'FARMER', title: 'Farmer', description: 'Manage your farms and crop health.', icon: UserRound },
  { role: 'DRONE_PILOT', title: 'Drone Pilot', description: 'Access assigned drone operations after approval.', icon: Plane },
  { role: 'ADMIN', title: 'Administrator', description: 'Secure sign-in for provisioned administrators only.', icon: Shield },
];

export default function AuthPage({ onAuthenticated, onBack }: AuthPageProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole>('FARMER');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [verifier, setVerifier] = useState<RecaptchaVerifier | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => () => verifierRef.current?.clear(), []);

  useEffect(() => {
    if (!retryAfter) return undefined;
    const timer = window.setTimeout(() => setRetryAfter((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retryAfter]);

  const runAuthentication = async (user: User) => {
    setError('');
    try {
      await onAuthenticated(user, selectedRole);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Sign-in failed. Try again.');
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await runAuthentication(await signInWithGoogle());
    } catch (authError) {
      const code = getFirebaseErrorCode(authError);
      setError(code === 'auth/popup-closed-by-user'
        ? 'Google sign-in was cancelled.'
        : 'Google sign-in could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!verifierRef.current) {
        verifierRef.current = createPhoneVerifier('phone-recaptcha');
        setVerifier(verifierRef.current);
      }
      const sent = await sendPhoneOtp(phone, verifierRef.current);
      setConfirmation(sent);
      setRetryAfter(30);
      setMessage('Verification code sent. Check your messages.');
    } catch (otpError) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      setVerifier(null);
      const code = getFirebaseErrorCode(otpError);
      setError(otpError instanceof Error && otpError.message.startsWith('Enter a valid Indian')
        ? otpError.message
        : code === 'auth/invalid-phone-number'
        ? 'Enter a valid Indian mobile number.'
        : code === 'auth/too-many-requests' || code === 'auth/quota-exceeded'
          ? 'Too many attempts. Wait before requesting another code.'
          : 'We could not deliver a verification code. Check the number and try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmation) return;
    setBusy(true);
    setError('');
    try {
      await runAuthentication(await verifyPhoneOtp(confirmation, otp));
    } catch (otpError) {
      const code = getFirebaseErrorCode(otpError);
      setError(code === 'auth/code-expired'
        ? 'That code has expired. Request a new verification code.'
        : 'The verification code is incorrect or expired.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-busy={busy} className="mx-auto my-6 max-w-3xl rounded-3xl border border-[#7b8d80] bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:my-8 sm:p-9">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400">
        <ArrowLeft className="h-4 w-4" /> Back to Khet Rakshak
      </button>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <Shield className="h-7 w-7" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Har Khet Ki Digital Suraksha</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-emerald-950 dark:text-white">Secure sign in</h1>
        <p className="mt-2 text-sm text-gray-500">Choose the portal you need. Your account permissions are verified securely.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Choose portal">
        {roleOptions.map(({ role, title, description, icon: Icon }) => (
          <button
            key={role}
            type="button"
            aria-pressed={selectedRole === role}
            onClick={() => { setSelectedRole(role); setError(''); }}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              selectedRole === role
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-gray-200 hover:border-emerald-300 dark:border-gray-700'
            }`}
          >
            <Icon className="mb-2 h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <span className="block text-sm font-bold">{title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-500">{description}</span>
          </button>
        ))}
      </div>

      {!isFirebaseConfigured && (
        <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Authentication is not configured yet. The site administrator must configure the Firebase client environment variables.
        </div>
      )}
      {error && <p id="auth-error" role="alert" className="mb-4 rounded-xl border border-[#b42318] bg-red-50 p-3 text-base text-[#7a1b14]">{error}</p>}
      {message && <p role="status" aria-live="polite" className="mb-4 rounded-xl border border-[#176b3a] bg-green-50 p-3 text-base text-[#174c2c]">{message}</p>}

      <button
        type="button"
        disabled={busy || !isFirebaseConfigured}
        onClick={handleGoogle}
        className="group flex w-full items-center justify-center gap-3 rounded-lg border border-[#747775] bg-white px-4 py-3 font-medium text-[#1f1f1f] shadow-sm transition hover:bg-[#f8faff] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4285f4] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-white dark:text-[#1f1f1f]"
      >
        {busy ? (
          <span>Please wait…</span>
        ) : (
          <>
            <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.89c-.58 2.96-2.25 5.48-4.72 7.18l7.63 5.91c4.45-4.1 7.18-10.14 7.18-17.56Z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.94 23.94 0 0 0 0 21.56l7.98-6.19Z" />
              <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.79l-7.63-5.91c-2.12 1.42-4.84 2.2-8.24 2.2-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" /> OR MOBILE OTP <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      {!confirmation ? (
        <form onSubmit={(event) => { event.preventDefault(); void handleSendOtp(); }} className="space-y-3">
          <label htmlFor="phone-number" className="block text-sm font-semibold">Mobile number</label>
          <div className="flex overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
            <span className="border-r border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800">+91</span>
            <input
              id="phone-number"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              value={phone}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'auth-error' : undefined}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Mobile number"
              required
              className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"
            />
          </div>
          <p className="text-xs text-gray-500">+91 is added automatically. Firebase verifies the number and delivers the OTP; standard SMS charges may apply.</p>
          {selectedRole === 'FARMER' && <p className="text-xs text-emerald-800 dark:text-emerald-400">New farmers can create an account by verifying their mobile number or Google account.</p>}
          <button type="submit" disabled={busy || retryAfter > 0 || !isFirebaseConfigured} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {busy ? 'Sending code…' : retryAfter ? `Try again in ${retryAfter}s` : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void handleVerifyOtp(); }} className="space-y-3">
          <label htmlFor="phone-otp" className="block text-sm font-semibold">Enter verification code</label>
          <input
            id="phone-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            value={otp}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'auth-error' : undefined}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
            placeholder="6-digit code"
            required
            className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-emerald-600 dark:border-gray-700"
          />
          <button type="submit" disabled={busy || otp.length !== 6} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {busy ? 'Verifying…' : 'Verify and continue'}
          </button>
          <button type="button" onClick={() => { setConfirmation(null); setOtp(''); }} className="w-full py-2 text-sm font-semibold text-gray-600 hover:text-emerald-700">
            Use a different number
          </button>
          <button
            type="button"
            disabled={busy || retryAfter > 0}
            onClick={() => {
              verifierRef.current?.clear();
              verifierRef.current = null;
              setVerifier(null);
              setConfirmation(null);
              setOtp('');
              void handleSendOtp();
            }}
            className="w-full py-2 text-sm font-semibold text-emerald-700 disabled:text-gray-400"
          >
            {retryAfter ? `Resend code in ${retryAfter}s` : 'Resend OTP'}
          </button>
        </form>
      )}
      <div id="phone-recaptcha" />
      <div className="mt-6 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500 dark:bg-gray-800">
        <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
        <p><CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Pilot access requires administrator approval. Administrator accounts are provisioned privately and cannot be self-registered.</p>
      </div>
      <span className="sr-only">{verifier ? 'Phone verification initialized' : ''}</span>
    </section>
  );
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return '';
}
