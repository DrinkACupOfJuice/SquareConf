import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/ChatInput';
import { createSession } from '../../api/seesionsListApi';
import './home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [greetingText, setGreetingText] = useState('');
  const [isTypingStarted, setIsTypingStarted] = useState(false);

  const typingRef = useRef<number | null>(null);
  const typingSpeed = 150;

  /* ================= 问候语 + 打字机效果 ================= */

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setGreetingText('早上好，');
    else if (hour >= 12 && hour < 18) setGreetingText('中午好，');
    else if (hour >= 18) setGreetingText('晚上好，');
    else setGreetingText('夜深了，');

    setIsTypingStarted(true);
  }, []);

  const fullText = `${greetingText}有什么我可以帮你的？`;

  useEffect(() => {
    if (!greetingText || !isTypingStarted) return;

    if (typingRef.current) clearTimeout(typingRef.current);

    if (currentIndex < fullText.length) {
      typingRef.current = window.setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
    }

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [currentIndex, fullText, greetingText, isTypingStarted]);

  /* ================= 发送：创建会话 + 跳转 ================= */

  const handleSend = async (
    inputValue: string,
    uploadedFile: { id?: string; name?: string } | null
  ) => {
    if (!inputValue?.trim() && !uploadedFile) return;

    try {
      const res = await createSession('新会话');

      if (!res?.data?.id) {
        console.error('创建会话失败：未返回 sessionId');
        return;
      }

      const sessionId = res.data.id;

      navigate(`/chat/${sessionId}`, {
        state: {
          initialMessage: inputValue,
          initialFile: uploadedFile
        }
      });
    } catch (err) {
      console.error('Home 创建会话失败', err);
    }
  };

  /* ================= 渲染 ================= */

  return (
    <div className="container">
      <Sidebar />

      <main className="home-main">
        <div className="typing-container">
          {isTypingStarted && (
            <div className="home-input-title typing-animation">
              {displayText}
              {currentIndex < fullText.length && (
                <span className="typing-cursor" />
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