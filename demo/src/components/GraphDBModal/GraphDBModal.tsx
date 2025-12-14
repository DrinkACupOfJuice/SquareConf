import React, { useEffect, useState } from 'react';
import './graphDBModal.css';
import {
    getGraphDBList,
    deleteGraphDB,
    validateGraphDBConnection
} from '../../api/graphDBApi';

interface GraphDBModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GraphDBModal: React.FC<GraphDBModalProps> = ({ isOpen, onClose }) => {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        loadList();
    }, [isOpen]);

    const loadList = async () => {
        setLoading(true);
        try {
            const res = await getGraphDBList();
            setList(res.data?.data || []);
        } catch (e) {
            alert('加载图数据库列表失败');
        } finally {
            setLoading(false);
        }
    };

    /** 校验连接 */
    const handleValidate = async (db: any) => {
        setActionLoadingId(db.id);
        try {
            await validateGraphDBConnection({
                host: db.host,
                port: db.port,
                user: db.user,
                pwd: db.pwd,
                type: db.type
            });
            alert(`【${db.name}】连接成功`);
        } catch (e) {
            alert(`【${db.name}】连接失败`);
        } finally {
            setActionLoadingId(null);
        }
    };

    /** 删除 */
    const handleDelete = async (db: any) => {
        const ok = window.confirm(`确定删除图数据库【${db.name}】吗？`);
        if (!ok) return;

        setActionLoadingId(db.id);
        try {
            await deleteGraphDB(db.id);
            alert('删除成功');
            loadList();
        } catch (e) {
            alert('删除失败');
        } finally {
            setActionLoadingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="gdb-modal">
            <div className="gdb-modal-content">
                <button className="gdb-close-btn" onClick={onClose}>×</button>

                <h3 className="gdb-modal-title">图知识库配置</h3>

                {/* 列表 */}
                <div className="gdb-list">
                    {loading && <div className="gdb-empty">加载中...</div>}

                    {!loading && list.length === 0 && (
                        <div className="gdb-empty">暂无图数据库</div>
                    )}

                    {list.map(db => (
                        <div key={db.id} className="gdb-item">
                            <div className="gdb-info">
                                <span className="gdb-name">{db.name}</span>
                                {db.is_default_db && (
                                    <span className="gdb-tag">默认</span>
                                )}
                            </div>

                            <div className="gdb-actions">
                                <button
                                    disabled={actionLoadingId === db.id}
                                    onClick={() => handleValidate(db)}
                                >
                                    校验
                                </button>
                                <button
                                    disabled={actionLoadingId === db.id}
                                    onClick={() => handleDelete(db)}
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 操作区 */}
                <div className="gdb-modal-actions">
                    <button className="gdb-cancel-btn" onClick={onClose}>
                        关闭
                    </button>
                    <button
                        className="gdb-submit-btn"
                    >
                        新增图数据库
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphDBModal;

