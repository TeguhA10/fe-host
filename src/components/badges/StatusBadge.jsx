import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    Draft: 'bg-slate-100 text-slate-700 ring-slate-650/10',
    Submitted: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-rose-50 text-rose-700 ring-rose-600/10',
    Received: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    Cancelled: 'bg-neutral-100 text-neutral-800 ring-neutral-700/10'
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 ring-slate-650/10';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${currentStyle}`}>
      {status}
    </span>
  );
}
