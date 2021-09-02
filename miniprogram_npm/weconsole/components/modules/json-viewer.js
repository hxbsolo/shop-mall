import { uuid } from '@mpkit/util';
import { createEllipsisJSONChunk, ELLIPSIS_CHAR, equalJSONPropPath, getJSONNode, getJSONTree, getPathValue, isArray, isObject } from './json';
export class JSONViewer {
    constructor(options) {
        this.symbolMap = [];
        this.options = options;
        this.measureText = this.measureText.bind(this);
    }
    replaceJSONPropPath(path) {
        const readyPath = [];
        return path.map((item) => {
            readyPath.push(item);
            if (typeof item === 'string') {
                return item;
            }
            const path = [].concat(readyPath);
            const readyItem = this.symbolMap.find((item) => equalJSONPropPath(path, item.path));
            if (readyItem) {
                return readyItem.prop;
            }
            const strPah = '$$symbol_' + uuid();
            this.symbolMap.push({
                prop: strPah,
                path
            });
            return strPah;
        });
    }
    restoreJSONPropPath(path) {
        return path.map((item) => {
            if (typeof item === 'string' && item.startsWith('$$symbol_')) {
                const readyItem = this.symbolMap.find((s) => s.prop === item);
                if (readyItem) {
                    return readyItem.path[readyItem.path.length - 1];
                }
            }
            return item;
        });
    }
    setTarget(target) {
        this.options.target = target;
        this.symbolMap = [];
    }
    getPathPropWidth(path) {
        const { arrowWidth } = this.options;
        if (!path) {
            return arrowWidth;
        }
        let pathWidth = arrowWidth;
        path.forEach((propName, index, arr) => {
            if (index) {
                pathWidth += arrowWidth * 2;
            }
            if (index === arr.length - 1) {
                const name = typeof propName === 'symbol' ? propName.toString() : propName;
                pathWidth += this.measureText(name + ': ');
            }
        });
        return pathWidth;
    }
    getWords(str, maxWidth, readyWidth) {
        const { fontSize, keyFontSize, measureText } = this.options;
        if (typeof str === 'string') {
            return [
                {
                    fontSize: fontSize,
                    word: str
                }
            ];
        }
        readyWidth = readyWidth || 0;
        const words = [];
        let stop;
        const push = (item) => {
            if (Array.isArray(item)) {
                return item.forEach((i) => {
                    if (stop) {
                        return;
                    }
                    push(i);
                });
            }
            if (!item.width && measureText) {
                item.width = measureText(item.word, item.fontSize);
            }
            words.push(item);
            readyWidth += item.width;
            if (typeof maxWidth !== 'undefined' && readyWidth >= maxWidth) {
                stop = true;
            }
        };
        if (str.row === true) {
            const row = str;
            if (row.prop) {
                this.getWords(row.prop, maxWidth, readyWidth).forEach((item) => {
                    if (stop) {
                        return;
                    }
                    item.fontSize = keyFontSize;
                    push(item);
                });
                if (stop) {
                    return words;
                }
            }
            if (row.value) {
                push(this.getWords(row.value, maxWidth, readyWidth));
            }
            return words;
        }
        const chunk = str;
        const wordFontSize = str.prop === true ? keyFontSize : chunk.type === "compute" /* compute */ ? keyFontSize : fontSize;
        let word = '';
        if (chunk.remark) {
            word += chunk.remark;
        }
        if (chunk.className) {
            word += chunk.className;
        }
        if (chunk.leftBoundary) {
            word += chunk.leftBoundary;
        }
        push({
            fontSize: wordFontSize,
            word
        });
        if (stop) {
            return words;
        }
        if (chunk.content) {
            if (isObject(chunk.content)) {
                if (isArray(chunk.content)) {
                    chunk.content.forEach((item) => {
                        if (stop) {
                            return;
                        }
                        push(this.getWords(item, maxWidth, readyWidth));
                    });
                }
                else {
                    push(this.getWords(chunk.content, maxWidth, readyWidth));
                }
                if (stop) {
                    return words;
                }
            }
            else {
                push({
                    fontSize: wordFontSize,
                    word: chunk.content
                });
            }
            if (stop) {
                return words;
            }
        }
        if (chunk.rightBoundary) {
            push({
                fontSize: wordFontSize,
                word: chunk.rightBoundary
            });
        }
        return words;
    }
    measureText(str, maxWidth) {
        const { measureText } = this.options;
        if (!measureText) {
            return 0;
        }
        const words = this.getWords(str, maxWidth);
        let totalWidth = 0;
        const hasMaxWidth = typeof maxWidth !== 'undefined' && maxWidth >= 0;
        words.forEach((item) => {
            if (hasMaxWidth && totalWidth >= maxWidth) {
                return;
            }
            if (!item.width) {
                item.width = measureText(item.word, item.fontSize);
            }
            totalWidth += item.width;
        });
        return totalWidth;
    }
    getJSONNode(path, maxPropLength) {
        let { target, maxWidth } = this.options;
        const obj = !path ? target : getPathValue(target, path);
        const doc = getJSONNode(obj, maxPropLength);
        if (doc.type === "object" /* object */) {
            if (path) {
                maxWidth = maxWidth - this.getPathPropWidth(path);
            }
            cutJSONNode(doc, maxWidth, this.measureText);
        }
        return doc;
    }
    getJSONTree(path) {
        const { target, maxWidth } = this.options;
        const obj = !path ? target : getPathValue(target, path);
        const tree = getJSONTree(obj, path);
        tree.forEach((item) => {
            if (item.path) {
                item.path = this.replaceJSONPropPath(item.path);
            }
            if (item.value && item.value.type === "object" /* object */ && isArray(item.value.content)) {
                cutJSONNode(item.value, maxWidth - this.getPathPropWidth(item.path), this.measureText);
                item.value.path = this.replaceJSONPropPath(item.value.path);
            }
            else if ((item === null || item === void 0 ? void 0 : item.value) && item.value.path) {
                item.value.path = this.replaceJSONPropPath(item.value.path);
            }
        });
        return tree;
    }
}
export const cutJSONNode = (doc, maxWidth, measureText) => {
    const oldLength = doc.content.length;
    if (!oldLength) {
        return doc;
    }
    let textWidth = measureText(doc, maxWidth);
    let lastValCut;
    while (textWidth > maxWidth) {
        const lastItem = doc.content.pop();
        const tsItem = lastItem;
        if (tsItem.type === "string" /* string */ && tsItem.content.length > 3) {
            tsItem.__cut__ = true;
            tsItem.content = tsItem.content.substr(0, tsItem.content.length / 2);
            lastValCut = true;
            doc.content.push(tsItem);
        }
        if (!doc.content.length) {
            break;
        }
        textWidth = measureText(doc, maxWidth);
    }
    if (lastValCut && doc.content.length) {
        const tsItem = doc.content[doc.content.length - 1];
        if (tsItem.type === "string" /* string */) {
            tsItem.content += ELLIPSIS_CHAR;
        }
    }
    if (doc.content.length < oldLength) {
        const ellipsisChunk = createEllipsisJSONChunk();
        const ellipsisWidth = measureText(ellipsisChunk);
        if (!doc.content.length || ellipsisWidth + textWidth < maxWidth) {
            doc.content.push(ellipsisChunk);
            return doc;
        }
        const tsItem = doc.content[doc.content.length - 1];
        if (tsItem.type === "string" /* string */) {
            let lastWidth = measureText(tsItem);
            while (tsItem.content.length > 3 && ellipsisWidth + lastWidth > maxWidth) {
                tsItem.content = tsItem.content.substr(0, tsItem.content.length / 2);
                lastWidth = measureText(tsItem);
            }
            if (ellipsisWidth + lastWidth < maxWidth) {
                tsItem.content += ELLIPSIS_CHAR;
                lastWidth = measureText(tsItem);
            }
            if (ellipsisWidth + lastWidth > maxWidth) {
                doc.content.pop();
            }
        }
        else {
            doc.content.pop();
        }
        doc.content.push(ellipsisChunk);
    }
    return doc;
};
