// src/components/SessionList/SessionList.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getAllSessions,
  createSession,
  deleteSession,
  updateSession,
  Session
} from '../../api/seesionsListApi';
import './SessionList.css';

interface SessionListProps {
  isSidebarExpanded: boolean;
  activeSessionId: string;
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
  const hasAutoNavigated = useRef(false);
  const mountedRef = useRef(true);

  // 标记挂载状态
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // URL → activeDialogId 同步
  useEffect(() => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    if (match) {
      setActiveDialogId(match[1]);
    } else {
      setActiveDialogId('');
    }
  }, [location.pathname]);

  // 获取会话列表（仅挂载时一次）
  useEffect(() => {
    let cancelled = false;

    const fetchSessions = async () => {
      try {
        const data = await getAllSessions(1, 50);
        if (cancelled || !mountedRef.current) return;

        setSessions(data || []);

        const isAtChatRoot =
          location.pathname === '/chat' || location.pathname === '/chat/';
        const hasSession = data && data.length > 0;

        if (isAtChatRoot && hasSession && !hasAutoNavigated.current) {
          hasAutoNavigated.current = true;
          const firstId = data[0].id;
          setActiveDialogId(firstId);
          navigate(`/chat/${firstId}`, { replace: true });
        }
      } catch (err) {
        console.error('获取会话列表失败', err);
      }
    };

    fetchSessions();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 点击外部关闭更多菜单
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 新建会话
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    try {
      const res = await createSession(newSessionName.trim());
      if (res && res.code === 200 && res.data) {
        setSessions(prev => [res.data, ...prev]);
        setActiveDialogId(res.data.id);
        navigate(`/chat/${res.data.id}`);
        setIsCreateModalOpen(false);
        setNewSessionName('');
      } else {
        alert('创建会话失败');
      }
    } catch (err) {
      console.error(err);
      alert('创建会话失败');
    }
  };

  // 删除会话
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除该会话吗？')) return;
    try {
      await deleteSession(id);

      setSessions(prev => {
        const nextSessions = prev.filter(s => s.id !== id);

        if (activeDialogId === id) {
          if (nextSessions.length > 0) {
            const nextId = nextSessions[0].id;
            navigate(`/chat/${nextId}`);
            setActiveDialogId(nextId);
          } else {
            navigate('/home');
            setActiveDialogId('');
          }
        }

        return nextSessions;
      });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        alert('会话不存在或已被删除');
      } else {
        console.error(err);
      }
    }
  };

  // 重命名
  const handleRename = async (id: string) => {
    const newName = prompt('输入新的会话名称：');
    if (!newName?.trim()) return;
    try {
      const res = await updateSession(id, newName.trim());
      if (res && res.code === 200 && res.data) {
        setSessions(prev => prev.map(s => (s.id === id ? res.data : s)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 选择会话
  const handleSelect = (id: string) => {
    setActiveDialogId(id);
    navigate(`/chat/${id}`);
  };

  if (!isSidebarExpanded) return null;

  return (
    <div className={`sessionlist__panel ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="sessionlist__new-btn"
        onClick={() => setIsCreateModalOpen(true)}
      >
        + 新建会话
      </button>

      <ul className="sessionlist__list">
        {sessions.map(s => (
          <li
            key={s.id}
            ref={el => (liRefs.current[s.id] = el)}
            className={`sessionlist__item ${activeDialogId === s.id ? 'sessionlist__item--active' : ''
              }`}
            onMouseEnter={() => setHoveredSessionId(s.id)}
            onMouseLeave={() => setHoveredSessionId(null)}
            onClick={() => handleSelect(s.id)}
          >
            <span className="sessionlist__name">
              {s.name || '未命名会话'}
            </span>

            {hoveredSessionId === s.id && (
              <div
                className="sessionlist__actions"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="sessionlist__more-btn"
                  onClick={e => {
                    e.stopPropagation();
                    setOpenMenuId(prev => (prev === s.id ? null : s.id));
                  }}
                >
                  …
                </button>

                {openMenuId === s.id &&
                  liRefs.current[s.id] &&
                  ReactDOM.createPortal(
                    <div
                      className="sessionlist__more-menu"
                      style={{
                        top:
                          liRefs.current[s.id]!.getBoundingClientRect().bottom +
                          window.scrollY,
                        left: Math.max(
                          8,
                          liRefs.current[s.id]!.getBoundingClientRect().right -
                          140
                        ),
                        zIndex: 9999
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div
                        className="sessionlist__more-item"
                        onClick={() => {
                          handleRename(s.id);
                          setOpenMenuId(null);
                        }}
                      >
                        重命名
                      </div>
                      <div
                        className="sessionlist__more-item sessionlist__more-item--danger"
                        onClick={() => {
                          handleDelete(s.id);
                          setOpenMenuId(null);
                        }}
                      >
                        删除
                      </div>
                    </div>,
                    document.body
                  )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {isCreateModalOpen &&
        ReactDOM.createPortal(
          <div
            className="sessionlist__modal-overlay"
            onClick={() => {
              setIsCreateModalOpen(false);
              setNewSessionName('');
            }}
          >
            <div
              className="sessionlist__modal"
              onClick={e => e.stopPropagation()}
            >
              <h3>输入会话名称</h3>
              <input
                type="text"
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
                autoFocus
                className="sessionlist__modal-input"
              />
              <div className="sessionlist__modal-btns">
                <button 
                  onClick={handleCreateSession}
                  className='sessionlist__new-btn'
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewSessionName('');
                  }}
                  className='sessionlist__new-btn'
                >
                  取消
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SessionList;