// src/api/sessionMessageApi.ts
import request from './Fileapi';

// ======================== 类型定义 ========================
export interface Question {
    id: string;
    job_id: string;
    payload: any;
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

// ======================== 会话消息视图接口 ========================

/** 获取会话消息视图 */
export const getSessionMessageView = async (sessionId: string): Promise<SessionMessageViewResponse> => {
    const res = await request.get(`/sessions/${sessionId}/messages`);
    return res.data;
};

/** 获取指定任务的消息视图 */
export const getJobMessageView = async (jobId: string): Promise<JobMessageViewResponse> => {
    const res = await request.get(`/jobs/${jobId}/messages`);
    return res.data;
};