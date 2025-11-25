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

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [activeDialogId, setActiveDialogId] = useState<string>('');
  const [hasMounted, setHasMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentKey = activeKey || location.pathname;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setIsReady(true);
  };

  const handleDialogClick = (id: string) => setActiveDialogId(id);

  const goHome = () => navigate('/home');
  const goManager = () => navigate('/manager');
  const goKnowledgeBase = () => navigate('/knowledge-base');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (!hasMounted) {
      content.style.transition = 'none';
    } else {
      content.style.transition = 'height 0.3s ease';
    }

    if (isExpanded) {
      content.style.height = `${content.scrollHeight}px`;
    } else {
      content.style.height = '0px';
    }
  }, [isExpanded, dialogs, hasMounted]);

  return (
    <aside className="sidebar">
      <button className={`setting-btn ${currentKey === '/home' ? 'active' : ''}`} onClick={goHome}>首页</button>
      <button className={`setting-btn ${currentKey === '/manager' ? 'active' : ''}`} onClick={goManager}>评价</button>
      <button className={`setting-btn ${currentKey === '/knowledge-base' ? 'active' : ''}`} onClick={goKnowledgeBase}>知识库管理</button>

      {dialogs.length > 0 && (
        <div className="history-panel">
          <div className="panel-header">
            <button className="collapse-btn" onClick={toggleExpand} aria-expanded={isExpanded}>
              历史对话
            </button>
          </div>
          <div className="panel-content" ref={contentRef}>
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
        </div>
      )}
    </aside>
  );
};

export default Sidebar;