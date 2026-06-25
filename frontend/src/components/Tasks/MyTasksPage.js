import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../../services/api';
import { useProjects } from '../../context/ProjectContext';
import { Badge, Empty, PageLoader } from '../UI';
import { formatDate, isOverdue } from '../../utils/date';

export default function MyTasksPage() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectProject }     = useProjects();
  const navigate              = useNavigate();

  useEffect(() => {
    tasksAPI.myTasks().then(d => setTasks(d.tasks||[])).catch(()=>setTasks([])).finally(()=>setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const ip   = tasks.filter(t => t.status==='in-progress'||t.status==='review');
  const todo = tasks.filter(t => t.status==='todo');
  const done = tasks.filter(t => t.status==='done');
  const over = tasks.filter(t => t.status!=='done' && isOverdue(t.dueDate));

  const Section = ({ label, items, color }) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:13, fontWeight:600, color, marginBottom:10 }}>{label} <span style={{ fontWeight:400, color:'#A3A39E' }}>({items.length})</span></h2>
        {items.map(t => (
          <div key={t._id} onClick={() => { selectProject(t.project); navigate(`/board/${t.project?._id||t.project}`); }}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#fff', border:'1px solid #E5E5E3', borderRadius:8, marginBottom:6, cursor:'pointer', transition:'border-color .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#CCCCC9'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#E5E5E3'}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: t.project?.color||'#534AB7', flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
              <div style={{ fontSize:11, color:'#A3A39E', marginTop:1 }}>{t.project?.name}</div>
            </div>
            <Badge type="priority" value={t.priority} />
            {t.dueDate && <span style={{ fontSize:11, color: isOverdue(t.dueDate)&&t.status!=='done'?'#A32D2D':'#A3A39E', whiteSpace:'nowrap' }}>📅 {formatDate(t.dueDate)}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', background:'#fff', borderBottom:'1px solid #E5E5E3', flexShrink:0 }}>
        <h1 style={{ fontSize:16, fontWeight:600 }}>My tasks</h1>
        <p style={{ fontSize:13, color:'#6B6B66', marginTop:2 }}>{tasks.length} task{tasks.length!==1?'s':''} assigned to you</p>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        {tasks.length === 0
          ? <Empty icon="🎉" title="No tasks assigned to you" subtitle="Tasks assigned to you across all projects will appear here" />
          : <>
            {over.length>0 && <Section label="⚠ Overdue" items={over} color="#A32D2D" />}
            <Section label="⚡ In progress" items={ip} color="#534AB7" />
            <Section label="📋 To do" items={todo} color="#6B6B66" />
            <Section label="✅ Done" items={done} color="#1D9E75" />
          </>}
      </div>
    </div>
  );
}
