import React, { useState } from 'react';
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

  const dialogs: Dialog[] = [
    { id: '1', title: '对话1' },
    { id: '2', title: '对话2' },
    { id: '3', title: '对话3' },
  ];

  const goToChat = () => {
    navigate('/chat', { state: { input: inputValue, file: uploadedFile } });
  };

  return (
    <div className="container">
      <Sidebar dialogs={dialogs} />
      <main className="main-area">
        <div className="input-section">
          <textarea
            className="input-box"
            placeholder="输入内容..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <div className="button-group">
            <FileUploader onUploadSuccess={(file) => setUploadedFile(file)} />
            <button className="send-btn" onClick={goToChat}>
              发送
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
