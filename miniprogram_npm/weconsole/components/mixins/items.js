const Spec = {
    data: {
        selectedMap: {}
    },
    methods: {
        computeSelectMap() {
            if (this.computeSelectMapTimer) {
                clearTimeout(this.computeSelectMapTimer);
            }
            this.computeSelectMapTimer = setTimeout(() => {
                const selected = (this.$getProp('selected', []) || this.data.selected);
                if (!selected || (Array.isArray(selected) && !selected.length)) {
                    this.setData({
                        selectedMap: {}
                    });
                }
                else {
                    this.setData({
                        selectedMap: (Array.isArray(selected) ? selected : [selected]).reduce((sum, item) => {
                            sum[item] = 1;
                            return sum;
                        }, {})
                    });
                }
            }, 50);
        },
        computeAffixList() {
            if (this.computeAffixAllListTimer) {
                clearTimeout(this.computeAffixAllListTimer);
            }
            this.computeAffixAllListTimer = setTimeout(() => {
                const rows = (this.$getProp('affixIds', []) || this.data.affixIds);
                let scrollMarginTop = this.data.scrollMarginTop || 0;
                const affixList = rows
                    .map((id) => {
                    return (this.affixAllList || []).find((item) => item.id === id);
                })
                    .filter((item) => item);
                const vlItemHeight = this.$getProp('vlItemHeight');
                const renderCallBacks = [];
                if (vlItemHeight) {
                    scrollMarginTop = vlItemHeight * affixList.length;
                }
                else {
                    scrollMarginTop = 0;
                    affixList.forEach((item) => {
                        if ((this === null || this === void 0 ? void 0 : this.affixItemHeightMap) && this.affixItemHeightMap[item.id]) {
                            scrollMarginTop += this.affixItemHeightMap[item.id];
                        }
                        else {
                            renderCallBacks.push(() => {
                                return (this.$getBoundingClientRect(`.affix-row-${item.id}`)
                                    // eslint-disable-next-line max-nested-callbacks
                                    .then((res) => {
                                    if (!this.affixItemHeightMap) {
                                        this.affixItemHeightMap = {};
                                    }
                                    this.affixItemHeightMap[item.id] = res.height;
                                })
                                    .catch(() => Promise.resolve()));
                            });
                        }
                    });
                }
                this.setData({
                    affixList,
                    scrollMarginTop
                }, () => {
                    renderCallBacks.length &&
                        Promise.all(renderCallBacks.map((item) => item())).then(() => {
                            var _a;
                            if (((_a = this.data) === null || _a === void 0 ? void 0 : _a.affixList) && this.data.affixList.length) {
                                let scrollMarginTop = 0;
                                affixList.forEach((item) => {
                                    if ((this === null || this === void 0 ? void 0 : this.affixItemHeightMap) && this.affixItemHeightMap[item.id]) {
                                        scrollMarginTop += this.affixItemHeightMap[item.id];
                                    }
                                });
                                this.setData({
                                    scrollMarginTop
                                });
                            }
                        });
                });
            }, 100);
        },
        triggerReady(fireInit = true, exports) {
            fireInit && this.$vlInit();
            this.triggerEvent('ready', Object.assign({ from: this.data.from, addItem: this.$vlAddItem.bind(this), reloadAffixList: (allList) => {
                    if (allList) {
                        this.affixAllList = allList;
                    }
                    this.computeAffixList();
                }, replaceAllList: (list) => {
                    wx.showLoading();
                    this.$vlClear().then(() => {
                        this.$vlAllList = [...list];
                        this.$vlListChange();
                        this.$vlReload();
                        wx.nextTick(() => {
                            wx.hideLoading();
                        });
                    });
                } }, (exports || {})));
        },
        fireCellEvent(name, e) {
            const data = {};
            const { rowid, col, type } = e.currentTarget.dataset;
            if (type === 'affix') {
                data.affix = true;
            }
            if (rowid) {
                data.rowId = rowid;
                if (type === 'affix') {
                    data.row = this.data.affixList.find((item) => item.id === rowid);
                }
                else {
                    data.row = this.data.$vlShowList.find((item) => item.id === rowid);
                }
            }
            if (col) {
                data.col = this.$getProp('cols', [])[col];
            }
            this.triggerEvent(name, data);
        },
        tapRow(e) {
            this.fireCellEvent('tapRow', e);
        },
        longpressRow(e) {
            this.fireCellEvent('longpressRow', e);
        }
    },
    detached() {
        if (this.computeAffixAllListTimer) {
            clearTimeout(this.computeAffixAllListTimer);
        }
        delete this.computeAffixAllListTimer;
    }
};
export default Spec;
