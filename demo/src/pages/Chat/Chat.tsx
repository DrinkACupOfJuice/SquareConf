// src/pages/Chat/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/Chatinput';
import RatingModal from '../../components/RatingModal/RatingModal';
import { SessionJob, MessageInfo } from '../../components/SessionJob/SessionJob';
import { getAllSessions } from '../../api/seesionsListApi';
import SessionMessages from '../../components/SessionMessage/SessionMessage';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string;
  thinkingTime?: number;
  tokenCount?: number;
  file?: { id?: string; name?: string; url?: string };
}

interface SessionSummary {
  session_id: string;
  title: string;
  lastMessageTime?: string;
  messageCount?: number;
}

interface ChatProps {
  sessionId: string;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState(sessionId); // 保持当前会话
  const [job, setJob] = useState<SessionJob>(new SessionJob(sessionId));
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [scoreError, setScoreError] = useState('');
  const [inputValue, setInputValue] = useState('');
  const chatInputRef = useRef<{ setInput: (value: string) => void } | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 修复：外部 sessionId 变化时，需要同步 activeSessionId
  useEffect(() => {
    if (sessionId && sessionId !== activeSessionId) {
      setActiveSessionId(sessionId);
    }
  }, [sessionId]);

  // 格式化时间
  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // 切换会话：job 重新绑定，同时清除实时消息（不影响历史消息）
  useEffect(() => {
    if (!activeSessionId) return;
    setJob(new SessionJob(activeSessionId));
    setMessages([]); // 不删除历史消息（历史消息由 SessionMessages 渲染）
  }, [activeSessionId]);

  // 获取所有会话
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const list = await getAllSessions();
        setSessions(list);
      } catch (err) {
        console.error('获取会话列表失败', err);
      }
    };
    loadSessions();
  }, []);

  // 自动滚动到底部（实时消息区）
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 验证评分
  useEffect(() => {
    if (!ratingScore) return setScoreError('');
    const num = Number(ratingScore);
    setScoreError(isNaN(num) || num < 1 || num > 100 ? '请输入1-100之间的数字' : '');
  }, [ratingScore]);

  // 打字机效果（AI 回复）
  const typeWriterAI = (fullText: string, thinkingTime = 0, tokenCount = 0) => {
    const aiId = `resp-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: aiId, sender: 'assistant', content: '', time: formatTime(new Date()), thinkingTime, tokenCount }
    ]);

    let index = 0;
    const timer = setInterval(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiId
            ? { ...msg, content: fullText.slice(0, index + 1) }
            : msg
        )
      );
      index++;
      if (index >= fullText.length) clearInterval(timer);
    }, 30);
  };

  // 发送消息
  const handleSend = async (
    inputVal?: string,
    uploadedFile?: { id?: string; name?: string; url?: string } | null
  ) => {
    let userContent = inputVal ? inputVal.trim() : inputValue.trim();
    if (!userContent && !uploadedFile) return;

    const hasFile = !!uploadedFile;
    if (hasFile) {
      userContent = userContent
        ? `${userContent}\n📄 上传文件：${uploadedFile?.name}`
        : `📄 上传文件：${uploadedFile?.name}`;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: userContent,
      time: formatTime(new Date()),
      file: uploadedFile || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    if (!inputVal) setInputValue('');

    try {
      const aiRes: MessageInfo = await job.sendMessage(userContent);
      typeWriterAI(aiRes.payload, aiRes.thinkingTime, aiRes.tokenCount);
    } catch (err) {
      console.error('发送消息失败', err);
      typeWriterAI('抱歉，消息发送失败，请稍后重试。');
    }
  };

  // 评分操作
  const openRating = () => {
    setIsRatingOpen(true);
    setRatingScore('');
    setRatingComment('');
    setScoreError('');
  };

  const closeRating = () => setIsRatingOpen(false);

  const submitRating = () => {
    const num = Number(ratingScore);
    if (!ratingScore || isNaN(num) || num < 1 || num > 100) {
      setScoreError('请输入1-100之间的数字');
      return;
    }

    closeRating();

    setMessages(prev => [
      ...prev,
      {
        id: `resp-${Date.now()}`,
        sender: 'assistant',
        content: '感谢你的宝贵评价！我们会根据你的反馈持续优化产品体验～',
        time: formatTime(new Date()),
        thinkingTime: 0.5,
        tokenCount: 15
      }
    ]);
  };

  return (
    <div className="container">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
      />

      <div className="chat-container">

        {/* 加载历史消息（SessionMessage 接入成功） */}
        <SessionMessages sessionId={activeSessionId} />

        {/* 实时消息 */}
        <div className="message-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="bubble">
                <div className="bubble-content">{msg.content}</div>
                <div className="bubble-meta">
                  {msg.sender === 'assistant'
                    ? `思考${msg.thinkingTime?.toFixed(1)}s • 调用${msg.tokenCount}token`
                    : msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="input-area">
          <ChatInput
            ref={chatInputRef}
            placeholder="请输入消息...（支持上传文件，Ctrl+Enter换行）"
            onSend={handleSend}
            quickActions={[
              { label: '快速提问', onClick: () => chatInputRef.current?.setInput('请介绍一下核心功能') },
              { label: '文件咨询', onClick: () => chatInputRef.current?.setInput('请解析这个文件的内容') },
              { label: '评价一下本次使用如何', onClick: openRating }
            ]}
          />
        </div>

        {/* 评分 */}
        <RatingModal
          isOpen={isRatingOpen}
          onClose={closeRating}
          onSubmit={(score, comment) => {
            setRatingScore(score);
            setRatingComment(comment);
            submitRating();
          }}
        />
      </div>
    </div>
  );
};

export default Chat;