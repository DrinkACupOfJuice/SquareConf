import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // 侧边栏专属样式文件

// 定义对话类型（与原Home页面一致）
interface Dialog {
  id: string;
  title: string;
}

// 组件 props 类型：接收对话列表数据
interface SidebarProps {
  dialogs: Dialog[];
}

const Sidebar: React.FC<SidebarProps> = ({ dialogs }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeDialogId, setActiveDialogId] = useState<string>('1');

  // 切换折叠状态
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 切换活跃对话
  const handleDialogClick = (id: string) => {
    setActiveDialogId(id);
  };

  // 跳转至Manager页面（设置逻辑）
  const goToManager = () => {
    navigate('/Manager');
  };

  const goHome = () => {
    navigate('/Home');
  };

  return (
    <aside className="sidebar">
      <button className="setting-btn" onClick={goHome}>
        首页
      </button>
      {/* 历史对话面板 */}
      <div className="history-panel">
        <div className="panel-header">
          <button 
            className="collapse-btn" 
            onClick={toggleExpand}
            aria-expanded={isExpanded}
          >
            历史对话 {isExpanded ? '▼' : '▲'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="panel-content">
            <ul className="dialog-list">
              {dialogs.map(dialog => (
                <li 
                  key={dialog.id}
                  className={activeDialogId === dialog.id ? 'active' : ''}
                  onClick={() => handleDialogClick(dialog.id)}
                  role="button"
                  tabIndex={0}
                >
                  {dialog.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="setting-btn" onClick={goToManager}>
        设置
      </button>
    </aside>
  );
};

export default Sidebar;