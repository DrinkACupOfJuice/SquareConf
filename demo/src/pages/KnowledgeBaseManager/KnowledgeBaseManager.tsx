import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  getAllKnowledgeBases,
  deleteKnowledgeBase,
  addFileToKnowledgeBase,
  deleteFileFromKnowledgeBase,
  KnowledgeBaseRaw,
} from "../../api/KnowledgeBaseApi";
import './KnowledgeBaseManager.css';

interface KBFile {
  file_id: string;
  url: string;
  name: string;
  size: number;
}

const LOCAL_TEST_MODE = true;

const KnowledgeBaseManager: React.FC = () => {
  const location = useLocation();

  const defaultKb: KnowledgeBaseRaw = { id: "default", name: "默认知识库", description: "", file_count: 0 };

  const [kbList, setKbList] = useState<KnowledgeBaseRaw[]>([defaultKb]);
  const [expandedKbIds, setExpandedKbIds] = useState<Set<string>>(new Set());
  const [filesMap, setFilesMap] = useState<Record<string, KBFile[]>>({});
  const [loadingKb, setLoadingKb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBases = async () => {
    setLoadingKb(true);
    setError(null);
    try {
      const list = await getAllKnowledgeBases();
      setKbList(list && list.length > 0 ? list : [defaultKb]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "获取知识库失败");
      setKbList([defaultKb]);
    } finally {
      setLoadingKb(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const handleUpload = async (kbId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = "";

    try {
      if (LOCAL_TEST_MODE) {
        const mockFile: KBFile = { file_id: `${Date.now()}`, url: URL.createObjectURL(file), name: file.name, size: file.size };
        setFilesMap(prev => ({ ...prev, [kbId]: [...(prev[kbId] || []), mockFile] }));
        return;
      }

      const addRes = await addFileToKnowledgeBase(kbId, file);
      const fileData = addRes?.data ?? addRes;
      const kbFile: KBFile = {
        file_id: fileData?.file_id ?? fileData?.id ?? `${Date.now()}`,
        url: fileData?.url ?? fileData?.path ?? "",
        name: file.name,
        size: file.size,
      };
      setFilesMap(prev => ({ ...prev, [kbId]: [...(prev[kbId] || []), kbFile] }));
    } catch (err) {
      console.error(err);
      alert("上传失败");
    }
  };

  const handleDeleteFile = async (kbId: string, fileId: string) => {
    if (!window.confirm("确认删除该文件？")) return;
    try {
      if (!LOCAL_TEST_MODE) await deleteFileFromKnowledgeBase(kbId, fileId);
      setFilesMap(prev => ({ ...prev, [kbId]: (prev[kbId] || []).filter(f => f.file_id !== fileId) }));
    } catch (err) {
      console.error(err);
      alert("删除失败");
    }
  };

  const handleDeleteKb = async (kbId: string) => {
    if (!window.confirm("确认删除该知识库？")) return;
    try {
      if (!LOCAL_TEST_MODE) await deleteKnowledgeBase(kbId);
      setKbList(prev => prev.filter(k => k.id !== kbId));
      setFilesMap(prev => { const copy = { ...prev }; delete copy[kbId]; return copy; });
      setExpandedKbIds(prev => { const copy = new Set(prev); copy.delete(kbId); return copy; });
    } catch (err) {
      console.error(err);
      alert("删除失败");
    }
  };

  const toggleExpand = (kbId: string) => {
    setExpandedKbIds(prev => { const copy = new Set(prev); copy.has(kbId) ? copy.delete(kbId) : copy.add(kbId); return copy; });
  };

  return (
    <div className="container">
      <Sidebar activeKey={location.pathname} />

      <main className="main-area">
        {loadingKb && <div>加载中...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}

        <ul className="kb-list">
          {kbList.map((kb, index) => (
            <li
              key={kb.id}
              className="kb-card"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="kb-header" onClick={() => toggleExpand(kb.id)}>
                <div className="kb-header-left">
                  <strong>{kb.name}</strong>
                  {kb.description && <div className="kb-desc">{kb.description}</div>}
                </div>
              </div>
              {expandedKbIds.has(kb.id) && (
                <div className="kb-expanded">

                  {/* 按钮区：移到折叠内部 */}
                  <div className="kb-actions">
                    <label className="upload-btn">
                      上传文件
                      <input type="file" onChange={e => handleUpload(kb.id, e)} />
                    </label>

                    <button className="setting-btn danger" onClick={() => handleDeleteKb(kb.id)}>
                      删除知识库
                    </button>
                  </div>
                  {/* 文件列表 */}
                  <div className="file-section">
                    <ul className="file-list">
                      {(filesMap[kb.id] || []).length > 0 ? (
                        filesMap[kb.id].map(f => (
                          <li key={f.file_id} className="file-item">
                            <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                            <span>{(f.size / 1024).toFixed(1)} KB</span>
                            <button className="setting-btn" onClick={() => handleDeleteFile(kb.id, f.file_id)}>删除</button>
                          </li>
                        ))
                      ) : (
                        <li>暂无文件</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default KnowledgeBaseManager;






