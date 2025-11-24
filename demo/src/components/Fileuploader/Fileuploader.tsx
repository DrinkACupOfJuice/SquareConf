import React, { useRef, useState } from 'react';
import { uploadFile, deleteFile, UploadFileResponse } from '../../api/Fileapi'; // 引入类型定义
import './FileUploader.css';

// 定义上传成功后的文件类型（与接口返回匹配）
interface UploadedFile {
  id: string; // 对应接口返回的 file_id（真实 UUID）
  name: string; // 文件名
  url: string; // 文件访问路径（可选，用于预览/下载）
}

interface FileUploaderProps {
  onUploadSuccess?: (file: UploadedFile | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [errorMsg, setErrorMsg] = useState(''); // 新增错误提示状态

  // 触发文件选择框
  const handleAttachClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
    setErrorMsg(''); // 清空之前的错误提示
  };

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    try {
      // 调用优化后的上传接口（自动处理占位符，返回真实 file_id）
      const res: UploadFileResponse = await uploadFile(file); 
      console.log('上传返回:', res);

      // 组装文件数据（id 对应接口的 file_id，新增 url 字段）
      const fileData: UploadedFile = {
        id: res.data.file_id, // 关键修复：接口返回的是 file_id 而非 id
        name: file.name,
        url: res.data.url, // 保存文件访问路径（可用于后续预览）
      };

      setUploadedFile(fileData);
      onUploadSuccess?.(fileData); // 回调通知父组件
      alert(`✅ 文件上传成功！\n文件名：${file.name}\n文件ID：${fileData.id}`);
    } catch (error: any) {
      const errMsg = error.message || '上传失败，请重试';
      console.error('上传失败:', errMsg, error);
      setErrorMsg(errMsg);
      alert(`❌ ${errMsg}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // 清空文件选择框，允许重新选择同一文件
    }
  };

  // 处理文件删除
  const handleDeleteFile = async () => {
    if (!uploadedFile?.id) return alert('暂无文件可删除');

    try {
      const res = await deleteFile(uploadedFile.id);
      console.log('删除返回:', res);

      // 删除成功后更新状态
      setUploadedFile(null);
      onUploadSuccess?.(null); // 回调通知父组件
      alert('🗑️ 文件已成功删除');
    } catch (error: any) {
      const errMsg = error.message || '删除失败，请重试';
      console.error('删除失败:', errMsg, error);
      setErrorMsg(errMsg);
      alert(`❌ ${errMsg}`);
    }
  };

  return (
    <div className="file-uploader">
      {/* 隐藏的文件选择输入框 */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.png,.jpeg" // 可选：限制文件类型
      />

      {/* 上传按钮 */}
      <button 
        className="attach-btn" 
        onClick={handleAttachClick} 
        disabled={uploading}
      >
        {uploading ? '📤' : '+'}
      </button>

      {/* 错误提示（新增） */}
      {errorMsg && <div className="upload-error">{errorMsg}</div>}

      {/* 已上传文件预览 */}
      {uploadedFile && (
        <div className="file-preview">
          <span className="file-name">📄 {uploadedFile.name}</span>
          <button 
            className="delete-btn" 
            onClick={handleDeleteFile}
            disabled={uploading}
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;