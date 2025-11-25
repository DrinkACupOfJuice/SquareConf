import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/Chatinput';
import './home.css';

interface Dialog {
  id: string;
  title: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 对话框数据（保持不变）
  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  // 处理输入框的发送事件
  const handleSend = (inputValue: string, uploadedFile: { id?: string; name?: string } | null) => {
    // 发送后跳转到 chat 页面，传递数据
    navigate('/chat', { state: { input: inputValue, file: uploadedFile } });
  };

  return (
    <div className="container">
      <Sidebar dialogs={dialogs} activeKey="/home" />

      <main className="home-main">
        <div className="home-input-title">有什么我可以帮你的？</div>
        <ChatInput
          placeholder="输入内容..."
          onSend={handleSend}
        />
      </main>
    </div>
  );
};

export default Home;