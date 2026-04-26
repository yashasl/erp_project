import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/auth/login', data);
      login(res.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      {/* Left - Image Panel */}
      <div style={styles.left}>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
          alt="Team collaboration"
          style={styles.bgImage}
        />
        <div style={styles.overlay} />
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>⚡</div>
            <span style={styles.logoText}>Mini ERP</span>
          </div>
          <h1 style={styles.heroTitle}>Manage your team<br />projects with ease.</h1>
          <p style={styles.heroSub}>A powerful ERP system built for modern teams. Track projects, assign tasks, and collaborate in real-time.</p>
          <div style={styles.stats}>
            {[{ val: '10+', label: 'Projects' }, { val: '50+', label: 'Tasks' }, { val: '3', label: 'Roles' }].map(s => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statVal}>{s.val}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.avatarRow}>
            <img src="https://api.dicebear.com/7.x/shapes/svg?seed=erp&backgroundColor=dbeafe" alt="avatar" style={styles.avatar} />
          </div>
          <h2 style={styles.cardTitle}>Welcome back 👋</h2>
          <p style={styles.cardSub}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} placeholder="you@example.com" type="email" {...register('email', { required: true })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input style={styles.input} placeholder="••••••••" type="password" {...register('password', { required: true })} />
            </div>
            <button style={styles.btn} type="submit">Sign In →</button>
          </form>

          <div style={styles.divider}><div style={styles.dividerLine} /><span style={styles.dividerText}>or continue with</span><div style={styles.dividerLine} /></div>

          <div style={styles.socialRow}>
            {['Google', 'GitHub'].map(s => (
              <div key={s} style={styles.socialBtn}>{s === 'Google' ? '🌐' : '🐙'} {s}</div>
            ))}
          </div>

          <p style={styles.footer}>Don't have an account? <Link to="/signup" style={styles.link}>Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex' },
  left: { flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
  bgImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(30,58,138,0.85) 0%, rgba(99,102,241,0.75) 100%)' },
  leftContent: { position: 'relative', zIndex: 1, padding: '60px', width: '100%' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto', paddingBottom: 60 },
  logoBox: { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(255,255,255,0.3)' },
  logoText: { fontSize: 20, fontWeight: 800, color: '#fff' },
  heroTitle: { fontSize: 40, fontWeight: 900, lineHeight: 1.25, color: '#fff', marginBottom: 16 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 40, maxWidth: 400 },
  stats: { display: 'flex', gap: 32 },
  statItem: { textAlign: 'center' },
  statVal: { fontSize: 28, fontWeight: 800, color: '#fff' },
  statLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  right: { width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '48px 40px' },
  card: { width: '100%', background: '#fff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(59,130,246,0.1)', border: '1px solid #e0eaff', animation: 'fadeIn 0.5s ease' },
  avatarRow: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 16, border: '3px solid #dbeafe' },
  cardTitle: { fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6, textAlign: 'center' },
  cardSub: { fontSize: 14, color: '#64748b', marginBottom: 28, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#f8fafc', transition: 'all 0.2s' },
  btn: { padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 16px rgba(59,130,246,0.3)', marginTop: 4 },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#f1f5f9' },
  dividerText: { fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: 10, marginBottom: 20 },
  socialBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', textAlign: 'center' },
  footer: { textAlign: 'center', fontSize: 14, color: '#64748b' },
  link: { color: '#3b82f6', fontWeight: 600 },
};

export default Login;
