// src/api/sessionJobApi.ts
import request from "./Fileapi";

/** ======================== 类型定义 ======================== */
export interface ChatPayload {
  payload: string;               // 文本内容
  job_id: string;                // 后端生成
  timestamp: number;             // 后端生成
  id: string;                    // 后端生成
  session_id: string;            // 后端生成
  assigned_expert_name?: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
}

export interface ChatResponse {
  data: ChatPayload;
  message: string;
  code: number;
}

export interface StopJobResponse {
  data: null;
  message: string;
  code: number;
}

export interface LatestJobResponse {
  data: {
    id: string;
  };
  message: string;
  code: number;
}

export interface RecoverJobResponse {
  data: null;
  message: string;
  code: number;
}

/** ======================== 会话任务接口 ======================== */

/** 发送聊天消息 */
export const chatWithSession = async (
  sessionId: string,
  message: string
): Promise<ChatResponse> => {
  const body = { payload: message };

  const res = await request.post(`/sessions/${sessionId}/chat`, body);
  return res.data;
};

/** 停止任务*/
export const stopSessionJob = async (
  sessionId: string
): Promise<StopJobResponse> => {
  const res = await request.post(`/sessions/${sessionId}/stop`);
  return res.data;
};

/** 获取最新 job_id */
export const getLatestJobId = async (
  sessionId: string
): Promise<LatestJobResponse> => {
  const res = await request.get(`/sessions/${sessionId}/job_id`);
  return res.data;
};

/** 恢复原始任务 */
export const recoverSessionJob = async (
  sessionId: string
): Promise<RecoverJobResponse> => {
  const res = await request.post(`/sessions/${sessionId}/recover`);
  return res.data;
};
