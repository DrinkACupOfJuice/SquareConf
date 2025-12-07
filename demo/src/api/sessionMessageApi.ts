import request from './Fileapi';
import { AxiosError } from 'axios';

// ======================== 类型定义 ========================
export interface Question {
  id: string;
  job_id: string;
  payload: any; // 建议替换为具体类型，如 Record<string, any> 或自定义接口
  session_id: string;
  timestamp: number;
}

export interface Answer {
  id: string;
  job_id: string;
  payload: any;
  session_id: string;
  timestamp: number;
}

export interface AnswerMetrics {
  job_id: string;
  status: string;
  duration: number;
  tokens: number;
}

export interface ThinkingMessage {
  payload: any;
  job_id: string;
  artifact_ids: string[];
  timestamp: number;
  id: string;
}

export interface ThinkingSubjob {
  goal: string;
  original_job_id: string;
  context: string;
  id: string;
  session_id: string;
  assigned_expert_name: string;
  expert_id: string;
  output_schema: string;
  life_cycle: number;
  is_legacy: boolean;
  thinking: string;
  dag: any;
}

export interface ThinkingMetrics {
  job_id: string;
  status: string;
  duration: number;
  tokens: number;
}

// 会话消息结构
export interface SessionMessageItem {
  question: Question;
  answer: Answer;
  answer_metrics: AnswerMetrics;
  thinking_messages: ThinkingMessage[];
  thinking_subjobs: ThinkingSubjob[];
  thinking_metrics: ThinkingMetrics[];
}

export interface SessionMessageViewResponse {
  data: SessionMessageItem[];
  message: string;
  code: number;
}

export interface JobMessageViewResponse {
  data: SessionMessageItem;
  message: string;
  code: number;
}

// ======================== 工具函数 ========================
/** 兼容 Mock/后端的响应数据提取 */
function extractData<T>(res: any): T {
  return res?.data?.data ?? res?.data ?? res;
}

// ======================== 接口方法 ========================

/**
 * 获取会话消息视图
 * @param sessionId 会话 ID
 * @returns 会话消息列表
 */
export const getSessionMessageView = async (
  sessionId: string
): Promise<SessionMessageViewResponse> => {
  try {
    if (!sessionId) {
      throw new Error('sessionId 不能为空');
    }
    const res = await request.get(`/sessions/<session_id>/messages?session_id=${sessionId}`);
    return {
      code: res.data.code ?? 200,
      message: res.data.message ?? '请求成功',
      data: extractData<SessionMessageItem[]>(res),
    };
  } catch (err) {
    const error = err as Error;
    console.error('获取会话消息失败：', error.message);
    // 抛出标准化错误，方便上层组件处理
    throw {
      code: 500,
      message: error.message,
      data: [] as SessionMessageItem[],
    };
  }
};

/**
 * 获取指定任务的消息视图
 * @param jobId 任务 ID
 * @returns 单个任务消息
 */
export const getJobMessageView = async (
  jobId: string
): Promise<JobMessageViewResponse> => {
  try {
    if (!jobId) {
      throw new Error('jobId 不能为空');
    }
    const res = await request.get(`/jobs/${jobId}/message`);
    return {
      code: res.data.code ?? 200,
      message: res.data.message ?? '请求成功',
      data: extractData<SessionMessageItem>(res),
    };
  } catch (err) {
    const error = err as Error;
    console.error('获取任务消息失败：', error.message);
    // 抛出标准化错误
    throw {
      code: 500,
      message: error.message,
      data: {} as SessionMessageItem,
    };
  }
};