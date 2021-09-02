export interface EventHandler<T = any> {
    (type: string, data?: T): any;
}
export interface IEventEmitter<T = any> {
    on: (type: string, handler: EventHandler<T>) => any;
    once: (type: string, handler: EventHandler<T>) => any;
    off: (type: string, handler?: EventHandler<T>) => any;
    emit: (type: string, data?: T) => any;
    destory: () => any;
}
export declare type WcListFilterHandler<T = any> = (item: T, index: number, list: T[]) => any;
