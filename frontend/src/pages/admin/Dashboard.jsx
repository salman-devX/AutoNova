import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CalendarClock, Wrench, CheckCircle2, DollarSign, Users, Car, PackageX, Gauge } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard, ChartCard } from '../../components/common/Card';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/format';
import { useChartTheme } from '../../utils/chartTheme';
import Button from '../../components/common/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const chart = useChartTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    reportService.getAdminDashboard()
      .then(setStats)
      .catch((err) => toast({ type: 'error', title: 'Could not load dashboard', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." className="min-h-[50vh]" />;
  if (!stats) return null;

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Workshop performance at a glance."
        action={<Button variant="secondary" onClick={() => navigate('/admin/reports')}>View Full Reports</Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Today's Appointments" value={stats.todaysAppointments} icon={CalendarClock} accent="cyan" />
        <StatCard index={1} label="Active Jobs" value={stats.activeJobs} icon={Wrench} accent="blue" />
        <StatCard index={2} label="Completed Services" value={stats.completedServices} icon={CheckCircle2} accent="emerald" />
        <StatCard index={3} label="Revenue (MTD)" value={formatCurrency(stats.revenueThisMonth)} icon={DollarSign} accent="amber" />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={4} label="Total Customers" value={stats.totalCustomers} icon={Users} accent="cyan" />
        <StatCard index={5} label="Vehicles Registered" value={stats.totalVehicles} icon={Car} accent="blue" />
        <StatCard index={6} label="Low-Stock Parts" value={stats.lowStockParts} icon={PackageX} accent="rose" />
        <StatCard index={7} label="Mechanics Working" value={stats.mechanicWorkload.length} icon={Gauge} accent="emerald" />
      </div>

      <div className="mt-6">
        <ChartCard title="Mechanic Workload" subtitle="Open jobs currently assigned, per mechanic">
          {stats.mechanicWorkload.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">No jobs currently assigned to any mechanic.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.mechanicWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chart.axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chart.axisColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chart.tooltipStyle} cursor={{ fill: chart.cursorFill }} />
                <Bar dataKey="jobs" radius={[8, 8, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
