import { isEmptyObject, isPlainObject } from '@mpkit/util';
import { getMpViewType, has, log } from '../../modules/util';
export const ELLIPSIS_CHAR = '…';
export const FUNC_CHAR = 'ƒ';
export const PROTO_PROP = '__proto__';
export const equalJSONPropPath = (a, b) => {
    if (!a && !b) {
        return true;
    }
    if (!a) {
        return false;
    }
    if (!b) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    return a.every((item, index) => item === b[index]);
};
export const likeInt = (obj) => {
    if (typeof obj === 'symbol') {
        return false;
    }
    return String(parseInt(obj)) === String(obj);
};
export const isNum = (obj) => typeof obj === 'number' && !isNaN(obj);
export const isFunc = (obj) => typeof obj === 'function' || obj instanceof Function;
export const isObject = (obj) => typeof obj === 'object' && obj;
export const isArray = (obj) => Array.isArray(obj);
export const getPathValue = (obj, path, throwError = false) => {
    if (!isObject(obj) && !isArray(obj)) {
        return;
    }
    const arr = path;
    const readyPath = [];
    for (let i = 0, len = arr.length; i < len; i++) {
        if (!isObject(obj) && !isArray(obj)) {
            const err = new Error(`此${readyPath}路径对应的值非对象`);
            err.stopPath = readyPath;
            if (throwError) {
                throw err;
            }
            else {
                log('error', err);
                return;
            }
        }
        const item = arr[i];
        readyPath.push(item);
        const propName = item;
        if (propName === PROTO_PROP) {
            obj = getPrototypeOf(obj);
            if (typeof obj === 'undefined') {
                const err = new Error(`无法找到在对象上找到${readyPath}路径对应的值`);
                err.stopPath = readyPath;
                if (throwError) {
                    throw err;
                }
                else {
                    log('error', err);
                    return;
                }
            }
            continue;
        }
        if (!(propName in obj)) {
            const err = new Error(`无法找到在对象上找到${readyPath}路径对应的值`);
            err.stopPath = readyPath;
            if (throwError) {
                throw err;
            }
            else {
                log('error', err);
                return;
            }
        }
        try {
            obj = obj[propName];
        }
        catch (error) {
            if (throwError) {
                throw error;
            }
            else {
                log('error', error);
                return;
            }
        }
    }
    return obj;
};
export const getClassName = (obj) => {
    if (!obj || (!isFunc(obj) && !isObject(obj))) {
        return '';
    }
    const viewType = getMpViewType(obj);
    if (viewType === 'App') {
        return 'App';
    }
    if (viewType === 'Page') {
        return 'Page';
    }
    if (viewType === 'Component') {
        return 'Component';
    }
    if ('constructor' in obj && 'name' in obj.constructor && obj.constructor.name) {
        return obj.constructor.name;
    }
    if ('prototype' in obj &&
        'constructor' in obj.prototype &&
        'name' in obj.prototype.constructor &&
        obj.prototype.constructor.name) {
        return obj.prototype.constructor.name;
    }
    const proto = getPrototypeOf(obj);
    if (proto) {
        return getClassName(proto);
    }
    return '';
};
export const getJSONType = (obj) => {
    const type = typeof obj;
    if (type === 'string') {
        return "string" /* string */;
    }
    if (type === 'number') {
        return "num" /* num */;
    }
    if (type === 'bigint') {
        return "bigint" /* bigint */;
    }
    if (type === 'symbol') {
        return "symbol" /* symbol */;
    }
    if (type === 'boolean') {
        return "bool" /* bool */;
    }
    if (type === 'undefined') {
        return "undefined" /* undefined */;
    }
    if (type === 'function') {
        return "func" /* func */;
    }
    if (type === 'object') {
        if (!obj) {
            return "null" /* null */;
        }
        return "object" /* object */;
    }
};
export const getGlobalObjectConstructor = (clsName) => {
    if (clsName === 'Number') {
        return Number;
    }
    if (clsName === 'Array') {
        return Array;
    }
    if (clsName === 'Object') {
        return Object;
    }
    if (clsName === 'Boolean') {
        return Boolean;
    }
    if (clsName === 'Date') {
        return Date;
    }
    if (clsName === 'Map') {
        return Map;
    }
    if (clsName === 'Set') {
        return Set;
    }
    if (clsName === 'String') {
        return String;
    }
    if (clsName === 'BigInt' && typeof BigInt === 'function') {
        return BigInt;
    }
    if (clsName === 'Symbol' && typeof Symbol === 'function') {
        return Symbol;
    }
};
export const isGlobalObjectInstance = (obj, clsName) => {
    const cons = getGlobalObjectConstructor(clsName);
    if (!cons) {
        return false;
    }
    return obj instanceof cons;
};
export const getGlobalObjectJSONChunk = (obj, chunk) => {
    const type = getJSONType(obj);
    if (type !== "object" /* object */) {
        return;
    }
    const clsName = getClassName(obj);
    if (isGlobalObjectInstance(obj, clsName)) {
        chunk = chunk || {};
        chunk.type = type;
        if (clsName === 'Date') {
            chunk.content = obj.toString();
            return chunk;
        }
        if (clsName !== 'Object') {
            chunk.className = clsName;
        }
        if (clsName === 'Number' ||
            clsName === 'Boolean' ||
            clsName === 'String' ||
            clsName === 'BigInt' ||
            clsName === 'Symbol') {
            chunk.leftBoundary = ' {';
            chunk.rightBoundary = '}';
            const tschunk = chunk;
            tschunk.content = getSummaryJSONChunk(obj.valueOf());
            return chunk;
        }
        // if (clsName === "BigInt") {
        //     chunk.content = (obj as Object).toString() + "n";
        //     return chunk;
        // }
    }
};
export const createEllipsisJSONChunk = () => {
    return {
        type: "ellipsis" /* ellipsis */,
        content: ELLIPSIS_CHAR
    };
};
/**
 * 以简略的方式返回JSONChunk
 * @param perspective 对于一些装包的值（new Number(3)）是否将其中的值透视显示出来
 */
