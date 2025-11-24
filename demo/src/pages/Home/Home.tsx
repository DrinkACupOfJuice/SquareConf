import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import FileUploader from '../../components/Fileuploader/Fileuploader';
import './home.css';

interface Dialog {
  id: string;
  title: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ id?: string; name?: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  // 自适应高度
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const goToChat = () => {
    navigate('/chat', { state: { input: inputValue, file: uploadedFile } });
  };

  return (
    <div className="container">
      <Sidebar dialogs={dialogs} activeKey="/home" />

      <main className="home-main">
        <div className="home-input-wrapper">
          <textarea
            ref={inputRef}
            className="home-input-box"
            placeholder="输入内容..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="home-btns">
            <div className="home-btn attach">
              <FileUploader onUploadSuccess={(file) => setUploadedFile(file)} />
            </div>
            <div className="home-btn send">
              <button className="home-send-btn" onClick={goToChat}>
                ↑
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
