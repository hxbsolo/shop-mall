import { WeComponent } from '../mixins/component';
import { equalJSONPropPath, getJSONNode, getPathValue } from '../modules/json';
import { cutJSONNode, JSONViewer } from '../modules/json-viewer';
import { getSystemInfo } from '../modules/util';
import EbusMixin from '../mixins/ebus';
import CanvasMixin from '../mixins/canvas';
import { log } from '../../modules/util';
// eslint-disable-next-line quotes
const fontName = "Consolas, Menlo, Monaco, 'Courier New', monospace";
const Spec = {
    options: {
        multipleSlots: true
    },
    properties: {
        target: null,
        json: {
            type: Object
        },
        outerClass: String,
        from: String,
        init: {
            type: Boolean,
            value: true
        },
        mode: {
            type: Number,
            value: 1 /* full */
        },
        fontSize: {
            type: Number,
            value: 28,
            observer() {
                this.syncFontSize();
            }
        },
        smallFontSize: {
            type: Number,
            value: 28 * 0.8,
            observer() {
                this.syncFontSize();
            }
        }
    },
    data: {
        root: null,
        activeTab: 0,
        JSONString: '',
        tabs: [
            {
                name: 'Tree',
                value: 2 /* tree */
            },
            {
                name: 'JSON String',
                value: 3 /* string */
            }
        ]
    },
    methods: {
        syncFontSize() {
            if (!this.JSONViewer) {
                return;
            }
            this.JSONViewer.options.fontSize = this.data.fontSize || 28;
            this.JSONViewer.options.keyFontSize = this.data.smallFontSize || 28 * 0.8;
        },
        onInited(func) {
            if (this.inited) {
                return func(this);
            }
            if (!this.onInitedHandlers) {
                this.onInitedHandlers = [];
            }
            this.onInitedHandlers.push(func);
        },
        openPath(path) {
            this.setPathVisable(true, path);
        },
        closePath(path) {
            this.setPathVisable(false, path);
        },
        buildPath(open, path) {
            if (!this.JSONViewer) {
                log('warn', '未初始化，暂时无法设置显示性');
                return;
            }
            const mpData = {};
            if (!path || !path.length) {
                mpData['root.tree'] = open ? this.JSONViewer.getJSONTree() : null;
                mpData['root.open'] = open;
                return mpData;
            }
            const jsonPath = this.JSONViewer.restoreJSONPropPath(path);
            let mpPath = 'root.tree';
            const readyPath = [];
            const getTree = (parent, init = true) => {
                if (!parent) {
                    return;
                }
                if (parent.tree) {
                    return parent.tree;
                }
                if (init) {
                    const tree = this.JSONViewer.getJSONTree(readyPath);
                    mpData[mpPath] = tree;
                    mpData[mpPath.substr(0, mpPath.length - 5) + '.open'] = true;
                    return tree;
                }
            };
            let tree = getTree(this.data.root || this.JSONViewer.getJSONNode());
            for (let len = jsonPath.length, i = 0; i < len; i++) {
                const prop = jsonPath[i];
                readyPath.push(prop);
                const index = tree.findIndex((item) => equalJSONPropPath(this.JSONViewer.restoreJSONPropPath(item.path), readyPath));
                if (index === -1) {
                    break;
                }
                mpPath += `[${index}].tree`;
                tree = getTree(tree[index], i !== len - 1);
                if (!tree) {
                    break;
                }
            }
            if (equalJSONPropPath(readyPath, jsonPath) && !tree && open) {
                tree = this.JSONViewer.getJSONTree(readyPath);
            }
            mpData[mpPath] = open ? tree : null;
            mpData[mpPath.substr(0, mpPath.length - 5) + '.open'] = open;
            return mpData;
        },
        setPathVisable(open, path) {
            this.lastOpen = open;
            this.lastPath = path;
            this.setData(this.buildPath(open, path));
        },
        toggle(e) {
            const { open, path, fromCompute } = e.detail;
            if (fromCompute) {
                this.buildComputeObject(path);
                return;
            }
            this.setPathVisable(open, path);
            this.triggerEvent('toggle', e.detail);
        },
        buildComputeObject(path) {
            const mpData = {};
            const jsonPath = this.JSONViewer.restoreJSONPropPath(path);
            let mpPath = 'root.tree';
            const readyPath = [];
            const getTree = (parent) => {
                if (!parent) {
                    return;
                }
                if (parent.tree) {
                    return parent.tree;
                }
            };
            let tree = getTree(this.data.root);
            for (let len = jsonPath.length, i = 0; i < len; i++) {
                const prop = jsonPath[i];
                readyPath.push(prop);
                const index = tree.findIndex((item) => equalJSONPropPath(this.JSONViewer.restoreJSONPropPath(item.path), readyPath));
                if (index === -1) {
                    break;
                }
                mpPath += `[${index}].tree`;
                const oldTree = tree;
                tree = getTree(tree[index]);
                if (!tree) {
                    tree = oldTree;
                    mpPath = mpPath.substr(0, mpPath.length - 5);
                    break;
                }
            }
            const val = getPathValue(this.JSONViewer.options.target, jsonPath, false);
            const node = getJSONNode(val);
            node.value = true;
            node.path = jsonPath;
            cutJSONNode(node, this.JSONViewer.options.maxWidth - this.JSONViewer.getPathPropWidth(jsonPath), this.JSONViewer.measureText);
            node.path = this.JSONViewer.replaceJSONPropPath(jsonPath);
            mpPath += '.value';
            mpData[mpPath] = node;
            this.setData(mpData);
        },
        rpxToPx(rpx) {
            return (this.windowWidth / 750) * rpx;
        },
        measureText(str, fontSize) {
            if (!this.$wcCanvasContext) {
                return Infinity;
            }
            this.$wcCanvasContext.font = `${fontSize}px ${fontName}`;
            return this.$wcCanvasContext.measureText(str).width;
        },
        initJSONViewer() {
            if (this.JSONViewer) {
                return Promise.resolve();
            }
            return Promise.all([getSystemInfo(), this.$getBoundingClientRect('.json-viewer'), this.$getCanvasContext()])
                .then(([{ windowWidth }, { width }]) => {
                this.windowWidth = windowWidth;
                this.measureText = this.measureText.bind(this);
                const target = 'target' in this ? this.target : 'target' in this.data ? this.data.target : undefined;
                this.JSONViewer = new JSONViewer({
                    target: target,
                    arrowWidth: this.rpxToPx(20),
                    fontSize: this.rpxToPx(this.data.fontSize || 28),
                    keyFontSize: this.rpxToPx(this.data.smallFontSize || 28 * 0.8),
                    measureText: this.measureText,
                    maxWidth: width - this.rpxToPx(100)
                });
                return new Promise((resolve) => {
                    const mpData = this.data.root ? {} : { root: this.JSONViewer.getJSONNode() };
                    if (this.lastPath) {
                        Object.assign(mpData, this.buildPath(this.lastOpen, this.lastPath));
                    }
                    this.setData(mpData, () => {
                        this.triggerEvent('first', this.data.root);
                        resolve();
                    });
                });
            })
                .catch((err) => {
                if (this.$wcComponentIsDeatoryed) {
                    return;
                }
                return Promise.reject(err);
            });
        },
        setJSONString() {
            return new Promise((resolve) => {
                const target = 'target' in this ? this.target : 'target' in this.data ? this.data.target : undefined;
                const type = typeof target;
                let JSONString;
                if (type === 'undefined') {
                    JSONString = 'undefined';
                }
                else if (type === 'function') {
                    JSONString = target.toString();
                }
                else {
                    JSONString = JSON.stringify(target, null, 2);
                }
                this.setData({
                    JSONString: JSONString
                }, resolve);
            });
        },
        setTarget(target, updateUI = true) {
            this.target = target;
            if (this.data.mode === 1 /* full */ ||
                this.data.mode === 3 /* string */) {
                updateUI && this.setJSONString();
            }
            if ((this.data.mode === 1 /* full */ ||
                this.data.mode === 2 /* tree */) &&
                this.JSONViewer) {
                this.JSONViewer.setTarget(this.target);
                updateUI &&
                    this.setData({
                        root: this.JSONViewer.getJSONNode()
                    });
            }
        },
        changeTab(e) {
            this.setData({
                activeTab: parseInt(e.detail)
            });
            if (parseInt(e.detail) === 1) {
                this.initJSONViewer('1');
            }
            else {
                this.setJSONString();
            }
        },
        init() {
            if (this.inited) {
                return Promise.resolve();
            }
            const fire = () => {
                if (this.onInitedHandlers && (this === null || this === void 0 ? void 0 : this.onInitedHandlers.length)) {
                    this.onInitedHandlers.forEach((item) => {
                        item === null || item === void 0 ? void 0 : item(this);
                    });
                    delete this.onInitedHandlers;
                }
            };
            if (this.data.mode === 1 /* full */) {
                return Promise.all([this.setJSONString(), this.initJSONViewer()]).then(() => {
                    this.inited = true;
                    fire();
                });
            }
            if (this.data.mode === 2 /* tree */) {
                return this.initJSONViewer().then(() => {
                    this.inited = true;
                    fire();
                });
            }
            if (this.data.mode === 3 /* string */) {
                return this.setJSONString().then(() => {
                    this.inited = true;
                    fire();
                });
            }
        }
    },
    created() {
        this.lastOpen = false;
        this.lastPath = [];
    },
    attached() {
        if (this.data.json) {
            this.setData({
                root: this.data.json
            });
        }
    },
    ready() {
        if (this.data.init) {
            this.init();
        }
        this.$wcEmit('JSONViewerReady', {
            from: this.data.from,
            viewer: this
        });
    }
};
WeComponent(EbusMixin, CanvasMixin, Spec);
