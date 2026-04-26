import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Signup = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await API.post('/auth/signup', data);
      login(res.data);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={styles.page}>
      {/* Left - Image Panel */}
      <div style={styles.left}>
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80"
          alt="Team working"
          style={styles.bgImage}
        />
        <div style={styles.overlay} />
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>⚡</div>
            <span style={styles.logoText}>Mini ERP</span>
          </div>
          <h1 style={styles.heroTitle}>Join thousands of<br />productive teams.</h1>
          <p style={styles.heroSub}>Create your account and start managing projects, tasks, and your team — all in one place.</p>
          <div style={styles.roleCards}>
            {[
              { role: 'Admin', desc: 'Full system control', icon: '👑', color: '#fbbf24' },
              { role: 'Manager', desc: 'Lead projects & teams', icon: '🎯', color: '#34d399' },
              { role: 'Developer', desc: 'Work on assigned tasks', icon: '💻', color: '#60a5fa' },
            ].map(r => (
              <div key={r.role} style={styles.roleCard}>
                <span style={styles.roleIcon}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{r.role}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <img src="https://api.dicebear.com/7.x/shapes/svg?seed=signup&backgroundColor=ede9fe" alt="icon" style={styles.topIcon} />
            <h2 style={styles.cardTitle}>Create your account</h2>
            <p style={styles.cardSub}>Get started for free today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} placeholder="John Doe" {...register('name', { required: true })} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} placeholder="you@example.com" type="email" {...register('email', { required: true })} />
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Password</label>
                <input style={styles.input} placeholder="••••••••" type="password" {...register('password', { required: true })} />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Role</label>
                <select style={styles.input} {...register('role')}>
                  <option value="Developer">Developer</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button style={styles.btn} type="submit">Create Account →</button>
          </form>

          <p style={styles.terms}>By signing up, you agree to our <span style={styles.link}>Terms</span> and <span style={styles.link}>Privacy Policy</span>.</p>
          <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex' },
  left: { flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
  bgImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(15,23,42,0.88) 0%, rgba(79,70,229,0.75) 100%)' },
  leftContent: { position: 'relative', zIndex: 1, padding: '60px', width: '100%' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 },
  logoBox: { width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(255,255,255,0.25)' },
  logoText: { fontSize: 20, fontWeight: 800, color: '#fff' },
  heroTitle: { fontSize: 38, fontWeight: 900, lineHeight: 1.25, color: '#fff', marginBottom: 16 },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36, maxWidth: 380 },
  roleCards: { display: 'flex', flexDirection: 'column', gap: 10 },
  roleCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' },
  roleIcon: { fontSize: 20 },
  right: { width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '48px 40px' },
  card: { width: '100%', background: '#fff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(59,130,246,0.1)', border: '1px solid #e0eaff', animation: 'fadeIn 0.5s ease' },
  cardTop: { textAlign: 'center', marginBottom: 28 },
  topIcon: { width: 56, height: 56, borderRadius: 14, border: '2px solid #ede9fe', marginBottom: 14 },
  cardTitle: { fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6 },
  cardSub: { fontSize: 14, color: '#64748b' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#f8fafc', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 16px rgba(59,130,246,0.3)', marginTop: 4 },
  terms: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 },
  footer: { textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 12 },
  link: { color: '#3b82f6', fontWeight: 600, cursor: 'pointer' },
};

export default Signup;
