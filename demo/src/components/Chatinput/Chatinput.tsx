import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import FileUploader from '../Fileuploader/Fileuploader';
import './ChatInput.css';

// 定义子组件暴露给父组件的方法类型
interface ChatInputRef {
  setInput: (value: string) => void;
}

interface ChatInputProps {
  placeholder?: string;
  onSend: (inputValue: string, uploadedFile: { id?: string; name?: string; url?: string } | null) => void;
  initialValue?: string;
  quickActions?: { label: string; onClick: () => void }[];
}

const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  placeholder = "发消息、输入 @ 选择技能或 / 选择文件",
  onSend,
  initialValue = '',
  quickActions = [],
}, ref) => {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [uploadedFile, setUploadedFile] = useState<{ id?: string; name?: string; url?: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 暴露给父组件的方法：修改输入框内容
  useImperativeHandle(ref, () => ({
    setInput: (value: string) => {
      setInputValue(value);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }, 0);
    },
  }));

  // 自动调整输入框高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // 接收 FileUploader 的上传/删除回调
  const handleUploadSuccess = (file: { id?: string; name?: string; url?: string } | null) => {
    setUploadedFile(file);
  };

  // 发送逻辑
  const handleSend = useCallback(() => {
    if (!inputValue.trim() && !uploadedFile) return;
    onSend(inputValue, uploadedFile);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue, uploadedFile, onSend]);

  // 回车发送（Ctrl+Enter换行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      {/* 快捷操作按钮 */}
      {quickActions.length > 0 && (
        <div className="chat-input-quick-actions">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="chat-input-quick-btn"
              onClick={action.onClick}
            >
              {action.label} →
            </button>
          ))}
        </div>
      )}

      {/* 输入框区域 */}
      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          className="chat-input-box"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* 功能按钮区：直接渲染 FileUploader 原样式，不做任何修改 */}
        <div className="chat-input-buttons">
          {/* 直接渲染 FileUploader，保留其原生样式和功能 */}
          <FileUploader onUploadSuccess={handleUploadSuccess} />

          {/* 发送按钮 */}
          <button
            className="chat-input-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() && !uploadedFile}
            title="发送"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
export default ChatInput;