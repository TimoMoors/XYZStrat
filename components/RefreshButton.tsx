'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Lock, X } from 'lucide-react';
import { clsx } from 'clsx';

interface RefreshButtonProps {
  onRefresh: () => void;
}

type Status = 'idle' | 'locked' | 'loading' | 'success' | 'error';

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');

  function openModal() {
    setPassword('');
    setMessage('');
    setStatus('locked');
  }

  function closeModal() {
    setStatus('idle');
    setPassword('');
    setMessage('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-analyze-password': password,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setStatus('success');
      setMessage('Report updated!');
      setPassword('');
      setTimeout(() => {
        onRefresh();
        setStatus('idle');
      }, 1500);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      setPassword('');
    }
  }

  return (
    <>
      {/* Trigger button */}
      <div className="flex items-center gap-3">
        {status === 'success' && (
          <span className="text-xs font-medium text-emerald-400">
            <CheckCircle size={12} className="inline mr-1" />
            {message}
          </span>
        )}
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 active:scale-95 transition-all"
        >
          <RefreshCw size={14} />
          Run Analysis
        </button>
      </div>

      {/* Password modal */}
      {(status === 'locked' || status === 'loading' || status === 'error') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-zinc-400" />
                <h2 className="text-white font-semibold">Enter password</h2>
              </div>
              <button
                onClick={closeModal}
                disabled={status === 'loading'}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                disabled={status === 'loading'}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 disabled:opacity-50"
              />

              {status === 'error' && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={12} />
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !password}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  status === 'loading' || !password
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-white text-zinc-900 hover:bg-zinc-200 active:scale-95'
                )}
              >
                <RefreshCw size={14} className={clsx(status === 'loading' && 'animate-spin')} />
                {status === 'loading' ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
