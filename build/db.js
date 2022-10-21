export class InMemoryDatabase {
    constructor() {
        this.db = {};
    }
    set(value) {
        this.db[value.root] = value;
    }
    get(root) {
        return this.db[root];
    }
}
//# sourceMappingURL=db.js.map