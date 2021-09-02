import { parseCookie } from './cookie';
import { computeTime, convertStockToInitiatorName, getStatusText } from './util';
// eslint-disable-next-line complexity
export const convertApiDetail = (product) => {
    let failMsg;
    if (product.status === 3 /* Fail */ &&
        (product === null || product === void 0 ? void 0 : product.response) &&
        product.response.length &&
        product.response[0] &&
        product.response[0].errMsg) {
        const arr = product.response[0].errMsg.split(':fail');
        if (arr.length > 1) {
            failMsg = arr[1].trim();
        }
        else {
            failMsg = product.response[0].errMsg;
        }
    }
    const statusText = getStatusText(product.status);
    const statusKV = {
        name: 'Work Status',
        value: statusText,
        remark: failMsg
    };
    const apiOptions = (product === null || product === void 0 ? void 0 : product.request) && product.request[0] ? product.request[0] : null;
    const res = {
        id: product.id,
        general: [
            {
                name: 'Api Name',
                value: product.category
            },
            statusKV
        ]
    };
    if (product.stack) {
        res.stack = product.stack.map((item) => {
            const data = {
                name: item.target || ''
            };
            if (item.fileName) {
                data.value = convertStockToInitiatorName(item);
            }
            return data;
        });
    }
    if (product.endTime || product.execEndTime) {
        res.general.push({
            name: 'Take Time',
            value: computeTime((product.endTime || product.execEndTime) - product.time)
        });
    }
    if (product.category === 'request') {
        const requestOptions = apiOptions;
        const response = (product === null || product === void 0 ? void 0 : product.response) && product.response[0] ? product.response[0] : null;
        if (requestOptions) {
            res.general.push({
                name: '$$HR$$'
            });
            res.general.push({
                name: 'Request URL',
                value: requestOptions.url || ''
            });
            res.general.push({
                name: 'Request Method',
                value: (requestOptions.method || 'get').toUpperCase()
            });
            let statusCode;
            if (response) {
                if (response instanceof Error) {
                    statusCode = 'Exception';
                }
                else if (response.statusCode) {
                    statusCode = response.statusCode;
                }
                else {
                    statusCode = 'Unknown';
                }
            }
            else {
                statusCode = 'Waiting';
            }
            res.general.push({
                name: 'Status Code',
                value: statusCode
            });
            if (requestOptions.header) {
                res.requestHeaders = Object.keys(requestOptions.header).map((key) => {
                    return {
                        name: key,
                        value: requestOptions.header[key]
                    };
                });
            }
            if (requestOptions.url && requestOptions.url.indexOf('?') !== -1) {
                res.queryStringParameters = requestOptions.url
                    .split('?')
                    .slice(1)
                    .reduce((sum, item, index, arr) => {
                    if (!res.queryString) {
                        res.queryString = arr.join('?');
                    }
                    item.split('&').forEach((sec) => {
                        const arr = sec.split('=');
                        const name = decodeURIComponent(arr[0]);
                        sum.push({
                            name,
                            value: arr[1],
                            decodedValue: arr[1] ? decodeURIComponent(arr[1]) : ''
                        });
                    });
                    return sum;
                }, []);
            }
            const requestDataType = typeof requestOptions.data;
            if (requestDataType !== 'undefined') {
                res.originalRequestData = requestOptions.data;
                // const reqContentType = requestOptions.header
                //     ? findValue(requestOptions.header, "content-type")
                //     : "application/json";
                // if (reqContentType) {
                //     if (reqContentType.startsWith("application/json")) {
                //         // requestRayload
                //     } else if (
                //         reqContentType === "application/x-www-form-unlencoded"
                //     ) {
                //     }
                // }
            }
            if (response && !(response instanceof Error)) {
                if (response.header) {
                    res.responseHeaders = Object.keys(response.header).map((key) => {
                        return {
                            name: key,
                            value: response.header[key]
                        };
                    });
                }
                if ((response === null || response === void 0 ? void 0 : response.cookies) && response.cookies.length) {
                    res.cookies = response.cookies.map((item) => {
                        return parseCookie(item);
                    });
                }
                res.response = response.data;
            }
        }
    }
    ['requestHeaders', 'responseHeaders', 'queryStringParameters'].forEach((prop) => {
        if (!res[prop] || !res[prop].length) {
            delete res[prop];
        }
    });
    return res;
};