export const getSummaryJSONChunk = (obj, perspective) => {
    const type = getJSONType(obj);
    const chunk = {};
    chunk.type = type;
    if (type === "string" /* string */) {
        chunk.leftBoundary = chunk.rightBoundary = '"';
        chunk.content = obj;
        return chunk;
    }
    if (type === "num" /* num */) {
        chunk.content = String(obj);
        return chunk;
    }
    if (type === "bool" /* bool */) {
        chunk.content = String(obj);
        return chunk;
    }
    if (type === "bigint" /* bigint */) {
        chunk.content = obj.toString() + 'n';
        return chunk;
    }
    if (type === "symbol" /* symbol */) {
        chunk.content = obj.toString();
        return chunk;
    }
    if (type === "null" /* null */) {
        chunk.content = 'null';
        return chunk;
    }
    if (type === "undefined" /* undefined */) {
        chunk.content = 'undefined';
        return chunk;
    }
    if (type === "func" /* func */) {
        chunk.content = FUNC_CHAR;
        return chunk;
    }
    if (type === "object" /* object */) {
        const clsName = getClassName(obj);
        if (clsName !== 'Object') {
            if (clsName === 'Date') {
                chunk.content = obj.toString();
                return chunk;
            }
            if (clsName === 'Array') {
                chunk.className = clsName;
                chunk.leftBoundary = '(';
                chunk.rightBoundary = ')';
                chunk.content = String(obj.length);
                return chunk;
            }
            if (!perspective) {
                chunk.className = clsName;
                return chunk;
            }
            getGlobalObjectJSONChunk(obj, chunk);
            if (!chunk.content) {
                const tschunk = chunk;
                tschunk.content = createEllipsisJSONChunk();
                return chunk;
            }
        }
        chunk.leftBoundary = '{';
        chunk.rightBoundary = '}';
        chunk.content = ELLIPSIS_CHAR;
        return chunk;
    }
    return chunk;
};
export const getJSONProp = (prop) => {
    const chunk = getSummaryJSONChunk(prop);
    chunk.prop = true;
    delete chunk.leftBoundary;
    chunk.rightBoundary = ': ';
    delete chunk.type;
    return chunk;
};
/**
 * 以Object.keys的方式获取对象的JSONChunk集合
 */
