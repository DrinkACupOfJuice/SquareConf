// src/components/SessionJob/SessionJob.ts
import {
    chatWithSession,
    stopSessionJob,
    getLatestJobId,
    recoverSessionJob,
    ChatPayload,
    ChatResponse,
    StopJobResponse,
    LatestJobResponse,
    RecoverJobResponse
} from '../../api/seesionJobApi';

import { getSessionMessageView, SessionMessageItem } from '../../api/sessionMessageApi';

export interface SessionJobProps {
    sessionId: string;
}

export interface MessageInfo {
    payload: string;
    job_id: string;
    timestamp: number;
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    thinkingTime?: number;
    tokenCount?: number;
}

export interface SessionSummary {
    id: string;
    name: string;
}

export class SessionJob {
    sessionId: string;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
    }

    /** 发送消息 */
    async sendMessage(message: string): Promise<MessageInfo> {
        const res: ChatResponse = await chatWithSession(this.sessionId, message);
        const msg: MessageInfo = {
            ...res.data,
            thinkingTime: 0
        };
        return msg;
    }

    /** 获取历史消息 */
    async loadHistory(): Promise<MessageInfo[]> {
        const res = await getSessionMessageView(this.sessionId);
        return res.data.map((item: SessionMessageItem) => ({
            id: item.answer.id,
            payload: item.answer.payload,
            role: 'assistant',
            timestamp: item.answer.timestamp,
            thinkingTime: item.thinking_metrics?.duration,
            tokenCount: item.thinking_metrics?.tokens
        }));
    }

    async stop(): Promise<StopJobResponse> {
        return await stopSessionJob(this.sessionId);
    }

    async getLatestJobId(): Promise<string> {
        const res: LatestJobResponse = await getLatestJobId(this.sessionId);
        return res.data.id;
    }

    async recover(): Promise<RecoverJobResponse> {
        return await recoverSessionJob(this.sessionId);
    }

    static async simulateThinking(ms: number = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

