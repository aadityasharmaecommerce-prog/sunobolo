import { useEffect, useState } from 'react';
import type { Lesson } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services/adminService';
import { getDB } from '@/services/store';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function AdminLessonsPage() {
  usePageMeta('Admin Lessons — SunoBolo English', '');
  const { toast } = useToast();
  const [rows, setRows] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [courseFilter, setCourseFilter] = useState('all');
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Lesson>>({ title: '', emoji: '📄', description: '', courseId: 'beginner', isFree: false });
  const [saving, setSaving] = useState(false);

  const db = getDB();
  const filtered = courseFilter === 'all' ? rows : rows.filter((l) => l.courseId === courseFilter);
  const courseTitle = (id: string) => db.courses.find((c) => c.id === id)?.title ?? id;

  const refresh = async () => {
    try {
      setRows(await adminService.getAllLessons());
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

  const save = async () => {
    if (!form.title?.trim()) return toast('Title required hai.', 'error');
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateLesson(editing.id, form);
        toast('Lesson update ho gaya ✅');
      } else {
        await adminService.addLesson(form);
        toast('Lesson add ho gaya ✅');
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

  const remove = async (l: Lesson) => {
    if (window.confirm(`"${l.title}" delete karein? Iske saare sentences bhi delete honge.`)) {
      try {
        await adminService.deleteLesson(l.id);
        toast('Lesson delete ho gaya.', 'info');
        await refresh();
      } catch {
        toast('Delete fail ho gaya.', 'error');
      }
    }
  };

  if (loading) return <LoadingState label="Lessons load ho rahe hain…" />;
  if (error) return <ErrorState onRetry={refresh} />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Lessons ({filtered.length})</h2>
        <div className="flex">
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} aria-label="Filter by course">
            <option value="all">All courses</option>
            {db.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <Button
            onClick={() => {
              setForm({ title: '', emoji: '📄', description: '', courseId: courseFilter !== 'all' ? courseFilter : 'beginner', isFree: false });
              setCreating(true);
            }}
          >
            + Add Lesson
          </Button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Course</th>
              <th>Order</th>
              <th>Sentences</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td>
                  <strong>{l.emoji} {l.title}</strong>
                  <div className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{l.description}</div>
                </td>
                <td>{courseTitle(l.courseId)}</td>
                <td>{l.order}</td>
                <td>{l.sentenceCount}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => { setForm({ ...l }); setEditing(l); }}>Edit</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => remove(l)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? `Edit: ${editing.title}` : 'Add Lesson'}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="field">
          <label>Course</label>
          <select value={form.courseId ?? 'beginner'} onChange={(e) => setForm({ ...form, courseId: e.target.value })} disabled={!!editing}>
            {db.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Title</label>
          <input value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="flex">
          <div className="field grow">
            <label>Emoji</label>
            <input value={form.emoji ?? ''} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </div>
          <div className="field">
            <label>Order</label>
            <input type="number" value={form.order ?? 1} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
      </Modal>
    </div>
  );
}
