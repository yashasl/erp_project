import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    ...(user?.role !== 'Admin' ? [{ to: '/tasks', label: 'My Tasks', icon: <CheckSquare size={18} /> }] : []),
  ];

  const roleColors = { Admin: '#ef4444', Manager: '#f59e0b', Developer: '#10b981' };
  const rc = roleColors[user?.role] || '#3b82f6';
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=${rc.replace('#','')}&textColor=ffffff`;

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoRow}>
        <div style={styles.logoBox}>⚡</div>
        <span style={styles.logoText}>Mini ERP</span>
      </div>

      <div style={styles.userCard}>
        <img src={avatarUrl} alt="avatar" style={styles.avatar} />
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name}</div>
          <span style={{ ...styles.rolePill, background: rc + '18', color: rc }}>{user?.role}</span>
        </div>
      </div>

      <p style={styles.navLabel}>Navigation</p>
      <nav style={styles.nav}>
        {links.map(link => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link key={link.to} to={link.to} style={{ ...styles.link, ...(active ? styles.activeLink : {}) }}>
              <span style={{ color: active ? '#3b82f6' : '#94a3b8' }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.divider} />
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: { width: 240, minHeight: '100vh', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 14px', boxShadow: '2px 0 12px rgba(59,130,246,0.06)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 24 },
  logoBox: { width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' },
  logoText: { fontSize: 18, fontWeight: 800, color: '#1e293b' },
  userCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '12px 14px', marginBottom: 24 },
  avatar: { width: 38, height: 38, borderRadius: 10, border: '2px solid #dbeafe', flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 },
  rolePill: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'inline-block' },
  navLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, margin: '0 6px 10px' },
  nav: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1 },
  link: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
  activeLink: { background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, border: '1px solid #dbeafe' },
  bottom: { marginTop: 'auto' },
  divider: { height: 1, background: '#f1f5f9', margin: '12px 0' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, background: '#fff5f5', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%' },
};

export default Sidebar;
