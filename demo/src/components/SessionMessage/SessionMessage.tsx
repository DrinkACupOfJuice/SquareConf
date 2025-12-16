// src/components/SessionMessages/SessionMessages.tsx
import React, { useEffect, useState } from 'react';
import {
    getSessionMessageView,
    SessionMessageItem,
} from '../../api/sessionMessageApi';
import './SessionMessage.css';

interface SessionMessagesProps {
    sessionId: string;
}

// 将 payload 兼容处理成字符串
const formatPayload = (payload: any): string => {
    if (payload === null || payload === undefined) return '';
    if (typeof payload === 'string') return payload;
    try {
        return JSON.stringify(payload);
    } catch {
        return String(payload);
    }
};

const SessionMessages: React.FC<SessionMessagesProps> = ({ sessionId }) => {
    const [messages, setMessages] = useState<SessionMessageItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await getSessionMessageView(sessionId);

                if (res.code === 200) {
                    setMessages(Array.isArray(res.data) ? res.data : []);
                } else {
                    setError(res.message || '获取消息失败');
                }
            } catch (err) {
                console.error('获取会话消息失败：', err);
                setError('获取消息异常，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) fetchMessages();
    }, [sessionId]);

    if (loading)
        return (
            <div className="session-messages__loading">加载中...</div>
        );
    if (error)
        return (
            <div className="session-messages__error">{error}</div>
        );
    if (!messages.length&&!loading)
        return (
            <div className="session-messages__empty">暂无消息</div>
        );

    return (
        <div className="session-messages__container">
            {messages.map((item) => (
                <div key={item.question?.id} className="session-messages__item">
                    {/* 用户消息 */}
                    <div className="session-messages__question">
                        <strong>用户：</strong>
                        {formatPayload(item.question?.payload)}
                    </div>

                    {/* AI 回复 */}
                    {item.answer && (
                        <div className="session-messages__answer">
                            <strong>AI：</strong>
                            {formatPayload(item.answer.payload)}
                        </div>
                    )}

                    {/* 思考消息 */}
                    {item.thinking_messages &&
                        item.thinking_messages.length > 0 && (
                            <div className="session-messages__thinking">
                                <strong>思考消息：</strong>
                                <ul>
                                    {item.thinking_messages.map((msg) => (
                                        <li key={msg.id}>
                                            {formatPayload(msg.payload)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>
            ))}
        </div>
    );
};

export default SessionMessages;

