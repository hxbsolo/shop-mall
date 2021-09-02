import { MpAttrNode, MpElement } from '../../types/element';
export declare const getChildrenElements: (vw: any, group?: string) => Promise<MpElement[]>;
export declare const getElement: (vw: any) => Promise<MpElement>;
export declare const hasChild: (vw: any, type?: 'App' | 'Page' | 'Component') => boolean;
export declare const getElementAttrs: (vw: any, type?: 'App' | 'Page' | 'Component') => Promise<MpAttrNode[] | undefined>;
export declare const findPageIns: (id: string) => any | undefined;
export declare const findComponentIns: (id: string) => any | undefined;
