import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface Dialog {
  id: string;
  title: string;
}

interface SidebarProps {
  dialogs?: Dialog[];
  activeKey?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ dialogs = [], activeKey }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 初始化时从 localStorage 读取状态
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved ? JSON.parse(saved) : true; // 默认展开
  });

  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [activeDialogId, setActiveDialogId] = useState<string>('');
  const [hasMounted, setHasMounted] = useState(false);
  const historyContentRef = useRef<HTMLDivElement>(null);

  const currentKey = activeKey || location.pathname;

  const toggleSidebar = () => {
    setIsSidebarExpanded(prev => {
      const newState = !prev;
      localStorage.setItem("sidebarExpanded", JSON.stringify(newState)); // 🚀 保存收起状态
      return newState;
    });
  };

  const toggleHistory = () => setIsHistoryExpanded(prev => !prev);

  const handleDialogClick = (id: string) => setActiveDialogId(id);

  const handleNavClick = (path: string) => {
    navigate(path);
    // ❌ 不修改 isSidebarExpanded
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const content = historyContentRef.current;
    if (!content) return;

    content.style.transition = hasMounted ? 'height 0.3s ease' : 'none';

    if (isHistoryExpanded && isSidebarExpanded) {
      content.style.height = `${content.scrollHeight}px`;
    } else {
      content.style.height = '0px';
    }
  }, [isHistoryExpanded, dialogs, hasMounted, isSidebarExpanded]);

  return (
    <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'} transition-enabled`}>
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-expanded={isSidebarExpanded}
      >
        {isSidebarExpanded ? '◀' : '▶'}
      </button>

      <div className="nav-buttons">
        <button
          className={`setting-btn ${currentKey === '/home' ? 'active' : ''}`}
          onClick={() => handleNavClick('/home')}
          title="首页"
        >
          <span className="btn-icon">
            <img src="/home.png" alt="home" className="btn-icon-img" />
          </span>
          <span className="btn-text">首页</span>
        </button>

        <button
          className={`setting-btn ${currentKey === '/manager' ? 'active' : ''}`}
          onClick={() => handleNavClick('/manager')}
          title="评价"
        >
          <span className="btn-icon">⭐</span>
          <span className="btn-text">评价</span>
        </button>

        <button
          className={`setting-btn ${currentKey === '/knowledge-base' ? 'active' : ''}`}
          onClick={() => handleNavClick('/knowledge-base')}
          title="知识库管理"
        >
          <span className="btn-icon">📚</span>
          <span className="btn-text">知识库管理</span>
        </button>
      </div>

      {dialogs.length > 0 && (
        <div className="history-panel">
          <div className="panel-header">
            <button
              className="collapse-btn"
              onClick={toggleHistory}
              aria-expanded={isHistoryExpanded}
              disabled={!isSidebarExpanded}
              title={isSidebarExpanded ? '展开/收起历史对话' : '请先展开侧边栏'}
            >
              <span className="panel-title">历史对话</span>
            </button>
          </div>
          {isSidebarExpanded && (
            <div className="panel-content" ref={historyContentRef}>
              <ul className="dialog-list">
                {dialogs.map(d => (
                  <li
                    key={d.id}
                    className={activeDialogId === d.id ? 'active' : ''}
                    onClick={() => handleDialogClick(d.id)}
                    role="button"
                    tabIndex={0}
                  >
                    {d.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;