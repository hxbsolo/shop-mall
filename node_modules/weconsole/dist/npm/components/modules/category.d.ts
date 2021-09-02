import { MpNameValue } from '../../types/common';
import { MpUIConfig } from '../../types/config';
import { MpProduct } from '../../types/product';
export declare const MpApiCategoryMap: {
    request: string;
    downloadFile: string;
    uploadFile: string;
    createUDPSocket: string;
    sendSocketMessage: string;
    onSocketOpen: string;
    onSocketMessage: string;
    onSocketError: string;
    onSocketClose: string;
    connectSocket: string;
    closeSocket: string;
    canIUse: string;
    switchTab: string;
    navigateBack: string;
    navigateTo: string;
    redirectTo: string;
    reLaunch: string;
    showToast: string;
    showModal: string;
    showLoading: string;
    showActionSheet: string;
    hideToast: string;
    hideLoading: string;
    nextTick: string;
    stopPullDownRefresh: string;
    startPullDownRefresh: string;
    pageScrollTo: string;
    setStorageSync: string;
    setStorage: string;
    removeStorageSync: string;
    removeStorage: string;
    getStorageSync: string;
    getStorage: string;
    getStorageInfo: string;
    getStorageInfoSync: string;
    clearStorageSync: string;
    clearStorage: string;
    login: string;
    checkSession: string;
    getAccountInfoSync: string;
    getUserProfile: string;
    getUserInfo: string;
    getLocation: string;
    openLocation: string;
};
export declare const reportCategoryMapToList: (categoryMap: {
    [prop: string]: string;
}) => MpNameValue<string>[];
/**
 * 获取小程序Api数据原料的分类值
 */
export declare const getCategoryValue: (product: Partial<MpProduct>, runConfig?: MpUIConfig) => string[];
/**
 * 获取小程序Api数据原料的分类信息列表
 */
export declare const getApiCategoryList: (runConfig?: MpUIConfig) => MpNameValue<string>[];
