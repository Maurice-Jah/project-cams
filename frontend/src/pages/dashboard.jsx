import { useGetDashboardSummary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, Search, FolderOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, PriorityBadge } from '@/components/badges';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#1e293b','#64748b','#ef4444','#f59e0b','#10b981'];

export function Dashboard() {
  const { data, isLoading, error } = useGetDashboardSummary();
  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-28 rounded-xl"/>)}</div>
      <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72 rounded-xl"/><Skeleton className="h-72 rounded-xl"/></div>
      <Skeleton className="h-64 rounded-xl"/>
    </div>
  );
  if (error || !data) return <div className="p-6 border border-destructive/20 bg-destructive/5 text-destructive rounded-lg">Failed to load dashboard data.</div>;
  const { openCases, totalCases, criticalCases, totalChildren, activeInvestigations, recentCases, casesByType, casesByStatus, myAssignedCases, myOpenCaseCount, myWorkerId } = data;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground mt-1 text-sm">Overview of your case management metrics.</p></div>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/cases?status=open"><Card className="shadow-sm hover:bg-muted/30 transition-colors cursor-pointer"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Active Cases</CardTitle><FolderOpen className="h-4 w-4 text-primary shrink-0"/></CardHeader><CardContent className="px-4 pb-4"><div className="text-2xl font-bold">{openCases}</div><p className="text-xs text-muted-foreground mt-1">of {totalCases} total</p></CardContent></Card></Link>
        <Link href="/cases?priority=critical"><Card className="shadow-sm border-l-4 border-l-red-500 hover:bg-muted/30 transition-colors cursor-pointer"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Critical</CardTitle><AlertCircle className="h-4 w-4 text-red-500 shrink-0"/></CardHeader><CardContent className="px-4 pb-4"><div className="text-2xl font-bold text-red-600">{criticalCases}</div><p className="text-xs text-muted-foreground mt-1">Immediate attention</p></CardContent></Card></Link>
        <Link href="/children"><Card className="shadow-sm hover:bg-muted/30 transition-colors cursor-pointer"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Children</CardTitle><Users className="h-4 w-4 text-primary shrink-0"/></CardHeader><CardContent className="px-4 pb-4"><div className="text-2xl font-bold">{totalChildren}</div><p className="text-xs text-muted-foreground mt-1">Active profiles</p></CardContent></Card></Link>
        <Link href="/investigations"><Card className="shadow-sm hover:bg-muted/30 transition-colors cursor-pointer"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4"><CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Investigations</CardTitle><Search className="h-4 w-4 text-primary shrink-0"/></CardHeader><CardContent className="px-4 pb-4"><div className="text-2xl font-bold">{activeInvestigations}</div><p className="text-xs text-muted-foreground mt-1">Ongoing</p></CardContent></Card></Link>
      </div>
      {myWorkerId != null && (
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base">My Assigned Cases</CardTitle>
            <Link href="/cases?assignedToMe=1" className="text-xs text-primary hover:underline">View all ({myOpenCaseCount} open)</Link>
          </CardHeader>
          <CardContent>
            {myAssignedCases?.length ? (
              <div className="space-y-2">{myAssignedCases.map(c=>(
                <Link key={c.id} href={'/cases/'+c.id}>
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <div><p className="font-medium text-primary text-sm">{c.caseNumber}</p><p className="text-xs text-muted-foreground capitalize">{c.abuseType.replace(/_/g,' ')}</p></div>
                    <div className="flex items-center gap-1.5"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div>
                  </div>
                </Link>
              ))}</div>
            ) : <p className="text-sm text-muted-foreground py-2">No cases currently assigned to you.</p>}
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base">Cases by Type</CardTitle></CardHeader><CardContent className="h-56 sm:h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={casesByType} margin={{top:10,right:10,left:-20,bottom:0}}><XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false}/><YAxis fontSize={11} tickLine={false} axisLine={false}/><Tooltip cursor={{fill:'#f1f5f9'}} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/><Bar dataKey="count" fill="#1e293b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></CardContent></Card>
        <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base">Case Status Distribution</CardTitle></CardHeader><CardContent className="h-56 sm:h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={casesByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="count" nameKey="label">{casesByStatus.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/></PieChart></ResponsiveContainer></CardContent></Card>
      </div>
      <Card className="shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base">Recent Cases</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 sm:hidden">
            {recentCases?.map(c=>(
              <Link key={c.id} href={'/cases/'+c.id}>
                <div className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="space-y-1"><p className="font-medium text-primary text-sm">{c.caseNumber}</p><p className="text-xs text-muted-foreground capitalize">{c.abuseType.replace(/_/g,' ')}</p><p className="text-xs text-muted-foreground">{format(new Date(c.reportedAt),'MMM d, yyyy')}</p></div>
                  <div className="flex flex-col items-end gap-1"><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left"><thead className="text-xs text-muted-foreground uppercase bg-muted/50"><tr><th className="px-4 py-3 font-medium">Case Number</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Reported</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Priority</th></tr></thead>
              <tbody>{recentCases?.map(c=>(
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-primary"><Link href={'/cases/'+c.id} className="hover:underline">{c.caseNumber}</Link></td>
                  <td className="px-4 py-3 capitalize">{c.abuseType.replace(/_/g,' ')}</td>
                  <td className="px-4 py-3 text-muted-foreground">{format(new Date(c.reportedAt),'MMM d, yyyy')}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status}/></td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
