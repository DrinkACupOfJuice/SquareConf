export interface CurrentGraphDB {
    id: string;
    name: string;
}

const KEY = 'current_graph_db';

export const getCurrentGraphDB = (): CurrentGraphDB | null => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
};

export const setCurrentGraphDB = (db: CurrentGraphDB) => {
    localStorage.setItem(KEY, JSON.stringify(db));
};

export const clearCurrentGraphDB = () => {
    localStorage.removeItem(KEY);
};
