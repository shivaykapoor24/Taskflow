import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { TaskFormModal, TaskDetailModal } from '../Tasks/TaskModal';
import { Badge, Avatar, Button, Empty, PageLoader, Toast } from '../UI';
import { formatDate, isOverdue } from '../../utils/date';

const COLS = [
  { key:'todo',         label:'To do',       color:'#888780' },
  { key:'in-progress',  label:'In progress',  color:'#534AB7' },
  { key:'review',       label:'In review',    color:'#BA7517' },
  { key:'done',         label:'Done',         color:'#1D9E75' },
];

export default function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, selectProject, activeProject, tasks, fetchTasks, deleteTask, loadingTasks } = useProjects();
  const [view, setView]         = useState('kanban');
  const [taskModal, setTaskModal] = useState(null);
  const [filterPri, setFilterPri] = useState('all');
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    const p = projects.find(x => x._id === projectId);
    if (p) selectProject(p);
    else fetchTasks(projectId);
  }, [projectId, projects.length]);

  const filtered = tasks.filter(t => filterPri === 'all' || t.priority === filterPri);
  const byCol    = key => filtered.filter(t => t.status === key);

  const handleDelete = async id => { await deleteTask(id); setToast({ message:'Task deleted', type:'success' }); };

  if (loadingTasks && tasks.length === 0) return <PageLoader />;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'12px 24px', background:'#fff', borderBottom:'1px solid #E5E5E3', display:'flex', alignItems:'center', gap:12, flexShrink:0, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'#A3A39E', cursor:'pointer' }} onClick={() => navigate('/projects')}>Projects</span>
        <span style={{ color:'#A3A39E' }}>/</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:16 }}>{activeProject?.emoji||'📁'}</span>
          <h1 style={{ fontSize:15, fontWeight:600 }}>{activeProject?.name||'Board'}</h1>
        </div>
        <div style={{ flex:1 }} />
        <div style={{ display:'flex', gap:2, padding:2, background:'#F5F5F4', borderRadius:8 }}>
          {[['kanban','🗂 Kanban'],['list','📋 List'],['timeline','📅 Timeline']].map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'5px 10px', borderRadius:6, border:'none', fontSize:12, fontWeight:500, background: view===v?'#fff':'transparent', color: view===v?'#1A1A18':'#6B6B66', boxShadow: view===v?'0 1px 3px rgba(0,0,0,.08)':'none', cursor:'pointer', fontFamily:'inherit' }}>{l}</button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => setTaskModal({ type:'create' })}>＋ Add task</Button>
      </div>
      <div style={{ padding:'8px 24px', borderBottom:'1px solid #E5E5E3', display:'flex', gap:6, alignItems:'center', flexShrink:0, background:'#F9F9F8' }}>
        <span style={{ fontSize:12, color:'#A3A39E' }}>Priority:</span>
        {['all','high','medium','low'].map(p => (
          <button key={p} onClick={() => setFilterPri(p)} style={{ padding:'3px 10px', borderRadius:10, fontSize:12, border:'1px solid', borderColor: filterPri===p?'#534AB7':'#E5E5E3', background: filterPri===p?'#EEEDFE':'transparent', color: filterPri===p?'#534AB7':'#6B6B66', fontWeight: filterPri===p?500:400, cursor:'pointer', fontFamily:'inherit' }}>
            {p==='all'?'All':p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
        <span style={{ fontSize:12, color:'#A3A39E', marginLeft:'auto' }}>{filtered.length} task{filtered.length!==1?'s':''}</span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:20 }}>
        {view==='kanban' && <KanbanView cols={COLS} byCol={byCol} onAdd={s => setTaskModal({type:'create',defaultStatus:s})} onOpen={t => setTaskModal({type:'detail',task:t})} />}
        {view==='list'   && <ListView tasks={filtered} onOpen={t => setTaskModal({type:'detail',task:t})} onAdd={() => setTaskModal({type:'create'})} />}
        {view==='timeline' && <TimelineView tasks={filtered} onOpen={t => setTaskModal({type:'detail',task:t})} />}
      </div>
      {taskModal?.type==='create' && <TaskFormModal projectId={projectId} defaultStatus={taskModal.defaultStatus} onClose={() => setTaskModal(null)} onSaved={() => setToast({message:'Task created!',type:'success'})} />}
      {taskModal?.type==='edit'   && <TaskFormModal task={taskModal.task} projectId={projectId} onClose={() => setTaskModal(null)} onSaved={() => setToast({message:'Task updated!',type:'success'})} />}
      {taskModal?.type==='detail' && <TaskDetailModal task={taskModal.task} projectId={projectId} onClose={() => setTaskModal(null)} onEdit={() => setTaskModal({type:'edit',task:taskModal.task})} onDelete={handleDelete} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function KanbanView({ cols, byCol, onAdd, onOpen }) {
  return (
    <div style={{ display:'flex', gap:16, height:'100%', overflowX:'auto', paddingBottom:8 }}>
      {cols.map(col => {
        const ts = byCol(col.key);
        return (
          <div key={col.key} style={{ minWidth:240, width:240, flexShrink:0, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'0 2px' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:col.color, flexShrink:0 }} />
              <span style={{ fontSize:13, fontWeight:600, flex:1 }}>{col.label}</span>
              <span style={{ fontSize:11, background:'#F5F5F4', border:'1px solid #E5E5E3', borderRadius:10, padding:'1px 7px', color:'#A3A39E' }}>{ts.length}</span>
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {ts.map(t => <TaskCard key={t._id} task={t} onClick={() => onOpen(t)} />)}
              {ts.length===0 && <div style={{ padding:'20px 0', textAlign:'center', color:'#A3A39E', fontSize:12 }}>No tasks</div>}
            </div>
            <button onClick={() => onAdd(col.key)} style={{ width:'100%', padding:8, border:'1px dashed #E5E5E3', borderRadius:8, background:'none', color:'#A3A39E', fontSize:12, cursor:'pointer', marginTop:6, fontFamily:'inherit', transition:'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#F9F9F8'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              ＋ Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const over = isOverdue(task.dueDate) && task.status !== 'done';
  return (
    <div onClick={onClick} style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:8, padding:'10px 12px', marginBottom:8, cursor:'pointer', transition:'border-color .15s,box-shadow .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='#CCCCC9'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='#E5E5E3'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ fontSize:13, fontWeight:500, marginBottom:8, lineHeight:1.4 }}>{task.title}</div>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        <Badge type="priority" value={task.priority} />
        {task.dueDate && <span style={{ fontSize:11, color: over?'#A32D2D':'#A3A39E', display:'flex', alignItems:'center', gap:2 }}>📅 {formatDate(task.dueDate)}</span>}
        <div style={{ flex:1 }} />
        {task.assignee && <Avatar user={task.assignee} size={22} />}
      </div>
      {task.tags?.length > 0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>{task.tags.slice(0,3).map(tag => <span key={tag} style={{ fontSize:10, padding:'1px 6px', borderRadius:8, background:'#F5F5F4', border:'1px solid #E5E5E3', color:'#A3A39E' }}>{tag}</span>)}</div>}
    </div>
  );
}

function ListView({ tasks, onOpen, onAdd }) {
  const CC = { todo:'#888','in-progress':'#534AB7',review:'#BA7517',done:'#1D9E75' };
  const CL = { todo:'To do','in-progress':'In progress',review:'In review',done:'Done' };
  if (tasks.length === 0) return <Empty icon="📋" title="No tasks yet" subtitle="Add your first task" action={<Button variant="primary" onClick={onAdd}>Add task</Button>} />;
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', overflow:'hidden' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead><tr style={{ background:'#F9F9F8' }}>
          {['Task','Status','Priority','Assignee','Due',''].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, color:'#A3A39E', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', borderBottom:'1px solid #E5E5E3' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {tasks.map((t,i) => (
            <tr key={t._id} onClick={() => onOpen(t)} style={{ cursor:'pointer', borderBottom: i<tasks.length-1?'1px solid #E5E5E3':'none' }}
              onMouseEnter={e => e.currentTarget.style.background='#F9F9F8'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <td style={{ padding:'10px 14px', fontSize:13, fontWeight:500, maxWidth:240, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:11, color:CC[t.status], display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, borderRadius:'50%', background:CC[t.status] }} />{CL[t.status]}</span></td>
              <td style={{ padding:'10px 14px' }}><Badge type="priority" value={t.priority} /></td>
              <td style={{ padding:'10px 14px' }}>{t.assignee?<Avatar user={t.assignee} size={24} />:<span style={{fontSize:12,color:'#A3A39E'}}>—</span>}</td>
              <td style={{ padding:'10px 14px' }}><span style={{ fontSize:12, color: isOverdue(t.dueDate)&&t.status!=='done'?'#A32D2D':'#6B6B66' }}>{formatDate(t.dueDate)||'—'}</span></td>
              <td style={{ padding:'10px 14px', textAlign:'right' }}><span style={{ fontSize:16, color:'#A3A39E' }}>›</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineView({ tasks, onOpen }) {
  const withDates = tasks.filter(t => t.dueDate);
  if (!withDates.length) return <Empty icon="📅" title="No due dates set" subtitle="Add due dates to tasks to see them on the timeline" />;
  const dates = withDates.map(t => new Date(t.dueDate));
  const minD = new Date(Math.min(...dates)), maxD = new Date(Math.max(...dates));
  minD.setDate(minD.getDate()-3); maxD.setDate(maxD.getDate()+7);
  const total = (maxD-minD)/86400000;
  const CC = { todo:'#888','in-progress':'#534AB7',review:'#BA7517',done:'#1D9E75' };
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#A3A39E', marginBottom:12, paddingLeft:160 }}>
        <span>{minD.toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
        <span>{new Date((minD.getTime()+maxD.getTime())/2).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
        <span>{maxD.toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
      </div>
      {withDates.sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).map(t => {
        const offset = (new Date(t.dueDate)-minD)/86400000;
        const left = Math.min(94, Math.round(offset/total*100));
        return (
          <div key={t._id} onClick={() => onOpen(t)} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10, cursor:'pointer' }}>
            <div style={{ width:150, fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flexShrink:0 }}>{t.title}</div>
            <div style={{ flex:1, height:22, background:'#F5F5F4', borderRadius:6, position:'relative', minWidth:200 }}>
              <div style={{ position:'absolute', left:`${left}%`, top:'50%', transform:'translate(-50%,-50%)', background:CC[t.status], color:'#fff', borderRadius:6, padding:'2px 10px', fontSize:11, whiteSpace:'nowrap', fontWeight:500 }}>
                {formatDate(t.dueDate)}
              </div>
            </div>
            <div style={{ width:60, textAlign:'right', flexShrink:0 }}><Badge type="priority" value={t.priority} /></div>
          </div>
        );
      })}
    </div>
  );
}
