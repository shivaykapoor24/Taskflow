import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { usersAPI } from '../../services/api';
import { Modal, Button, Input, Textarea, Select, Badge, Avatar, Toast } from '../UI';
import { formatDate, isOverdue } from '../../utils/date';

const STATUS_COLS = ['todo','in-progress','review','done'];
const STATUS_LABELS = { todo:'To do','in-progress':'In progress',review:'In review',done:'Done' };
const STATUS_COLORS = { todo:'#888','in-progress':'#534AB7',review:'#BA7517',done:'#1D9E75' };

export function TaskFormModal({ task, projectId, defaultStatus='todo', onClose, onSaved }) {
  const { projects, createTask, updateTask } = useProjects();
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title||'', description: task?.description||'',
    status: task?.status||defaultStatus, priority: task?.priority||'medium',
    projectId: task?.project?._id||task?.project||projectId,
    dueDate: task?.dueDate?task.dueDate.slice(0,10):'',
    assignee: task?.assignee?._id||task?.assignee||'', tags: task?.tags?.join(', ')||'',
  });
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(task?.assignee||null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (memberSearch.length < 2) { setMemberResults([]); return; }
    const t = setTimeout(async () => {
      try { const d = await usersAPI.search(memberSearch); setMemberResults(d.users||[]); }
      catch { setMemberResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [memberSearch]);

  const save = async () => {
    if (!form.title.trim()) { setErrors({ title:'Title is required' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags?form.tags.split(',').map(t=>t.trim()).filter(Boolean):[], assignee: selectedAssignee?._id||form.assignee||undefined, dueDate: form.dueDate||undefined };
      const saved = isEdit ? await updateTask(task._id, payload) : await createTask(payload);
      onSaved?.(saved); onClose();
    } catch (err) { setToast({ message: err.error||'Failed to save task', type:'error' }); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Modal title={isEdit?'Edit task':'New task'} onClose={onClose} width={520}>
        <Input label="Title *" placeholder="What needs to be done?" value={form.title} onChange={set('title')} error={errors.title} autoFocus />
        <Textarea label="Description" placeholder="Add details, links, or context…" rows={3} value={form.description} onChange={set('description')} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Select label="Project" value={form.projectId} onChange={set('projectId')}>
            {projects.map(p => <option key={p._id} value={p._id}>{p.emoji} {p.name}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={set('status')}>
            {STATUS_COLS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={set('priority')}>
            {['high','medium','low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </Select>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:4 }}>Due date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E5E5E3', background:'#F9F9F8', color:'#1A1A18', fontFamily:'inherit', outline:'none' }} />
          </div>
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ display:'block', fontSize:12, color:'#6B6B66', marginBottom:4 }}>Assignee</label>
          {selectedAssignee
            ? <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid #E5E5E3', borderRadius:8, background:'#F9F9F8' }}>
                <Avatar user={selectedAssignee} size={22} />
                <span style={{ fontSize:13, flex:1 }}>{selectedAssignee.name}</span>
                <button onClick={() => { setSelectedAssignee(null); setForm(f=>({...f,assignee:''})); }} style={{ background:'none', border:'none', color:'#A3A39E', cursor:'pointer', fontSize:14 }}>✕</button>
              </div>
            : <div style={{ position:'relative' }}>
                <input placeholder="Search team members…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                  style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid #E5E5E3', background:'#F9F9F8', color:'#1A1A18', fontFamily:'inherit', outline:'none' }} />
                {memberResults.length > 0 && (
                  <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #E5E5E3', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,.1)', zIndex:10, marginTop:2 }}>
                    {memberResults.map(u => (
                      <div key={u._id} onClick={() => { setSelectedAssignee(u); setForm(f=>({...f,assignee:u._id})); setMemberSearch(''); setMemberResults([]); }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background='#F5F5F4'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <Avatar user={u} size={24} />
                        <div><div style={{ fontSize:13, fontWeight:500 }}>{u.name}</div><div style={{ fontSize:11, color:'#A3A39E' }}>{u.email}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          }
        </div>
        <Input label="Tags (comma-separated)" placeholder="frontend, bug, urgent" value={form.tags} onChange={set('tags')} />
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving}>{isEdit?'Save changes':'Create task'}</Button>
        </div>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export function TaskDetailModal({ task, projectId, onClose, onEdit, onDelete }) {
  const { moveTask } = useProjects();
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);

  const changeStatus = async s => {
    if (s === status) return;
    setSaving(true);
    await moveTask(task._id, s);
    setStatus(s);
    setSaving(false);
  };

  return (
    <Modal onClose={onClose} width={500}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[status] }} />
        <span style={{ fontSize:12, color:STATUS_COLORS[status], fontWeight:500 }}>{STATUS_LABELS[status]}</span>
        <Badge type="priority" value={task.priority} />
        <div style={{ flex:1 }} />
        <Button size="sm" onClick={onEdit}>✏ Edit</Button>
        <Button size="sm" variant="danger" onClick={() => { onDelete(task._id); onClose(); }}>🗑 Delete</Button>
      </div>
      <h2 style={{ fontSize:16, fontWeight:600, marginBottom:10, lineHeight:1.4 }}>{task.title}</h2>
      {task.description && <p style={{ fontSize:13, color:'#6B6B66', lineHeight:1.7, marginBottom:16 }}>{task.description}</p>}
      <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:13, color:'#6B6B66', marginBottom:20, padding:'12px 0', borderTop:'1px solid #E5E5E3', borderBottom:'1px solid #E5E5E3' }}>
        {task.dueDate && <span style={{ color: isOverdue(task.dueDate)&&status!=='done'?'#A32D2D':'inherit' }}>📅 {new Date(task.dueDate).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'})}{isOverdue(task.dueDate)&&status!=='done'?' — Overdue':''}</span>}
        {task.assignee && <span style={{ display:'flex', alignItems:'center', gap:6 }}><Avatar user={task.assignee} size={20} />{task.assignee.name}</span>}
      </div>
      {task.tags?.length > 0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>{task.tags.map(t => <span key={t} style={{ padding:'2px 8px', borderRadius:10, background:'#F5F5F4', fontSize:12, border:'1px solid #E5E5E3' }}>{t}</span>)}</div>}
      <p style={{ fontSize:12, color:'#6B6B66', marginBottom:8 }}>Move to</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
        {STATUS_COLS.map(k => (
          <button key={k} onClick={() => changeStatus(k)} disabled={saving} style={{ padding:'6px 4px', borderRadius:8, border:`1px solid ${status===k?STATUS_COLORS[k]:'#E5E5E3'}`, background: status===k?`${STATUS_COLORS[k]}18`:'transparent', color: status===k?STATUS_COLORS[k]:'#6B6B66', fontSize:11, fontWeight: status===k?600:400, cursor:'pointer', fontFamily:'inherit' }}>
            {STATUS_LABELS[k]}
          </button>
        ))}
      </div>
    </Modal>
  );
}
