import request from "./Fileapi"; // 你已有的 axios 封装

// ======================== 类型定义 ========================

export interface GraphDBConfig {
    type: string;            // 图数据库类型（NEO4J / TUGRAPH）
    name: string;            // 名称
    host: string;            // URL或者IP
    port: number;            // 端口
    id?: string;             // 创建时无，更新/查询时有
    desc?: string;           // 描述
    user?: string;           // 用户名
    pwd?: string;            // 密码
    default_schema?: string; // 默认schema
    is_default_db?: boolean; // 是否默认数据库

    create_time?: number;
    update_time?: number;
}

// ======================== API 接口封装 ========================

/** 获取全部图数据库列表 */
export const getGraphDBList = () => {
    return request.get("/graphdbs/");
};

/** 获取指定 ID 图数据库详情 */
export const getGraphDBById = (graphDbId: string) => {
    return request.get(`/graphdbs/${graphDbId}`);
};

/** 删除指定 ID 图数据库 */
export const deleteGraphDB = (graphDbId: string) => {
    return request.delete(`/graphdbs/${graphDbId}`);
};

/** 创建图数据库配置 */
export const createGraphDB = (data: GraphDBConfig) => {
    return request.post("/graphdbs/", data);
};

/** 更新图数据库配置 */
export const updateGraphDB = (graphDbId: string, data: GraphDBConfig) => {
    return request.put(`/graphdbs/${graphDbId}`, data);
};

/** 验证图数据库连接 */
export const validateGraphDBConnection = (data: {
    host: string;
    port: number;
    user: string;
    pwd: string;
    type: string;
}) => {
    return request.post("/graphdbs/validate_connection", data);
};
