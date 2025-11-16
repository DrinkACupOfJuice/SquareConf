// src/pages/KnowledgeBaseManager/KnowledgeBaseManager.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllKnowledgeBases,
  deleteKnowledgeBase,
  addFileToKnowledgeBase,
  deleteFileFromKnowledgeBase,
} from "../../api/knowledgeBaseApi";
import "./KnowledgeBaseManager.css";

interface KnowledgeBase {
  id: string;
  name: string;
}

interface KBFile {
  file_id: string;
  url: string;
  name: string;
  size: number;
}

const KnowledgeBaseManager: React.FC = () => {
  const navigate = useNavigate();

  const defaultKb: KnowledgeBase = { id: "default", name: "默认知识库" };

  const [kbList, setKbList] = useState<KnowledgeBase[]>([defaultKb]);
  const [expandedKbIds, setExpandedKbIds] = useState<Set<string>>(new Set()); // 展开状态
  const [filesMap, setFilesMap] = useState<Record<string, KBFile[]>>({});
  const [loading, setLoading] = useState(false);

  /** 获取知识库列表 */
  const fetchKnowledgeBases = async () => {
    try {
      // ===== 本地测试 / 正式接口 =====
      const res = await getAllKnowledgeBases(); // 正式接口调用
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setKbList(res.data);
      } else {
        // 本地测试阶段使用默认知识库
        setKbList([defaultKb]);
      }
    } catch (err) {
      console.error("获取知识库失败:", err);
      alert("获取知识库失败，使用默认知识库进行本地测试");
      setKbList([defaultKb]);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  /** 上传文件 */
  const handleUpload = async (kbId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (kbId === "default") {
        // ===== 本地测试阶段 =====
        const mockFile: KBFile = {
          file_id: Date.now().toString(),
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };
        setFilesMap((prev) => ({
          ...prev,
          [kbId]: [...(prev[kbId] || []), mockFile],
        }));
      } else {
        // ===== 正式接口阶段 =====
        const res = await addFileToKnowledgeBase(kbId, file);
        setFilesMap((prev) => ({
          ...prev,
          [kbId]: [...(prev[kbId] || []), res.data],
        }));
      }
    } catch (err) {
      console.error("上传文件失败:", err);
      alert("上传失败");
    } finally {
      setLoading(false);
    }
  };

  /** 删除文件 */
  const handleDeleteFile = async (kbId: string, fileId: string) => {
    if (!window.confirm("确定删除该文件吗？")) return;

    setLoading(true);
    try {
      if (kbId === "default") {
        // ===== 本地测试阶段 =====
        setFilesMap((prev) => ({
          ...prev,
          [kbId]: (prev[kbId] || []).filter((f) => f.file_id !== fileId),
        }));
      } else {
        // ===== 正式接口阶段 =====
        await deleteFileFromKnowledgeBase(kbId, fileId);
        setFilesMap((prev) => ({
          ...prev,
          [kbId]: (prev[kbId] || []).filter((f) => f.file_id !== fileId),
        }));
      }
    } catch (err) {
      console.error("删除文件失败:", err);
      alert("删除失败");
    } finally {
      setLoading(false);
    }
  };

  /** 删除知识库 */
  const handleDeleteKb = async (kbId: string) => {
    if (!window.confirm("确定删除该知识库吗？")) return;

    try {
      if (kbId === "default") {
        // ===== 本地测试阶段 =====
        setKbList((prev) => prev.filter((kb) => kb.id !== kbId));
        setFilesMap((prev) => {
          const copy = { ...prev };
          delete copy[kbId];
          return copy;
        });
        setExpandedKbIds((prev) => {
          const copy = new Set(prev);
          copy.delete(kbId);
          return copy;
        });
      } else {
        // ===== 正式接口阶段 =====
        await deleteKnowledgeBase(kbId);
        setKbList((prev) => prev.filter((kb) => kb.id !== kbId));
        setFilesMap((prev) => {
          const copy = { ...prev };
          delete copy[kbId];
          return copy;
        });
        setExpandedKbIds((prev) => {
          const copy = new Set(prev);
          copy.delete(kbId);
          return copy;
        });
      }
    } catch (err) {
      console.error("删除知识库失败:", err);
      alert("删除失败");
    }
  };

  /** 切换展开/折叠 */
  const toggleExpand = (kbId: string) => {
    setExpandedKbIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(kbId)) copy.delete(kbId);
      else copy.add(kbId);
      return copy;
    });
  };

  return (
    <div className="container">
      <div className="manager-container">
        {/* 左侧导航栏保持不变 */}
        <aside className="sidebar">
          <button className="setting-btn" onClick={() => navigate("/home")}>
            首页
          </button>
          <button className="setting-btn" onClick={() => navigate("/manager")}>
            评价
          </button>
          <button className="setting-btn active">知识库管理</button>
        </aside>

        {/* 右侧主区域 */}
        <main className="main-area">
          <h2>知识库列表</h2>
          <ul className="kb-list">
            {kbList.map((kb) => (
              <li key={kb.id} className="menu-item">
                <div
                  style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}
                  onClick={() => toggleExpand(kb.id)}
                >
                  <span>{kb.name}</span>
                  <button
                    className="setting-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteKb(kb.id);
                    }}
                  >
                    删除知识库
                  </button>
                </div>

                {/* 展开显示文件 */}
                {expandedKbIds.has(kb.id) && (
                  <div className="file-section" style={{ marginTop: "10px" }}>
                    <label className="upload-btn">
                      {loading ? "上传中..." : "上传文件"}
                      <input
                        type="file"
                        onChange={(e) => handleUpload(kb.id, e)}
                        disabled={loading}
                        style={{ display: "none" }}
                      />
                    </label>
                    <ul className="file-list">
                      {(filesMap[kb.id] || []).length > 0 ? (
                        filesMap[kb.id].map((file) => (
                          <li key={file.file_id} className="file-item">
                            <a href={file.url} target="_blank" rel="noreferrer">
                              {file.name}
                            </a>{" "}
                            ({(file.size / 1024).toFixed(1)} KB)
                            <button
                              className="setting-btn"
                              onClick={() => handleDeleteFile(kb.id, file.file_id)}
                            >
                              删除
                            </button>
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
            {kbList.length === 0 && <li>暂无知识库</li>}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeBaseManager;





