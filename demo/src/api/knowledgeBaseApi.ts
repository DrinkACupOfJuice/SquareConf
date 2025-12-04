import request from "./Fileapi";
import { uploadFile } from "./Fileapi";

// ==================== 类型定义 ====================

// 知识库对象标准格式
export interface KnowledgeBaseRaw {
  id: string;
  name: string;
  description?: string;
  file_count?: number | string;
  [k: string]: any;
}

// 文件信息
export interface KBFilePayload {
  file_id: string;
  url: string;
  name?: string;
  size?: number;
}

// ==================== 工具函数 ====================

/**
 * 提取后端返回的知识库列表
 * 支持多种后端返回结构：
 * 1. 数组形式直接返回
 * 2. data.data 为数组
 * 3. global_knowledge_base + local_knowledge_base
 */
const extractListFromResponse = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;

  const maybe = res?.data?.data || res?.data;
  if (maybe && typeof maybe === "object") {
    const arr: any[] = [];
    if (maybe.global_knowledge_base && typeof maybe.global_knowledge_base === "object") {
      arr.push(maybe.global_knowledge_base);
    }
    if (Array.isArray(maybe.local_knowledge_base)) {
      arr.push(...maybe.local_knowledge_base);
    }
    if (arr.length > 0) return arr;
  }
  return [];
};

/**
 * 统一知识库格式
 */
const normalizeKbItem = (item: any): KnowledgeBaseRaw => {
  if (!item || typeof item !== "object") return null as any;
  return {
    id: String(item.id ?? item.kb_id ?? item.uuid ?? ""),
    name: item.name ?? item.title ?? item.kb_name ?? "未命名知识库",
    description: item.description ?? item.desc ?? "",
    file_count: typeof item.file_count === "number" ? item.file_count : Number(item.file_count) || 0,
    ...item,
  };
};

// ==================== 知识库接口 ====================

/** 获取所有知识库 */
export const getAllKnowledgeBases = async (): Promise<KnowledgeBaseRaw[]> => {
  const res = await request.get("/knowledgebases/");
  const rawList = extractListFromResponse(res);
  const parsedList = rawList.map((it: any) => {
    if (typeof it === "string") {
      try {
        return JSON.parse(it);
      } catch {
        return it;
      }
    }
    return it;
  });
  return parsedList.map(normalizeKbItem).filter(Boolean) as KnowledgeBaseRaw[];
};

/** 删除指定知识库*/
export const deleteKnowledgeBase = async (kbId: string, drop: boolean = false) => {
  const res = await request.delete(`/knowledgebases/${kbId}`, {
    params: { drop },
  });
  return res.data;
};

/** 上传文件到指定知识库*/
export const addFileToKnowledgeBase = async (kbId: string, file: File) => {
  // 上传文件获取 file_id
  const uploadRes = await uploadFile(file);
  const uploadData = uploadRes?.data ?? uploadRes;
  const fileId = uploadData?.file_id ?? uploadData?.id ?? null;
  const fileUrl = uploadData?.url ?? uploadData?.path ?? "";

  if (!fileId) throw new Error("上传后未返回 file_id");

  // POST 到 /knowledgebases/:knowledge_base_id/files/:file_id
  const res = await request.post(`/knowledgebases/${kbId}/files/${fileId}`, {
    name: file.name,
    size: file.size,
    url: fileUrl,
  });

  return res.data;
};

/** 删除指定知识库中的文件*/
export const deleteFileFromKnowledgeBase = async (kbId: string, fileId: string) => {
  const res = await request.delete(`/knowledgebases/${kbId}/files/${fileId}`);
  return res.data;
};




