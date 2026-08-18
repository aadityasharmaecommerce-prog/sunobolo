import { useEffect, useMemo, useState } from 'react';
import type { Sentence } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminService } from '@/services/adminService';
import { getDB } from '@/services/store';
import { useToast } from '@/context/ToastContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';

const EMPTY: Partial<Sentence> = { english: '', hindi: '', difficulty: 'easy', isFree: true };

export function AdminSentencesPage() {
  usePageMeta('Admin Sentences — SunoBolo English', '');
  const { toast } = useToast();
  const db = getDB();
  const [all, setAll] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [editing, setEditing] = useState<Sentence | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Sentence>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setAll(await adminService.getAllSentences());
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

  const rows = useMemo(() => {
    let list = all;
    if (courseFilter !== 'all') list = list.filter((s) => s.courseId === courseFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.english.toLowerCase().includes(q) || s.hindi.includes(q));
    }
    return list.slice(0, 300); // pagination-lite
  }, [all, courseFilter, search]);

  const lessonTitle = (id: string) => db.lessons.find((l) => l.id === id)?.title ?? id;
  const courseTitle = (id: string) => db.courses.find((c) => c.id === id)?.title ?? id;

  const save = async () => {
    if (!form.english?.trim()) return toast('English sentence required hai.', 'error');
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateSentence(editing.id, form);
        toast('Sentence update ho gaya ✅');
      } else {
        await adminService.addSentence(form);
        toast('Sentence add ho gaya ✅');
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

  const remove = async (s: Sentence) => {
    if (window.confirm('Yeh sentence delete karein?')) {
      try {
        await adminService.deleteSentence(s.id);
        toast('Sentence delete ho gaya.', 'info');
        await refresh();
      } catch {
        toast('Delete fail ho gaya.', 'error');
      }
    }
  };

  if (loading) return <LoadingState label="Sentences load ho rahe hain…" />;
  if (error) return <ErrorState onRetry={refresh} />;

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Sentences ({rows.length} shown)</h2>
        <div className="flex">
          <input
            type="search"
            placeholder="Search English/Hindi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search sentences"
          />
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} aria-label="Filter by course">
            <option value="all">All courses</option>
            {db.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <Button
            onClick={() => {
              const firstLesson = db.lessons.find((l) => courseFilter === 'all' || l.courseId === courseFilter);
              setForm({ ...EMPTY, lessonId: firstLesson?.id, courseId: firstLesson?.courseId ?? 'beginner' });
              setCreating(true);
            }}
          >
            + Add Sentence
          </Button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>English</th>
              <th>Hindi</th>
              <th>Lesson</th>
              <th>Difficulty</th>
              <th>Free</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.order}</td>
                <td><strong>{s.english}</strong></td>
                <td>{s.hindi}</td>
                <td>
                  {courseTitle(s.courseId)} / {lessonTitle(s.lessonId)}
                </td>
                <td><Badge variant="neutral">{s.difficulty}</Badge></td>
                <td>{s.isFree ? <Badge variant="free">Free</Badge> : <Badge variant="paid">Paid</Badge>}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => { setForm({ ...s }); setEditing(s); }}>Edit</button>
                    <button className="btn btn--ghost btn--sm" onClick={() => remove(s)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-center text-muted" style={{ padding: 'var(--sp-5)' }}>Koi sentence nahi mila.</p>}
      </div>

      <Modal
        open={creating || !!editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        title={editing ? 'Edit Sentence' : 'Add Sentence'}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="field">
          <label>Lesson</label>
          <select
            value={form.lessonId ?? ''}
            onChange={(e) => {
              const lesson = db.lessons.find((l) => l.id === e.target.value);
              setForm({ ...form, lessonId: e.target.value, courseId: lesson?.courseId ?? 'beginner' });
            }}
            disabled={!!editing}
          >
            {db.lessons.map((l) => (
              <option key={l.id} value={l.id}>{courseTitle(l.courseId)} — {l.title}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>English sentence</label>
          <input value={form.english ?? ''} onChange={(e) => setForm({ ...form, english: e.target.value })} placeholder="My name is Rahul." />
        </div>
        <div className="field">
          <label>Hindi meaning</label>
          <input value={form.hindi ?? ''} onChange={(e) => setForm({ ...form, hindi: e.target.value })} placeholder="मेरा नाम राहुल है।" />
        </div>
        <div className="flex">
          <div className="field grow">
            <label>Difficulty</label>
            <select value={form.difficulty ?? 'easy'} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Sentence['difficulty'] })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="field">
            <label>Order</label>
            <input type="number" value={form.order ?? 1} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
        </div>
        <label className="flex" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={!!form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
          Free sentence
        </label>
      </Modal>
    </div>
  );
}
