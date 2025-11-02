import React, { useState, useEffect } from 'react';
import './chat.css';

// 消息类型接口（新增时间、思考时间、token数字段）
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string; // 消息发送时间
  thinkingTime?: number; // AI思考时间（秒），仅AI消息有
  tokenCount?: number; // 调用token数，仅AI消息有
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'assistant', 
      content: '欢迎使用！有什么可以帮你的？', 
      time: formatTime(new Date()),
      thinkingTime: 0.8,
      tokenCount: 12
    },
    { 
      id: '2', 
      sender: 'user', 
      content: '请问如何使用这个功能？', 
      time: formatTime(new Date(Date.now() - 1000 * 30)) // 模拟30秒前发送
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState<string>('');
  const [ratingComment, setRatingComment] = useState('');
  const [scoreError, setScoreError] = useState('');

  // 格式化时间为 "HH:MM:SS"
  function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  // 验证评分
  useEffect(() => {
    if (!ratingScore) {
      setScoreError('');
      return;
    }
    const num = Number(ratingScore);
    if (isNaN(num) || num < 1 || num > 100) {
      setScoreError('请输入1-100之间的数字');
    } else {
      setScoreError('');
    }
  }, [ratingScore]);

  // 模拟AI思考过程（随机1-3秒）
  const simulateAIChat = (userContent: string): Promise<{ content: string; thinkingTime: number; tokenCount: number }> => {
    return new Promise((resolve) => {
      const thinkingTime = Math.floor(Math.random() * 2000) + 1000; // 1-3秒
      setTimeout(() => {
        // 模拟AI回复内容（根据用户问题匹配）
        let aiContent = '';
        let tokenCount = 0;
        
        if (userContent.includes('使用')) {
          aiContent = '你可以通过输入框发送消息与我互动，点击"评价一下本次使用如何"可提交评分和反馈，发送后我会及时回复你～';
          tokenCount = Math.floor(aiContent.length * 0.7); // 粗略估算token数（1汉字≈0.7token）
        } else if (userContent.includes('评分')) {
          aiContent = '评分范围是1-100分，你可以在弹窗中输入分数并填写详细评价，提交后会同步到系统中哦';
          tokenCount = Math.floor(aiContent.length * 0.7);
        } else {
          aiContent = '感谢你的消息！如果你有具体的问题或需求，可以详细说明，我会尽力为你解答～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        }

        resolve({
          content: aiContent,
          thinkingTime: thinkingTime / 1000, // 转换为秒
          tokenCount
        });
      }, thinkingTime);
    });
  };

  // 消息发送逻辑（新增AI回复）
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // 1. 添加用户消息
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: inputValue,
      time: formatTime(new Date())
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // 2. 模拟AI思考并回复
    const aiResponse = await simulateAIChat(inputValue);
    const aiMessage: Message = {
      id: `resp-${Date.now()}`,
      sender: 'assistant',
      content: aiResponse.content,
      time: formatTime(new Date()),
      thinkingTime: aiResponse.thinkingTime,
      tokenCount: aiResponse.tokenCount
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  // 打开评价弹窗
  const openRating = () => {
    setIsRatingOpen(true);
    setRatingScore('');
    setRatingComment('');
    setScoreError('');
  };

  // 关闭评价弹窗
  const closeRating = () => {
    setIsRatingOpen(false);
  };

  // 提交评价
  const submitRating = () => {
    const num = Number(ratingScore);
    if (!ratingScore) {
      setScoreError('请输入评分');
      return;
    }
    if (isNaN(num) || num < 1 || num > 100) {
      setScoreError('请输入1-100之间的数字');
      return;
    }
    
    console.log('提交评价：', {
      评分: num,
      详细评价: ratingComment
    });
    closeRating();

    // 评价提交后，AI自动回复
    const aiMessage: Message = {
      id: `resp-${Date.now()}`,
      sender: 'assistant',
      content: '感谢你的宝贵评价！我们会根据你的反馈持续优化产品体验～',
      time: formatTime(new Date()),
      thinkingTime: 0.5,
      tokenCount: 15
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="chat-container">
      {/* 消息列表区域 */}
      <div className="message-list">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender}`}
          >
            <div className="avatar"></div>
            <div className="bubble">
              <div className="bubble-content">{msg.content}</div>
              <div className="bubble-meta">
                {msg.time}
                {/* AI消息额外显示思考时间和token数 */}
                {msg.sender === 'assistant' && (
                  <span className="ai-meta">
                    • 思考{msg.thinkingTime?.toFixed(1)}s • 调用{msg.tokenCount}token
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <div className="input-section">
        <button className="rating-btn" onClick={openRating}>
          评价一下本次使用如何
        </button>
        <div className="input-row">
          <input
            type="text"
            className="input-box"
            placeholder="请输入"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend}>
            发送
          </button>
        </div>
      </div>

      {/* 评价弹窗（带详细评价） */}
      {isRatingOpen && (
        <div className="rating-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeRating}>×</button>
            <h3 className="modal-title">请评价</h3>
            
            {/* 评分输入 */}
            <div className="rating-input-group">
              <label className="rating-label">评分（1-100）：</label>
              <input
                type="text"
                className={`rating-input ${scoreError ? 'error' : ''}`}
                placeholder="输入1-100的数字"
                value={ratingScore}
                onChange={(e) => setRatingScore(e.target.value.replace(/[^\d]/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && submitRating()}
              />
              {scoreError && <div className="error-message">{scoreError}</div>}
            </div>

            {/* 详细评价输入 */}
            <div className="comment-input-group">
              <label className="comment-label">详细评价：</label>
              <textarea
                className="comment-input"
                placeholder="请输入您的详细评价（可选）"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeRating}>取消</button>
              <button className="submit-btn" onClick={submitRating}>提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;