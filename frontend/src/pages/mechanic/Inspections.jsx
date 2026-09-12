import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardCheck, Plus, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Select, Textarea } from '../../components/common/FormFields';
import { Modal } from '../../components/common/Modal';
import { Loader, EmptyState } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { inspectionService } from '../../services/inspectionService';
import { serviceOrderService } from '../../services/serviceOrderService';
import { formatDate } from '../../utils/format';
import { cn } from '../../utils/cn';

const CATEGORIES = [
  { value: 'engine', label: 'Engine' }, { value: 'brakes', label: 'Brakes' }, { value: 'tires', label: 'Tires' },
  { value: 'battery', label: 'Battery' }, { value: 'lights', label: 'Lights' }, { value: 'suspension', label: 'Suspension' },
  { value: 'fluids', label: 'Fluids' }, { value: 'exterior', label: 'Exterior' }, { value: 'interior', label: 'Interior' },
];
const RATINGS = [
  { value: 'good', label: 'Good', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
  { value: 'needs_attention', label: 'Needs Attention', icon: AlertTriangle, color: 'text-amber-400 border-amber-400/30 bg-amber-400/10' },
  { value: 'critical', label: 'Critical', icon: AlertCircle, color: 'text-rose-400 border-rose-400/30 bg-rose-400/10' },
];

export default function Inspections() {
  const location = useLocation();
  const [inspections, setInspections] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceOrderId, setServiceOrderId] = useState('');
  const [ratings, setRatings] = useState({});
  const [recommendations, setRecommendations] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      inspectionService.list({}),
      serviceOrderService.list({}),
    ])
      .then(([inspRes, jobsRes]) => {
        setInspections(inspRes.data || []);
        setActiveJobs((jobsRes.data || []).filter((j) => j.status !== 'completed' && j.status !== 'cancelled'));
      })
      .catch((err) => toast({ type: 'error', title: 'Could not load inspections', message: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setServiceOrderId(location.state?.serviceOrderId || '');
    setRatings({});
    setRecommendations('');
    setModalOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const job = activeJobs.find((j) => (j._id || j.id) === serviceOrderId);
      if (!job) throw new Error('Select which job this inspection is for.');
      const items = Object.entries(ratings).map(([category, rating]) => ({ category, rating }));
      await inspectionService.create({
        serviceOrderId,
        vehicleId: job.vehicleId?._id || job.vehicleId,
        items,
        recommendations,
      });
      toast({ type: 'success', title: 'Inspection recorded' });
      setModalOpen(false);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not save inspection', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading inspections..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Inspections" subtitle="Vehicle checklist history." action={<Button icon={Plus} onClick={openNew}>New Inspection</Button>} />

      {inspections.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No inspections yet" description="Record your first vehicle inspection." action={<Button icon={Plus} onClick={openNew}>New Inspection</Button>} />
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => {
            const id = insp._id || insp.id;
            return (
              <Card key={id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{insp.vehicleId ? `${insp.vehicleId.make} ${insp.vehicleId.model} — ${insp.vehicleId.registrationNumber}` : 'Vehicle'}</p>
                    <p className="text-xs text-ink-muted">{formatDate(insp.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {insp.items.map((item) => {
                    const rating = RATINGS.find((r) => r.value === item.rating);
                    const category = CATEGORIES.find((c) => c.value === item.category);
                    if (!rating) return null;
                    return (
                      <span key={item.category} className={cn('badge', rating.color)}>
                        <rating.icon className="h-3 w-3" /> {category?.label || item.category}
                      </span>
                    );
                  })}
                </div>
                {insp.recommendations && <p className="mt-3 text-sm text-ink-3">{insp.recommendations}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title="New Inspection" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} disabled={!serviceOrderId || Object.keys(ratings).length === 0} onClick={submit}>Save Inspection</Button>
        </>}
      >
        <div className="space-y-5">
          <Select label="Job / Vehicle" required placeholder="Select an active job" value={serviceOrderId} onChange={(e) => setServiceOrderId(e.target.value)}
            options={activeJobs.map((j) => {
              const id = j._id || j.id;
              const v = j.vehicleId;
              return { value: id, label: v ? `${v.make} ${v.model} — ${v.registrationNumber}` : id };
            })} />
          {activeJobs.length === 0 && <p className="text-sm text-ink-muted">You have no active jobs assigned right now.</p>}

          <div>
            <p className="mb-2 text-sm font-medium text-ink-2">Checklist</p>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat.value} className="flex items-center justify-between rounded-xl bg-glass-1 p-3">
                  <span className="text-sm text-ink-2">{cat.label}</span>
                  <div className="flex gap-1.5">
                    {RATINGS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setRatings((prev) => ({ ...prev, [cat.value]: r.value }))}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
                          ratings[cat.value] === r.value ? r.color : 'border-hairline-2 text-ink-faint hover:border-hairline-3'
                        )}
                        title={r.label}
                      >
                        <r.icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Textarea label="Recommendations" placeholder="Any notes or recommendations for the customer..." value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
