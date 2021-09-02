import { IJSONViewer, JSONWord, JSONViewerOptions, JSONMeasureTextHandler, JSONItem, JSONChunk, JSONNode, JSONTree, JSONPropPath } from '../../types/json';
export declare class JSONViewer<T = any> implements IJSONViewer<T> {
    readonly options: JSONViewerOptions<T>;
    private symbolMap;
    constructor(options: JSONViewerOptions<T>);
    replaceJSONPropPath(path: JSONPropPath): string[];
    restoreJSONPropPath(path: string[]): JSONPropPath;
    setTarget(target?: any): void;
    getPathPropWidth(path?: JSONPropPath): number;
    getWords(str: string | JSONItem, maxWidth?: number, readyWidth?: number): JSONWord[];
    measureText(str: string | JSONItem, maxWidth?: number): number;
    getJSONNode(path?: JSONPropPath, maxPropLength?: number): JSONNode;
    getJSONTree(path?: JSONPropPath): JSONTree;
}
export declare const cutJSONNode: (doc: JSONNode<JSONChunk[]>, maxWidth: number, measureText: JSONMeasureTextHandler) => JSONNode<JSONChunk[]> | undefined;
