import { RequireId } from '../../types/common';
import { MpUIConfig } from '../../types/config';
import { MpApiMaterial, MpConsoleMaterial, MpProduct } from '../../types/product';
export declare const getApiNameInfo: (product: Partial<MpProduct>) => {
    name: string;
    desc: string;
} | undefined;
export declare const getApiStatusInfo: (product: Partial<MpProduct>) => {
    code?: number;
    status?: string;
    statusDesc?: string;
};
export declare const convertApiMaterial: (product: Partial<MpProduct>, mpRunConfig?: MpUIConfig) => Partial<MpApiMaterial> & RequireId;
export declare const convertConsoleMaterial: (product: Partial<MpProduct>, mpRunConfig?: MpUIConfig) => MpConsoleMaterial;
export declare const requestProductToString: (product: MpProduct) => string;
export declare const productToString: (product: MpProduct) => string;
