import { EventEmitter } from '../../modules/event-emitter';
export class ReaderStateController extends EventEmitter {
    // eslint-disable-next-line @typescript-eslint/no-parameter-properties
    constructor(name, productController) {
        super();
        this.name = name;
        this.productController = productController;
        this.recording = true;
        this.state = {
            state: {},
            productIdList: [],
            productIdMap: {},
            keepSaveMap: {},
            topList: [],
            markMap: {}
        };
        if ((name === 'Api' || name === 'Console') && productController) {
            if (typeof productController === 'function') {
                const promise = productController();
                if (promise && promise.then) {
                    promise.then((res) => {
                        this.bind(res);
                    });
                }
                else {
                    this.bind(promise);
                }
            }
            else {
                this.bind(productController);
            }
        }
    }
    bind(productController) {
        const name = this.name;
        const addMaterial = (id) => {
            const { productIdList, productIdMap } = this.state;
            if (!productIdMap[id]) {
                productIdList.push(id);
            }
        };
        const list = productController.getList();
        list.forEach((item) => {
            if ((item.type === "Api" /* Api */ && name === 'Api') ||
                (item.type === "Console" /* Console */ && name === 'Console')) {
                addMaterial(item.id);
            }
        });
        const handler = (type, data) => {
            if (!this.recording) {
                return;
            }
            if ((data.type === "Api" /* Api */ && name === 'Api') ||
                (data.type === "Console" /* Console */ && name === 'Console')) {
                addMaterial(data.id);
            }
        };
        productController.on('create', handler);
        productController.on('change', handler);
    }
    clearProducts() {
        this.state.productIdList = [];
        this.state.productIdMap = {};
        if (this.state.keepSaveMap) {
            this.state.productIdList = Object.keys(this.state.keepSaveMap);
        }
    }
    getProductIdList() {
        return this.state.productIdList.concat([]);
    }
    record(recording) {
        this.recording = recording;
    }
    getState(key, defaultVal) {
        return key in this.state.state ? this.state.state[key] : defaultVal;
    }
    setState(key, val) {
        this.state.state[key] = val;
        this.emit('setState', {
            key,
            val,
            state: this.state.state
        });
    }
    removeState(key) {
        const val = this.state.state[key];
        delete this.state.state[key];
        this.emit('removeState', {
            key,
            oldVal: val,
            state: this.state.state
        });
    }
    handMap(type, ...args) {
        const argLen = args.length;
        let map;
        let cancelAll;
        let cancel;
        if (type === 'keepSave') {
            map = this.state.keepSaveMap;
            cancelAll = 'cancelAllKeepSave';
            cancel = 'cancelKeepSave';
        }
        else if (type === 'mark') {
            map = this.state.markMap;
            cancelAll = 'cancelAllMark';
            cancel = 'cancelMark';
        }
        else if (type === 'top') {
            map = this.state.topList;
            cancelAll = 'cancelAllTop';
            cancel = 'cancelTop';
        }
        if (!argLen) {
            // 拿所有id
            return type === 'top' ? map : Object.keys(map);
        }
        const [id, save] = args;
        if (!id) {
            if (argLen < 2 || save !== false) {
                // 拿所有id
                return type === 'top' ? map : Object.keys(map);
            }
            if (type !== 'top') {
                // 取消全部
                // eslint-disable-next-line guard-for-in
                for (const prop in map) {
                    delete map[prop];
                }
                this.emit(cancelAll);
                return;
            }
            map.splice(0, map.length);
            this.emit(cancelAll);
            return;
        }
        if (save) {
            if (type !== 'top') {
                map[id] = 1;
                this.emit(type, {
                    id,
                    map: map
                });
                return;
            }
            map.unshift(id);
            if (map.length > 3) {
                map.pop();
            }
            this.emit(type, {
                id,
                map
            });
        }
        if (type !== 'top') {
            delete map[id];
            this.emit(cancel, {
                id,
                map: map
            });
            return;
        }
        const index = map.findIndex((item) => item === id);
        if (index !== -1) {
            map.splice(index, 1);
            this.emit(cancel, {
                id,
                map: map
            });
        }
    }
    keepSave(id, save) {
        return this.handMap.apply(this, ['keepSave', id, save]);
    }
    mark(id, save) {
        return this.handMap.apply(this, ['mark', id, save]);
    }
    top(id, save) {
        return this.handMap.apply(this, ['top', id, save]);
    }
}
