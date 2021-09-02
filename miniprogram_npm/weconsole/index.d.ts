import { Hooker } from './modules/hooker';
import { MpProductController } from './modules/controller';
import { HookScope } from './types/common';
import { MpUIConfig } from './types/config';
import { WcCustomAction } from './types/other';
export * from './modules/ebus';
export { log } from './modules/util';
export declare const ProductController: MpProductController;
export declare const HookerList: Hooker[];
export declare const replace: (scope?: HookScope) => void;
export declare const restore: (scope?: HookScope) => void;
/** 获取小程序内weconsole已经监控到的所有的App/Page/Component实例 */
export declare const getWcControlMpViewInstances: () => any[];
export declare const setUIConfig: (config: Partial<MpUIConfig>) => void;
export declare const addCustomAction: (action: WcCustomAction) => void;
export declare const removeCustomAction: (actionId: string) => void;
export declare const showWeConsole: () => void;
export declare const hideWeConsole: () => void;
