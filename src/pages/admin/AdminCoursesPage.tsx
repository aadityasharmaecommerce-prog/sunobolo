import { useEffect, useState } from 'react';
import type { Course } from '@/types';
import { LEVEL_LABELS } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services/adminService';
import { coursesService } from '@/services/coursesService';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';

const EMPTY: Partial<Course> = {
  title: '',
  tagline: '',
  description: '',
  level: 'beginner',
  audience: 'adults',
  emoji: '📘',
  color: 'sky',
  isFree: true,
  order: 99,
};

export function AdminCoursesPage() {
  usePageMeta('Admin Courses — SunoBolo English', '');
  const { toast } = useToast();
  const [rows, setRows] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Course>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setRows(await coursesService.getCourses());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setCreating(true);
  };

  const openEdit = (c: Course) => {
    setForm({ ...c });
    setEditing(c);
  };

  const save = async () => {
    if (!form.title?.trim()) {
      toast('Title required hai.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateCourse(editing.id, form);
        toast('Course update ho gaya ✅');
      } else {
        await adminService.addCourse(form);
        toast('Course add ho gaya ✅');
      }
      setEditing(null);
      setCreating(false);
      await refresh();
    } catch {
      toast('Save fail ho gaya (admin token check karo).', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Course) => {
    if (window.confirm(`"${c.title}" delete karein? Saare lessons aur sentences bhi delete honge.`)) {
      try {
        await adminService.deleteCourse(c.id);
        toast('Course delete ho gaya.', 'info');
        await refresh();
      } catch {
        toast('Delete fail ho gaya.', 'error');
      }
    }
  };

  if (loading) return <LoadingState label="Courses load ho rahe hain…" />;
  if (error) return <ErrorState onRetry={refresh} />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Courses ({rows.length})</h2>
        <Button onClick={openCreate}>+ Add Course</Button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Level</th>
              <th>Audience</th>
              <th>Lessons</th>
              <th>Sentences</th>
              <th>Free</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>
                    {c.emoji} {c.title}
                  </strong>
                </td>
                <td>{LEVEL_LABELS[c.level]}</td>
                <td>{c.audience}</td>
                <td>{c.lessonCount}</td>
                <td>{c.sentenceCount}</td>
                <td>{c.isFree ? <Badge variant="free">Free</Badge> : <Badge variant="paid">Paid</Badge>}</td>
                <td>{c.order}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => remove(c)}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? `Edit: ${editing.title}` : 'Add Course'}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="field">
          <label>Title</label>
          <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Beginner English" />
        </div>
        <div className="field">
          <label>Tagline</label>
          <input value={form.tagline ?? ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Chhota motivational line" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div className="field">
          <label>Emoji</label>
          <input value={form.emoji ?? ''} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
        <div className="flex">
          <div className="field grow">
            <label>Level</label>
            <select value={form.level ?? 'beginner'} onChange={(e) => setForm({ ...form, level: e.target.value as Course['level'] })}>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field grow">
            <label>Audience</label>
            <select value={form.audience ?? 'adults'} onChange={(e) => setForm({ ...form, audience: e.target.value as Course['audience'] })}>
              <option value="kids">Kids</option>
              <option value="students">Students</option>
              <option value="adults">Adults</option>
              <option value="professionals">Professionals</option>
            </select>
          </div>
          <div className="field">
            <label>Order</label>
            <input type="number" value={form.order ?? 99} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
        </div>
        <label className="flex" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={!!form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
          Free course (bina package ke accessible)
        </label>
      </Modal>
    </div>
  );
}
