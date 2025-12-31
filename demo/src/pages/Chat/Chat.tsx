// src/pages/Chat/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './chat.css';

import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/Chatinput';
import RatingModal from '../../components/RatingModal/RatingModal';
import { SessionJob, MessageInfo } from '../../components/SessionJob/SessionJob';
import { getAllSessions } from '../../api/seesionsListApi';
import SessionMessages from '../../components/SessionMessage/SessionMessage';

/* ================= 类型 ================= */

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string;
  thinkingTime?: number;
  tokenCount?: number;
  file?: { id?: string; name?: string; url?: string };
}

// 与API返回的Session类型保持一致
interface SessionSummary {
  id: string;
  name: string;
  timestamp: number;
  latest_job_id: string;
  knowledgebase_id?: string;
}

/* ================= 组件 ================= */

const Chat: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  /** URL 无 sessionId 兜底 */
  useEffect(() => {
    if (!sessionId) navigate('/home', { replace: true });
  }, [sessionId]);

  if (!sessionId) return null;

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const [job, setJob] = useState<SessionJob>(() => new SessionJob(sessionId));

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const chatInputRef = useRef<{ setInput: (v: string) => void } | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialRef = useRef(false);

  /* ======= sessionId 变化处理 ======= */
  useEffect(() => {
    if (sessionId === activeSessionId) return;

    setActiveSessionId(sessionId);
    setJob(new SessionJob(sessionId));
    setMessages([]);
    hasSentInitialRef.current = false;
  }, [sessionId]);

  /* ======= 获取会话列表 ======= */
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const list = await getAllSessions();
        setSessions(list || []);
      } catch (err) {
        console.error('获取会话列表失败', err);
      }
    };
    loadSessions();
  }, []);

  /* ======= 接收 Home 首条消息 ======= */
  useEffect(() => {
    const state = location.state as { initialMessage?: string; initialFile?: any } | null;
    if (state?.initialMessage && !hasSentInitialRef.current && job) {
      hasSentInitialRef.current = true;
      handleSend(state.initialMessage);
    }
  }, [location.state, job]);

  /* ======= 滚动 ======= */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ======= 工具 ======= */
  const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const typeWriterAI = (text: string, thinking = 0, tokens = 0) => {
    const id = `ai-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id, sender: 'assistant', content: '', time: now(), thinkingTime: thinking, tokenCount: tokens }
    ]);
    let i = 0;
    const timer = setInterval(() => {
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, content: text.slice(0, ++i) } : m))
      );
      if (i >= text.length) clearInterval(timer);
    }, 30);
  };

  /* ======= 发送消息 ======= */
  const handleSend = async (
    inputVal?: string,
    uploadedFile?: { id?: string; name?: string; url?: string } | null
  ) => {
    let content = inputVal ? inputVal.trim() : inputValue.trim();
    if (!content && !uploadedFile) return;

    if (uploadedFile) {
      content = content ? `${content}\n📄 上传文件：${uploadedFile.name}` : `📄 上传文件：${uploadedFile.name}`;
    }

    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', content, time: now(), file: uploadedFile || undefined }
    ]);

    if (!inputVal) setInputValue('');

    try {
      const res: MessageInfo = await job.sendMessage(content);
      typeWriterAI(res.payload, res.thinkingTime, res.tokenCount);
    } catch {
      typeWriterAI('发送失败，请稍后再试');
    }
  };

  /* ======= 打开评分弹窗 ======= */
  const openRating = () => {
    setIsRatingOpen(true);
    setRatingScore('');
    setRatingComment('');
    setScoreError('');
  };

  const submitRating = () => {
    const n = Number(ratingScore);
    if (!ratingScore || isNaN(n) || n < 1 || n > 100) {
      setScoreError('请输入1-100之间的数字');
      return;
    }

    setIsRatingOpen(false);

    setMessages(prev => [
      ...prev,
      {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        content: '感谢你的评价！我们会持续改进体验～',
        time: now(),
        thinkingTime: 0.5,
        tokenCount: 15
      }
    ]);
  };

  /* ======= 渲染 ======= */
  return (
    <div className="container">
      <Sidebar />

      <div className="chat-container">
        {/* 消息列表 - 合并历史消息和实时消息 */}
        <div className="message-list">
          {/* 历史消息 */}
          <SessionMessages sessionId={activeSessionId} />
          
          {/* 实时消息 */}
          {messages.map(m => (
            <div key={m.id} className={`message ${m.sender}`}>
              <div className="bubble">
                <div className="bubble-content">{m.content}</div>
                <div className="bubble-meta">
                  {m.sender === 'assistant'
                    ? `思考 ${m.thinkingTime?.toFixed(1)}s • ${m.tokenCount} token`
                    : m.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* 输入框 + 快捷动作 */}
        <div className="input-area">
          <ChatInput
            ref={chatInputRef}
            placeholder="请输入消息..."
            onSend={handleSend}
            quickActions={[
              { label: '快速提问', onClick: () => chatInputRef.current?.setInput('请介绍一下核心功能') },
              { label: '文件咨询', onClick: () => chatInputRef.current?.setInput('请解析这个文件') },
              { label: '评价体验', onClick: openRating }
            ]}
          />
        </div>

        {/* 评分弹窗 */}
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSubmit={submitRating}
        />
      </div>
    </div>
  );
};

export default Chat;
