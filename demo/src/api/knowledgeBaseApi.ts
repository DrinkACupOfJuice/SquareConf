// src/api/knowledgeBaseApi.ts
import request from "./Fileapi";
import { uploadFile } from "./Fileapi"; // 你自己的文件上传接口

/** 获取所有知识库 */
export const getAllKnowledgeBases = async () => {
  const res = await request.get("/knowledgebases/"); // 注意尾斜杠
  // 确保返回 data 是数组
  return Array.isArray(res.data.data) ? res.data.data : [];
};

/** 删除指定知识库 */
export const deleteKnowledgeBase = async (kbId: string) => {
  const res = await request.delete(`/knowledgebases/${kbId}`);
  return res.data;
};

/** 向指定知识库添加文件 */
export const addFileToKnowledgeBase = async (kbId: string, file: File) => {
  const uploadRes = await uploadFile(file);
  const res = await request.post(`/knowledgebases/${kbId}/files/${uploadRes.data.file_id}`, {
    name: file.name,
    size: file.size,
    url: uploadRes.data.url,
  });
  return res.data;
};

/** 从指定知识库删除文件 */
export const deleteFileFromKnowledgeBase = async (kbId: string, fileId: string) => {
  const res = await request.delete(`/knowledgebases/${kbId}/files/${fileId}`);
  return res.data;
};


