import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Toast } from '../UI';

export default function AuthPage() {
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ name:'', email:'', password:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setToast({ message: err.error || 'Something went wrong', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#F0EFF9 0%,#F5F5F4 60%,#E8F4EF 100%)' }}>
      <div style={{ background:'#fff', borderRadius:12, padding:'36px 40px', width:420, boxShadow:'0 4px 24px rgba(0,0,0,.1)', border:'1px solid #E5E5E3' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>⚡</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#534AB7' }}>Taskflow</h1>
          <p style={{ fontSize:13, color:'#6B6B66', marginTop:4 }}>{mode === 'login' ? 'Sign in to your workspace' : 'Create your free account'}</p>
        </div>
        <div style={{ display:'flex', gap:4, background:'#F5F5F4', borderRadius:8, padding:4, marginBottom:24 }}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); }} style={{ flex:1, padding:'7px 0', borderRadius:6, border:'none', fontSize:13, fontWeight:500, background: mode===m ? '#fff' : 'transparent', color: mode===m ? '#1A1A18' : '#6B6B66', boxShadow: mode===m ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition:'all .15s', cursor:'pointer' }}>
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
        {mode === 'register' && <Input label="Full name" placeholder="Shivay Kapoor" value={form.name} onChange={set('name')} error={errors.name} onKeyDown={e => e.key==='Enter'&&submit()} />}
        <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} onKeyDown={e => e.key==='Enter'&&submit()} />
        <Input label="Password" type="password" placeholder={mode==='register'?'At least 8 characters':'Your password'} value={form.password} onChange={set('password')} error={errors.password} onKeyDown={e => e.key==='Enter'&&submit()} />
        <Button variant="primary" style={{ width:'100%', justifyContent:'center', marginTop:4, padding:'10px' }} onClick={submit} loading={loading}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
        <p style={{ textAlign:'center', fontSize:12, color:'#A3A39E', marginTop:20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode==='login'?'register':'login'); setErrors({}); }} style={{ color:'#534AB7', cursor:'pointer', fontWeight:500 }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
