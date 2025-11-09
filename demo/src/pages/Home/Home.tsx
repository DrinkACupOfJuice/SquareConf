import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar'; // 引入Sidebar组件
import './home.css'; // 仅保留主内容区域样式

// 定义对话类型（与Sidebar组件一致）
interface Dialog {
  id: string;
  title: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(''); // 存储输入框内容

  // 对话列表数据（传递给Sidebar组件）
  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  // 跳转至chat页面（发送逻辑）
  const goToChat = () => {
    navigate('/chat', { state: { input: inputValue } });
  };

  return (
    <div className="container">
      <Sidebar dialogs={dialogs} />
      <main className="main-area">
        <div className="input-section">
          <textarea 
            type="text" 
            className="input-box" 
            placeholder="输入内容..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && goToChat()}
          />
          <div className='button-group'>
            <button className="attach-btn">发送附件</button>
            <button className="send-btn" onClick={goToChat}>
              发送
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;