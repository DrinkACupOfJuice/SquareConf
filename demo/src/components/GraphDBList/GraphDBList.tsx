import React, { useEffect, useState } from 'react';
import {
    getGraphDBList,
    deleteGraphDB
} from '../../api/graphdbApi';
import {
    getCurrentGraphDB,
    setCurrentGraphDB
} from '../../store/graphdbStore';
import './GraphDBList.css';

interface GraphDB {
    id: string;
    name: string;
    type: string;
    host: string;
    port: number;
    is_default_db?: boolean;
}

const GraphDBList: React.FC = () => {
    const [list, setList] = useState<GraphDB[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(
        getCurrentGraphDB()?.id || null
    );

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await getGraphDBList();
        setList(res.data?.data || []);
    };

    /** 1️⃣ 选择图数据库 */
    const handleSelect = (db: GraphDB) => {
        setCurrentId(db.id);
        setCurrentGraphDB({ id: db.id, name: db.name });
    };

    /** 3️⃣ 删除 */
    const handleDelete = async (db: GraphDB) => {
        if (!window.confirm(`确定删除 ${db.name}？`)) return;
        await deleteGraphDB(db.id);
        if (currentId === db.id) {
            setCurrentId(null);
        }
        load();
    };

    return (
        <div className="graphdb-wrapper">
            <div className="graphdb-title">📚 图知识库</div>

            {list.map(db => (
                <div
                    key={db.id}
                    className={`graphdb-item ${currentId === db.id ? 'active' : ''}`}
                    onClick={() => handleSelect(db)}
                >
                    <div className="graphdb-header">
                        <span>{db.name}</span>
                        {currentId === db.id && <span className="using-tag">使用中</span>}
                    </div>

                    <div className="graphdb-meta">
                        {db.type} · {db.host}:{db.port}
                    </div>

                    <div className="graphdb-actions">
                        <button onClick={e => { e.stopPropagation(); alert('编辑下一步'); }}>
                            编辑
                        </button>
                        <button
                            className="danger"
                            onClick={e => {
                                e.stopPropagation();
                                handleDelete(db);
                            }}
                        >
                            删除
                        </button>
                    </div>
                </div>
            ))}

            <button
                className="graphdb-add"
                onClick={() => alert('新增下一步')}
            >
                ＋ 新增图数据库
            </button>
        </div>
    );
};

export default GraphDBList;

