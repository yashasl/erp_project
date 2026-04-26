import { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FolderKanban, CheckSquare, Clock, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#10b981'];
const statusColor = (s) => ({ Planning: '#64748b', Active: '#3b82f6', 'On Hold': '#f59e0b', Completed: '#10b981' }[s] || '#64748b');

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.loadingMain}><div style={styles.spinner} /><p style={{ color: '#94a3b8', marginTop: 14 }}>Loading...</p></div>
    </div>
  );

  const completion = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  const barData = [
    { name: 'Todo', value: data.todoTasks },
    { name: 'In Progress', value: data.inProgressTasks },
    { name: 'Done', value: data.completedTasks },
  ];
  const pieData = [
    { name: 'High', value: data.byPriority.High },
    { name: 'Medium', value: data.byPriority.Medium },
    { name: 'Low', value: data.byPriority.Low },
  ];

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.main}>

        {/* Hero Banner */}
        <div style={styles.heroBanner}>
          <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&auto=format&fit=crop&q=60" alt="banner" style={styles.bannerImg} />
          <div style={styles.bannerOverlay} />
          <div style={styles.bannerContent}>
            <div>
              <h2 style={styles.bannerTitle}>Good {getGreeting()}, {user?.name}! 👋</h2>
              <p style={styles.bannerSub}>Here's what's happening with your projects today.</p>
            </div>
            <div style={styles.datePill}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={styles.statsGrid}>
          <StatCard icon={<FolderKanban size={20} />} label="Total Projects" value={data.totalProjects} color="#3b82f6" bg="#eff6ff" />
          <StatCard icon={<CheckSquare size={20} />} label="Completed" value={data.completedTasks} color="#10b981" bg="#f0fdf4" />
          <StatCard icon={<Clock size={20} />} label="In Progress" value={data.inProgressTasks} color="#f59e0b" bg="#fffbeb" />
          <StatCard icon={<TrendingUp size={20} />} label="Completion" value={`${completion}%`} color="#8b5cf6" bg="#faf5ff" />
          {data.totalUsers !== undefined && <StatCard icon={<Users size={20} />} label="Total Users" value={data.totalUsers} color="#06b6d4" bg="#ecfeff" />}
        </div>

        {/* Progress */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Overall Task Completion</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{completion}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${completion}%` }} />
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{data.completedTasks} done · {data.inProgressTasks} in progress · {data.todoTasks} todo</p>
        </div>

        {/* Charts */}
        <div style={styles.chartsRow}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Tasks by Status</span>
              <span style={styles.badge}>{data.totalTasks} total</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={38}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={['#cbd5e1', '#3b82f6', '#10b981'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Tasks by Priority</span>
              <span style={styles.badge}>Priority split</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Recent Projects</span>
            <span style={styles.badge}>{data.recentProjects.length} projects</span>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentProjects.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ ...styles.td, color: '#cbd5e1', width: 36 }}>{i + 1}</td>
                  <td style={styles.td}>
                    <div style={styles.projectRow}>
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=dbeafe&textColor=1d4ed8`} alt="" style={styles.projectIcon} />
                      {p.name}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: statusColor(p.status), background: statusColor(p.status) + '18' }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
    <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>
    <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '10px 0 4px' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
  </div>
);

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f0f4ff' },
  main: { flex: 1, overflowY: 'auto', animation: 'fadeIn 0.4s ease' },
  loadingMain: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36, border: '3px solid #dbeafe', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  heroBanner: { position: 'relative', height: 180, overflow: 'hidden', marginBottom: 28 },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(30,58,138,0.82) 0%, rgba(99,102,241,0.6) 100%)' },
  bannerContent: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px' },
  bannerTitle: { fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  datePill: { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: '#fff' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20, padding: '0 36px' },
  statCard: { background: '#fff', borderRadius: 16, padding: '20px 18px', boxShadow: '0 2px 8px rgba(59,130,246,0.06)', border: '1px solid #e0eaff' },
  statIcon: { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: '22px 24px', marginBottom: 20, marginLeft: 36, marginRight: 36, boxShadow: '0 2px 8px rgba(59,130,246,0.06)', border: '1px solid #e0eaff' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b' },
  badge: { fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 20 },
  progressTrack: { height: 10, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: 10, transition: 'width 0.6s ease' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, padding: '0 36px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 },
  td: { padding: '12px 12px', fontSize: 14, color: '#475569' },
  projectRow: { display: 'flex', alignItems: 'center', gap: 10 },
  projectIcon: { width: 28, height: 28, borderRadius: 8, border: '1px solid #dbeafe' },
};

export default Dashboard;
