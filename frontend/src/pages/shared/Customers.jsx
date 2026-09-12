import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/SearchAndFilter';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { customerService } from '../../services/customerService';
import { formatDate } from '../../utils/format';

const STATUS_LABELS = { active: 'Active', inactive: 'Inactive', blocked: 'Blocked' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const load = (params) => {
    setLoading(true);
    customerService.list(params)
      .then((res) => setCustomers(res.data || []))
      .catch((err) => toast({ type: 'error', title: 'Could not load customers', message: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => load({ search }), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <PageHeader title="Customers" subtitle="Search and manage the customer directory." />

      <Card className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." className="max-w-md" />
      </Card>

      {loading ? (
        <Loader label="Loading customers..." />
      ) : (
        <Card>
          <DataTable
            emptyLabel="No customers found"
            columns={[
              { key: 'name', header: 'Name', render: (r) => r.userId?.name || '—' },
              { key: 'email', header: 'Email', render: (r) => <span className="flex items-center gap-1.5 text-ink-3"><Mail className="h-3.5 w-3.5" />{r.userId?.email}</span> },
              { key: 'phone', header: 'Phone', render: (r) => <span className="flex items-center gap-1.5 text-ink-3"><Phone className="h-3.5 w-3.5" />{r.phone || r.userId?.phone || '—'}</span> },
              { key: 'createdAt', header: 'Joined', render: (r) => formatDate(r.createdAt) },
              { key: 'status', header: 'Status', render: (r) => <StatusBadge status={STATUS_LABELS[r.status] || r.status} /> },
            ]}
            data={customers}
          />
        </Card>
      )}
    </div>
  );
}
