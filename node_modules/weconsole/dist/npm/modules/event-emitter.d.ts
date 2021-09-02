import { IEventEmitter, EventHandler } from '../types/util';
export declare class EventEmitter<T = any> implements IEventEmitter<T> {
    private events;
    constructor();
    once(type: string, _handler: EventHandler<T>): void;
    destory(): void;
    on(type: string, handler: EventHandler<T>): void;
    off(type: string, handler?: EventHandler<T>): void;
    emit(type: string, data?: T): void;
}
