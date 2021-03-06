import { hookFunc, replaceFunc } from '@mpkit/func-helper';
import { wcScopeSingle, log } from './util';
const CONSOLE_METHODS = ['log', 'info', 'warn', 'error'];
const SigleScopes = ["Api" /* Api */, "App" /* App */, "Component" /* Component */, "Page" /* Page */, "Console" /* Console */];
export class Hooker {
    constructor(scope, hooks, original, originalName, otherState) {
        // eslint-disable-next-line no-param-reassign
        otherState = otherState || {};
        this.scope = scope;
        this.hooks = hooks;
        this.stores = [];
        if (scope === "App" /* App */) {
            this.native = App;
            App = replaceFunc(App, hookFunc(App, false, this.hooks, Object.assign({ funcName: 'App', scope: this.scope }, otherState)).func, (store) => {
                this.stores.push(store);
            });
            return;
        }
        if (scope === "Page" /* Page */) {
            this.native = Page;
            Page = replaceFunc(Page, hookFunc(Page, false, this.hooks, Object.assign({ funcName: 'Page', scope: this.scope }, otherState)).func, (store) => {
                this.stores.push(store);
            });
            return;
        }
        if (scope === "Component" /* Component */) {
            this.native = Component;
            Component = replaceFunc(Component, hookFunc(Component, false, this.hooks, Object.assign({ funcName: 'Component', scope: this.scope }, otherState)).func, (store) => {
                this.stores.push(store);
            });
            return;
        }
        if (scope === "Api" /* Api */) {
            this.native = wx;
            const target = {};
            for (const prop in wx) {
                if (typeof wx[prop] === 'function') {
                    const mehtod = wx[prop].bind(wx);
                    target[prop] = replaceFunc(mehtod, hookFunc(mehtod, false, this.hooks, Object.assign({ funcName: prop, scope: this.scope }, otherState)).func, (store) => {
                        this.stores.push(store);
                    });
                }
                else if (prop === 'cloud') {
                    // ???????????????
                    for (const cloudProp in wx.cloud) {
                        if (typeof wx.cloud[cloudProp] === 'function') {
                            const mehtod = wx.cloud[cloudProp].bind(wx.cloud);
                            wx.cloud[cloudProp] = replaceFunc(mehtod, hookFunc(mehtod, false, this.hooks, Object.assign({ funcName: `cloud.${cloudProp}`, scope: this.scope, hookApiCallback: false }, otherState)).func, (store) => {
                                this.stores.push(store);
                            });
                        }
                    }
                    target[prop] = wx.cloud;
                }
                else {
                    target[prop] = wx[prop];
                }
            }
            wx = target;
            return;
        }
        if (scope === "Console" /* Console */) {
            this.native = console;
            const org = {};
            for (const prop in console) {
                if (CONSOLE_METHODS.indexOf(prop) !== -1 && typeof console[prop] === 'function') {
                    const mehtod = console[prop].bind(console);
                    org[prop] = mehtod;
                    console[prop] = replaceFunc(mehtod, hookFunc(mehtod, false, this.hooks, Object.assign({ funcName: prop, scope: this.scope }, otherState)).func, (store) => {
                        this.stores.push(store);
                    });
                }
            }
            console.org = org;
            return;
        }
        if (!original || typeof original !== 'function') {
            log('error', '???????????????????????????hook');
            return;
        }
        if (scope === "AppMethod" /* AppMethod */ || scope === "PageMethod" /* PageMethod */ || scope === "ComponentMethod" /* ComponentMethod */) {
            this.native = original;
            this.target = replaceFunc(original, hookFunc(original, false, this.hooks, Object.assign({ funcName: originalName, scope: this.scope }, otherState)).func, (store) => {
                this.stores.push(store);
            });
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    static for(scope, hooks, original, originalName, otherState) {
        if (SigleScopes.indexOf(scope) !== -1) {
            return wcScopeSingle(`HookerOf${scope}`, () => new Hooker(scope, hooks, original, originalName, otherState));
        }
        return new Hooker(scope, hooks, original, originalName, otherState);
    }
    replace() {
        if (this.stores) {
            this.stores.forEach((item) => item.replace());
        }
    }
    restore() {
        if (this.stores) {
            this.stores.forEach((item) => item.restore());
        }
    }
}
