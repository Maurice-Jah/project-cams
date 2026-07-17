import { useParams } from 'wouter';
import { useGetCase, useListCaseNotes, useListInvestigations, useListWorkers } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/logo';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';

/**
 * A clean, print-only view of a single case: child + assignment + referral
 * + investigations + notes. Staff use the browser's own "Print" dialog
 * ("Save as PDF") to hand this to an outside party (e.g. law enforcement)
 * without ever giving that party a login to this system.
 */
export function CasesReport() {
  const { id } = useParams();
  const numId = Number(id);
  const { user } = useAuth();
  const { data: c, isLoading } = useGetCase(numId);
  const { data: notes } = useListCaseNotes(numId);
  const { data: allInvestigations } = useListInvestigations();
  const { data: workers } = useListWorkers();
  const investigations = (allInvestigations ?? []).filter(i => i.caseId === numId);
  const investigatorName = (workerId) => {
    const w = workers?.find(x => x.id === workerId);
    return w ? `${w.firstName} ${w.lastName}` : 'Unassigned';
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading report…</div>;
  if (!c) return <div className="p-10 text-center text-muted-foreground">Case not found.</div>;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-page { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
      <div className="no-print sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Case Report — {c.caseNumber}</p>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      <div className="report-page max-w-3xl mx-auto bg-white p-10 my-6 shadow-sm print:shadow-none print:my-0 text-slate-900">
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-slate-800"><Logo className="h-9 w-9" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CAMS Case Report</h1>
              <p className="text-sm text-slate-500 mt-0.5">Child & Family Case Management System</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generated {format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
            <p>By {user?.name ?? 'Unknown'}</p>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Case Overview</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">Case Number</p><p className="font-medium">{c.caseNumber}</p></div>
            <div><p className="text-slate-500">Status</p><p className="font-medium capitalize">{c.status.replace(/_/g,' ')}</p></div>
            <div><p className="text-slate-500">Priority</p><p className="font-medium capitalize">{c.priority}</p></div>
            <div><p className="text-slate-500">Abuse Type</p><p className="font-medium capitalize">{c.abuseType.replace(/_/g,' ')}</p></div>
            <div><p className="text-slate-500">Reported</p><p className="font-medium">{format(new Date(c.reportedAt), 'MMM d, yyyy')}</p></div>
            {c.closedAt && <div><p className="text-slate-500">Closed</p><p className="font-medium">{format(new Date(c.closedAt), 'MMM d, yyyy')}</p></div>}
          </div>
          {c.description && <p className="text-sm mt-3 leading-relaxed border-t border-slate-200 pt-3">{c.description}</p>}
        </section>

        {c.child && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Child</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500">Name</p><p className="font-medium">{c.child.firstName} {c.child.lastName}</p></div>
              <div><p className="text-slate-500">Date of Birth</p><p className="font-medium">{c.child.dateOfBirth ? format(new Date(c.child.dateOfBirth), 'MMM d, yyyy') : '—'}</p></div>
              <div><p className="text-slate-500">Guardian</p><p className="font-medium">{c.child.guardianName || '—'}</p></div>
              <div><p className="text-slate-500">Guardian Contact</p><p className="font-medium">{c.child.guardianPhone || '—'}</p></div>
              <div><p className="text-slate-500">Address</p><p className="font-medium">{c.child.address || '—'}</p></div>
              <div><p className="text-slate-500">School</p><p className="font-medium">{c.child.schoolName || '—'}</p></div>
            </div>
          </section>
        )}

        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Assignment</h2>
          <p className="text-sm">{c.worker ? `${c.worker.firstName} ${c.worker.lastName} — ${c.worker.role?.replace(/_/g,' ')}, ${c.worker.department}` : 'Unassigned'}</p>
        </section>

        {c.referredToLawEnforcement && (
          <section className="mb-6 border border-slate-300 rounded-lg p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Law Enforcement Referral</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500">Agency</p><p className="font-medium">{c.referralAgency}</p></div>
              <div><p className="text-slate-500">Referred</p><p className="font-medium">{c.referredAt ? format(new Date(c.referredAt), 'MMM d, yyyy') : '—'}</p></div>
              {c.referralContact && <div><p className="text-slate-500">Contact</p><p className="font-medium">{c.referralContact}</p></div>}
              {c.referralReferenceNumber && <div><p className="text-slate-500">Reference #</p><p className="font-medium font-mono">{c.referralReferenceNumber}</p></div>}
            </div>
          </section>
        )}

        {investigations.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Investigations</h2>
            <div className="space-y-3">
              {investigations.map(inv => (
                <div key={inv.id} className="text-sm border-l-2 border-slate-300 pl-3">
                  <p className="font-medium capitalize">{inv.status.replace(/_/g,' ')} — {investigatorName(inv.workerId)}</p>
                  <p className="text-slate-500 text-xs">Started {format(new Date(inv.startedAt), 'MMM d, yyyy')}{inv.completedAt ? ', completed ' + format(new Date(inv.completedAt), 'MMM d, yyyy') : ''}{inv.outcome ? ' · Outcome: ' + inv.outcome : ''}</p>
                  {inv.findings && <p className="mt-1 leading-relaxed">{inv.findings}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Case Notes</h2>
          {notes?.length ? (
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.id} className="text-sm border-l-2 border-slate-200 pl-3">
                  <p>{n.content}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.authorName} · {format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No notes on file.</p>}
        </section>

        <div className="mt-10 pt-4 border-t border-slate-200 text-[11px] text-slate-400">
          This document contains confidential information about a minor. Handle in accordance with your organization's data protection policy.
        </div>
      </div>
    </div>
  );
}
