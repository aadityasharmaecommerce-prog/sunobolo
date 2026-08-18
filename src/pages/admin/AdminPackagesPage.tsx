import { useState } from 'react';
import type { Package } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services/adminService';
import { getDB } from '@/services/store';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function AdminPackagesPage() {
  usePageMeta('Admin Packages — SunoBolo English', '');
  const { toast } = useToast();
  const [rows, setRows] = useState(() => [...getDB().packages]);
  const [editing, setEditing] = useState<Package | null>(null);
  const [form, setForm] = useState<Partial<Package>>({});

  const refresh = () => setRows([...getDB().packages]);

  const save = async () => {
    if (!editing) return;
    await adminService.updatePackage(editing.id, {
      name: form.name ?? editing.name,
      price: Number(form.price ?? editing.price),
      originalPrice: Number(form.originalPrice ?? editing.originalPrice),
      tagline: form.tagline ?? editing.tagline,
    });
    toast('Package update ho gaya ✅');
    setEditing(null);
    refresh();
  };

  return (
    <div>
      <h2 className="mb-2">Packages ({rows.length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Price</th>
              <th>Original</th>
              <th>Tagline</th>
              <th>Features</th>
              <th>Popular</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.price === 0 ? 'FREE' : `${p.currency}${p.price}`}</td>
                <td>{p.originalPrice > 0 ? `${p.currency}${p.originalPrice}` : '—'}</td>
                <td>{p.tagline}</td>
                <td>{p.features.length} features</td>
                <td>{p.popular ? <Badge variant="warn">Popular</Badge> : '—'}</td>
                <td>
                  <button className="btn btn--ghost btn--sm" onClick={() => { setForm({ ...p }); setEditing(p); }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit: ${editing.name}` : 'Edit package'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <div className="field">
          <label>Name</label>
          <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="flex">
          <div className="field grow">
            <label>Price (₹)</label>
            <input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div className="field grow">
            <label>Original price (₹)</label>
            <input type="number" value={form.originalPrice ?? 0} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} />
          </div>
        </div>
        <div className="field">
          <label>Tagline</label>
          <input value={form.tagline ?? ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
