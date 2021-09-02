import { JSONType, JSONChunk, JSONProp, JSONTree, GlobalObjectConstructorNames, JSONNode, JSONPropFilter, JSONPropDesc, JSONPropPath } from '../../types/json';
export declare const ELLIPSIS_CHAR = "\u2026";
export declare const FUNC_CHAR = "\u0192";
export declare const PROTO_PROP = "__proto__";
export declare const equalJSONPropPath: (a: JSONPropPath, b: JSONPropPath) => boolean;
export declare const likeInt: (obj: string | symbol) => boolean;
export declare const isNum: (obj: any) => boolean;
export declare const isFunc: (obj: any) => boolean;
export declare const isObject: (obj: any) => any;
export declare const isArray: (obj: any) => boolean;
export declare const getPathValue: <T = any>(obj: any, path: JSONPropPath, throwError?: boolean) => T;
export declare const getClassName: (obj: any) => string;
export declare const getJSONType: (obj: any) => JSONType;
export declare const getGlobalObjectConstructor: (clsName: GlobalObjectConstructorNames) => Function;
export declare const isGlobalObjectInstance: (obj: any, clsName: GlobalObjectConstructorNames) => boolean;
export declare const getGlobalObjectJSONChunk: (obj: any, chunk?: JSONChunk) => JSONChunk<string>;
export declare const createEllipsisJSONChunk: () => JSONChunk;
/**
 * 以简略的方式返回JSONChunk
 * @param perspective 对于一些装包的值（new Number(3)）是否将其中的值透视显示出来
 */
export declare const getSummaryJSONChunk: (obj: any, perspective?: boolean) => JSONChunk;
export declare const getJSONProp: (prop: string | symbol) => JSONProp;
/**
 * 以Object.keys的方式获取对象的JSONChunk集合
 */
export declare const getObjectKeysJSONChunks: (obj: any, maxPropLength?: number, filter?: JSONPropFilter) => JSONChunk[] | undefined;
export declare const getPrototypeOf: (obj: any) => any;
export declare const getPrototypeOfDesc: (obj: any) => PropertyDescriptor | undefined;
export declare const getOwnPropertyDescriptors: (obj: any, filter?: JSONPropFilter) => JSONPropDesc[];
export declare const getObjectJSONChunk: (obj: any, maxPropLength?: number) => JSONChunk<any> | undefined;
export declare const isProtected: (desc: PropertyDescriptor) => boolean;
export declare const getJSONNode: (obj: any, maxPropLength?: number) => JSONNode<any>;
export declare const getJSONTree: (obj: any, path?: JSONPropPath, startPropIndex?: number, endPropIndex?: number) => JSONTree;
export declare const includeString: (str: string, keyword: string) => boolean;
export declare const include: (obj: any, keyword: string, searchPosition?: 'key' | 'val' | 'all', deep?: true | false | number) => boolean;
