import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../../services/api';
import { useProjects } from '../../context/ProjectContext';
import { Button } from '../UI';

export default function CalendarPage() {
  const [tasks, setTasks]  = useState([]);
  const [month, setMonth]  = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [selected, setSelected] = useState(null);
  const { selectProject } = useProjects();
  const navigate = useNavigate();

  useEffect(() => { tasksAPI.myTasks().then(d => setTasks(d.tasks || [])).catch(() => {}); }, []);

  const year = month.getFullYear(), mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const today = new Date();
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const tasksByDate = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    const key = t.dueDate.slice(0,10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const dateKey = d => `${year}-${String(mon+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const selectedTasks = selected ? (tasksByDate[selected] || []) : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', background:'#fff', borderBottom:'1px solid #E5E5E3', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <h1 style={{ fontSize:16, fontWeight:600, flex:1 }}>Calendar</h1>
        <Button size="sm" onClick={() => setMonth(new Date(year, mon-1, 1))}>‹ Prev</Button>
        <span style={{ fontSize:14, fontWeight:500, minWidth:160, textAlign:'center' }}>{month.toLocaleDateString('en',{month:'long',year:'numeric'})}</span>
        <Button size="sm" onClick={() => setMonth(new Date(year, mon+1, 1))}>Next ›</Button>
        <Button size="sm" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</Button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap:20 }}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#F5F5F4' }}>
              {DAYS.map(d => <div key={d} style={{ padding:'8px 0', textAlign:'center', fontSize:11, color:'#A3A39E', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', borderBottom:'1px solid #E5E5E3' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`} style={{ minHeight:80, borderRight:'1px solid #E5E5E3', borderBottom:'1px solid #E5E5E3', background:'#F9F9F8', opacity:.5 }} />)}
              {Array.from({length:daysInMonth},(_,i)=>i+1).map(d => {
                const key = dateKey(d), dayTs = tasksByDate[key] || [];
                const isToday = d===today.getDate() && mon===today.getMonth() && year===today.getFullYear();
                const isSel = selected === key;
                return (
                  <div key={d} onClick={() => setSelected(isSel ? null : key)}
                    style={{ minHeight:80, padding:6, borderRight:'1px solid #E5E5E3', borderBottom:'1px solid #E5E5E3', cursor:'pointer', background: isSel ? '#EEEDFE' : 'transparent' }}
                    onMouseEnter={e => { if(!isSel) e.currentTarget.style.background='#F9F9F8'; }}
                    onMouseLeave={e => { if(!isSel) e.currentTarget.style.background='transparent'; }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: isToday ? '#534AB7' : 'transparent', color: isToday ? '#fff' : '#6B6B66', fontSize:12, fontWeight: isToday ? 600 : 400, marginBottom:4 }}>{d}</div>
                    {dayTs.slice(0,3).map(t => <div key={t._id} style={{ fontSize:10, padding:'1px 5px', borderRadius:3, marginBottom:2, background:`${t.project?.color||'#534AB7'}22`, color: t.project?.color||'#534AB7', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>)}
                    {dayTs.length > 3 && <div style={{ fontSize:10, color:'#A3A39E' }}>+{dayTs.length-3} more</div>}
                  </div>
                );
              })}
            </div>
          </div>
          {selected && (
            <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E5E5E3', padding:16, height:'fit-content' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h3 style={{ fontSize:13, fontWeight:600 }}>{new Date(selected+'T12:00:00').toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})}</h3>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'#A3A39E', cursor:'pointer' }}>✕</button>
              </div>
              {selectedTasks.length === 0 ? <p style={{ fontSize:12, color:'#A3A39E', textAlign:'center', padding:'20px 0' }}>No tasks due</p>
              : selectedTasks.map(t => (
                <div key={t._id} onClick={() => { selectProject(t.project); navigate(`/board/${t.project?._id||t.project}`); }}
                  style={{ padding:'8px 10px', background:'#F9F9F8', borderRadius:8, marginBottom:8, cursor:'pointer', border:'1px solid #E5E5E3' }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{t.title}</div>
                  <div style={{ fontSize:11, color:'#A3A39E' }}>{t.project?.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
