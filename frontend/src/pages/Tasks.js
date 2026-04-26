import { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { CheckSquare, Clock, Circle, Calendar, FolderOpen } from 'lucide-react';

const priorityColor = (p) => ({ High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[p] || '#94a3b8');
const priorityBg = (p) => ({ High: '#fef2f2', Medium: '#fffbeb', Low: '#f0fdf4' }[p] || '#f8fafc');
const statusColor = (s) => ({ Todo: '#64748b', 'In Progress': '#3b82f6', Done: '#10b981' }[s] || '#64748b');
const statusBg = (s) => ({ Todo: '#f8fafc', 'In Progress': '#eff6ff', Done: '#f0fdf4' }[s] || '#f8fafc');
const statusIcon = (s) => ({ Todo: <Circle size={14} />, 'In Progress': <Clock size={14} />, Done: <CheckSquare size={14} /> }[s]);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/tasks/my').then(res => setTasks(res.data)).catch(console.error);
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      toast.success('Status updated!');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    All: tasks.length,
    Todo: tasks.filter(t => t.status === 'Todo').length,
    'In Progress': tasks.filter(t => t.status === 'In Progress').length,
    Done: tasks.filter(t => t.status === 'Done').length,
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h2 style={styles.heading}>My Tasks</h2>
            <p style={styles.sub}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
          </div>
        </div>

        <div style={styles.filters}>
          {['All', 'Todo', 'In Progress', 'Done'].map(f => (
            <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }} onClick={() => setFilter(f)}>
              {f}
              <span style={{ ...styles.filterCount, background: filter === f ? 'rgba(255,255,255,0.3)' : '#f1f5f9', color: filter === f ? '#fff' : '#64748b' }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}><CheckSquare size={36} color="#93c5fd" /></div>
            <p style={styles.emptyTitle}>{filter === 'All' ? 'No tasks assigned yet' : `No ${filter} tasks`}</p>
            <p style={styles.emptySub}>Tasks assigned to you will appear here.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map(task => (
              <div key={task._id} style={styles.card}>
                <div style={{ ...styles.statusStrip, background: statusColor(task.status) }} />
                <div style={styles.cardLeft}>
                  <div style={{ color: statusColor(task.status), marginTop: 2 }}>{statusIcon(task.status)}</div>
                  <div style={styles.cardContent}>
                    <div style={styles.cardTop}>
                      <h4 style={styles.title}>{task.title}</h4>
                      <span style={{ ...styles.priorityBadge, color: priorityColor(task.priority), background: priorityBg(task.priority) }}>{task.priority}</span>
                    </div>
                    {task.description && <p style={styles.desc}>{task.description}</p>}
                    <div style={styles.cardMeta}>
                      <span style={styles.projectTag}><FolderOpen size={12} /> {task.project?.name}</span>
                      {task.deadline && <span style={styles.metaItem}><Calendar size={12} /> {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <select
                  style={{ ...styles.statusSelect, color: statusColor(task.status), background: statusBg(task.status), border: `1.5px solid ${statusColor(task.status)}33` }}
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, e.target.value)}
                >
                  {['Todo', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f0f4ff' },
  main: { flex: 1, padding: '32px 36px', animation: 'fadeIn 0.4s ease' },
  topBar: { marginBottom: 24 },
  heading: { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub: { color: '#64748b', fontSize: 14, marginTop: 6 },
  filters: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  filterActive: { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: '1.5px solid transparent', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
  filterCount: { padding: '1px 7px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#94a3b8' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(59,130,246,0.06)', border: '1px solid #e0eaff', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' },
  statusStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '14px 0 0 14px' },
  cardLeft: { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, paddingLeft: 8 },
  cardContent: { flex: 1 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 },
  priorityBadge: { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  desc: { fontSize: 13, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 },
  cardMeta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  projectTag: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#3b82f6', fontWeight: 600 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' },
  statusSelect: { padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none', flexShrink: 0 },
};

export default Tasks;
