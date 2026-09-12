import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, Users, Car, PackageX } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, ChartCard } from '../../components/common/Card';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/format';
import { useChartTheme } from '../../utils/chartTheme';

export default function Reports() {
  const chart = useChartTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    reportService.getAdminDashboard()
      .then(setStats)
      .catch((err) => toast({ type: 'error', title: 'Could not load reports', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading reports..." className="min-h-[50vh]" />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Workshop performance at a glance." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Revenue (MTD)" value={formatCurrency(stats.revenueThisMonth)} icon={DollarSign} accent="cyan" />
        <StatCard index={1} label="Total Customers" value={stats.totalCustomers} icon={Users} accent="blue" />
        <StatCard index={2} label="Vehicles Registered" value={stats.totalVehicles} icon={Car} accent="emerald" />
        <StatCard index={3} label="Low-Stock Parts" value={stats.lowStockParts} icon={PackageX} accent="rose" />
      </div>

      <div className="mt-6">
        <ChartCard title="Mechanic Workload" subtitle="Open jobs currently assigned, per mechanic">
          {stats.mechanicWorkload.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">No jobs currently assigned to any mechanic.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.mechanicWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chart.axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chart.axisColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chart.tooltipStyle} cursor={{ fill: chart.cursorFill }} />
                <Bar dataKey="jobs" radius={[8, 8, 0, 0]} fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Deeper trend analytics (revenue over time, most-booked services, repeat-customer rate) need a dedicated
        reporting endpoint on the backend — flagged as a follow-up, not implemented yet.
      </p>
    </div>
  );
}
