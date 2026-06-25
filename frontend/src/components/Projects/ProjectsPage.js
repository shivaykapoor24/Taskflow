import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { Button, Modal, Input, Textarea, Empty, Toast, Avatar } from '../UI';

const EMOJIS = ['🚀','📱','💡','🛍️','⚙️','🎨','📊','🔐','🌐','📝','🏗️','🧪'];
const COLORS  = ['#534AB7','#1D9E75','#D85A30','#185FA5','#BA7517','#993556','#2E7D8C','#5C6BC0'];

export default function ProjectsPage() {
  const { projects, fetchProjects, createProject, deleteProject, selectProject, loadingProjects } = useProjects();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]  = useState(null);
  const [form, setForm]    = useState({ name:'', description:'', emoji:'🚀', color:COLORS[0] });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchProjects(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name.trim()) { setErrors({ name:'Name is required' }); return; }
    setSaving(true);
    try {
      const p = await createProject(form);
      setShowModal(false);
      setForm({ name:'', description:'', emoji:'🚀', color:COLORS[0] });
      setToast({ message:`"${p.name}" created!`, type:'success' });
    } catch (err) {
      setToast({ message: err.error || 'Failed to create project', type:'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await deleteProject(id); setToast({ message:'Project deleted', type:'success' }); }
    catch { setToast({ message:'Failed to delete', type:'error' }); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', background:'#fff', borderBottom:'1px solid #E5E5E3', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <h1 style={{ fontSize:16, fontWeight:600 }}>Projects</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>＋ New project</Button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        {projects.length === 0 && !loadingProjects
          ? <Empty icon="📁" title="No projects yet" subtitle="Create your first project to start managing tasks" action={<Button variant="primary" onClick={() => setShowModal(true)}>Create project</Button>} />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16 }}>
            {projects.map(p => {
              const done = p.taskCount?.done||0, total = p.taskCount?.total||0, pct = total?Math.round(done/total*100):0;
              return (
                <div key={p._id} onClick={() => { selectProject(p); navigate(`/board/${p._id}`); }}
                  style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', padding:18, cursor:'pointer', transition:'border-color .15s,box-shadow .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#CCCCC9'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#E5E5E3'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:`${p.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{p.emoji||'📁'}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:'#6B6B66', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description||'No description'}</div>
                    </div>
                    <button onClick={e => handleDelete(e, p._id)} style={{ background:'none', border:'none', fontSize:14, color:'#A3A39E', cursor:'pointer', padding:2 }} title="Delete">🗑</button>
                  </div>
                  <div style={{ display:'flex', gap:12, fontSize:12, color:'#6B6B66', marginBottom:10 }}>
                    <span>✅ {done}</span><span>⚡ {p.taskCount?.inProgress||0}</span><span>📋 {total}</span>
                    {(p.taskCount?.overdue||0)>0&&<span style={{color:'#A32D2D'}}>⚠ {p.taskCount.overdue}</span>}
                  </div>
                  <div style={{ height:4, background:'#F5F5F4', borderRadius:2, overflow:'hidden', marginBottom:10 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: p.color||'#534AB7', borderRadius:2 }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex' }}>
                      {(p.members||[]).slice(0,4).map((m,i) => <div key={i} style={{ marginLeft:-6 }}><Avatar user={m.user||{name:'?'}} size={24} /></div>)}
                    </div>
                    <span style={{ fontSize:12, color:'#A3A39E' }}>{pct}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
      {showModal && (
        <Modal title="New project" onClose={() => { setShowModal(false); setErrors({}); }}>
          <Input label="Project name *" placeholder="e.g. Customer Portal" value={form.name} onChange={set('name')} error={errors.name} autoFocus />
          <Textarea label="Description" placeholder="What are you building?" rows={2} value={form.description} onChange={set('description')} />
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:6 }}>Emoji</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {EMOJIS.map(e => <button key={e} onClick={() => setForm(f=>({...f,emoji:e}))} style={{ width:34, height:34, borderRadius:8, border:`2px solid ${form.emoji===e?'#534AB7':'#E5E5E3'}`, background: form.emoji===e?'#EEEDFE':'transparent', fontSize:18, cursor:'pointer' }}>{e}</button>)}
            </div>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:6 }}>Color</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {COLORS.map(c => <button key={c} onClick={() => setForm(f=>({...f,color:c}))} style={{ width:28, height:28, borderRadius:'50%', background:c, border:`3px solid ${form.color===c?'#1A1A18':'transparent'}`, cursor:'pointer' }} />)}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <Button onClick={() => { setShowModal(false); setErrors({}); }}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} loading={saving}>Create project</Button>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
