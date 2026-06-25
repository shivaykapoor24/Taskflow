import React from 'react';

export function Button({ children, variant = 'default', size = 'md', loading, className = '', style = {}, ...props }) {
  const base = { display:'inline-flex', alignItems:'center', gap:'6px', borderRadius:'var(--radius-md,8px)', border:'1px solid', fontWeight:500, cursor: props.disabled || loading ? 'not-allowed' : 'pointer', opacity: props.disabled || loading ? 0.6 : 1, transition:'all .15s', whiteSpace:'nowrap', fontFamily:'inherit' };
  const variants = {
    default: { background:'#fff', borderColor:'#E5E5E3', color:'#1A1A18' },
    primary: { background:'#534AB7', borderColor:'#534AB7', color:'#fff' },
    danger:  { background:'#FCEBEB', borderColor:'#A32D2D', color:'#A32D2D' },
    ghost:   { background:'transparent', borderColor:'transparent', color:'#6B6B66' },
    success: { background:'#E1F5EE', borderColor:'#1D9E75', color:'#1D9E75' },
  };
  const sizes = { sm:{ padding:'4px 10px', fontSize:'12px' }, md:{ padding:'7px 14px', fontSize:'13px' }, lg:{ padding:'10px 20px', fontSize:'14px' } };
  return <button style={{ ...base, ...variants[variant], ...sizes[size], ...style }} className={className} {...props}>{loading && <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'currentColor', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }} />}{children}</button>;
}

export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:4 }}>{label}</label>}
      <input style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:`1px solid ${error?'#A32D2D':'#E5E5E3'}`, background:'#F9F9F8', color:'#1A1A18', fontSize:13, fontFamily:'inherit', outline:'none', ...style }} {...props} />
      {error && <p style={{ fontSize:11, color:'#A32D2D', marginTop:3 }}>{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:4 }}>{label}</label>}
      <select style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E5E5E3', background:'#F9F9F8', color:'#1A1A18', fontSize:13, fontFamily:'inherit', outline:'none' }} {...props}>{children}</select>
      {error && <p style={{ fontSize:11, color:'#A32D2D', marginTop:3 }}>{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, rows = 3, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:4 }}>{label}</label>}
      <textarea rows={rows} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E5E5E3', background:'#F9F9F8', color:'#1A1A18', fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none' }} {...props} />
      {error && <p style={{ fontSize:11, color:'#A32D2D', marginTop:3 }}>{error}</p>}
    </div>
  );
}

const PRI = { high:{ background:'#FCEBEB', color:'#791F1F' }, medium:{ background:'#FAEEDA', color:'#633806' }, low:{ background:'#EAF3DE', color:'#27500A' } };
const STA = { todo:{ background:'#F0F0EE', color:'#555552' }, 'in-progress':{ background:'#EEEDFE', color:'#3C3489' }, review:{ background:'#FEF5E7', color:'#7A4D04' }, done:{ background:'#E1F5EE', color:'#085041' } };
const STA_LABELS = { todo:'To do', 'in-progress':'In progress', review:'In review', done:'Done' };
export function Badge({ type = 'priority', value }) {
  const s = type === 'priority' ? PRI[value] : STA[value];
  return <span style={{ ...s, display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:500, whiteSpace:'nowrap' }}>{type === 'status' ? (STA_LABELS[value] || value) : value}</span>;
}

const AV_COLORS = [{ bg:'#EEEDFE', cl:'#3C3489' },{ bg:'#E1F5EE', cl:'#085041' },{ bg:'#FAEEDA', cl:'#633806' },{ bg:'#E6F1FB', cl:'#0C447C' },{ bg:'#FAECE7', cl:'#712B13' }];
export function Avatar({ user, size = 28 }) {
  if (!user) return null;
  const idx = user.name ? user.name.charCodeAt(0) % AV_COLORS.length : 0;
  const { bg, cl } = AV_COLORS[idx];
  const init = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color:cl, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:500, flexShrink:0, border:'2px solid #fff' }} title={user.name}>{init}</div>;
}

export function Modal({ children, onClose, title, width = 480 }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose?.()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:24, width, maxWidth:'95vw', maxHeight:'88vh', overflowY:'auto', border:'1px solid #E5E5E3', boxShadow:'0 4px 24px rgba(0,0,0,.12)' }}>
        {title && <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:600 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:'#A3A39E', cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>}
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon = '📋', title, subtitle, action }) {
  return (
    <div style={{ textAlign:'center', padding:'52px 20px', color:'#A3A39E' }}>
      <div style={{ fontSize:36, marginBottom:10 }}>{icon}</div>
      <p style={{ fontSize:14, fontWeight:500, color:'#6B6B66', marginBottom:4 }}>{title}</p>
      {subtitle && <p style={{ fontSize:13, marginBottom:16 }}>{subtitle}</p>}
      {action}
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:28, height:28, border:'3px solid #E5E5E3', borderTopColor:'#534AB7', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      <p style={{ color:'#A3A39E', fontSize:13 }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = { success:'#1D9E75', error:'#A32D2D', info:'#534AB7' };
  React.useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:2000, background:'#fff', border:`1px solid ${colors[type]}`, borderLeft:`4px solid ${colors[type]}`, borderRadius:8, padding:'10px 16px', boxShadow:'0 4px 12px rgba(0,0,0,.1)', fontSize:13, display:'flex', alignItems:'center', gap:10, maxWidth:360 }}>
      <span style={{ color:colors[type], fontWeight:600 }}>{type==='success'?'✓':type==='error'?'✕':'ℹ'}</span>
      <span style={{ flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'#A3A39E', fontSize:16, cursor:'pointer' }}>✕</button>
    </div>
  );
}
