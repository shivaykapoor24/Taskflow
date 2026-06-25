import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../services/api';
import { Badge, Avatar, Button, Empty, PageLoader } from '../UI';
import { formatDate, isOverdue } from '../../utils/date';

export default function Dashboard() {
  const { projects, fetchProjects, selectProject, loadingProjects } = useProjects();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [myTasks, setMyTasks]   = useState([]);
  const [loadingT, setLoadingT] = useState(true);

  useEffect(() => {
    fetchProjects();
    tasksAPI.myTasks().then(d => setMyTasks(d.tasks || [])).catch(() => setMyTasks([])).finally(() => setLoadingT(false));
  }, []);

  if (loadingProjects) return <PageLoader />;

  const totalDone = projects.reduce((s, p) => s + (p.taskCount?.done || 0), 0);
  const totalAll  = projects.reduce((s, p) => s + (p.taskCount?.total || 0), 0);
  const totalOver = projects.reduce((s, p) => s + (p.taskCount?.overdue || 0), 0);
  const totalIP   = projects.reduce((s, p) => s + (p.taskCount?.inProgress || 0), 0);
  const pct       = totalAll ? Math.round(totalDone / totalAll * 100) : 0;
  const h         = new Date().getHours();
  const greet     = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const upcoming  = myTasks.filter(t => t.status !== 'done').sort((a,b) => new Date(a.dueDate||'9999') - new Date(b.dueDate||'9999')).slice(0, 6);

  const Stat = ({ label, value, sub, color, pct: p }) => (
    <div style={{ background:'#fff', borderRadius:8, padding:'14px 16px', border:'1px solid #E5E5E3' }}>
      <div style={{ fontSize:12, color:'#6B6B66', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:600, color: color || '#1A1A18' }}>{value}</div>
      <div style={{ fontSize:11, color:'#A3A39E', marginTop:2 }}>{sub}</div>
      {p !== undefined && <div style={{ marginTop:8, height:4, background:'#F5F5F4', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:`${p}%`, background: color || '#534AB7', borderRadius:2 }} /></div>}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', background:'#fff', borderBottom:'1px solid #E5E5E3', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:16, fontWeight:600 }}>Good {greet}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ fontSize:13, color:'#6B6B66', marginTop:2 }}>{upcoming.length > 0 ? `You have ${upcoming.length} task${upcoming.length > 1 ? 's' : ''} coming up` : 'Everything looks good today!'}</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/projects')}>＋ New project</Button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          <Stat label="Total projects" value={projects.length} sub="active workspaces" />
          <Stat label="Completed" value={totalDone} sub={`${pct}% completion rate`} color="#1D9E75" pct={pct} />
          <Stat label="In progress" value={totalIP} sub="tasks active now" color="#534AB7" />
          <Stat label="Overdue" value={totalOver} sub={totalOver > 0 ? 'needs attention' : 'all on track'} color={totalOver > 0 ? '#A32D2D' : '#1D9E75'} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>My upcoming tasks</h2>
              <Button size="sm" variant="ghost" onClick={() => navigate('/my-tasks')}>View all →</Button>
            </div>
            {loadingT ? <div style={{ textAlign:'center', padding:20 }}><div style={{ width:20, height:20, border:'2px solid #E5E5E3', borderTopColor:'#534AB7', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto' }} /></div>
            : upcoming.length === 0 ? <Empty icon="🎉" title="No tasks assigned to you" />
            : upcoming.map(t => (
              <div key={t._id} onClick={() => { selectProject(t.project); navigate(`/board/${t.project?._id || t.project}`); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #E5E5E3', cursor:'pointer' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: t.project?.color || '#534AB7', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize:11, color:'#A3A39E' }}>{t.project?.name}</div>
                </div>
                <Badge type="priority" value={t.priority} />
                {t.dueDate && <span style={{ fontSize:11, color: isOverdue(t.dueDate) ? '#A32D2D' : '#A3A39E', whiteSpace:'nowrap' }}>{formatDate(t.dueDate)}</span>}
              </div>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>Projects</h2>
              <Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>View all →</Button>
            </div>
            {projects.length === 0 ? <Empty icon="📁" title="No projects yet" action={<Button variant="primary" size="sm" onClick={() => navigate('/projects')}>Create project</Button>} />
            : projects.slice(0, 5).map(p => {
              const done = p.taskCount?.done || 0, total = p.taskCount?.total || 0, pp = total ? Math.round(done/total*100) : 0;
              return (
                <div key={p._id} onClick={() => { selectProject(p); navigate(`/board/${p._id}`); }} style={{ marginBottom:12, cursor:'pointer', padding:6, borderRadius:8 }}
                  onMouseEnter={e => e.currentTarget.style.background='#F5F5F4'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:16 }}>{p.emoji || '📁'}</span>
                    <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{p.name}</span>
                    <span style={{ fontSize:11, color:'#A3A39E' }}>{done}/{total} · {pp}%</span>
                  </div>
                  <div style={{ height:4, background:'#F5F5F4', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pp}%`, background: p.color || '#534AB7', borderRadius:2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
