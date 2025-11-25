import React, { useRef, useState, useEffect } from 'react';
import { uploadFile, deleteFile, UploadFileResponse } from '../../api/Fileapi';
import './FileUploader.css';

// 定义上传成功后的文件类型（与接口返回匹配）
interface UploadedFile {
  id: string; // 对应接口返回的 file_id（真实 UUID）
  name: string; // 原始文件名
  url: string; // 文件访问路径（用于下载）
  type: string; // 文件类型（用于区分文件类型）
  shortName: string; // 缩短后的文件名（10个字符含后缀）
}

interface FileUploaderProps {
  onUploadSuccess?: (files: UploadedFile[]) => void; // 回调返回文件数组
  maxCount?: number; // 最大上传文件数量，默认无限制
  accept?: string; // 允许上传的文件类型，默认常用格式
}

// 默认属性
const defaultProps: FileUploaderProps = {
  maxCount: undefined,
  accept: ".pdf,.doc,.docx,.jpg,.png,.jpeg,.gif,.svg,.xls,.xlsx,.ppt,.pptx",
  onUploadSuccess: () => {},
};

// 工具函数：缩短文件名到10个字符（含文件类型后缀）
const shortenFileName = (fileName: string): string => {
  // 分离文件名和后缀
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // 无后缀文件，直接截断
    return fileName.length > 10 ? `${fileName.substring(0, 10)}...` : fileName;
  }

  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const ext = fileName.substring(lastDotIndex); // 包含点号的后缀（如.pdf）
  
  // 计算可分配给文件名的长度（总长度10 - 后缀长度）
  const maxNameLength = 10 - ext.length;
  
  if (maxNameLength <= 0) {
    // 后缀过长，直接显示后缀（最多显示10个字符）
    return ext.substring(0, 10);
  }

  if (nameWithoutExt.length <= maxNameLength) {
    // 文件名+后缀不超过10个字符，直接返回
    return fileName;
  }

  // 截断文件名，拼接后缀
  return `${nameWithoutExt.substring(0, maxNameLength)}...${ext}`;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  maxCount,
  accept = defaultProps.accept,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]); // 正在上传的文件名数组
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]); // 已上传文件数组
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // 弹窗显示/隐藏状态
  const modalRef = useRef<HTMLDivElement | null>(null); // 弹窗ref，用于点击外部关闭

  // 检查是否还能上传更多文件
  const canUploadMore = !maxCount || uploadedFiles.length < maxCount;

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // 阻止弹窗内部事件冒泡
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 触发文件选择框
  const handleAttachClick = () => {
    if (uploadingFiles.length > 0) return; // 正在上传时禁止选择新文件
    if (!canUploadMore) {
      setErrorMsg(`最多只能上传 ${maxCount} 个文件`);
      return;
    }
    fileInputRef.current?.click();
    setErrorMsg('');
  };

  // 处理文件上传（支持多文件）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 过滤已存在的文件（根据文件名去重）
    const newFiles = Array.from(files).filter(
      (file) => !uploadedFiles.some((f) => f.name === file.name)
    );

    // 检查是否超过最大数量限制
    if (maxCount && uploadedFiles.length + newFiles.length > maxCount) {
      setErrorMsg(`最多只能上传 ${maxCount} 个文件，当前已选择 ${uploadedFiles.length} 个`);
      e.target.value = '';
      return;
    }

    if (newFiles.length === 0) {
      setErrorMsg('所选文件已全部上传');
      e.target.value = '';
      return;
    }

    // 设置正在上传的文件
    const uploadingFilenames = newFiles.map((file) => file.name);
    setUploadingFiles(uploadingFilenames);
    setErrorMsg('');

    try {
      // 批量上传文件（并行上传）
      const uploadPromises = newFiles.map(async (file) => {
        const res: UploadFileResponse = await uploadFile(file);
        return {
          id: res.data.file_id,
          name: file.name,
          url: res.data.url || '',
          type: file.type,
          shortName: shortenFileName(file.name), // 生成缩短后的文件名
        } as UploadedFile;
      });

      // 等待所有文件上传完成
      const newUploadedFiles = await Promise.all(uploadPromises);
      
      // 更新已上传文件列表
      const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(updatedFiles);
      
      // 通知父组件
      onUploadSuccess?.(updatedFiles);

      alert(`✅ 成功上传 ${newUploadedFiles.length} 个文件！`);
    } catch (error: any) {
      const errMsg = error.message || '部分文件上传失败，请重试';
      console.error('上传失败:', errMsg, error);
      setErrorMsg(errMsg);
      alert(`❌ ${errMsg}`);
    } finally {
      setUploadingFiles([]);
      e.target.value = ''; // 清空文件选择框
    }
  };

  // 处理单个文件删除
  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      
      // 从已上传文件列表中移除该文件
      const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);
      setUploadedFiles(updatedFiles);
      
      // 通知父组件
      onUploadSuccess?.(updatedFiles);

      alert('🗑️ 文件已成功删除');
    } catch (error: any) {
      const errMsg = error.message || '删除失败，请重试';
      console.error('删除失败:', errMsg, error);
      setErrorMsg(errMsg);
      alert(`❌ ${errMsg}`);
    }
  };

  // 处理全部文件删除
  const handleDeleteAll = async () => {
    if (uploadedFiles.length === 0) return;
    if (!window.confirm('确定要删除所有已上传文件吗？')) return;

    try {
      // 批量删除所有文件
      await Promise.all(uploadedFiles.map((file) => deleteFile(file.id)));
      
      setUploadedFiles([]);
      setIsModalOpen(false); // 删除后关闭弹窗
      onUploadSuccess?.([]);
      alert('🗑️ 所有文件已成功删除');
    } catch (error: any) {
      const errMsg = error.message || '部分文件删除失败，请重试';
      console.error('批量删除失败:', errMsg, error);
      setErrorMsg(errMsg);
      alert(`❌ ${errMsg}`);
    }
  };

  // 打开文件列表弹窗
  const openFileModal = () => {
    if (uploadedFiles.length > 1) {
      setIsModalOpen(true);
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 获取文件图标（根据文件类型）
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('powerpoint')) return '🎥';
    return '📎'; // 默认图标
  };

  // 下载文件
  const handleDownloadFile = (url: string, fileName: string) => {
    if (!url) {
      alert('文件下载地址不存在');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="file-uploader-container">
      {/* 核心区域：上传按钮 + 已上传文件 */}
      <div className="main-content">
        {/* 上传按钮区域 */}
        <div className="upload-btn-wrapper">
          {/* 隐藏的文件选择输入框（支持多文件） */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept={accept}
            multiple // 开启多文件选择
          />

          {/* 上传按钮 */}
          <button
            className="attach-btn"
            onClick={handleAttachClick}
            disabled={uploadingFiles.length > 0 || !canUploadMore}
            title={!canUploadMore ? `最多上传${maxCount}个文件` : '选择文件上传'}
          >
            {uploadingFiles.length > 0 ? '📤 上传中...' : '➕ 上传文件'}
          </button>
        </div>

        {/* 已上传文件区域 */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files-inline">
            {/* 单个文件：直接显示（10字符文件名） */}
            {uploadedFiles.length === 1 ? (
              <div className="single-file-item">
                <div 
                  className="file-info" 
                  onClick={() => handleDownloadFile(uploadedFiles[0].url, uploadedFiles[0].name)}
                  title={uploadedFiles[0].name} //  hover显示完整文件名
                >
                  <span className="file-icon">{getFileIcon(uploadedFiles[0].type)}</span>
                  <span className="file-name">{uploadedFiles[0].shortName}</span>
                  <span className="download-icon" title="下载文件">⬇️</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteFile(uploadedFiles[0].id)}
                  disabled={uploadingFiles.length > 0}
                  title="删除文件"
                >
                  ×
                </button>
              </div>
            ) : (
              // 多个文件：显示数量+查看全部（点击打开弹窗）
              <div 
                className="multi-file-trigger"
                onClick={openFileModal}
                title={`共${uploadedFiles.length}个文件，点击查看全部`}
              >
                <span className="file-count">
                  📎 {uploadedFiles.length}个文件
                </span>
                <span className="view-all-text">查看全部</span>
              </div>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {errorMsg && <div className="upload-error">{errorMsg}</div>}
      </div>

      {/* 文件列表弹窗 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div 
            className="file-modal" 
            ref={modalRef}
            onClick={stopPropagation}
          >
            {/* 弹窗头部 */}
            <div className="modal-header">
              <h3>已上传文件（{uploadedFiles.length} 个）</h3>
              <button className="close-modal-btn" onClick={closeModal} title="关闭">×</button>
            </div>

            {/* 弹窗操作区 */}
            <div className="modal-actions">
              <button
                className="delete-all-btn"
                onClick={handleDeleteAll}
                disabled={uploadingFiles.length > 0}
              >
                删除全部文件
              </button>
            </div>

            {/* 弹窗内容：文件列表（10字符文件名） */}
            <div className="modal-content">
              {uploadedFiles.length > 0 ? (
                <div className="modal-file-list">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="modal-file-item">
                      <div className="file-icon">{getFileIcon(file.type)}</div>
                      <div className="file-details">
                        <span 
                          className="file-name" 
                          title={file.name} // hover显示完整文件名
                          onClick={() => handleDownloadFile(file.url, file.name)}
                        >
                          {file.name}
                        </span>
                      </div>
                      <div className="file-actions">
                        <button
                          className="download-btn"
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          title="下载文件"
                        >
                          下载
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={uploadingFiles.length > 0}
                          title="删除文件"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">暂无已上传文件</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 上传中状态提示*/}
      {uploadingFiles.length > 0 && (
        <div className="uploading-status">
          <span>正在上传：{uploadingFiles.map(shortenFileName).join('、')}</span>
        </div>
      )}
    </div>
  );
};

//FileUploader.defaultProps = defaultProps;
export default FileUploader;