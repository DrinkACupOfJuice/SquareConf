// src/api/sessionsApi.ts
import request from './Fileapi';

/** ===================== 类型定义 ===================== */
export interface Session {
    id: string;
    name: string;
    timestamp: number;
    latest_job_id: string;
    knowledgebase_id?: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/** ===================== 会话列表相关 API ===================== */

/** 获取所有会话列表 */
export const getAllSessions = async (
    page?: number,
    size?: number
): Promise<Session[]> => {
    try {
        const res = await request.get('/sessions/', { params: { page, size } });
        // 返回接口 data 字段数组
        return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
        console.error('获取会话列表失败', err);
        return [];
    }
};

/** 创建新会话 */
export const createSession = async (
    name: string
): Promise<ApiResponse<Session>> => {
    const res = await request.post('/sessions/', { name });
    return res.data;
};

/** 获取指定 ID 的会话 */
export const getSessionById = async (
    session_id: string
): Promise<ApiResponse<Session>> => {
    const res = await request.get(`/sessions/${session_id}`);
    return res.data;
};

/** 更新指定 ID 的会话 */
export const updateSession = async (
    session_id: string,
    name: string
): Promise<ApiResponse<Session>> => {
    const res = await request.put(`/sessions/${session_id}`, { name });
    return res.data;
};

/** 删除指定 ID 的会话 */
export const deleteSession = async (
    session_id: string
): Promise<ApiResponse<{}>> => {
    const res = await request.delete(`/sessions/${session_id}`);
    return res.data;
};
