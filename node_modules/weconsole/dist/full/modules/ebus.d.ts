import { EventEmitter } from './event-emitter';
export declare const on: (type: string, handler: import("../types/util").EventHandler<any>) => void;
export declare const off: (type: string, handler?: import("../types/util").EventHandler<any>) => void;
export declare const emit: (type: string, data?: any) => void;
export declare const once: (type: string, _handler: import("../types/util").EventHandler<any>) => void;
export declare const ebus: EventEmitter<any>;
