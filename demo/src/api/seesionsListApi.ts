// src/api/sessionsApi.ts
import request from './Fileapi'; // axios 实例或你自己封装的请求工具

/** ===================== 类型定义 ===================== */
export interface Session {
    id: string;
    name: string;
    timestamp: number;
    latest_job_id: string;
    knowledgebase_id?: string; // 可选，创建会话时可能会返回
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/** ===================== 会话列表相关 API ===================== */

/*获取所有会话（历史列表）*/
export const getAllSessions = async (): Promise<ApiResponse<Session[]>> => {
    const res = await request.get('/sessions'); // 替换为实际接口路径
    return res.data;
};

/**
 * 创建新会话
 * @param knowledgebase_id 可选知识库 ID
 */
export const createSession = async (
    knowledgebase_id?: string
): Promise<ApiResponse<Session>> => {
    const res = await request.post('/sessions', { knowledgebase_id });
    return res.data;
};

/**
 * 获取指定 ID 的会话
 * @param id 会话 ID
 */
export const getSessionById = async (
    id: string
): Promise<ApiResponse<Session>> => {
    const res = await request.get(`/sessions/${id}`);
    return res.data;
};

/**
 * 更新指定 ID 的会话
 * @param id 会话 ID
 * @param payload 可更新字段，例如 { name: "新会话名称" }
 */
export const updateSession = async (
    id: string,
    payload: Partial<Pick<Session, 'name'>>
): Promise<ApiResponse<Session>> => {
    const res = await request.patch(`/sessions/${id}`, payload);
    return res.data;
};

/**
 * 删除指定 ID 的会话
 * @param id 会话 ID
 */
export const deleteSession = async (
    id: string
): Promise<ApiResponse<{}>> => {
    const res = await request.delete(`/sessions/${id}`);
    return res.data;
};
