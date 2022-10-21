export interface BaseData {
    root: string;
}

export interface Merkle {
    tree: string;
    root: string;
}

interface DataBase<T extends BaseData> {
    set(value: T): void
    get(root: string): T | undefined;
}

export class InMemoryDatabase<T extends BaseData> implements DataBase<T> {
    private db: Record<string, T> = {};

    public set(value: T): void {
        this.db[value.root] = value; 
    }

    public get(root: string) : T | undefined {
        return this.db[root] 
    }
    
}