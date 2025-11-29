// src/api/sessionJobApi.ts
import request from './Fileapi';

// ======================== 类型定义 ========================
export interface ChatPayload {
  payload: any;
  job_id: string;
  timestamp: number;
  id: string;
  session_id: string;
  assigned_expert_name?: string;
  role?: 'SYSTEM' | 'USER' | 'ASSISTANT';
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

// ======================== 会话任务接口 ========================

/** 发送聊天消息 */
export const chatSession = async (
  sessionId: string,
  message: string
): Promise<ChatResponse> => {
  const res = await request.post(`/sessions/${sessionId}/chat`, { message });
  return res.data;
};

/** 停止会话任务流程图 */
export const stopSessionJob = async (jobId: string): Promise<StopJobResponse> => {
  const res = await request.post(`/jobs/${jobId}/stop`);
  return res.data;
};

/** 获取会话任务最新 ID */
export const getLatestJobId = async (sessionId: string): Promise<LatestJobResponse> => {
  const res = await request.get(`/sessions/${sessionId}/latest_job_id`);
  return res.data;
};

/** 恢复会话原始任务 */
export const recoverOriginalJob = async (jobId: string): Promise<RecoverJobResponse> => {
  const res = await request.post(`/jobs/${jobId}/recover`);
  return res.data;
};
