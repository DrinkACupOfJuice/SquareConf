// src/components/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionList from '../SessionList/SessionList';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const newState = !prev;
      localStorage.setItem("sidebarExpanded", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} transition-enabled`}>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-expanded={isSidebarExpanded}>
        {isSidebarExpanded ? '◀' : '▶'}
      </button>

      <div className="nav-buttons">
        <button className={`setting-btn ${location.pathname === '/home' ? 'active' : ''}`} onClick={() => navigate('/home')} title="首页">
          <span className="btn-icon">🏠</span><span className="btn-text">首页</span>
        </button>
        <button className={`setting-btn ${location.pathname === '/manager' ? 'active' : ''}`} onClick={() => navigate('/manager')} title="评价">
          <span className="btn-icon">⭐</span><span className="btn-text">评价</span>
        </button>
        <button className={`setting-btn ${location.pathname === '/knowledge-base' ? 'active' : ''}`} onClick={() => navigate('/knowledge-base')} title="知识库管理">
          <span className="btn-icon">📚</span><span className="btn-text">知识库管理</span>
        </button>
      </div>

      <SessionList isSidebarExpanded={isSidebarExpanded} />
    </aside>
  );
};

export default Sidebar;



