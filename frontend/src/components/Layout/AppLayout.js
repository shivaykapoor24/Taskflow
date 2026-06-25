import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { Avatar } from '../UI';

const COLORS = ['#534AB7','#1D9E75','#D85A30','#185FA5','#BA7517'];

export default function AppLayout() {
  const { user, logout }   = useAuth();
  const { projects, fetchProjects, selectProject } = useProjects();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const isActive = path => location.pathname === path;
  const isProj   = id   => location.pathname === `/board/${id}`;

  const NavBtn = ({ path, icon, label }) => (
    <button onClick={() => navigate(path)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, border:'none', width:'100%', textAlign:'left', background: isActive(path) ? '#EEEDFE' : 'transparent', color: isActive(path) ? '#534AB7' : '#6B6B66', fontWeight: isActive(path) ? 500 : 400, fontSize:13, cursor:'pointer', transition:'background .15s', fontFamily:'inherit' }}>
      <span style={{ fontSize:16, width:20 }}>{icon}</span>
      {!collapsed && label}
    </button>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <aside style={{ width: collapsed ? 56 : 220, flexShrink:0, background:'#fff', borderRight:'1px solid #E5E5E3', display:'flex', flexDirection:'column', transition:'width .2s', overflow:'hidden' }}>
        <div style={{ padding:'14px 12px', borderBottom:'1px solid #E5E5E3', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {!collapsed && <div><span style={{ fontSize:15, fontWeight:700, color:'#534AB7' }}>⚡ Taskflow</span><div style={{ fontSize:11, color:'#A3A39E', marginTop:1 }}>Project workspace</div></div>}
          <button onClick={() => setCollapsed(c => !c)} style={{ background:'none', border:'none', color:'#A3A39E', fontSize:16, padding:4, borderRadius:6, cursor:'pointer', marginLeft: collapsed ? 'auto' : 0 }}>{collapsed ? '▶' : '◀'}</button>
        </div>
        <nav style={{ padding:'8px 8px 0', flex:1, overflowY:'auto' }}>
          <NavBtn path="/"         icon="🏠" label="Dashboard" />
          <NavBtn path="/projects" icon="📁" label="Projects" />
          <NavBtn path="/my-tasks" icon="✅" label="My tasks" />
          <NavBtn path="/calendar" icon="📅" label="Calendar" />
          {!collapsed && projects.length > 0 && (
            <>
              <div style={{ fontSize:11, color:'#A3A39E', textTransform:'uppercase', letterSpacing:'.6px', padding:'14px 10px 4px', fontWeight:500 }}>Projects</div>
              {projects.map((p, i) => (
                <button key={p._id} onClick={() => { selectProject(p); navigate(`/board/${p._id}`); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:8, border:'none', width:'100%', textAlign:'left', background: isProj(p._id) ? '#F5F5F4' : 'transparent', color: isProj(p._id) ? '#1A1A18' : '#6B6B66', fontWeight: isProj(p._id) ? 500 : 400, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background: p.color || COLORS[i % COLORS.length], flexShrink:0 }} />
                  <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize:11, color:'#A3A39E' }}>{p.taskCount?.total || 0}</span>
                </button>
              ))}
              <button onClick={() => navigate('/projects')} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', marginTop:2, borderRadius:8, border:'none', width:'100%', textAlign:'left', background:'transparent', color:'#534AB7', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                <span>＋</span> New project
              </button>
            </>
          )}
        </nav>
        <div style={{ padding:'10px 8px', borderTop:'1px solid #E5E5E3', display:'flex', alignItems:'center', gap:8 }}>
          <Avatar user={user} size={30} />
          {!collapsed && (
            <>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize:11, color:'#A3A39E' }}>{user?.role || 'Admin'}</div>
              </div>
              <button onClick={logout} style={{ background:'none', border:'none', color:'#A3A39E', cursor:'pointer', fontSize:14 }} title="Sign out">↩</button>
            </>
          )}
        </div>
      </aside>
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}
