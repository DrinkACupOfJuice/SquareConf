import React, { useState, useEffect, useRef } from 'react';
import './chat.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatInput from '../../components/Chatinput/Chatinput';
import RatingModal from '../../components/RatingModal/RatingModal';
import FileUploader from '../../components/Fileuploader/Fileuploader';

// 定义对话类型（与Sidebar组件一致）
interface Dialog {
  id: string;
  title: string;
}

// 消息类型接口（包含所有字段）
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  time: string; // 消息发送时间
  thinkingTime?: number; // AI思考时间（秒），仅AI消息有
  tokenCount?: number; // 调用token数，仅AI消息有
  file?: { id?: string; name?: string; url?: string }; // 文件信息（可选）
}

// 对话列表数据（仅定义一次）
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
  const [inputValue, setInputValue] = useState(''); // 新增inputValue状态
  const chatInputRef = useRef<{ setInput: (value: string) => void } | null>(null);

  // 关键：创建滚动容器的ref
  const messageEndRef = useRef<HTMLDivElement>(null);

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

  // 关键：监听messages变化，自动滚动到底部
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 模拟AI思考过程（扩展更多回复场景）
  const simulateAIChat = (userContent: string, hasFile: boolean): Promise<{ content: string; thinkingTime: number; tokenCount: number }> => {
    return new Promise((resolve) => {
      const thinkingTime = Math.floor(Math.random() * 2000) + 1000; // 1-3秒
      setTimeout(() => {
        let aiContent = '';
        let tokenCount = 0;

        // 1. 有文件上传场景
        if (hasFile) {
          aiContent = '我已收到你上传的文件！支持的操作包括：解析文本内容、提取关键信息、格式转换（如PDF转Word）、数据统计等。请告诉我你的具体需求，我会为你处理～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 2. 功能使用相关
        else if (userContent.includes('使用') || userContent.includes('怎么') || userContent.includes('如何')) {
          if (userContent.includes('文件') || userContent.includes('上传')) {
            aiContent = '上传文件可以点击输入框上方的文件上传按钮，支持PDF、Word、Excel、图片等格式。上传后可以告诉我需要对文件进行的操作，比如解析内容、提取数据等～';
          } else if (userContent.includes('快速提问') || userContent.includes('快捷')) {
            aiContent = '快速提问功能可以直接点击输入框上方的"快速提问"按钮，会自动填充常用问题。你也可以自定义输入问题，支持多轮对话追问哦～';
          } else if (userContent.includes('换行')) {
            aiContent = '在输入框中按 Ctrl+Enter 可以换行，直接按 Enter 会提交发送消息。如果需要输入多行文本，建议使用 Ctrl+Enter 进行换行操作～';
          } else {
            aiContent = '你可以通过输入框发送消息与我互动，支持文本提问、文件上传、多轮对话。点击"评价一下本次使用如何"可提交反馈，发送后我会及时回复你～';
          }
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 3. 评分评价相关
        else if (userContent.includes('评分') || userContent.includes('评价') || userContent.includes('反馈')) {
          aiContent = '评分范围是1-100分，点击输入框上方的"评价一下本次使用如何"即可打开评价弹窗。你可以输入分数并填写详细反馈，我们会根据你的建议持续优化产品～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 4. 产品功能咨询
        else if (userContent.includes('功能') || userContent.includes('能做什么') || userContent.includes('支持')) {
          aiContent = '本工具支持以下功能：\n1. 文本问答（各类问题咨询、知识查询）\n2. 文件处理（解析、转换、数据提取）\n3. 多轮对话（连续追问、上下文理解）\n4. 快速操作（预设问题、快捷指令）\n5. 反馈评价（提交使用体验和建议）\n你可以告诉我具体需求，我会为你提供对应服务～';
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 5. 问题咨询场景
        else if (userContent.includes('问') || userContent.includes('什么') || userContent.includes('？') || userContent.includes('吗')) {
          if (userContent.includes('天气') || userContent.includes('温度')) {
            aiContent = '抱歉，当前版本暂不支持实时天气查询功能～ 你可以咨询其他问题，比如知识科普、文件处理、功能使用等，我会尽力为你解答～';
          } else if (userContent.includes('时间') || userContent.includes('日期')) {
            aiContent = `当前时间为 ${formatTime(new Date())}，你可以咨询其他问题，比如功能使用、文件处理等，我会为你提供帮助～`;
          } else if (userContent.includes('价格') || userContent.includes('收费') || userContent.includes('免费')) {
            aiContent = '目前基础功能（文本问答、普通文件处理、快速操作）均为免费使用～ 后续会推出高级功能套餐，具体收费标准会提前通知，敬请关注～';
          } else if (userContent.includes('客服') || userContent.includes('人工')) {
            aiContent = '如需人工客服帮助，可以发送"转人工"指令，我们的客服人员会在工作日9:00-18:00为你提供支持。也可以先描述你的问题，我会尽力为你解答～';
          } else {
            aiContent = '感谢你的提问！我已记录你的问题，相关解答如下：\n由于这是通用问答场景，如果你有具体的问题细节（如文件处理需求、功能使用疑问等），可以详细说明，我会为你提供更精准的回复～';
          }
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 6. 感谢/告别场景
        else if (userContent.includes('谢谢') || userContent.includes('感谢') || userContent.includes('再见') || userContent.includes('拜拜')) {
          const thanksReplies = [
            '不客气～ 有任何问题随时再来找我哦！',
            '不用谢！能帮到你我很开心，祝你使用愉快～',
            '再见啦～ 期待下次为你提供服务！如果有使用体验想反馈，也可以点击评价按钮告诉我们～',
            '感谢你的使用！如有任何需要，欢迎随时回来咨询～'
          ];
          aiContent = thanksReplies[Math.floor(Math.random() * thanksReplies.length)];
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 7. 吐槽/建议场景
        else if (userContent.includes('不好用') || userContent.includes('垃圾') || userContent.includes('建议') || userContent.includes('优化')) {
          if (userContent.includes('不好用') || userContent.includes('垃圾')) {
            aiContent = '非常抱歉给你带来了不好的使用体验～ 能否具体说明哪里需要改进？（如功能不够、操作复杂、回复不准确等）我们会重点优化这些问题，非常感谢你的反馈！';
          } else {
            aiContent = '非常感谢你的宝贵建议！我们已经记录下来，会在后续版本中进行优化。如果有更具体的改进方向，也可以详细说明，你的建议对我们很重要～';
          }
          tokenCount = Math.floor(aiContent.length * 0.7);
        }
        // 8. 其他通用场景
        else {
          const generalReplies = [
            '感谢你的消息！如果你有具体的问题或需求，可以详细说明，我会尽力为你解答～',
            '你好呀！我是智能助手，支持文本问答、文件处理、功能咨询等服务，有什么可以帮你的？',
            '看到你的消息啦～ 请具体描述你的需求（如"解析PDF文件"、"介绍核心功能"等），我会为你提供对应帮助～',
            '欢迎使用智能助手！如需了解功能详情，可以发送"功能介绍"；如需上传文件，可以点击上传按钮，期待为你服务～'
          ];
          aiContent = generalReplies[Math.floor(Math.random() * generalReplies.length)];
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
  // 打字机效果逐字显示 AI 回复
  const typeWriterAI = (fullText: string, thinkingTime: number = 0, tokenCount: number = 0) => {
    const aiId = `resp-${Date.now()}`;
    // 插入占位消息
    setMessages(prev => [
      ...prev,
      { id: aiId, sender: 'assistant', content: '', time: formatTime(new Date()), thinkingTime, tokenCount }
    ]);

    let index = 0;
    const interval = 30; // 每 30ms 打印一个字符
    const timer = setInterval(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiId) {
          return { ...msg, content: fullText.slice(0, index + 1) };
        }
        return msg;
      }));
      index++;
      if (index >= fullText.length) clearInterval(timer);
    }, interval);
  };
  // 消息发送逻辑（适配两种输入方式）
  const handleSend = async (inputVal?: string, uploadedFile?: { id?: string; name?: string; url?: string } | null) => {
    // 兼容ChatInput和原生输入框
    let userContent = inputVal ? inputVal.trim() : inputValue.trim();
    if (!userContent && !uploadedFile) return;

    const hasFile = !!uploadedFile;

    // 拼接文件信息
    if (hasFile) {
      userContent = userContent
        ? `${userContent}\n📄 上传文件：${uploadedFile?.name}`
        : `📄 上传文件：${uploadedFile?.name}`;
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

    // 清空原生输入框
    if (!inputVal) setInputValue('');

    // AI回复
    const aiResponse = await simulateAIChat(userContent, hasFile);
    // 使用打字机效果显示 AI 回复
    typeWriterAI(aiResponse.content, aiResponse.thinkingTime, aiResponse.tokenCount);
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

    console.log('提交评价：', { 评分: num, 详细评价: ratingComment });
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
      <Sidebar dialogs={dialogs} activeKey="/chat" />

      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              {/* <div className="avatar"></div> */} {/* 移除头像 */}
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
          {/* 关键：添加滚动锚点（不可见元素） */}
          <div ref={messageEndRef} />
        </div>

        <div className="input-area">
          <ChatInput
            ref={chatInputRef}
            placeholder="请输入消息...（支持上传文件，Ctrl+Enter换行）"
            onSend={handleSend}
            quickActions={[
              { label: '快速提问', onClick: () => chatInputRef.current?.setInput('请介绍一下核心功能') },
              { label: '文件咨询', onClick: () => chatInputRef.current?.setInput('请解析这个文件的内容') },
              {
                label: '评价一下本次使用如何',
                onClick: openRating,
              }
            ]}
          />
        </div>
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSubmit={(score, comment) => {
            console.log('评分：', score, '详细评价：', comment);

            const aiMessage: Message = {
              id: `resp-${Date.now()}`,
              sender: 'assistant',   // <-- 这里 TS 已认定为 "assistant" 字面量 OK
              content: '感谢你的宝贵评价！我们会根据你的反馈持续优化产品体验～',
              time: formatTime(new Date()),
              thinkingTime: 0.5,
              tokenCount: 15
            };

            setMessages(prev => [...prev, aiMessage]);
          }}
        />
      </div>
    </div>
  );
};

export default Chat;