import { log } from '../../modules/util';
const promiseifyMpApi = (apiName, options) => {
    const api = wx;
    if (!api) {
        return Promise.reject(new Error(`无法在当前环境找到小程序Api对象，暂时无法执行${apiName}方法`));
    }
    if (!(apiName in api) || typeof api[apiName] !== 'function') {
        return Promise.reject(new Error(`无法小程序Api对象找到${apiName}方法`));
    }
    return new Promise((resolve, reject) => {
        if (!options) {
            options = {};
        }
        options.success = (res) => {
            resolve(res);
        };
        options.fail = (res) => {
            reject(new Error(`${(res === null || res === void 0 ? void 0 : res.errMsg) ? res.errMsg : '未知错误'}`));
        };
        api[apiName](options);
    });
};
export default {
    methods: {
        noop() { },
        $getBoundingClientRect(selector, retryCount = 3, delay = 200) {
            return new Promise((resolve, reject) => {
                const fire = () => {
                    this.createSelectorQuery()
                        .select(selector)
                        .boundingClientRect()
                        .exec((res) => {
                        if ((res === null || res === void 0 ? void 0 : res[0]) && 'height' in res[0]) {
                            resolve(res[0]);
                        }
                        else {
                            retryCount--;
                            if (retryCount <= 0 || this.$wcComponentIsDeatoryed) {
                                const err = new Error(this.$wcComponentIsDeatoryed
                                    ? `组件已被销毁，无法获取元素${selector}的boundingClientRect`
                                    : `无法找到元素${selector}进而获取其boundingClientRect`);
                                err.com = this;
                                log('log', err);
                                return reject(err);
                            }
                            setTimeout(() => {
                                fire();
                            }, delay);
                        }
                    });
                };
                fire();
            });
        },
        $showToast(title) {
            if (typeof title !== 'object' || !title) {
                wx.showToast({
                    title: title || '',
                    icon: 'none'
                });
            }
            else {
                wx.showToast(title);
            }
        },
        $showActionSheet(options) {
            if (Array.isArray(options)) {
                options = {
                    itemList: options
                };
                // eslint-disable-next-line no-empty
            }
            else if (typeof options === 'object' && options) {
            }
            else {
                options = {
                    itemList: []
                };
            }
            const tsOptions = options;
            if (!Array.isArray(tsOptions.itemList)) {
                return Promise.reject(new Error('未传递itemList选项，无法显示菜单'));
            }
            return promiseifyMpApi('showActionSheet', tsOptions).then((res) => {
                if (res && ('tapIndex' in res || 'index' in res)) {
                    return res.tapIndex;
                }
            });
        }
    }
};
