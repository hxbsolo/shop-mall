import { RequireId } from '../types/common';
import { IMpProductController, MpProductFilter } from '../types/hook';
import { MpProduct } from '../types/product';
import { EventEmitter } from './event-emitter';
export declare class MpProductController extends EventEmitter implements IMpProductController {
    private map;
    private list;
    constructor();
    getList(filter?: MpProductFilter): MpProduct[];
    create(data: Partial<MpProduct> & RequireId<string>): MpProduct;
    change(data: Partial<MpProduct> & RequireId<string>): MpProduct;
}
