import { promiseifyApi } from '../../modules/util';
export const getStorageInfoAndList = () => {
    return promiseifyApi('getStorageInfo')
        .then((res) => {
        const info = res;
        return Promise.all([info].concat(info.keys.map((key) => getStorage(key))));
    })
        .then((res) => {
        return [res.splice(0, 1)[0], res];
    });
};
export const getStorageInfo = () => {
    return promiseifyApi('getStorageInfo');
};
export const getStorage = (key, toString = true) => {
    return promiseifyApi('getStorage', {
        key
    }).then((res) => {
        return {
            id: key,
            key,
            value: typeof res.data === 'string' ? res.data : toString ? JSON.stringify(res.data) : res.data
        };
    });
};
export const removeStorage = (key) => {
    return promiseifyApi('removeStorage', {
        key
    });
};
export const clearStorage = (ignore) => {
    if (!ignore) {
        return promiseifyApi('clearStorage');
    }
    return promiseifyApi('getStorageInfo').then((res) => {
        return res.keys.map((item) => {
            if (ignore(item)) {
                return Promise.resolve();
            }
            else {
                return removeStorage(item);
            }
        });
    });
};
