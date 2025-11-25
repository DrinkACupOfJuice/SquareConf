import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/Chatinput';

// 定义对话类型（与Sidebar组件一致）
interface Dialog {
  id: string;
  title: string;
}

<<<<<<< HEAD
// 消息类型接口（新增时间、思考时间、token数字段、文件字段）
=======
// 对话列表数据（传递给Sidebar组件）
const dialogs: Dialog[] = [
  { id: '1', title: '对话1' },
  { id: '2', title: '对话2' },
  { id: '3', title: '对话3' },
];

// 消息类型接口（新增时间、思考时间、token数字段）
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string; // 消息发送时间
  thinkingTime?: number; // AI思考时间（秒），仅AI消息有
  tokenCount?: number; // 调用token数，仅AI消息有
  file?: { id?: string; name?: string; url?: string }; // 文件信息（可选）
}

// 对话列表数据（传递给Sidebar组件）
const dialogs: Dialog[] = [
  { id: '1', title: '对话1' },
  { id: '2', title: '对话2' },
  { id: '3', title: '对话3' },
];

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
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState<string>('');
  const [ratingComment, setRatingComment] = useState('');
  const [scoreError, setScoreError] = useState('');
  const chatInputRef = useRef<{ setInput: (value: string) => void } | null>(null);

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
  const simulateAIChat = (userContent: string, hasFile: boolean): Promise<{ content: string; thinkingTime: number; tokenCount: number }> => {
    return new Promise((resolve) => {
      const thinkingTime = Math.floor(Math.random() * 2000) + 1000; // 1-3秒
      setTimeout(() => {
        let aiContent = '';
        let tokenCount = 0;
<<<<<<< HEAD
        
        if (hasFile) {
          aiContent = '我已收到你上传的文件！请告诉我你需要对这个文件进行什么操作（如解析内容、转换格式等），我会为你处理～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        } else if (userContent.includes('使用')) {
=======

        if (userContent.includes('使用')) {
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
          aiContent = '你可以通过输入框发送消息与我互动，点击"评价一下本次使用如何"可提交评分和反馈，发送后我会及时回复你～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        } else if (userContent.includes('评分')) {
          aiContent = '评分范围是1-100分，你可以在弹窗中输入分数并填写详细评价，提交后会同步到系统中哦';
          tokenCount = Math.floor(aiContent.length * 0.7);
        } else {
          aiContent = '感谢你的消息！如果你有具体的问题或需求，可以详细说明，我会尽力为你解答～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        }

        resolve({
          content: aiContent,
          thinkingTime: thinkingTime / 1000,
          tokenCount
        });
      }, thinkingTime);
    });
  };

  // 消息发送逻辑（适配 ChatInput）
  const handleSend = async (inputValue: string, uploadedFile: { id?: string; name?: string; url?: string } | null) => {
    let userContent = inputValue.trim();
    const hasFile = !!uploadedFile;
    
    // 拼接文件信息
    if (hasFile) {
      userContent = userContent 
        ? `${userContent}\n📄 上传文件：${uploadedFile.name}` 
        : `📄 上传文件：${uploadedFile.name}`;
    }

    // 添加用户消息
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: userContent,
      time: formatTime(new Date()),
      file: uploadedFile || undefined
    };
    setMessages(prev => [...prev, userMessage]);

    // AI回复
    const aiResponse = await simulateAIChat(inputValue, hasFile);
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

  // 评价相关方法
  const openRating = () => {
    setIsRatingOpen(true);
    setRatingScore('');
    setRatingComment('');
    setScoreError('');
  };

  const closeRating = () => {
    setIsRatingOpen(false);
  };

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
<<<<<<< HEAD
    
    console.log('提交评价：', { 评分: num, 详细评价: ratingComment });
=======

    console.log('提交评价：', {
      评分: num,
      详细评价: ratingComment
    });
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
    closeRating();

    // 评价后AI回复
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
    <div className="container">
<<<<<<< HEAD
      <Sidebar dialogs={dialogs} activeKey="/chat" />
      
=======
      <Sidebar dialogs={dialogs} />
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
      <div className="chat-container">
        {/* 消息列表区域 */}
        <div className="message-list">
          {messages.map((msg) => (
<<<<<<< HEAD
            <div 
              key={msg.id} 
=======
            <div
              key={msg.id}
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
              className={`message ${msg.sender}`}
            >
              <div className="avatar"></div>
              <div className="bubble">
                <div className="bubble-content">{msg.content}</div>
                <div className="bubble-meta">
                  {msg.time}
<<<<<<< HEAD
=======
                  {/* AI消息额外显示思考时间和token数 */}
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
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

<<<<<<< HEAD
        {/* 输入区域（评价按钮 + ChatInput） */}
        <div className="tools-row">
          <button className="rating-btn" onClick={openRating}>
            评价一下本次使用如何
          </button>
        </div>
        
        {/* ChatInput 组件（适配原有样式） */}
        <div className="input-area">
          <ChatInput
            ref={chatInputRef}
            placeholder="请输入消息...（支持上传文件，Ctrl+Enter换行）"
            onSend={handleSend}
            quickActions={[
              { label: '快速提问', onClick: () => chatInputRef.current?.setInput('请介绍一下核心功能') },
              { label: '文件咨询', onClick: () => chatInputRef.current?.setInput('请解析这个文件的内容') }
            ]}
          />
        </div>

        {/* 评价弹窗 */}
=======
        <div>
          <button className="rating-btn" onClick={openRating}>
            评价一下本次使用如何
          </button>
          <div className="uploader-wrapper">
            <FileUploader />
          </div>
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

        {/* 评价弹窗（带滑动条1-100） */}
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
        {isRatingOpen && (
          <div className="rating-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={closeRating}>×</button>
<<<<<<< HEAD
              <h3 className="modal-title">请评价</h3>
              
              <div className="rating-input-group">
                <label className="rating-label">评分（1-100）：</label>
=======
              <h3 className="modal-title">请评价本次使用</h3>

              {/* 滑动条评分 */}
              <div className="rating-input-group">
                <label className="rating-label">评分(1-100)：</label>
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
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
<<<<<<< HEAD

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

=======
              {/* 详细评价输入 */}
              <div className="comment-input-group">
                <label className="comment-label">详细评价（可选）：</label>
                <textarea
                  className="comment-input"
                  placeholder="请输入您的详细评价(最多500字)"
                  value={ratingComment}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setRatingComment(e.target.value);
                    // 自动调整高度
                    const target = e.target;
                    target.style.height = 'auto';           // 重置高度
                    target.style.height = target.scrollHeight + 'px'; // 设置为内容高度
                  }}
                ></textarea>
                <div className="comment-count">{ratingComment.length}/500</div>
              </div>
>>>>>>> 00ab736065a7e590a0a59bfd717b2621729191d9
              <div className="modal-actions">
                <button className="cancel-btn" onClick={closeRating}>取消</button>
                <button className="submit-btn" onClick={submitRating}>提交</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;