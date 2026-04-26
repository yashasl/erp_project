import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, FolderOpen, Calendar, Users, ArrowRight } from 'lucide-react';

const statusColor = (s) => ({ Planning: '#64748b', Active: '#3b82f6', 'On Hold': '#f59e0b', Completed: '#10b981' }[s] || '#64748b');
const statusBg = (s) => ({ Planning: '#f8fafc', Active: '#eff6ff', 'On Hold': '#fffbeb', Completed: '#f0fdf4' }[s] || '#f8fafc');

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '', status: 'Planning' });
  const canCreate = ['Admin', 'Manager'].includes(user?.role);

  useEffect(() => {
    API.get('/projects').then(res => setProjects(res.data)).catch(console.error);
  }, []);

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '', status: 'Planning' });
      toast.success('Project created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.heading}>Projects</h2>
            <p style={styles.sub}>{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
          {canCreate && <button style={styles.btn} onClick={() => setShowModal(true)}><Plus size={16} /> New Project</button>}
        </div>

        {projects.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}><FolderOpen size={36} color="#93c5fd" /></div>
            <p style={styles.emptyTitle}>No projects yet</p>
            <p style={styles.emptySub}>{canCreate ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map(p => (
              <div key={p._id} style={styles.card} onClick={() => navigate(`/projects/${p._id}`)}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${statusColor(p.status)}, ${statusColor(p.status)}44)`, borderRadius: '12px 12px 0 0', margin: '-20px -20px 16px' }} />
                <div style={styles.cardTop}>
                  <span style={{ ...styles.statusBadge, color: statusColor(p.status), background: statusBg(p.status) }}>{p.status}</span>
                  {user?.role === 'Admin' && (
                    <button style={styles.deleteBtn} onClick={e => handleDeleteProject(e, p._id)}><Trash2 size={14} /></button>
                  )}
                </div>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardDesc}>{p.description || 'No description provided.'}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.metaItem}><Users size={12} /> {p.members?.length || 0} members</span>
                  {p.deadline && <span style={styles.metaItem}><Calendar size={12} /> {new Date(p.deadline).toLocaleDateString()}</span>}
                  <span style={styles.viewLink}>Open <ArrowRight size={12} /></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h3 style={styles.modalTitle}>New Project</h3>
                  <p style={styles.modalSub}>Fill in the project details below</p>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Project Name *</label>
                  <input style={styles.input} placeholder="e.g. ERP System v2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Description</label>
                  <textarea style={{ ...styles.input, resize: 'vertical' }} rows={3} placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={styles.row}>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label style={styles.label}>Deadline</label>
                    <input style={styles.input} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div style={{ ...styles.field, flex: 1 }}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {['Planning', 'Active', 'On Hold', 'Completed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button style={styles.submitBtn} type="submit">Create Project →</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f0f4ff' },
  main: { flex: 1, padding: '32px 36px', animation: 'fadeIn 0.4s ease' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  heading: { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#64748b', fontSize: 14, marginTop: 6 },
  btn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(59,130,246,0.3)' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  card: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(59,130,246,0.07)', border: '1px solid #e0eaff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, transition: 'box-shadow 0.2s, transform 0.15s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  deleteBtn: { background: '#fff5f5', border: '1px solid #fee2e2', cursor: 'pointer', color: '#ef4444', borderRadius: 8, padding: '4px 6px', display: 'flex' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 },
  cardDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' },
  viewLink: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', fontWeight: 600, marginLeft: 'auto' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' },
  modal: { background: '#fff', borderRadius: 20, padding: 32, width: 480, boxShadow: '0 24px 64px rgba(59,130,246,0.15)', border: '1px solid #e0eaff' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 },
  modalSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  closeBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', borderRadius: 8, padding: 6, display: 'flex' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 16px rgba(59,130,246,0.3)', marginTop: 4 },
};

export default Projects;
