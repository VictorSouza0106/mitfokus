
export type Filters = 'ALL' | 'ACTIVE' | 'COMPLETED';

export interface ITodoObj {
    id: number,
    complete: boolean,
    text: string,
};

export interface ICacheData {
    timestamp: number,
    todos: ITodoObj[];
    selectedFilter: Filters;
};