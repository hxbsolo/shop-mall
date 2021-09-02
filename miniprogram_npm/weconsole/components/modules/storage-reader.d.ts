import { MpStorageInfo } from '../../types/storage-reader';
import { MpStorageMaterial } from '../../types/product';
export declare const getStorageInfoAndList: () => Promise<[MpStorageInfo, MpStorageMaterial[]]>;
export declare const getStorageInfo: () => Promise<MpStorageInfo>;
export declare const getStorage: (key: string, toString?: boolean) => Promise<MpStorageMaterial>;
export declare const removeStorage: (key: string) => Promise<void>;
export declare const clearStorage: (ignore?: Function) => Promise<void>;
