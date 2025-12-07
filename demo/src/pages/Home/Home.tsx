import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/ChatInput';
import './home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [greetingText, setGreetingText] = useState('');
  const typingRef = useRef<number | null>(null);
  // 新增：标记是否已开始打字（用于控制占位框显示）
  const [isTypingStarted, setIsTypingStarted] = useState(false);

  // 打字速度（毫秒/字），可调整
  const typingSpeed = 150;

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

    const greeting = getGreeting();
    setGreetingText(greeting);
    // 问候语获取完成后，标记开始打字（触发占位框切换）
    setIsTypingStarted(true);
  }, []);

  // 完整文本（问候语 + 原文本）
  const fullText = `${greetingText}有什么我可以帮你的？`;

  // 处理输入框的发送事件
  const handleSend = (inputValue: string, uploadedFile: { id?: string; name?: string } | null) => {
    navigate('/chat', { state: { input: inputValue, file: uploadedFile } });
  };

  // 打字机效果逻辑（保持不变）
  useEffect(() => {
    if (!greetingText || !isTypingStarted) return;

    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    if (currentIndex < fullText.length) {
      typingRef.current = window.setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
    }

    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, [currentIndex, fullText, typingSpeed, greetingText, isTypingStarted]);

  return (
    <div className="container">
      {/* Sidebar 自包含会话列表 */}
      <Sidebar />

      <main className="home-main">
        {/* 关键改动：添加占位框容器，通过 isTypingStarted 控制显示 */}
        <div className="typing-container">
          {/* 打字未开始时：显示透明占位框（与最终文本框样式一致） */}
          {!isTypingStarted && (
            <div className="home-input-title typing-placeholder"></div>
          )}
          {/* 打字开始后：显示打字机效果（保持原有逻辑） */}
          {isTypingStarted && (
            <div className="home-input-title typing-animation">
              {displayText}
              {/* 打字光标 - 仅在打字中显示（可选优化） */}
              {currentIndex < fullText.length && (
                <span className="typing-cursor"></span>
              )}
            </div>
          )}
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
