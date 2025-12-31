import React, { useEffect, useState } from 'react';
import {
    getGraphDBList,
    deleteGraphDB,
    validateGraphDBConnection,
    createGraphDB,
    updateGraphDB,
    getGraphDBById,
    GraphDBConfig
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
    desc?: string;
    user?: string;
    pwd?: string;
    default_schema?: string;
    is_default_db?: boolean;
    create_time?: number;
    update_time?: number;
}

interface GraphDBFormData {
    name: string;
    type: string;
    host: string;
    port: string;
    desc: string;
    user: string;
    pwd: string;
    default_schema: string;
    is_default_db: boolean;
}

const GraphDBList: React.FC = () => {
    const [list, setList] = useState<GraphDB[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(
        getCurrentGraphDB()?.id || null
    );
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDB, setEditingDB] = useState<GraphDB | null>(null);
    const [formData, setFormData] = useState<GraphDBFormData>({
        name: '',
        type: 'NEO4J',
        host: '',
        port: '7687',
        desc: '',
        user: '',
        pwd: '',
        default_schema: '',
        is_default_db: false
    });
    const [validatingId, setValidatingId] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getGraphDBList();
            setList(res.data?.data || []);
        } catch (error) {
            console.error('加载图数据库列表失败:', error);
            alert('加载图数据库列表失败');
        } finally {
            setLoading(false);
        }
    };

    /** 选择图数据库 */
    const handleSelect = (db: GraphDB) => {
        setCurrentId(db.id);
        setCurrentGraphDB({ id: db.id, name: db.name });
    };

    /** 删除 */
    const handleDelete = async (db: GraphDB) => {
        if (!window.confirm(`确定删除 ${db.name}？`)) return;
        try {
            await deleteGraphDB(db.id);
            if (currentId === db.id) {
                setCurrentId(null);
            }
            load();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败');
        }
    };

    /** 验证连接 */
    const handleValidate = async (db: GraphDB) => {
        setValidatingId(db.id);
        try {
            await validateGraphDBConnection({
                host: db.host,
                port: db.port,
                user: db.user || '',
                pwd: db.pwd || '',
                type: db.type
            });
            alert(`【${db.name}】连接成功`);
        } catch (error) {
            console.error('连接失败:', error);
            alert(`【${db.name}】连接失败`);
        } finally {
            setValidatingId(null);
        }
    };

    /** 打开创建模态框 */
    const handleCreate = () => {
        setEditingDB(null);
        setFormData({
            name: '',
            type: 'NEO4J',
            host: '',
            port: '7687',
            desc: '',
            user: '',
            pwd: '',
            default_schema: '',
            is_default_db: false
        });
        setShowModal(true);
    };

    /** 打开编辑模态框 */
    const handleEdit = async (db: GraphDB) => {
        try {
            const res = await getGraphDBById(db.id);
            const dbData = res.data?.data || db;
            setEditingDB(dbData);
            setFormData({
                name: dbData.name,
                type: dbData.type,
                host: dbData.host,
                port: dbData.port.toString(),
                desc: dbData.desc || '',
                user: dbData.user || '',
                pwd: dbData.pwd || '',
                default_schema: dbData.default_schema || '',
                is_default_db: dbData.is_default_db || false
            });
            setShowModal(true);
        } catch (error) {
            console.error('获取数据库详情失败:', error);
            alert('获取数据库详情失败');
        }
    };

    /** 处理表单变化 */
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    /** 提交表单 */
    const handleSubmit = async () => {
        // 验证必填字段
        if (!formData.name.trim()) {
            alert('请输入数据库名称');
            return;
        }
        if (!formData.host.trim()) {
            alert('请输入主机地址');
            return;
        }
        if (!formData.port.trim()) {
            alert('请输入端口号');
            return;
        }

        const portNum = parseInt(formData.port, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            alert('请输入有效的端口号 (1-65535)');
            return;
        }

        const dbData: GraphDBConfig = {
            type: formData.type,
            name: formData.name,
            host: formData.host,
            port: portNum,
            desc: formData.desc || undefined,
            user: formData.user || undefined,
            pwd: formData.pwd || undefined,
            default_schema: formData.default_schema || undefined,
            is_default_db: formData.is_default_db
        };

        try {
            if (editingDB) {
                // 更新
                await updateGraphDB(editingDB.id, dbData);
                alert('更新成功');
            } else {
                // 创建
                await createGraphDB(dbData);
                alert('创建成功');
            }
            setShowModal(false);
            load();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败');
        }
    };

    /** 设置默认数据库 */
    const handleSetDefault = async (db: GraphDB) => {
        try {
            await updateGraphDB(db.id, {
                ...db,
                is_default_db: true
            });
            alert(`已将 ${db.name} 设置为默认数据库`);
            load();
        } catch (error) {
            console.error('设置默认数据库失败:', error);
            alert('设置默认数据库失败');
        }
    };

    return (
        <div className="graphdb-wrapper">
            <div className="graphdb-title">📚 图知识库</div>

            {loading && <div className="graphdb-loading">加载中...</div>}

            {list.map(db => (
                <div
                    key={db.id}
                    className={`graphdb-item ${currentId === db.id ? 'active' : ''}`}
                    onClick={() => handleSelect(db)}
                >
                    <div className="graphdb-header">
                        <span className="graphdb-name">{db.name}</span>
                        <div className="graphdb-header-tags">
                            {db.is_default_db && <span className="default-tag">默认</span>}
                            {currentId === db.id && <span className="using-tag">使用中</span>}
                        </div>
                    </div>

                    <div className="graphdb-meta">
                        <span className="graphdb-type">{db.type}</span>
                        <span className="graphdb-address">{db.host}:{db.port}</span>
                        {db.desc && <span className="graphdb-desc">{db.desc}</span>}
                    </div>

                    <div className="graphdb-actions">
                        <button
                            onClick={e => { e.stopPropagation(); handleEdit(db); }}
                            disabled={validatingId === db.id}
                        >
                            编辑
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleValidate(db); }}
                            disabled={validatingId === db.id}
                        >
                            {validatingId === db.id ? '验证中...' : '验证连接'}
                        </button>
                        {!db.is_default_db && (
                            <button
                                onClick={e => { e.stopPropagation(); handleSetDefault(db); }}
                                disabled={validatingId === db.id}
                            >
                                设为默认
                            </button>
                        )}
                        <button
                            className="danger"
                            onClick={e => {
                                e.stopPropagation();
                                handleDelete(db);
                            }}
                            disabled={validatingId === db.id}
                        >
                            删除
                        </button>
                    </div>
                </div>
            ))}

            <button
                className="graphdb-add"
                onClick={handleCreate}
            >
                ＋ 新增图数据库
            </button>

            {/* 创建/编辑模态框 */}
            {showModal && (
                <div className="graphdb-modal-overlay">
                    <div className="graphdb-modal">
                        <div className="graphdb-modal-header">
                            <h3>{editingDB ? '编辑图数据库' : '新增图数据库'}</h3>
                            <button className="graphdb-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <div className="graphdb-modal-body">
                            <div className="form-group">
                                <label>数据库名称 *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="请输入数据库名称"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>数据库类型 *</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                >
                                    <option value="NEO4J">Neo4j</option>
                                    <option value="TUGRAPH">TuGraph</option>
                                </select>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>主机地址 *</label>
                                    <input
                                        type="text"
                                        name="host"
                                        value={formData.host}
                                        onChange={handleFormChange}
                                        placeholder="例如：localhost 或 127.0.0.1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>端口 *</label>
                                    <input
                                        type="text"
                                        name="port"
                                        value={formData.port}
                                        onChange={handleFormChange}
                                        placeholder="例如：7687"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>用户名</label>
                                    <input
                                        type="text"
                                        name="user"
                                        value={formData.user}
                                        onChange={handleFormChange}
                                        placeholder="可选"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>密码</label>
                                    <input
                                        type="password"
                                        name="pwd"
                                        value={formData.pwd}
                                        onChange={handleFormChange}
                                        placeholder="可选"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>默认 Schema</label>
                                <input
                                    type="text"
                                    name="default_schema"
                                    value={formData.default_schema}
                                    onChange={handleFormChange}
                                    placeholder="可选"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>描述</label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleFormChange}
                                    placeholder="请输入数据库描述（可选）"
                                    rows={3}
                                />
                            </div>
                            
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_default_db"
                                        checked={formData.is_default_db}
                                        onChange={handleFormChange}
                                    />
                                    设为默认数据库
                                </label>
                            </div>
                        </div>
                        
                        <div className="graphdb-modal-footer">
                            <button className="graphdb-modal-cancel" onClick={() => setShowModal(false)}>
                                取消
                            </button>
                            <button className="graphdb-modal-submit" onClick={handleSubmit}>
                                {editingDB ? '更新' : '创建'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphDBList;
