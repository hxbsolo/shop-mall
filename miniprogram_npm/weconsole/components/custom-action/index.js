import { WeComponent } from '../mixins/component';
import { getCustomActions } from '../modules/custom-action';
import EbusMixin from '../mixins/ebus';
import { each } from '../../modules/util';
const NoUICaseId = '$$$NO_UI$$$';
WeComponent(EbusMixin, {
    properties: {
        action: {
            type: String,
            observer() {
                this.setAction();
            }
        }
    },
    data: {
        caseList: [],
        noUICaseList: [],
        everyNoUI: false,
        activeCaseIndex: 0,
        caseState: {},
        caseTabState: {
            s0: 1
        },
        gridSelected: {}
    },
    methods: {
        setAction() {
            const actions = getCustomActions();
            this.actionDetail = actions.find((item) => item.id === this.data.action);
            if (!this.actionDetail) {
                this.setData({
                    caseList: null,
                    noUICaseList: null,
                    caseState: {},
                    caseTabState: {
                        s0: 1
                    }
                });
                delete this.caseResultState;
                return;
            }
            const action = this.actionDetail;
            const noneCases = [];
            const uiCases = [];
            const buttonTexts = [[], []];
            action.cases.forEach((item) => {
                const nv = {
                    name: item.button || item.id,
                    value: item.id
                };
                if (!item.showMode || item.showMode === "none" /* none */) {
                    noneCases.push(item);
                    buttonTexts[0].push(nv);
                }
                else {
                    uiCases.push(item);
                    buttonTexts[1].push(nv);
                }
            });
            let caseList;
            let noUICaseList;
            const everyNoUI = noneCases.length === action.cases.length;
            if (noneCases.length <= 1) {
                caseList = buttonTexts[0].concat(buttonTexts[1]);
                noUICaseList = [];
            }
            else {
                noUICaseList = buttonTexts[0];
                caseList = buttonTexts[1];
                caseList.unshift({
                    name: '无界面',
                    value: NoUICaseId
                });
            }
            this.setData({
                everyNoUI,
                caseList,
                noUICaseList,
                activeCaseIndex: 0,
                caseTabState: {
                    s0: 1
                },
                gridSelected: {}
            });
            if (action.autoCase) {
                this.changeCaseTab(action.autoCase);
                this.execCase(action.autoCase);
            }
        },
        tapCaseButton(e) {
            this.execCase(e.currentTarget.dataset.id);
        },
        changeCaseTab(e) {
            let caseId;
            let caseIndex = -1;
            if (typeof e === 'object' && e && e.currentTarget) {
                const item = this.data.caseList[e.detail];
                if (!item) {
                    return;
                }
                caseIndex = e.detail;
            }
            else {
                caseId = String(e);
            }
            const action = this.actionDetail;
            if (!action) {
                return;
            }
            if (caseIndex === -1) {
                caseIndex = this.data.caseList.findIndex((item) => item.value === caseId);
                if (caseIndex === -1) {
                    return;
                }
            }
            this.setData({
                activeCaseIndex: caseIndex,
                [`caseTabState.s${caseIndex}`]: 1
            });
        },
        execCase(id) {
            const action = this.actionDetail;
            if (!action) {
                return;
            }
            const caseIndex = action.cases.findIndex((item) => item.id === id);
            if (caseIndex === -1) {
                return;
            }
            const caseItem = action.cases[caseIndex];
            const show = (err, res) => {
                if (!this.caseResultState) {
                    this.caseResultState = {};
                }
                this.caseResultState[caseItem.id] = {
                    res,
                    err
                };
                const state = {
                    mode: caseItem.showMode,
                    errMsg: err ? err.message : '',
                    errStack: err ? err.stack : ''
                };
                if (!err) {
                    if (caseItem.showMode === "text" /* text */) {
                        state.data = typeof res === 'object' ? JSON.stringify(res) : String(res);
                    }
                    else if (caseItem.showMode === "component" /* component */) {
                        state.data = res;
                    }
                    else if (caseItem.showMode === "grid" /* grid */) {
                        const options = res;
                        state.cols = options.cols;
                        this.appendDataToGrid(caseItem.id, options.data);
                    }
                    else if (caseItem.showMode === "json" /* json */) {
                        if ((this === null || this === void 0 ? void 0 : this.caseJSONViewer) && this.caseJSONViewer[caseItem.id]) {
                            this.caseJSONViewer[caseItem.id].setTarget(res);
                            this.caseJSONViewer[caseItem.id].openPath();
                        }
                    }
                    // else if (
                    //     caseItem.showMode === WcCustomActionShowMode.jsonGrid
                    // ) {
                    //     const options: WcCustomActionGrid =
                    //         res as WcCustomActionGrid;
                    //     state.cols = options.cols;
                    //     const data: any[] = Array.isArray(options.data)
                    //         ? options.data
                    //         : [];
                    //     let list = data;
                    //     if (options.cols.some((item) => item.json)) {
                    //         list = data.map((item) =>
                    //             this.convertJSONGridItem(
                    //                 caseItem,
                    //                 item,
                    //                 options.cols
                    //             )
                    //         );
                    //     }
                    //     this.appendDataToGrid(caseItem.id, list);
                    // }
                }
                this.setData({
                    [`caseLoading.${caseItem.id}`]: false,
                    [`caseState.${caseItem.id}`]: state
                });
            };
            const res = caseItem.handler();
            if (typeof res === 'object' && res.then) {
                this.setData({
                    [`caseLoading.${caseItem.id}`]: true
                });
                res.then((val) => show(null, val));
                res.catch((err) => show(err));
            }
            else {
                show(null, res);
            }
        },
        getCase(id) {
            const action = this.actionDetail;
            if (!action) {
                return;
            }
            return action.cases.find((item) => item.id === id);
        },
        convertJSONGridItem(caseItem, item, cols) {
            const res = {};
            each(item, (prop, val) => {
                const col = cols.find((c) => c.field === prop);
                if (col === null || col === void 0 ? void 0 : col.json) {
                    res[prop] = {
                        json: 1,
                        key: `CustomAction_${caseItem.id}_${item.id}_${prop}`
                    };
                }
                else {
                    res[prop] = val;
                }
            });
            return res;
        },
        appendDataToGrid(caseId, data) {
            var _a;
            if ((_a = this.caseGrid) === null || _a === void 0 ? void 0 : _a[caseId]) {
                return this.caseGrid[caseId].replaceAllList(data);
            }
        },
        tapGridCell(e) {
            const caseId = e.currentTarget.dataset.case;
            this.setData({
                [`gridSelected.${caseId}`]: e.detail.rowId || ''
            });
        },
        gridReady(e) {
            var _a, _b, _c;
            const caseId = e.currentTarget.dataset.case;
            const caseItem = this.getCase(caseId);
            if (!caseItem) {
                return;
            }
            if (!this.caseGrid) {
                this.caseGrid = {};
            }
            this.caseGrid[caseId] = e.detail;
            e.detail.onJSONReady((data) => {
                var _a, _b, _c;
                const { from, viewer } = data;
                if (from === null || from === void 0 ? void 0 : from.startsWith('GridCol_CustomAction')) {
                    const [, , caseId, itemId, field] = from.split('_');
                    const list = (this === null || this === void 0 ? void 0 : this.caseResultState) &&
                        this.caseResultState[caseId] &&
                        ((_a = this.caseResultState[caseId]) === null || _a === void 0 ? void 0 : _a.res) &&
                        ((_c = (_b = this.caseResultState[caseId]) === null || _b === void 0 ? void 0 : _b.res) === null || _c === void 0 ? void 0 : _c.data)
                        ? this.caseResultState[caseId].res.data
                        : [];
                    if (!this.caseResultState[caseId].JSONViewerMap) {
                        this.caseResultState[caseId].JSONViewerMap = {};
                    }
                    this.caseResultState[caseId].JSONViewerMap[field] = viewer;
                    const readyItem = list.find((item) => {
                        if (typeof item.id === 'number') {
                            return item.id === parseFloat(itemId);
                        }
                        return item.id === itemId;
                    });
                    if (readyItem) {
                        viewer.setTarget(readyItem[field]);
                        viewer.init();
                    }
                }
            });
            if ((this === null || this === void 0 ? void 0 : this.caseResultState) &&
                this.caseResultState[caseId] &&
                ((_a = this.caseResultState[caseId]) === null || _a === void 0 ? void 0 : _a.res) &&
                ((_c = (_b = this.caseResultState[caseId]) === null || _b === void 0 ? void 0 : _b.res) === null || _c === void 0 ? void 0 : _c.data)) {
                const list = this.caseResultState[caseId].res.data;
                e.detail.replaceAllList(list);
                // if (
                //     caseItem.showMode === WcCustomActionShowMode.jsonGrid &&
                //     this.data.caseState[caseItem.id].cols &&
                //     this.data.caseState[caseItem.id].cols.some(
                //         (item) => item.json
                //     )
                // ) {
                //     e.detail.replaceAllList(
                //         list.map((item) =>
                //             this.convertJSONGridItem(
                //                 caseItem,
                //                 item,
                //                 this.data.caseState[caseItem.id].cols
                //             )
                //         )
                //     );
                // } else {
                // }
            }
        }
    },
    attached() {
        this.setAction();
        // const action: WcCustomAction = {
        //     id: 'd1',
        //     cases: [
        //         {
        //             id: 'c1',
        //             showMode: WcCustomActionShowMode.none,
        //             handler: () => console.log('d1-c1')
        //         },
        //         {
        //             id: 'c2',
        //             showMode: WcCustomActionShowMode.none,
        //             handler: () => console.log('d1-c2')
        //         },
        //         {
        //             id: 'c2',
        //             showMode: WcCustomActionShowMode.json,
        //             handler: () => ({
        //                 name: 'Tom'
        //             })
        //         }
        //     ]
        // };
    },
    created() {
        this.$wcOn('JSONViewerReady', (type, data) => {
            if (data.from.startsWith(`CustomAction_${this.data.action}`) &&
                data.viewer.selectOwnerComponent &&
                data.viewer.selectOwnerComponent() === this) {
                const caseId = data.from.split('_')[2];
                const caseItem = this.getCase(caseId);
                if (!caseItem) {
                    return;
                }
                if (!this.caseJSONViewer) {
                    this.caseJSONViewer = {};
                }
                this.caseJSONViewer[caseId] = data.viewer;
                data.viewer.init().then(() => {
                    const caseItem = this.getCase(caseId);
                    if (!caseItem) {
                        return;
                    }
                    if ((this === null || this === void 0 ? void 0 : this.caseResultState) && this.caseResultState[caseItem.id]) {
                        data.viewer.setTarget(this.caseResultState[caseItem.id].res);
                        data.viewer.openPath();
                    }
                });
            }
        });
    }
});
