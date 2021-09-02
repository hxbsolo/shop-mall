import { isEmptyObject } from '@mpkit/util';
import { FILTER_BREAK } from '../../modules/util';
const filterPass = (item, keyword, ctx) => {
    if (ctx.materialFilterPolicy) {
        return ctx.materialFilterPolicy(keyword, item);
    }
    const filterFields = item.indexs || [];
    return filterFields.some((item) => item === keyword || item.indexOf(keyword) !== -1);
};
const Mixin = {
    data: {},
    methods: {
        showMaterialAction(rowId) {
            if (!this.data.materialActions || !this.data.materialActions.length) {
                return Promise.reject(new Error('请配置materialActions'));
            }
            const row = this.NormalMaterialCategoryMap.all.find((item) => item.id === rowId);
            if (!row) {
                return Promise.reject(new Error(`无法找到${rowId}对应的数据`));
            }
            const isTop = (this === null || this === void 0 ? void 0 : this.topMaterials) && this.topMaterials.some((item) => item === rowId);
            const isMark = (this === null || this === void 0 ? void 0 : this.markMaterials) && this.markMaterials[rowId];
            const isKeppSave = (this === null || this === void 0 ? void 0 : this.keepSaveMaterials) && this.keepSaveMaterials[rowId];
            const actions = [];
            const textList = this.data.materialActions.map((item) => {
                const action = typeof item === 'object' ? item.action : item;
                const text = typeof item === 'object' ? item.text : undefined;
                actions.push(action);
                if (text) {
                    return typeof text === 'function' ? text(action, rowId, row, this.getProduct(rowId)) : text;
                }
                if (action === 2 /* top */) {
                    return `${isTop ? '取消' : ''}置顶显示`;
                }
                if (action === 4 /* mark */) {
                    return `${isMark ? '取消' : ''}标记`;
                }
                if (action === 1 /* keepSave */) {
                    return `${isKeppSave ? '取消' : ''}留存`;
                }
                if (action === 7 /* cancelAllKeepSave */) {
                    return '取消全部留存';
                }
                if (action === 6 /* cancelAllMark */) {
                    return '取消全部标记';
                }
                if (action === 8 /* groupTo */) {
                    return '分类为...';
                }
                if (action === 9 /* copy */) {
                    return '复制';
                }
                return action;
            });
            return this.$showActionSheet(textList).then((res) => {
                const action = actions[res];
                if (action === 2 /* top */) {
                    if (isTop) {
                        this.cancelTopMaterial(rowId);
                    }
                    else {
                        this.topMaterial(rowId);
                    }
                    return [action, isTop];
                }
                if (action === 1 /* keepSave */) {
                    if (isKeppSave) {
                        this.cancelKeepSaveMaterial(rowId);
                    }
                    else {
                        this.keepSaveMaterial(rowId);
                    }
                    return [action, isKeppSave];
                }
                if (action === 4 /* mark */) {
                    if (isMark) {
                        this.cancelMarkMaterial(rowId);
                    }
                    else {
                        this.markMaterial(rowId);
                    }
                    return [action, isMark];
                }
                if (action === 6 /* cancelAllMark */) {
                    this.cancelMarkMaterial();
                    return [action];
                }
                if (action === 7 /* cancelAllKeepSave */) {
                    this.cancelKeepSaveMaterial();
                    return [action];
                }
                if (action === 9 /* copy */) {
                    (this === null || this === void 0 ? void 0 : this.copyMaterial) && this.copyMaterial(row);
                    return [action];
                }
                this.$showToast(`动作${action}功能待实现`);
                return [action];
            });
        },
        pushShowItem(item) {
            if (!this.readerShowList) {
                this.readerShowList = [];
            }
            const index = this.readerShowList.findIndex((t) => t.id === item.id);
            if (index === -1) {
                this.readerShowList.push(item);
            }
            else {
                this.readerShowList[index] = item;
            }
        },
        addMaterialToCategory(material, map) {
            if (!this.readerShowList) {
                this.readerShowList = [];
            }
            if (!map) {
                this.initMaterialCategoryMap();
                this.addMaterialToCategory(material, this.NormalMaterialCategoryMap);
                const readyItem = this.NormalMaterialCategoryMap.all.find((t) => t.id === material.id);
                const categorys = material.categorys ? material.categorys : readyItem ? readyItem.categorys : [];
                if (this.filterKeyword) {
                    if (filterPass(material, this.filterKeyword, this)) {
                        this.addMaterialToCategory(material, this.FilterMaterialCategoryMap);
                        if (categorys.indexOf(this.data.activeCategory) !== -1 || this.data.activeCategory === 'all') {
                            this.pushShowItem(material);
                        }
                    }
                    return;
                }
                delete this.FilterMaterialCategoryMap;
                if (categorys.indexOf(this.data.activeCategory) !== -1 || this.data.activeCategory === 'all') {
                    this.pushShowItem(material);
                }
                return;
            }
            this.initMaterialCategoryMap(false, map);
            const readyItem = map.all ? map.all.find((item) => item.id === material.id) : null;
            if (readyItem) {
                Object.assign(readyItem, material);
            }
            else {
                map.all.push(material);
            }
            if (material.categorys || readyItem) {
                (material.categorys || readyItem.categorys || []).forEach((category) => {
                    if (!map[category]) {
                        map[category] = [];
                    }
                    if (map[category].length) {
                        const typeReadyItem = map[category].find((item) => item.id === material.id);
                        if (typeReadyItem) {
                            Object.assign(typeReadyItem, material);
                        }
                        else {
                            map[category].push(material);
                        }
                    }
                    else {
                        map[category].push(material);
                    }
                });
            }
        },
        initMaterialCategoryMap(clear, map) {
            if (!map) {
                if (!this.NormalMaterialCategoryMap) {
                    this.NormalMaterialCategoryMap = {};
                }
                if (!this.FilterMaterialCategoryMap) {
                    this.FilterMaterialCategoryMap = {};
                }
                this.initMaterialCategoryMap(clear, this.NormalMaterialCategoryMap);
                this.initMaterialCategoryMap(clear, this.FilterMaterialCategoryMap);
                return;
            }
            this.data.categoryList.forEach((item) => {
                if (!map[item.value] || clear) {
                    map[item.value] = [];
                }
            });
        },
        syncNormalMaterialToFilter() {
            if (!this.NormalMaterialCategoryMap) {
                return;
            }
            this.FilterMaterialCategoryMap = Object.keys(this.NormalMaterialCategoryMap).reduce((sum, category) => {
                sum[category] = this.NormalMaterialCategoryMap[category].filter((item) => {
                    return filterPass(item, this.filterKeyword, this);
                });
                return sum;
            }, {});
        },
        filterMaterial(keyword) {
            this.filterKeyword = keyword;
            this.initMaterialCategoryMap();
            this.syncNormalMaterialToFilter();
            if (this.filterKeyword) {
                this.readerShowList = this.FilterMaterialCategoryMap[this.data.activeCategory];
            }
            else {
                this.readerShowList = this.NormalMaterialCategoryMap[this.data.activeCategory];
            }
        },
        clearMaterial() {
            // 取消全部置顶
            this.cancelTopMaterial();
            // 把标记清空
            this.cancelMarkMaterial();
            // 将留存的id记录找出
            const keepSaveList = !this.keepSaveMaterials || isEmptyObject(this.keepSaveMaterials)
                ? []
                : this.NormalMaterialCategoryMap.all.filter((item) => this.keepSaveMaterials[item.id]);
            // 清空本地map
            this.initMaterialCategoryMap(true);
            // 清空item state
            const itemState = this.$vlItemState;
            delete this.$vlItemState;
            // 将留存的记录重新插入本地map
            keepSaveList.forEach((item) => {
                if ((itemState === null || itemState === void 0 ? void 0 : itemState[item.id]) && this.$vlSaveItemState) {
                    this.$vlSaveItemState(item.id, itemState[item.id]);
                }
                this.addMaterialToCategory(item);
            });
            if (this.filterKeyword) {
                this.readerShowList = this.FilterMaterialCategoryMap[this.data.activeCategory];
            }
            else {
                this.readerShowList = this.NormalMaterialCategoryMap[this.data.activeCategory];
            }
        },
        changeCategory(activeCategory) {
            this.initMaterialCategoryMap();
            if (this.data.activeCategory !== activeCategory) {
                this.setData({
                    activeCategory
                });
            }
            let list;
            if (this.filterKeyword) {
                list = this.FilterMaterialCategoryMap[activeCategory];
            }
            else {
                list = this.NormalMaterialCategoryMap[activeCategory];
            }
            if (activeCategory === 'mark' && this.markMaterials) {
                list = [];
                Object.keys(this.markMaterials).forEach((id) => {
                    const item = this.NormalMaterialCategoryMap.all.find((it) => it.id === id);
                    if (item) {
                        list.push(item);
                    }
                });
            }
            this.readerShowList = list;
        },
        keepSaveMaterial(id) {
            if (!this.keepSaveMaterials) {
                this.keepSaveMaterials = {};
            }
            this.keepSaveMaterials[id] = 1;
        },
        cancelKeepSaveMaterial(id) {
            if (this.keepSaveMaterials) {
                if (id) {
                    delete this.keepSaveMaterials[id];
                }
                else {
                    delete this.keepSaveMaterials;
                }
            }
        },
        markMaterial(id) {
            if (!this.markMaterials) {
                this.markMaterials = {};
            }
            this.markMaterials[id] = 1;
            if (this.data.activeCategory === 'mark') {
                this.changeCategory('mark');
            }
        },
        cancelMarkMaterial(id) {
            if (this.markMaterials) {
                if (id) {
                    delete this.markMaterials[id];
                }
                else {
                    delete this.markMaterials;
                }
                if (this.data.activeCategory === 'mark') {
                    this.changeCategory('mark');
                }
            }
        },
        topMaterial(id) {
            if (!this.topMaterials) {
                this.topMaterials = [];
            }
            this.topMaterials.unshift(id);
            // 最多置顶3条
            if (this.topMaterials.length > 3) {
                this.topMaterials.length = 3;
            }
        },
        cancelTopMaterial(id) {
            if (this.topMaterials) {
                if (id) {
                    const index = this.topMaterials.indexOf(id);
                    if (index !== -1) {
                        this.topMaterials.splice(index, 1);
                    }
                }
                else {
                    delete this.topMaterials;
                }
            }
        },
        getProduct(id) {
            const res = this.$wcProductController.getList((item) => {
                if (item.id === id) {
                    return FILTER_BREAK;
                }
                return false;
            });
            if (res === null || res === void 0 ? void 0 : res.length) {
                return res[0];
            }
        }
    }
};
export default Mixin;
