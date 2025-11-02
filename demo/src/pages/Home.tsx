import React, { useState } from 'react';
import './home.css';

// 定义对话类型
interface Dialog {
  id: string;
  title: string;
}

const Home: React.FC = () => {
  // 状态管理
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeDialogId, setActiveDialogId] = useState<string>('1');
  
  // 对话列表数据
  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  // 切换折叠状态
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 切换活跃对话
  const handleDialogClick = (id: string) => {
    setActiveDialogId(id);
  };

  return (
    <div className="container">
      {/* 左侧边栏 */}
      <aside className="sidebar">
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

        {/* 设置按钮 */}
        <button className="setting-btn">设置</button>
      </aside>

      {/* 主内容区域 */}
      <main className="main-area">
        {/* 输入区域 */}
        <div className="input-section">
          <input 
            type="text" 
            className="input-box" 
            placeholder="输入内容..."
          />
          <div>
            <button className="attach-btn">发送附件</button>
            <button className="send-btn">发送</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;