export const getObjectKeysJSONChunks = (obj, maxPropLength, filter) => {
    const type = getJSONType(obj);
    if (type !== "object" /* object */) {
        return;
    }
    maxPropLength = maxPropLength || Infinity;
    const isArr = isArray(obj);
    const chunks = [];
    const pushItem = (key, isLastKey) => {
        if (!isArr) {
            chunks.push(getJSONProp(key));
        }
        chunks.push(getSummaryJSONChunk(obj[key]));
        if (!isLastKey) {
            const item = {
                comma: true,
                content: ', '
            };
            chunks.push(item);
        }
    };
    const propDescList = getOwnPropertyDescriptors(obj, (name, desc, index) => {
        let pass = 'value' in desc && index < maxPropLength;
        if (typeof filter === 'function') {
            pass = pass && filter(name, desc, index);
        }
        return pass;
    });
    propDescList.forEach(({ prop }, index, arr) => {
        pushItem(prop, index === arr.length - 1);
    });
    return chunks;
};
export const getPrototypeOf = (obj) => {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(obj);
    }
    // eslint-disable-next-line no-proto
    return obj.__proto__;
};
export const getPrototypeOfDesc = (obj) => {
    const proto = getPrototypeOf(obj);
    if (typeof proto !== 'undefined' && proto !== null) {
        return {
            writable: false,
            enumerable: false,
            configurable: false,
            value: proto
        };
    }
};
export const getOwnPropertyDescriptors = (() => {
    let hasNative;
    let polyfill;
    let mock;
    const setPolyfill = () => {
        polyfill = function getOwnPropertyDescriptors(object, filter) {
            let maxIndex = 0;
            const res = Reflect.ownKeys(object).reduce((res, key, index) => {
                maxIndex = index;
                const val = Object.getOwnPropertyDescriptor(object, key);
                let pass = true;
                if (typeof filter === 'function') {
                    pass = filter(key, val, index);
                }
                pass &&
                    res.push({
                        prop: key,
                        desc: val
                    });
                return res;
            }, []);
            maxIndex = handleMpView(object, res, maxIndex + 1, filter);
            pushProtoDesc(object, res, maxIndex + 1, filter);
            return res;
        };
    };
    const setMock = () => {
        mock = (object, filter) => {
            const res = [];
            let index = -1;
            for (const prop in object) {
                if (has(object, prop)) {
                    index++;
                    let pass = true;
                    const val = Object.getOwnPropertyDescriptor(object, prop);
                    if (typeof filter === 'function') {
                        pass = filter(prop, val, index);
                    }
                    pass &&
                        res.push({
                            prop,
                            desc: val
                        });
                }
            }
            index = handleMpView(object, res, index + 1, filter);
            pushProtoDesc(object, res, index + 1, filter);
            return res;
        };
    };
    const pushProtoDesc = (obj, res, index, filter) => {
        const protoDesc = getPrototypeOfDesc(obj);
        if (protoDesc && (!filter || filter(PROTO_PROP, protoDesc, index))) {
            res.push({
                prop: PROTO_PROP,
                desc: protoDesc
            });
        }
    };
    const handleMpView = (obj, res, index, filter) => {
        const type = getMpViewType(obj);
        if (type === 'Page' || type === 'Component') {
            const props = ['data', 'dataset', 'properties'];
            props.forEach((name) => {
                if (name in obj) {
                    const desc = {
                        prop: name,
                        desc: {
                            enumerable: false,
                            writable: true,
                            configurable: false,
                            get() {
                                return obj[name];
                            }
                        }
                    };
                    index++;
                    if (!filter || filter(desc.prop, desc.desc, index)) {
                        res.push(desc);
                    }
                }
            });
        }
        return index;
    };
    return (obj, filter) => {
        const res = [];
        if (hasNative === true) {
            const desc = Object.getOwnPropertyDescriptors(obj);
            let maxIndex = 0;
            Object.getOwnPropertyNames(desc).forEach((name, index) => {
                maxIndex = index;
                if (name in desc && 'enumerable' in desc[name] && (!filter || filter(name, desc[name], index))) {
                    res.push({
                        prop: name,
                        desc: desc[name]
                    });
                }
            });
            Object.getOwnPropertySymbols(desc).forEach((name, index) => {
                maxIndex += index;
                if (!filter || filter(name, desc[name], maxIndex)) {
                    res.push({
                        prop: name,
                        desc: desc[name]
                    });
                }
            });
            maxIndex = handleMpView(obj, res, maxIndex + 1, filter);
            pushProtoDesc(obj, res, maxIndex + 1, filter);
            return res;
        }
        if (hasNative === false) {
            return (polyfill || mock)(obj, filter);
        }
        if (Object.getOwnPropertyDescriptors) {
            hasNative = true;
            return getOwnPropertyDescriptors(obj, filter);
        }
        hasNative = false;
        if (typeof Reflect !== 'undefined') {
            setPolyfill();
        }
        else {
            setMock();
        }
        return getOwnPropertyDescriptors(obj, filter);
    };
})();
export const getObjectJSONChunk = (obj, maxPropLength) => {
    const type = getJSONType(obj);
    if (type !== "object" /* object */) {
        return;
    }
    if (isArray(obj)) {
        const chunk = {
            type,
            leftBoundary: '[',
            rightBoundary: ']',
            content: getObjectKeysJSONChunks(obj, maxPropLength, (name) => name !== 'length' && name !== PROTO_PROP)
        };
        if (obj.length) {
            chunk.remark = `(${obj.length})`;
        }
        return chunk;
    }
    const chunk = {
        type
    };
    getGlobalObjectJSONChunk(obj, chunk);
    if (!chunk.content) {
        const clsName = getClassName(obj);
        chunk.rightBoundary = '}';
        if (clsName !== 'Object') {
            chunk.className = clsName;
            chunk.leftBoundary = ' {';
        }
        else {
            chunk.leftBoundary = '{';
        }
        chunk.content = getObjectKeysJSONChunks(obj, maxPropLength, (name) => name !== PROTO_PROP);
    }
    return chunk;
};
export const isProtected = (desc) => {
    return !desc.configurable || !desc.enumerable || !desc.writable || isFunc(desc.get) || isFunc(desc.set);
};
export const getJSONNode = (obj, maxPropLength) => {
    const type = getJSONType(obj);
    if (type !== "object" /* object */) {
        const chunk = getSummaryJSONChunk(obj, true);
        // chunk.node = true;
        return chunk;
    }
    const chunk = getObjectJSONChunk(obj, maxPropLength);
    if ((isPlainObject(obj) && isEmptyObject(obj)) || (Array.isArray(obj) && !obj.length)) {
        chunk.empty = true;
    }
    // if (isArray(obj)) {
    //     chunk.content = chunk.content.filter((item) => item.content);
    // }
    chunk.node = true;
    return chunk;
};
export const getJSONTree = (obj, path, startPropIndex, endPropIndex) => {
    if (!obj || !isObject(obj)) {
        return [];
    }
    const linkPath = (prop) => {
        if (path) {
            return path.concat(prop);
        }
        return [prop];
    };
    const res = [];
    let filter;
    // TODO:属性过多时，需要处理
    if (startPropIndex >= 0 && endPropIndex > 0) {
        let index = -1;
        filter = () => {
            index++;
            if (index >= startPropIndex && index < endPropIndex) {
                return true;
            }
            return false;
        };
    }
    const propDescs = getOwnPropertyDescriptors(obj, filter).sort((a, b) => {
        if (isProtected(a.desc) && isProtected(b.desc)) {
            return 0;
        }
        return isProtected(a.desc) ? 1 : -1;
    });
    const isArr = isArray(obj);
    propDescs.forEach(({ prop, desc }) => {
        if (prop === PROTO_PROP) {
            if (!desc.value) {
                return;
            }
            if (isArr && desc.value.constructor && desc.value.constructor === getGlobalObjectConstructor('Array')) {
                return;
            }
            if (desc.value.constructor && desc.value.constructor === getGlobalObjectConstructor('Object')) {
                return;
            }
        }
        const propChunk = getJSONProp(prop);
        propChunk.protected = isProtected(desc);
        let node;
        if (isFunc(desc.get)) {
            node = {
                type: "compute" /* compute */,
                leftBoundary: '(',
                rightBoundary: ')',
                content: '...'
            };
        }
        else {
            node = getJSONNode(obj[prop]);
        }
        node.value = true;
        node.path = linkPath(prop);
        res.push({
            row: true,
            path: linkPath(prop),
            prop: propChunk,
            value: node
        });
    });
    return res;
};
export const includeString = (str, keyword) => {
    str = typeof str === 'undefined' ? '' : String(str);
    keyword = typeof keyword === 'undefined' ? '' : String(keyword);
    if (str.indexOf(keyword) !== -1) {
        return true;
    }
    const lwA = str.toLowerCase();
    const lwB = keyword.toLowerCase();
    return lwA.indexOf(lwB) !== -1;
};
const _include = (obj, keyword, searchPosition, deepCount) => {
    const type = typeof obj;
    const res = type1Include(type, obj, keyword);
    if (typeof res !== 'undefined') {
        return res;
    }
    if (type === 'object') {
        if (!obj) {
            return _include(String(obj), keyword);
        }
        const clsName = getClassName(obj);
        const res = type2Include(clsName, obj, keyword);
        if (typeof res !== 'undefined') {
            return res;
        }
        if (deepCount < 0) {
            return false;
        }
        if (clsName === 'Map') {
            let pass = false;
            for (const [key, val] of obj) {
                if (searchPosition === 'all' || searchPosition === 'key') {
                    pass = _include(key, keyword, searchPosition, deepCount - 1);
                    if (pass) {
                        return true;
                    }
                }
                if (searchPosition === 'all' || searchPosition === 'val') {
                    pass = _include(val, keyword, searchPosition, deepCount - 1);
                    if (pass) {
                        return true;
                    }
                }
            }
            return pass;
        }
    }
    return false;
};
const type1Include = (type, obj, keyword) => {
    if (type === 'string' ||
        type === 'boolean' ||
        type === 'number' ||
        type === 'undefined' ||
        type === 'bigint' ||
        type === 'symbol') {
        let str;
        if (type === 'symbol') {
            str = obj.toString();
        }
        else if (type === 'bigint') {
            str = obj.toString() + 'n';
        }
        else {
            str = String(obj);
        }
        return includeString(str, keyword);
    }
};
const type2Include = (clsName, obj, keyword) => {
    if (clsName === 'Date') {
        return _include(obj.toString(), keyword);
    }
    if (clsName === 'String') {
        return _include(obj.valueOf(), keyword);
    }
    if (clsName === 'Number') {
        return _include(obj.valueOf(), keyword);
    }
    if (clsName === 'Boolean') {
        return _include(obj.valueOf(), keyword);
    }
    if (clsName === 'Symbol') {
        return _include(obj.valueOf(), keyword);
    }
    if (clsName === 'BigInt') {
        return _include(obj.valueOf(), keyword);
    }
};
export const include = (obj, keyword, searchPosition = 'all', deep = 100) => {
    return _include(obj, keyword, searchPosition, deep === false ? 0 : deep === true ? Infinity : typeof deep === 'number' ? deep : 0);
};
