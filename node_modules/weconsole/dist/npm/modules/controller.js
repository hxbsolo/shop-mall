import { EventEmitter } from './event-emitter';
import { filter as filterList } from './util';
export class MpProductController extends EventEmitter {
    constructor() {
        super();
        this.map = {};
        this.list = [];
    }
    getList(filter) {
        if (!filter) {
            return [].concat(this.list);
        }
        return filterList(this.list, filter);
    }
    create(data) {
        if (!this.map[data.id]) {
            this.map[data.id] = data;
            this.list.push(data);
        }
        Object.assign(this.map[data.id], data);
        this.emit('create', this.map[data.id]);
        return this.map[data.id];
    }
    change(data) {
        if (!this.map[data.id]) {
            this.map[data.id] = data;
            this.list.push(data);
        }
        Object.assign(this.map[data.id], data);
        this.emit('change', this.map[data.id]);
        return this.map[data.id];
    }
}
