import { WeComponent } from '../mixins/component';
import { convertApiDetail } from '../modules/detail';
import EbusMixin from '../mixins/ebus';
import ProductControllerMixin from '../mixins/product-controller';
import { FILTER_BREAK } from '../../modules/util';
WeComponent(EbusMixin, ProductControllerMixin, {
    properties: {
        data: {
            type: String,
            observer() {
                delete this.JSONViewerMap;
                this.setDetailData();
            }
        },
        tab: {
            type: Number,
            observer(val) {
                this.setData({
                    activeTabIndex: val
                });
            }
        }
    },
    data: {
        loading: true,
        error: '',
        tabs: [
            {
                name: 'Headers',
                value: 'headers'
            },
            {
                name: 'Preview',
                value: 'preview'
            },
            {
                name: 'Response',
                value: 'response'
            }
            // {
            //     name: "Initiator",
            //     value: "initiator",
            // },
        ],
        activeTabIndex: 0,
        detail: null,
        stackHideHooks: true
    },
    methods: {
        // toggleVisableStackHooks() {
        //     this.setData({
        //         stackHideHooks: !this.data.stackHideHooks,
        //     });
        //     this.setStackHooks();
        // },
        // setStackHooks() {
        //     const product: MpProduct = this.orgDetail;
        //     if (product && product.stack) {
        //         let stack: MpDetailKV[] = product.stack.map((item) => {
        //             const data: MpDetailKV = {
        //                 name: item.target || "",
        //             };
        //             if (item.fileName) {
        //                 data.value = convertStockToInitiatorName(item);
        //             }
        //             return data;
        //         }) as MpDetailKV[];
        //         if (this.data.stackHideHooks) {
        //             const index = stack.lastIndexOf(
        //                 (item) =>
        //                     item.name.indexOf(
        //                         "MkFuncHelperOfHookTarget"
        //                     ) !== -1
        //             );
        //             if (index !== -1) {
        //                 stack.splice(0, index + 2);
        //             }
        //         }
        //         this.setData({
        //             "detail.stack": stack,
        //         });
        //     }
        // },
        setTab(e) {
            this.triggerEvent('changeTab', e.detail);
        },
        close() {
            this.triggerEvent('close');
        },
        setDetailData(showLoading = true) {
            var _a;
            showLoading &&
                this.setData({
                    loading: true,
                    detail: null
                });
            const data = this.$getProp('data');
            if (typeof data === 'string') {
                if (!this.$wcProductController) {
                    return (showLoading &&
                        this.setData({
                            loading: false,
                            error: '?????????????????????????????????ID????????????',
                            detail: null
                        }));
                }
                const res = this.$wcProductController.getList((item) => {
                    if (item.id === data) {
                        return FILTER_BREAK;
                    }
                    return false;
                });
                if (this.$wcComponentIsDeatoryed) {
                    return;
                }
                if (res === null || res === void 0 ? void 0 : res.length) {
                    const apiProduct = res[0];
                    this.setData({
                        stack: apiProduct.stack
                    });
                    this.orgDetail = apiProduct;
                    this.apiOptinos = (apiProduct === null || apiProduct === void 0 ? void 0 : apiProduct.request) && ((_a = apiProduct.request) === null || _a === void 0 ? void 0 : _a[0]) ? apiProduct.request[0] : undefined;
                    this.setJSONViewer('Options', this.apiOptinos);
                    if (apiProduct.category === 'request' && this.apiOptinos) {
                        this.apiRequestData = this.apiOptinos.data;
                        this.setJSONViewer('RequestData', this.apiRequestData);
                    }
                    this.apiResult = apiProduct.result;
                    this.setJSONViewer('Result', this.apiResult);
                    this.setJSONViewer('PreviewResult', this.apiResult);
                    this.apiResponse =
                        (apiProduct === null || apiProduct === void 0 ? void 0 : apiProduct.response) && apiProduct.response[0] ? apiProduct.response[0] : undefined;
                    this.setJSONViewer('Response', this.apiResponse);
                    this.setJSONViewer('PreviewResponse', this.apiResponse);
                    const detail = convertApiDetail(apiProduct);
                    const tabs = this.data.tabs;
                    let hasCookies = false;
                    if ((detail === null || detail === void 0 ? void 0 : detail.cookies) && detail.cookies.length && !tabs.find((item) => item.value === 'cookies')) {
                        hasCookies = true;
                        tabs.push({
                            name: 'Cookies',
                            value: 'cookies'
                        });
                    }
                    this.setData({
                        tabs,
                        hasCookies,
                        loading: false,
                        error: '',
                        detail
                    });
                    // this.setStackHooks();
                    return;
                }
                this.setData({
                    loading: false,
                    error: '',
                    detail: null
                });
            }
            else if (data) {
                this.setData({
                    loading: false,
                    error: '',
                    detail: data
                });
            }
            else {
                this.setData({
                    loading: false,
                    error: '????????????????????????',
                    detail: null
                });
            }
        },
        onWcProduct(type, data) {
            if (data.id === this.data.data) {
                this.setDetailData();
            }
        },
        setJSONViewer(type, target, viewer) {
            if (!this.JSONViewerMap) {
                this.JSONViewerMap = {};
            }
            if (!this.JSONViewerMap[type]) {
                this.JSONViewerMap[type] = {
                    target,
                    viewer
                };
            }
            this.JSONViewerMap[type].target = target;
            if (viewer) {
                this.JSONViewerMap[type].viewer = viewer;
            }
            if (this.JSONViewerMap[type].viewer) {
                const vw = this.JSONViewerMap[type].viewer;
                vw.setTarget(target);
                if (type === 'PreviewResponse') {
                    vw.onInited((viewer) => {
                        if (viewer.data.from === `ApiDetail_${this.data.data}_PreviewResponse`) {
                            viewer.openPath(this.orgDetail && this.orgDetail.category === 'request'
                                ? ['data']
                                : []);
                        }
                    });
                }
            }
        }
    },
    created() {
        this.$wcOn('JSONViewerReady', (type, data) => {
            let viewType;
            const isFrom = (type) => {
                if (data.from === `ApiDetail_${this.data.data}_${type}` &&
                    data.viewer.selectOwnerComponent &&
                    data.viewer.selectOwnerComponent() === this) {
                    viewType = type;
                    return true;
                }
            };
            if (isFrom('Options')) {
                this.setJSONViewer(viewType, this.apiOptinos, data.viewer);
                data.viewer.init();
                return;
            }
            if (isFrom('RequestData')) {
                this.setJSONViewer(viewType, this.apiRequestData, data.viewer);
                data.viewer.init();
                return;
            }
            if (isFrom('PreviewResult')) {
                this.setJSONViewer(viewType, this.apiResult, data.viewer);
                data.viewer.init();
                return;
            }
            if (isFrom('Result')) {
                this.setJSONViewer('Result', this.apiResult, data.viewer);
                data.viewer.init();
                return;
            }
            if (isFrom('PreviewResponse')) {
                this.setJSONViewer(viewType, this.apiResponse, data.viewer);
                data.viewer.init();
                return;
            }
            if (isFrom('Response')) {
                this.setJSONViewer(viewType, this.apiResponse, data.viewer);
                data.viewer.init();
            }
        });
    }
});
