import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllKnowledgeBases,
  deleteKnowledgeBase,
  addFileToKnowledgeBase,
  deleteFileFromKnowledgeBase,
  KnowledgeBaseRaw,
} from "../../api/knowledgeBaseApi";
import "./KnowledgeBaseManager.css";

interface KBFile {
  file_id: string;
  url: string;
  name: string;
  size: number;
}

// 本地测试模式（无后端时可用）
const LOCAL_TEST_MODE = true;

const KnowledgeBaseManager: React.FC = () => {
  const navigate = useNavigate();

  const defaultKb: KnowledgeBaseRaw = { id: "default", name: "默认知识库", description: "", file_count: 0 };

  // 知识库列表
  const [kbList, setKbList] = useState<KnowledgeBaseRaw[]>([defaultKb]);

  // 展开状态记录
  const [expandedKbIds, setExpandedKbIds] = useState<Set<string>>(new Set());

  // 每个知识库对应的文件列表
  const [filesMap, setFilesMap] = useState<Record<string, KBFile[]>>({});

  // 加载状态 & 错误信息
  const [loadingKb, setLoadingKb] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 获取知识库列表 */
  const fetchKnowledgeBases = async () => {
    setLoadingKb(true);
    setError(null);
    try {
      const list = await getAllKnowledgeBases();
      if (list && list.length > 0) {
        setKbList(list);
        setExpandedKbIds(new Set([list[0].id])); // 默认展开第一个知识库
      } else {
        setKbList([defaultKb]);
      }
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

  /** 上传文件 */
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

  /** 删除文件 */
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

  /** 删除知识库 */
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

  /** 切换知识库展开状态 */
  const toggleExpand = (kbId: string) => {
    setExpandedKbIds(prev => { const copy = new Set(prev); copy.has(kbId) ? copy.delete(kbId) : copy.add(kbId); return copy; });
  };

  return (
    <div className="container">
      <div className="manager-container">
        {/* 左侧导航栏 */}
        <aside className="sidebar">
          <button className="setting-btn" onClick={() => navigate("/home")}>首页</button>
          <button className="setting-btn" onClick={() => navigate("/manager")}>评价</button>
          <button className="setting-btn active">知识库管理</button>
        </aside>

        {/* 主区域 */}
        <main className="main-area">
          {loadingKb && <div>加载中...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}

          <ul className="kb-list">
            {kbList.map(kb => (
              <li key={kb.id} className="kb-card">
                <div className="kb-header" onClick={() => toggleExpand(kb.id)}>
                  <div>
                    <strong>{kb.name}</strong>
                    {kb.description && <div className="kb-desc">{kb.description}</div>}
                  </div>
                  <div>
                    <button className="setting-btn" onClick={e => { e.stopPropagation(); handleDeleteKb(kb.id); }}>删除知识库</button>
                  </div>
                </div>

                {expandedKbIds.has(kb.id) && (
                  <div className="file-section">
                    <label className="upload-btn">
                      上传文件
                      <input type="file" onChange={e => handleUpload(kb.id, e)} style={{ display: "none" }} />
                    </label>

                    <ul className="file-list">
                      {(filesMap[kb.id] || []).length > 0 ? (
                        filesMap[kb.id].map(f => (
                          <li key={f.file_id} className="file-item">
                            <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                            <span> {(f.size / 1024).toFixed(1)} KB</span>
                            <button className="setting-btn" onClick={() => handleDeleteFile(kb.id, f.file_id)}>删除</button>
                          </li>
                        ))
                      ) : (
                        <li>暂无文件</li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;







