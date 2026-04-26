import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, MessageCircle, Trash2, ArrowLeft, Calendar, User } from 'lucide-react';

const priorityColor = (p) => ({ High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[p] || '#94a3b8');
const priorityBg = (p) => ({ High: '#fef2f2', Medium: '#fffbeb', Low: '#f0fdf4' }[p] || '#f8fafc');
const statusColor = (s) => ({ Todo: '#64748b', 'In Progress': '#3b82f6', Done: '#10b981' }[s] || '#64748b');
const statusBg = (s) => ({ Todo: '#f8fafc', 'In Progress': '#eff6ff', Done: '#f0fdf4' }[s] || '#f8fafc');
const projectStatusColor = (s) => ({ Planning: '#64748b', Active: '#3b82f6', 'On Hold': '#f59e0b', Completed: '#10b981' }[s] || '#64748b');

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', deadline: '', assignedTo: '' });
  const canManage = ['Admin', 'Manager'].includes(user?.role);

  useEffect(() => {
    API.get(`/projects/${id}`).then(res => setProject(res.data)).catch(console.error);
    API.get(`/projects/${id}/tasks`).then(res => setTasks(res.data)).catch(console.error);
    if (canManage) API.get('/auth/users').then(res => setUsers(res.data)).catch(console.error);
  }, [id, canManage]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/projects/${id}/tasks`, taskForm);
      setTasks([...tasks, res.data]);
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', status: 'Todo', deadline: '', assignedTo: '' });
      toast.success('Task created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      if (selectedTask?._id === taskId) setSelectedTask(res.data);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted!');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleAddComment = async (taskId) => {
    if (!comment.trim()) return;
    try {
      const res = await API.post(`/tasks/${taskId}/comments`, { text: comment });
      setSelectedTask(prev => ({ ...prev, comments: res.data }));
      setComment('');
    } catch { toast.error('Failed to add comment'); }
  };

  const handleAddMember = async (userId) => {
    try {
      const res = await API.post(`/projects/${id}/members`, { userId });
      setProject(res.data);
      toast.success('Member added!');
    } catch { toast.error('Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const res = await API.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
      toast.success('Member removed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (!project) return <div style={styles.layout}><Sidebar /><div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={styles.spinner} /></div></div>;

  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const sc = projectStatusColor(project.status);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>
        <button style={styles.backBtn} onClick={() => navigate('/projects')}><ArrowLeft size={15} /> Back to Projects</button>

        <div style={styles.projectBanner}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${sc}, ${sc}44)`, borderRadius: '16px 16px 0 0', margin: '-24px -24px 20px' }} />
          <div style={styles.bannerContent}>
            <div style={styles.bannerLeft}>
              <div style={styles.bannerTitleRow}>
                <h2 style={styles.heading}>{project.name}</h2>
                <span style={{ ...styles.statusBadge, color: sc, background: sc + '18' }}>{project.status}</span>
              </div>
              {project.description && <p style={styles.desc}>{project.description}</p>}
              {project.deadline && <span style={styles.deadlineTag}><Calendar size={13} /> {new Date(project.deadline).toLocaleDateString()}</span>}
            </div>
            <div style={styles.progressBox}>
              <div style={styles.progressTop}>
                <span style={styles.progressLabel}>Progress</span>
                <span style={styles.progressPct}>{progress}%</span>
              </div>
              <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
              <p style={styles.progressSub}>{doneTasks}/{tasks.length} tasks done</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h4 style={styles.sectionTitle}>Team Members <span style={styles.countBadge}>{project.members?.length || 0}</span></h4>
            {canManage && (
              <select style={styles.addSelect} onChange={e => e.target.value && handleAddMember(e.target.value)} value="">
                <option value="">+ Add Member</option>
                {users.filter(u => !project.members?.find(m => m._id === u._id)).map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            )}
          </div>
          <div style={styles.membersList}>
            {project.members?.map(m => {
              const rc = { Admin: '#ef4444', Manager: '#f59e0b', Developer: '#10b981' }[m.role] || '#64748b';
              const initials = m.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={m._id} style={styles.memberChip}>
                  <div style={{ ...styles.memberAvatar, background: `linear-gradient(135deg, ${rc}, ${rc}bb)` }}>{initials}</div>
                  <div>
                    <div style={styles.memberName}>{m.name}</div>
                    <div style={{ fontSize: 11, color: rc, fontWeight: 600 }}>{m.role}</div>
                  </div>
                  {canManage && !(user?.role === 'Manager' && m.role === 'Admin') && (
                    <button onClick={() => handleRemoveMember(m._id)} style={styles.removeBtn}><X size={11} /></button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h4 style={styles.sectionTitle}>Tasks <span style={styles.countBadge}>{tasks.length}</span></h4>
            {canManage && <button style={styles.btn} onClick={() => setShowTaskModal(true)}><Plus size={15} /> New Task</button>}
          </div>
          {tasks.length === 0 ? (
            <div style={styles.emptyTasks}>No tasks yet. {canManage ? 'Create the first one!' : ''}</div>
          ) : (
            <div style={styles.taskGrid}>
              {tasks.map(task => (
                <div key={task._id} style={styles.taskCard} onClick={() => setSelectedTask(task)}>
                  <div style={styles.taskCardTop}>
                    <span style={{ ...styles.priorityTag, color: priorityColor(task.priority), background: priorityBg(task.priority) }}>{task.priority}</span>
                    {canManage && <button style={styles.taskDeleteBtn} onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); }}><Trash2 size={13} /></button>}
                  </div>
                  <h4 style={styles.taskTitle}>{task.title}</h4>
                  {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                  <div style={styles.taskMeta}>
                    {task.assignedTo && <span style={styles.assignee}><User size={11} /> {task.assignedTo.name}</span>}
                    {task.deadline && <span style={styles.taskDeadline}><Calendar size={11} /> {new Date(task.deadline).toLocaleDateString()}</span>}
                  </div>
                  <div style={styles.taskFooter}>
                    <select style={{ ...styles.statusSelect, color: statusColor(task.status), background: statusBg(task.status), border: `1px solid ${statusColor(task.status)}33` }} value={task.status} onClick={e => e.stopPropagation()} onChange={e => handleStatusChange(task._id, e.target.value)}>
                      {['Todo', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span style={styles.commentCount}><MessageCircle size={12} /> {task.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showTaskModal && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div><h3 style={styles.modalTitle}>New Task</h3><p style={styles.modalSub}>Add a task to {project.name}</p></div>
                <button style={styles.closeBtn} onClick={() => setShowTaskModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateTask} style={styles.form}>
                <div style={styles.field}><label style={styles.label}>Title *</label><input style={styles.input} placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required /></div>
                <div style={styles.field}><label style={styles.label}>Description</label><textarea style={{ ...styles.input, resize: 'vertical' }} rows={2} placeholder="Task description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
                <div style={styles.row}>
                  <div style={{ ...styles.field, flex: 1 }}><label style={styles.label}>Priority</label><select style={styles.input} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>{['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}</select></div>
                  <div style={{ ...styles.field, flex: 1 }}><label style={styles.label}>Status</label><select style={styles.input} value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>{['Todo', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}</select></div>
                </div>
                <div style={styles.row}>
                  <div style={{ ...styles.field, flex: 1 }}><label style={styles.label}>Deadline</label><input style={styles.input} type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
                  <div style={{ ...styles.field, flex: 1 }}><label style={styles.label}>Assign To</label><select style={styles.input} value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}><option value="">Select user...</option>{users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}</select></div>
                </div>
                <button style={styles.submitBtn} type="submit">Create Task →</button>
              </form>
            </div>
          </div>
        )}

        {selectedTask && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modal, width: 500 }}>
              <div style={styles.modalHeader}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ ...styles.priorityTag, color: priorityColor(selectedTask.priority), background: priorityBg(selectedTask.priority) }}>{selectedTask.priority}</span>
                    <span style={{ ...styles.priorityTag, color: statusColor(selectedTask.status), background: statusBg(selectedTask.status) }}>{selectedTask.status}</span>
                  </div>
                  <h3 style={styles.modalTitle}>{selectedTask.title}</h3>
                </div>
                <button style={styles.closeBtn} onClick={() => setSelectedTask(null)}><X size={18} /></button>
              </div>
              {selectedTask.description && <p style={{ color: '#64748b', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>{selectedTask.description}</p>}
              {selectedTask.assignedTo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#475569' }}>
                  <User size={14} color="#94a3b8" /> Assigned to <strong>{selectedTask.assignedTo.name}</strong>
                </div>
              )}
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Comments ({selectedTask.comments?.length || 0})</h4>
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {selectedTask.comments?.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No comments yet.</p>}
                {selectedTask.comments?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', flex: 1, border: '1px solid #f1f5f9' }}>
                      <strong style={{ fontSize: 13, color: '#1e293b' }}>{c.user?.name || 'User'}</strong>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: '#64748b' }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...styles.input, flex: 1 }} placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTask._id)} />
                <button style={{ ...styles.btn, padding: '10px 18px' }} onClick={() => handleAddComment(selectedTask._id)}>Post</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f0f4ff' },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto', animation: 'fadeIn 0.4s ease' },
  spinner: { width: 36, height: 36, border: '3px solid #dbeafe', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0, fontWeight: 500 },
  projectBanner: { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(59,130,246,0.07)', border: '1px solid #e0eaff' },
  bannerContent: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  bannerLeft: { flex: 1 },
  bannerTitleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  heading: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  desc: { color: '#64748b', fontSize: 14, marginBottom: 8 },
  deadlineTag: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' },
  progressBox: { background: '#f8fafc', borderRadius: 12, padding: '16px 20px', minWidth: 200, border: '1px solid #e2e8f0' },
  progressTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: 600, color: '#475569' },
  progressPct: { fontSize: 20, fontWeight: 800, color: '#3b82f6' },
  progressTrack: { height: 8, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: 10 },
  progressSub: { fontSize: 12, color: '#94a3b8', margin: 0 },
  section: { background: '#fff', borderRadius: 16, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(59,130,246,0.07)', border: '1px solid #e0eaff' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 },
  countBadge: { background: '#eff6ff', color: '#3b82f6', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 700, marginLeft: 8 },
  addSelect: { padding: '7px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, background: '#f8fafc', color: '#475569', cursor: 'pointer' },
  membersList: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  memberChip: { display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 12, padding: '8px 14px', border: '1px solid #e2e8f0' },
  memberAvatar: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' },
  memberName: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
  removeBtn: { background: '#fff5f5', border: '1px solid #fee2e2', cursor: 'pointer', color: '#ef4444', borderRadius: 6, padding: 4, display: 'flex', marginLeft: 4 },
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(59,130,246,0.25)' },
  emptyTasks: { textAlign: 'center', color: '#94a3b8', padding: '28px 0', fontSize: 14 },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
  taskCard: { background: '#f8fafc', borderRadius: 12, padding: 16, cursor: 'pointer', border: '1.5px solid #e2e8f0', transition: 'border-color 0.15s, box-shadow 0.15s' },
  taskCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priorityTag: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  taskDeleteBtn: { background: '#fff5f5', border: '1px solid #fee2e2', cursor: 'pointer', color: '#ef4444', borderRadius: 6, padding: '3px 5px', display: 'flex' },
  taskTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' },
  taskDesc: { fontSize: 12, color: '#64748b', margin: '0 0 10px', lineHeight: 1.4 },
  taskMeta: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  assignee: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' },
  taskDeadline: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' },
  taskFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusSelect: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' },
  commentCount: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(6px)' },
  modal: { background: '#fff', borderRadius: 20, padding: 32, width: 480, boxShadow: '0 24px 64px rgba(59,130,246,0.15)', border: '1px solid #e0eaff', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 },
  modalSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  closeBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', borderRadius: 8, padding: 6, display: 'flex', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', fontSize: 14, width: '100%', boxSizing: 'border-box' },
  submitBtn: { padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, marginTop: 4, boxShadow: '0 4px 16px rgba(59,130,246,0.3)' },
};

export default ProjectDetail;
