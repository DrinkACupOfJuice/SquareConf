// src/components/Sidebar/Sidebar.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import SessionList from '../SessionList/SessionList';
import GraphDBModal from '../GraphDBModal/GraphDBModal';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved ? JSON.parse(saved) : true;
  });

  /** ✅ 从 URL 中解析当前会话 ID */
  const activeSessionId = useMemo(() => {
    const match = matchPath('/chat/:sessionId', location.pathname);
    return match?.params?.sessionId || '';
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('sidebarExpanded', JSON.stringify(next));
      return next;
    });
  };

  /** 图知识库弹窗开关 */
  const [isGraphDBOpen, setIsGraphDBOpen] = useState(false);

  return (
    <>
      <aside
        className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} transition-enabled`}
      >
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-expanded={isSidebarExpanded}
        >
          {isSidebarExpanded ? '◀' : '▶'}
        </button>

        <div className="nav-buttons">
          <button
            className={`setting-btn ${location.pathname === '/home' ? 'active' : ''}`}
            onClick={() => navigate('/home')}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">首页</span>
          </button>

          <button
            className={`setting-btn ${location.pathname === '/manager' ? 'active' : ''}`}
            onClick={() => navigate('/manager')}
          >
            <span className="btn-icon">⭐</span>
            <span className="btn-text">评价</span>
          </button>

          <button
            className={`setting-btn ${location.pathname === '/knowledge-base' ? 'active' : ''}`}
            onClick={() => navigate('/knowledge-base')}
          >
            <span className="btn-icon">📚</span>
            <span className="btn-text">知识库管理</span>
          </button>

          {/* ✅ 图知识库按钮 */}
          <button
            className="setting-btn"
            onClick={() => setIsGraphDBOpen(true)}
          >
            <span className="btn-icon">🧠</span>
            <span className="btn-text">图知识库</span>
          </button>
        </div>

        <SessionList
          isSidebarExpanded={isSidebarExpanded}
          activeSessionId={activeSessionId}
        />
      </aside>

      <GraphDBModal
        isOpen={isGraphDBOpen}
        onClose={() => setIsGraphDBOpen(false)}
      />
    </>
  );
};

export default Sidebar;
