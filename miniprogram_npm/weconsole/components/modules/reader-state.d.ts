import { IMpProductController } from '../../types/hook';
import { EventEmitter } from '../../modules/event-emitter';
import { ProductControllerGetter } from '../../types/reader-state';
export declare class ReaderStateController extends EventEmitter {
    private name;
    private productController?;
    private state;
    private recording;
    constructor(name: string, productController?: IMpProductController | ProductControllerGetter);
    private bind;
    clearProducts(): void;
    getProductIdList(): string[];
    record(recording: boolean): void;
    getState(key: string, defaultVal?: any): any;
    setState(key: string, val: any): void;
    removeState(key: string): void;
    private handMap;
    keepSave(id?: string, save?: boolean): string[] | undefined;
    mark(id?: string, save?: boolean): string[] | undefined;
    top(id?: string, save?: boolean): string[] | undefined;
}
