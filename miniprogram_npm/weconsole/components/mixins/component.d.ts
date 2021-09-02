import { MkViewFormatSpec, MpViewType } from '@mpkit/types';
import { MpComponentSpec, MpViewContext } from '../../types/view';
export declare const formatViewSpecList: (viewType: MpViewType, ...specList: any[]) => MkViewFormatSpec;
export declare const fireViewMethod: (methodHandlers: Array<Function | string>, ...args: any[]) => any;
export declare const WeComponent: <T extends MpViewContext<any> = MpViewContext<any>>(...specList: MpComponentSpec<T>[]) => void;
