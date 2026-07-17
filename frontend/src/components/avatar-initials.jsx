import { cn } from '@/lib/utils';

/**
 * A small circular initials avatar — used for workers and children instead
 * of a photo. This is deliberate: the app already avoids photos of minors
 * entirely (see components/logo.jsx for the same reasoning), and using a
 * consistent placeholder for staff too keeps the UI visually even rather
 * than having photos for some records and blanks for others.
 */
const PALETTE = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
];

function colorFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function AvatarInitials({ name, size = 'md', className }) {
  const initials = (name || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold shrink-0', sizeClass, colorFor(name || '?'), className)}>
      {initials}
    </div>
  );
}
