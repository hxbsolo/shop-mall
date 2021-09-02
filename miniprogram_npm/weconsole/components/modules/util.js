export const removeEndZero = (num) => {
    const str = String(num);
    if (str.indexOf('.') === -1) {
        return str;
    }
    const [before, after] = str.split('.');
    const af = parseInt(after);
    return before + (af === 0 ? '' : `.${af}`);
};
export const getStatusText = (status) => {
    if (status === 1) {
        return 'Executed';
    }
    if (status === 2) {
        return 'Success';
    }
    if (status === 3) {
        return 'Fail';
    }
    return 'Unknown';
};
export const computeTime = (total) => {
    let timeUnit;
    let timeVal;
    if (total < 1000) {
        timeUnit = 'ms';
        timeVal = removeEndZero(total.toFixed(1));
    }
    else if (total < 60 * 1000) {
        timeUnit = 's';
        timeVal = removeEndZero((total / 1000).toFixed(1));
    }
    else if (total < 60 * 60 * 1000) {
        timeUnit = 'm';
        timeVal = removeEndZero((total / (60 * 1000)).toFixed(1));
    }
    else {
        timeUnit = 'h';
        timeVal = removeEndZero((total / (60 * 60 * 1000)).toFixed(1));
    }
    return `${timeVal}${timeUnit}`;
};
export const findValue = (obj, prop) => {
    for (const key in obj) {
        if (key === prop || key.toLowerCase() === prop.toLowerCase()) {
            return obj[prop];
        }
    }
};
export const convertStockToInitiatorName = (stock) => {
    if (stock.fileName) {
        let fileName = stock.fileName
            .split('appservice')
            .slice(1)
            .map((item) => (item.startsWith('/') ? item : `/${item}`))
            .join('')
            .substr(1);
        fileName = fileName.startsWith('miniprogram_npm') ? fileName.substr('miniprogram_npm'.length + 1) : fileName;
        if (stock.lineNumebr) {
            return `${fileName}:${stock.lineNumebr}`;
        }
        if (fileName) {
            return fileName;
        }
    }
    return stock.original;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const convertStockToInitiatorDesc = (stock) => {
    return 'Script';
};
export const getSystemInfo = (() => {
    let info;
    return (allowFromCache = true) => {
        if (info && allowFromCache) {
            return Promise.resolve(JSON.parse(JSON.stringify(info)));
        }
        return new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success(res) {
                    info = JSON.parse(JSON.stringify(res));
                    resolve(res);
                },
                fail(res) {
                    reject(new Error((res === null || res === void 0 ? void 0 : res.errMsg) ? res.errMsg : '未知错误'));
                }
            });
        });
    };
})();
export const uniq = (list) => {
    return list.reduce((sum, item) => {
        if (sum.indexOf(item) === -1) {
            sum.push(item);
        }
        return sum;
    }, []);
};
export const rpxToPx = (rpx) => {
    return getSystemInfo().then((res) => {
        return (res.windowWidth / 750) * rpx;
    });
};
