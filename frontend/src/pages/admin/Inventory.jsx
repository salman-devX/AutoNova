import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Package, Pencil, Minus, PlusCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, RowActions } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/States';
import { useToast } from '../../context/ToastContext';
import { inventoryService } from '../../services/inventoryService';
import { formatCurrency } from '../../utils/format';

const STOCK_STATUS_LABEL = { active: 'Active', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

export default function Inventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.list({});
      setParts(res.data || []);
    } catch (err) {
      toast({ type: 'error', title: 'Could not load inventory', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); reset({ name: '', sku: '', category: '', purchasePrice: '', sellingPrice: '', quantity: '', minimumStockLevel: '' }); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    reset({ name: p.name, sku: p.sku, category: p.category, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice, quantity: p.quantity, minimumStockLevel: p.minimumStockLevel });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) await inventoryService.update(editing._id || editing.id, data);
      else await inventoryService.create(data);
      toast({ type: 'success', title: editing ? 'Part updated' : 'Part added' });
      setModalOpen(false);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const adjust = async (delta) => {
    setSaving(true);
    try {
      await inventoryService.adjustStock({ partId: adjustTarget._id || adjustTarget.id, quantityDelta: delta, reason: 'Manual adjustment' });
      toast({ type: 'success', title: 'Stock updated' });
      setAdjustTarget(null);
      load();
    } catch (err) {
      toast({ type: 'error', title: 'Could not adjust stock', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading inventory..." className="min-h-[50vh]" />;

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Parts catalog and stock levels." action={<Button icon={Plus} onClick={openAdd}>Add Part</Button>} />

      <Card>
        <DataTable
          emptyLabel="No parts yet"
          columns={[
            { key: 'name', header: 'Part' },
            { key: 'sku', header: 'SKU' },
            { key: 'category', header: 'Category' },
            { key: 'quantity', header: 'Qty' },
            { key: 'sellingPrice', header: 'Price', render: (r) => formatCurrency(r.sellingPrice) },
            { key: 'stockStatus', header: 'Status', render: (r) => <StatusBadge status={STOCK_STATUS_LABEL[r.stockStatus] || r.stockStatus} /> },
            {
              key: 'actions', header: '', className: 'text-right',
              render: (r) => (
                <RowActions>
                  <button onClick={() => setAdjustTarget(r)} className="rounded-lg p-1.5 text-ink-muted hover:bg-glass-1 hover:text-cyan-300" aria-label="Adjust stock"><PlusCircle className="h-4 w-4" /></button>
                  <button onClick={() => openEdit(r)} className="rounded-lg p-1.5 text-ink-muted hover:bg-glass-1 hover:text-cyan-300" aria-label="Edit part"><Pencil className="h-4 w-4" /></button>
                </RowActions>
              ),
            },
          ]}
          data={parts}
        />
      </Card>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Part' : 'Add Part'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit(onSubmit)}>{editing ? 'Save Changes' : 'Add Part'}</Button>
        </>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Part name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" required error={errors.sku?.message} {...register('sku', { required: 'Required' })} />
            <Input label="Category" {...register('category')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Purchase Price" type="number" required error={errors.purchasePrice?.message} {...register('purchasePrice', { required: 'Required' })} />
            <Input label="Selling Price" type="number" required error={errors.sellingPrice?.message} {...register('sellingPrice', { required: 'Required' })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" disabled={!!editing} {...register('quantity')} />
            <Input label="Min. Stock" type="number" {...register('minimumStockLevel')} />
          </div>
          {editing && <p className="text-xs text-ink-muted">Quantity can only be changed via the stock-adjust button — it's tracked with a full audit trail.</p>}
        </form>
      </Modal>

      <Modal open={!!adjustTarget} onClose={() => setAdjustTarget(null)} title="Adjust Stock" size="sm">
        {adjustTarget && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Package className="h-6 w-6" /></div>
            <p className="mt-3 font-display font-semibold text-ink">{adjustTarget.name}</p>
            <p className="text-sm text-ink-muted">Current stock: {adjustTarget.quantity} units</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" icon={Minus} loading={saving} onClick={() => adjust(-1)}>Remove 1</Button>
              <Button icon={Plus} loading={saving} onClick={() => adjust(1)}>Add 1</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
