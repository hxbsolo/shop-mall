import { uuid } from '@mpkit/util';
import { $$getStack, hookApiMethodCallback, isMpViewEvent, log, now, wcScopeSingle } from './util';
import { Hooker } from './hooker';
export const FuncIDHook = {
    before(state) {
        if (!state.state.id) {
            state.state.id = uuid();
        }
    }
};
export const FormatApiMethodCallbackHook = {
    before(state) {
        if (state.state.hookApiCallback === false) {
            return;
        }
        hookApiMethodCallback(state.state.funcName, (res) => {
            state.doneCallback(null, res);
        }, (res) => {
            state.doneCallback(res);
        }, state.args);
        if ((state === null || state === void 0 ? void 0 : state.args[0]) && state.args[0].success) {
            state.needDoneCallback = true;
        }
    }
};
export const MpProductHook = {
    before(state) {
        state.state.product = {
            id: state.state.id,
            time: now(),
            status: 1 /* Executed */,
            type: state.state.scope,
            category: state.state.funcName,
            stack: $$getStack(),
            request: state.args
        };
        state.state.controller.create(state.state.product);
    },
    after(state) {
        const { product, controller } = state.state;
        product.endTime = product.execEndTime = now();
        product.result = state.result;
        controller.change(product);
    },
    complete(state) {
        const { controller, product } = state.state;
        const response = state.fulfilled
            ? [state.value]
            : [state.errors[state.errors.length - 1].error, state.errors[state.errors.length - 1].type];
        const status = state.fulfilled ? 2 /* Success */ : 3 /* Fail */;
        product.endTime = now();
        product.response = response;
        product.status = status;
        controller.change(product);
    },
    catch(state) {
        const { controller, product } = state.state;
        const response = [state.errors[state.errors.length - 1].error, state.errors[state.errors.length - 1].type];
        if (state.state.scope === "Console" /* Console */) {
            log('error', response[0]);
        }
        const status = 3 /* Fail */;
        product.endTime = now();
        product.response = response;
        product.status = status;
        controller.change(product);
    }
};
const hookSpecMethod = (spec, scope, factoryState, otherState, isProperties) => {
    const fireHook = (name, method) => {
        const hooks = [
            {
                before(state) {
                    state.state.viewFactoryId = factoryState.id;
                    state.state.hookers = factoryState.hookers;
                    state.state.controller = factoryState.controller;
                }
            },
            FuncIDHook,
            MpProductHook,
            MpViewEventHandleHook
        ];
        if (scope === "PageMethod" /* PageMethod */ || scope === "ComponentMethod" /* ComponentMethod */) {
            hooks.push(MpViewEventHandleHook);
        }
        if (scope === "ComponentMethod" /* ComponentMethod */ && name === 'created') {
            hooks.push(MpViewInitLifeHook);
            hooks.push(MpViewInsCacheSaveHook);
        }
        if (scope === "PageMethod" /* PageMethod */ && name === 'onLoad') {
            hooks.push(MpViewInitLifeHook);
            hooks.push(MpViewInsCacheSaveHook);
        }
        if (scope === "ComponentMethod" /* ComponentMethod */ && name === 'detached') {
            hooks.push(MpViewInsDestoryMarkHook);
        }
        if (scope === "PageMethod" /* PageMethod */ && name === 'onUnload') {
            hooks.push(MpViewInsDestoryMarkHook);
        }
        const hooker = Hooker.for(scope, hooks, method, name, otherState);
        (factoryState === null || factoryState === void 0 ? void 0 : factoryState.hookers) && factoryState.hookers.push(hooker);
        return hooker.target;
    };
    for (const prop in spec) {
        if (isProperties) {
            if (typeof spec[prop] === 'object' && typeof spec[prop].observer === 'function') {
                spec[prop].observer = fireHook(prop, spec[prop].observer);
            }
        }
        else if (typeof spec[prop] === 'function') {
            spec[prop] = fireHook(prop, spec[prop]);
        }
    }
};
export const MpViewInsCacheSaveHook = {
    before(state) {
        // 将组件实例缓存到全局，便于view取到
        const MpViewInstances = wcScopeSingle('MpViewInstances', () => []);
        MpViewInstances.push(state.ctx);
    }
};
export const MpViewInsDestoryMarkHook = {
    before(state) {
        Object.defineProperty(state.ctx, '__wcDestoryed__', {
            value: true
        });
    }
};
export const MpViewInitLifeHook = {
    before(state) {
        // 重写setData和 triggerEvent
        if (state.ctx.setData || state.ctx.triggerEvent) {
            const { viewFactoryId, hookers, controller, scope } = state.state;
            ['setData', 'triggerEvent'].forEach((name) => {
                const method = state.ctx[name];
                const hooks = [
                    {
                        before(state) {
                            state.state.viewFactoryId = viewFactoryId;
                            state.state.hookers = hookers;
                            state.state.controller = controller;
                        }
                    },
                    FuncIDHook,
                    MpProductHook
                ];
                if (name === 'triggerEvent') {
                    hooks.push(MpViewEventTriggerHook);
                }
                const hooker = Hooker.for(scope, hooks, method, name);
                state.ctx[name] = hooker.target;
                hookers.push(hooker);
            });
        }
    }
};
export const MpViewFactoryHook = {
    before(state) {
        const { scope } = state.state;
        const spec = state.args[0];
        if (!spec.$wcDisabled) {
            // 执行App/Page/Component方法时将methods重写
            if (scope === "App" /* App */) {
                hookSpecMethod(spec, "AppMethod" /* AppMethod */, state.state);
                return;
            }
            if (scope === "Page" /* Page */) {
                if (!spec.onLoad) {
                    spec.onLoad = function WcOnLoadPlaceholder() { };
                }
                if (!spec.onLoad) {
                    spec.onUnload = function WcOnUnloadPlaceholder() { };
                }
                hookSpecMethod(spec, "PageMethod" /* PageMethod */, state.state);
                return;
            }
            if (scope === "Component" /* Component */) {
                if (!spec.created && (!spec.lifetimes || !spec.lifetimes.created)) {
                    spec.lifetimes = spec.lifetimes || {};
                    spec.lifetimes.created = function WcCreatedPlaceholder() { };
                }
                if (!spec.detached && (!spec.lifetimes || !spec.lifetimes.detached)) {
                    spec.lifetimes = spec.lifetimes || {};
                    spec.lifetimes.detached = function WcDetachedPlaceholder() { };
                }
                const lifetimes = Object.keys(spec).filter((key) => typeof spec[key] === 'function' && (!spec.lifetimes || !spec.lifetimes[key]));
                const lifetimesMap = {};
                lifetimes.forEach((name) => {
                    lifetimesMap[name] = spec[name];
                });
                hookSpecMethod(lifetimesMap, "ComponentMethod" /* ComponentMethod */, state.state, {
                    componentMethodSeat: "lifetimes" /* lifetimes */
                });
                lifetimes.forEach((name) => {
                    spec[name] = lifetimesMap[name];
                    delete lifetimesMap[name];
                });
                spec.methods &&
                    hookSpecMethod(spec.methods, "ComponentMethod" /* ComponentMethod */, state.state, {
                        componentMethodSeat: "methods" /* methods */
                    });
                spec.pageLifetimes &&
                    hookSpecMethod(spec.pageLifetimes, "ComponentMethod" /* ComponentMethod */, state.state, {
                        componentMethodSeat: "pageLifetimes" /* pageLifetimes */
                    });
                spec.lifetimes &&
                    hookSpecMethod(spec.lifetimes, "ComponentMethod" /* ComponentMethod */, state.state, {
                        componentMethodSeat: "lifetimes" /* lifetimes */
                    });
                spec.properties &&
                    hookSpecMethod(spec.properties, "ComponentMethod" /* ComponentMethod */, state.state, {
                        componentMethodSeat: "propObserver" /* propObserver */
                    }, true);
                spec.observers &&
                    hookSpecMethod(spec.observers, "ComponentMethod" /* ComponentMethod */, state.state, {
                        componentMethodSeat: "observers" /* observers */
                    });
            }
        }
    }
};
export const MpViewEventTriggerHook = {
    before(state) {
        const { id, funcName } = state.state;
        if (funcName === 'triggerEvent') {
            const args = state.args;
            const orgDetail = args[1];
            args[1] = {
                id,
                _mpcWrap: true,
                orgDetail
            };
        }
    }
};
export const MpViewEventHandleHook = {
    before(state) {
        const { controller, id } = state.state;
        const args = state.args;
        if (isMpViewEvent(args[0])) {
            const wrapDetail = args[0].detail;
            if (typeof wrapDetail === 'object' && wrapDetail && wrapDetail._mpcWrap) {
                args[0].detail = wrapDetail.orgDetail;
                controller.change({
                    id,
                    eventTriggerPid: wrapDetail.id
                });
                controller.change({
                    id: wrapDetail.id,
                    eventHandlePid: id
                });
            }
        }
    }
};
