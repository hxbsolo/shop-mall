import { EventHandler } from '../../types/util';
declare const _default: {
    methods: {
        $wcOn(name: string, handler: EventHandler): void;
        $wcOnce(name: string, handler: EventHandler): void;
        $wcEmit(name: string, data?: any): void;
        $wcOff(name: string, handler?: EventHandler): void;
    };
    detached(): void;
};
export default _default;
