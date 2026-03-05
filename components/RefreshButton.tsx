'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface RefreshButtonProps {
  onRefresh: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleClick() {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setStatus('success');
      setMessage('Report updated! Refreshing...');
      setTimeout(() => {
        onRefresh();
        setStatus('idle');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong');
      setTimeout(() => setStatus('idle'), 5000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={clsx(
            'text-xs font-medium',
            status === 'success' ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {status === 'success' ? <CheckCircle size={12} className="inline mr-1" /> : <AlertCircle size={12} className="inline mr-1" />}
          {message}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={clsx(
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-all',
          status === 'loading'
            ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
            : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 active:scale-95'
        )}
      >
        <RefreshCw size={14} className={clsx(status === 'loading' && 'animate-spin')} />
        {status === 'loading' ? 'Analyzing...' : 'Run Analysis'}
      </button>
    </div>
  );
}
