import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface Dialog {
  id: string;
  title: string;
}

interface SidebarProps {
  dialogs?: Dialog[];
  activeKey?: string; // 当前页面，用于设置 active 样式
}

const Sidebar: React.FC<SidebarProps> = ({ dialogs = [], activeKey }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // 整体侧边栏收起/展开
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(true); // 历史对话收起/展开
  const [isReady, setIsReady] = useState<boolean>(false);
  const [activeDialogId, setActiveDialogId] = useState<string>('');
  const [hasMounted, setHasMounted] = useState(false);
  const historyContentRef = useRef<HTMLDivElement>(null);

  const currentKey = activeKey || location.pathname;

  // 切换整体侧边栏收起/展开
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
    setIsReady(true);
  };

  // 切换历史对话收起/展开
  const toggleHistory = () => {
    setIsHistoryExpanded(!isHistoryExpanded);
  };

  const handleDialogClick = (id: string) => setActiveDialogId(id);

  const goHome = () => navigate('/home');
  const goManager = () => navigate('/manager');
  const goKnowledgeBase = () => navigate('/knowledge-base');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 历史对话面板高度动画（侧边栏收起时强制隐藏）
  useEffect(() => {
    const content = historyContentRef.current;
    if (!content) return;

    if (!hasMounted) {
      content.style.transition = 'none';
    } else {
      content.style.transition = 'height 0.3s ease';
    }

    // 仅当侧边栏展开 + 历史对话展开时才显示高度
    if (isHistoryExpanded && isSidebarExpanded) {
      content.style.height = `${content.scrollHeight}px`;
    } else {
      content.style.height = '0px';
    }
  }, [isHistoryExpanded, dialogs, hasMounted, isSidebarExpanded]);

  return (
    <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
      {/* 侧边栏收起/展开按钮 */}
      <button 
        className="sidebar-toggle-btn" 
        onClick={toggleSidebar}
        aria-expanded={isSidebarExpanded}
      >
        {isSidebarExpanded ? '◀' : '▶'}
      </button>

      {/* 导航按钮（收起时完全隐藏文字，仅留图标） */}
      <div className="nav-buttons">
        <button 
          className={`setting-btn ${currentKey === '/home' ? 'active' : ''}`} 
          onClick={goHome}
          title="首页" // 收起时hover显示提示文字
        >
          <span className="btn-icon">🏠</span>
          <span className="btn-text">首页</span>
        </button>
        <button 
          className={`setting-btn ${currentKey === '/manager' ? 'active' : ''}`} 
          onClick={goManager}
          title="评价"
        >
          <span className="btn-icon">⭐</span>
          <span className="btn-text">评价</span>
        </button>
        <button 
          className={`setting-btn ${currentKey === '/knowledge-base' ? 'active' : ''}`} 
          onClick={goKnowledgeBase}
          title="知识库管理"
        >
          <span className="btn-icon">📚</span>
          <span className="btn-text">知识库管理</span>
        </button>
      </div>

      {/* 历史对话面板（收起时完全隐藏文字和列表） */}
      {dialogs.length > 0 && (
        <div className="history-panel">
          <div className="panel-header">
            <button 
              className="collapse-btn" 
              onClick={toggleHistory} 
              aria-expanded={isHistoryExpanded}
              disabled={!isSidebarExpanded} // 侧边栏收起时禁用按钮
              title={isSidebarExpanded ? '展开/收起历史对话' : '请先展开侧边栏'}
            >
              <span className="panel-title">历史对话</span>
              {/* 仅保留箭头图标，文字随侧边栏状态显示/隐藏 */}
            </button>
          </div>
          {/* 侧边栏收起时完全隐藏列表容器 */}
          {isSidebarExpanded && (
            <div className="panel-content" ref={historyContentRef}>
              <ul className={`dialog-list ${isReady ? 'ready' : ''}`}>
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