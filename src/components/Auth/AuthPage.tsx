import { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function AuthPage() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, signUp, loading, error } = useAuth();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (mode === 'signUp' && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      if (mode === 'signIn') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (err) {
      console.error('Auth error', err);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-sand dark:bg-charcoal p-4">
      <div className="w-full max-w-md rounded-xl border border-mist bg-white/90 p-6 shadow-xl dark:bg-zinc-900 dark:border-stone">
        <h1 className="text-2xl font-bold text-center text-ink dark:text-fog">Minimal Notepad</h1>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-5">Email/password authentication</p>

        <div className="flex justify-center gap-2 mb-5">
          {['signIn', 'signUp'].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab as 'signIn' | 'signUp')}
              className={`px-4 py-2 rounded-md border ${mode === tab ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
            >
              {tab === 'signIn' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-mist px-3 py-2 bg-white dark:bg-zinc-900 dark:border-stone text-sm"
          />

          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-mist px-3 py-2 bg-white dark:bg-zinc-900 dark:border-stone text-sm"
          />

          {mode === 'signUp' && (
            <>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md border border-mist px-3 py-2 bg-white dark:bg-zinc-900 dark:border-stone text-sm"
              />
            </>
          )}

          {localError || error ? (
            <div className="text-xs text-red-600 dark:text-red-400">{localError || error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Processing...' : mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
