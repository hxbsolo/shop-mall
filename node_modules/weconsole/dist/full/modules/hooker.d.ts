import { MkFuncHook } from '@mpkit/types';
import { HookScope } from '../types/common';
import { IHooker } from '../types/hook';
export declare class Hooker implements IHooker {
    readonly target?: Function;
    readonly scope: HookScope;
    readonly hooks: MkFuncHook[];
    private stores?;
    private native?;
    private constructor();
    static for(scope: HookScope, hooks: MkFuncHook[], original?: Function, originalName?: string, otherState?: any): Hooker;
    replace(): void;
    restore(): void;
}
