import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllSessions, createSession, deleteSession, updateSession, Session } from '../../api/seesionsListApi';
import SessionMessages from '../SessionMessage/SessionMessage';
import './SessionList.css';

interface SessionListProps {
    isSidebarExpanded: boolean;
}

const SessionList: React.FC<SessionListProps> = ({ isSidebarExpanded }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeDialogId, setActiveDialogId] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const liRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

    // 同步 URL 中的 activeDialogId
    useEffect(() => {
        const match = location.pathname.match(/\/chat\/(.+)/);
        if (match) setActiveDialogId(match[1]);
    }, [location.pathname]);

    // 获取会话列表
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await getAllSessions(1, 50);
                setSessions(data || []);
                if (data?.length && !activeDialogId) {
                    setActiveDialogId(data[0].id);
                    navigate(`/chat/${data[0].id}`, { replace: true });
                }
            } catch (err) {
                console.error('获取会话列表失败', err);
            }
        };
        fetchSessions();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleCreateSession = async () => {
        if (!newSessionName.trim()) return;
        try {
            const res = await createSession(newSessionName.trim());
            if (res.code === 200) {
                setSessions(prev => [res.data, ...prev]);
                setActiveDialogId(res.data.id);
                navigate(`/chat/${res.data.id}`);
                setIsCreateModalOpen(false);
                setNewSessionName('');
            }
        } catch (err) {
            console.error(err);
            alert('创建会话失败');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('确定删除该会话吗？')) return;
        try {
            await deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
            if (activeDialogId === id && sessions.length > 1) {
                const nextId = sessions.find(s => s.id !== id)?.id || '';
                setActiveDialogId(nextId);
                navigate(`/chat/${nextId}`);
            }
        } catch (err: any) {
            if (err.response?.status === 404) alert('会话不存在或已被删除');
            else console.error(err);
        }
    };

    const handleRename = async (id: string) => {
        const newName = prompt('输入新的会话名称：');
        if (!newName?.trim()) return;
        try {
            const res = await updateSession(id, newName);
            if (res.code === 200) setSessions(prev => prev.map(s => s.id === id ? res.data : s));
        } catch (err) {
            console.error(err);
        }
    };

    if (!isSidebarExpanded) return null;

    return (
        <div className={`sessionlist__panel ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <button className="sessionlist__new-btn" onClick={() => setIsCreateModalOpen(true)}>+ 新建会话</button>
            <ul className="sessionlist__list">
                {sessions.map(s => (
                    <li
                        key={s.id}
                        ref={el => liRefs.current[s.id] = el}
                        className={`sessionlist__item ${activeDialogId === s.id ? 'sessionlist__item--active' : ''}`}
                        onMouseEnter={() => setHoveredSessionId(s.id)}
                        onMouseLeave={() => setHoveredSessionId(null)}
                    >
                        <span
                            className="sessionlist__name"
                            onClick={() => setActiveDialogId(s.id)}
                        >
                            {s.name || '未命名会话'}
                        </span>

                        {hoveredSessionId === s.id && (
                            <div className="sessionlist__actions" onClick={e => e.stopPropagation()}>
                                <button
                                    className="sessionlist__more-btn"
                                    onClick={() => setOpenMenuId(prev => prev === s.id ? null : s.id)}
                                    title="更多操作"
                                >…</button>
                                {openMenuId === s.id && liRefs.current[s.id] && ReactDOM.createPortal(
                                    <div
                                        className="sessionlist__more-menu"
                                        style={{
                                            top: liRefs.current[s.id]!.getBoundingClientRect().bottom + window.scrollY,
                                            left: liRefs.current[s.id]!.getBoundingClientRect().right - 100,
                                            zIndex: 9999,
                                        }}
                                    >
                                        <div onClick={() => handleRename(s.id)}>重命名</div>
                                        <div onClick={() => handleDelete(s.id)}>删除</div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        )}

                        {/* 会话历史消息 */}
                        {activeDialogId === s.id && (
                            <div className="sessionlist__history">
                                <SessionMessages sessionId={s.id} />
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {isCreateModalOpen && ReactDOM.createPortal(
                <div className="sessionlist__modal-overlay">
                    <div className="sessionlist__modal">
                        <h3>输入会话名称</h3>
                        <input
                            type="text"
                            value={newSessionName}
                            onChange={e => setNewSessionName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
                            autoFocus
                        />
                        <div className="sessionlist__modal-btns">
                            <button onClick={handleCreateSession}>创建</button>
                            <button onClick={() => { setIsCreateModalOpen(false); setNewSessionName(''); }}>取消</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SessionList;

