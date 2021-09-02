import { Hooker } from './modules/hooker';
import { FormatApiMethodCallbackHook, FuncIDHook, MpProductHook, MpViewFactoryHook } from './modules/hooks';
import { MpProductController } from './modules/controller';
import { wcScopeSingle, wcScope } from './modules/util';
import { emit } from './modules/ebus';
export * from './modules/ebus';
export { log } from './modules/util';
export const ProductController = wcScopeSingle('ProductController', () => new MpProductController());
export const HookerList = wcScopeSingle('HookerList', () => []);
// ProductController.on("all", (type, data) => {
//     ((console as any).org || console).log(type, data);
// });
const ProductControllerHook = {
    before(state) {
        state.state.controller = ProductController;
    }
};
const HookerListHook = {
    before(state) {
        state.state.hookers = HookerList;
    }
};
const initHooker = (scope) => {
    if (scope === "Api" /* Api */) {
        HookerList.push(Hooker.for("Api" /* Api */, [
            HookerListHook,
            ProductControllerHook,
            FuncIDHook,
            FormatApiMethodCallbackHook,
            MpProductHook
        ]));
        return;
    }
    if (scope === "Console" /* Console */) {
        HookerList.push(Hooker.for("Console" /* Console */, [HookerListHook, ProductControllerHook, FuncIDHook, MpProductHook]));
        return;
    }
    if (scope === "Component" /* Component */) {
        HookerList.push(Hooker.for("Component" /* Component */, [
            HookerListHook,
            ProductControllerHook,
            FuncIDHook,
            MpProductHook,
            MpViewFactoryHook
        ]));
        return;
    }
    if (scope === "Page" /* Page */) {
        HookerList.push(Hooker.for("Page" /* Page */, [
            HookerListHook,
            ProductControllerHook,
            FuncIDHook,
            MpProductHook,
            MpViewFactoryHook
        ]));
        return;
    }
    if (scope === "App" /* App */) {
        HookerList.push(Hooker.for("App" /* App */, [
            HookerListHook,
            ProductControllerHook,
            FuncIDHook,
            MpProductHook,
            MpViewFactoryHook
        ]));
    }
};
export const replace = (scope) => {
    if (!scope) {
        return HookerList.forEach((item) => item.replace());
    }
    const item = HookerList.find((item) => item.scope === scope);
    if (item) {
        item.replace();
        return;
    }
    initHooker(scope);
};
export const restore = (scope) => {
    if (!scope) {
        return HookerList.forEach((item) => item.restore());
    }
    const item = HookerList.find((item) => item.scope === scope);
    if (item) {
        item.restore();
    }
};
/** 获取小程序内weconsole已经监控到的所有的App/Page/Component实例 */
export const getWcControlMpViewInstances = () => wcScopeSingle('MpViewInstances', () => []);
export const setUIConfig = (config) => {
    const scope = wcScope();
    if (!scope.UIConfig) {
        scope.UIConfig = {};
    }
    Object.assign(scope.UIConfig, config);
    emit("WcUIConfigChange" /* WcUIConfigChange */, scope.UIConfig);
};
export const addCustomAction = (action) => {
    const scope = wcScope();
    if (!scope.UIConfig) {
        scope.UIConfig = {};
    }
    const config = scope.UIConfig;
    if (!config.customActions) {
        config.customActions = [];
    }
    const index = config.customActions.findIndex((item) => item.id === action.id);
    if (index === -1) {
        config.customActions.push(action);
    }
    else {
        config.customActions[index] = action;
    }
    emit("WcUIConfigChange" /* WcUIConfigChange */, scope.UIConfig);
};
export const removeCustomAction = (actionId) => {
    const scope = wcScope();
    if ((scope === null || scope === void 0 ? void 0 : scope.UIConfig) && scope.UIConfig.customActions) {
        const config = scope.UIConfig;
        const index = config.customActions.findIndex((item) => item.id === actionId);
        if (index !== -1) {
            config.customActions.splice(index, 1);
            emit("WcUIConfigChange" /* WcUIConfigChange */, scope.UIConfig);
        }
    }
};
global.addCustomAction = addCustomAction;
global.removeCustomAction = removeCustomAction;
export const showWeConsole = () => {
    const scope = wcScope();
    scope.visable = true;
    emit("WcVisableChange" /* WcVisableChange */, scope.visable);
};
export const hideWeConsole = () => {
    const scope = wcScope();
    scope.visable = false;
    emit("WcVisableChange" /* WcVisableChange */, scope.visable);
};
