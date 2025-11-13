import React, { useRef, useState } from 'react';
import { uploadFile, deleteFile } from '../../api/api';
import './FileUploader.css';

interface FileUploaderProps {
  onUploadSuccess?: (file: { id: string; name: string } | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string } | null>(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const res = await uploadFile(file); // 等待接口返回
      console.log('上传返回:', res.data);

      // 上传成功后再设置文件状态
      const fileData = {
        id: res.data.id, // 必须是真实接口返回的 id
        name: file.name,
      };

      setUploadedFile(fileData);
      onUploadSuccess?.(fileData);

      alert('✅ 文件上传成功');
    } catch (error) {
      console.error('上传失败:', error);
      alert('❌ 上传失败，请检查接口');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!uploadedFile?.id) return alert('暂无文件可删除');

    try {
      const res = await deleteFile(uploadedFile.id);
      console.log('删除返回:', res);

      setUploadedFile(null);
      onUploadSuccess?.(null);
      alert('🗑️ 文件已删除');
    } catch (error) {
      console.error('删除失败:', error);
      alert('❌ 删除失败');
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button className="attach-btn" onClick={handleAttachClick} disabled={uploading}>
        {uploading ? '上传中...' : '发送附件'}
      </button>

      {uploadedFile && (
        <div className="file-preview">
          <span>📄 {uploadedFile.name}</span>
          <button onClick={handleDeleteFile}>删除</button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;



