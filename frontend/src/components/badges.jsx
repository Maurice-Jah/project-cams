import { Badge } from '@/components/ui/badge';
export function StatusBadge({ status }) {
  const c = (s) => { switch(s.toLowerCase()) {
    case 'open': case 'reviewed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
    case 'under_investigation': case 'in_progress': return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200';
    case 'closed': case 'inactive': case 'completed': return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200';
    case 'referred': return 'bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200';
    case 'new': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
    case 'escalated': return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200';
    case 'active': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
  }};
  return <Badge variant="outline" className={`capitalize font-medium ${c(status)}`}>{status.replace(/_/g,' ')}</Badge>;
}
export function PriorityBadge({ priority }) {
  const c = (p) => { switch(p.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
    case 'high': return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200';
    case 'low': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
  }};
  return <Badge variant="outline" className={`capitalize font-medium ${c(priority)}`}>{priority}</Badge>;
}
