import { FormEvent, useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, User } from 'firebase/auth';
import { CheckCircle2, Shield } from 'lucide-react';
import {
  createPhoneVerifier,
  sendPhoneLinkOtp,
  updateProfile,
  verifyPhoneOtp,
} from '../services/authService';

interface ProfileSetupProps {
  identity: User;
  onComplete: (user: Awaited<ReturnType<typeof updateProfile>>) => void;
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return '';
}

export default function ProfileSetup({ identity, onComplete }: ProfileSetupProps) {
  const [fullName, setFullName] = useState(identity.displayName || '');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(identity.phoneNumber));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => () => verifierRef.current?.clear(), []);

  const sendOtp = async () => {
    setBusy(true);
    setError('');
    try {
      verifierRef.current = createPhoneVerifier('profile-recaptcha');
      setConfirmation(await sendPhoneLinkOtp(phone, verifierRef.current));
    } catch (sendError) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      const code = getFirebaseErrorCode(sendError);
      setError(sendError instanceof Error && sendError.message.startsWith('Enter a valid Indian')
        ? sendError.message
        : code === 'auth/too-many-requests' || code === 'auth/quota-exceeded'
          ? 'Too many attempts. Wait before requesting another code.'
          : 'Could not send the verification code. Check the number and try again.');
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setBusy(true);
    setError('');
    try {
      await verifyPhoneOtp(confirmation, otp);
      setPhoneVerified(true);
      setConfirmation(null);
    } catch {
      setError('The code is invalid or expired. Request a new code and try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!phoneVerified) {
      setError('Verify your mobile number to complete your profile.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onComplete(await updateProfile(identity, { fullName, village }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto my-10 max-w-xl rounded-3xl border border-gray-100 bg-white p-7 shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-700 p-3 text-white"><Shield className="h-6 w-6" /></div>
        <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Khet Rakshak</p><h1 className="font-display text-xl font-bold">Complete your farmer profile</h1></div>
      </div>
      <p className="mb-5 text-sm text-gray-500">Add your name, verified mobile number, and village before opening your farm workspace.</p>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={saveProfile} className="space-y-4">
        <label className="block text-sm font-semibold">Full name
          <input required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-3 font-normal dark:border-gray-700" />
        </label>
        <label className="block text-sm font-semibold">Village
          <input required maxLength={120} value={village} onChange={(event) => setVillage(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-3 font-normal dark:border-gray-700" />
        </label>
        {phoneVerified ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> Verified mobile: {identity.phoneNumber}
          </p>
        ) : (
          <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <label className="block text-sm font-semibold">Mobile number
              <input type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" />
            </label>
            {!confirmation ? (
              <button type="button" onClick={() => void sendOtp()} disabled={busy} className="w-full rounded-lg border border-emerald-700 py-2.5 font-bold text-emerald-800 disabled:opacity-50">Verify mobile with OTP</button>
            ) : (
              <>
                <input aria-label="One-time code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2.5 dark:border-gray-700" />
                <button type="button" onClick={() => void verifyOtp()} disabled={busy || otp.length !== 6} className="w-full rounded-lg bg-emerald-700 py-2.5 font-bold text-white disabled:opacity-50">Confirm mobile number</button>
              </>
            )}
          </div>
        )}
        <button type="submit" disabled={busy || !phoneVerified} className="w-full rounded-xl bg-emerald-700 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{busy ? 'Saving…' : 'Save profile and continue'}</button>
      </form>
      <div id="profile-recaptcha" />
    </section>
  );
}
