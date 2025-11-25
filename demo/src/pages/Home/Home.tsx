import React, { useState, useEffect, useRef } from 'react';
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
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [greetingText, setGreetingText] = useState('');
  const typingRef = useRef<number | null>(null);
  
  // 打字速度（毫秒/字），可调整
  const typingSpeed = 150;

  // 对话框数据（保持不变）
  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  // 根据时间获取问候语
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        return '早上好，';
      } else if (hour >= 12 && hour < 18) {
        return '中午好，';
      } else if (hour >= 18 && hour < 24) {
        return '晚上好，';
      } else {
        return '夜深了，'; // 凌晨时段
      }
    };
    
    setGreetingText(getGreeting());
  }, []);

  // 完整文本（问候语 + 原文本）
  const fullText = `${greetingText}有什么我可以帮你的？`;

  // 处理输入框的发送事件
  const handleSend = (inputValue: string, uploadedFile: { id?: string; name?: string } | null) => {
    // 发送后跳转到 chat 页面，传递数据
    navigate('/chat', { state: { input: inputValue, file: uploadedFile } });
  };

  // 打字机效果逻辑（修改为使用完整文本）
  useEffect(() => {
    // 只有当问候语获取完成后才开始打字（避免空文本）
    if (!greetingText) return;

    // 清除之前的定时器（防止多次触发）
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    // 如果还没打完所有字，继续打字
    if (currentIndex < fullText.length) {
      typingRef.current = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
    }

    // 组件卸载时清除定时器
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [currentIndex, fullText, typingSpeed, greetingText]);

  return (
    <div className="container">
      <Sidebar dialogs={dialogs} activeKey="/home" />

      <main className="home-main">
        {/* 打字机效果标题 - 匹配 home-input-title 样式 */}
        <div className="home-input-title typing-animation">
          {displayText}
          {/* 打字光标 - 适配大字体样式 */}
          <span className="typing-cursor"></span>
        </div>
        <ChatInput
          placeholder="输入内容..."
          onSend={handleSend}
        />
      </main>
    </div>
  );
};

export default Home;