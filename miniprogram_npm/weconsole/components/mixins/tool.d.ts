import { MpClientRect } from '../../types/view';
declare const _default: {
    methods: {
        noop(): void;
        $getBoundingClientRect(selector: string, retryCount?: number, delay?: number): Promise<MpClientRect>;
        $showToast(title: any): void;
        $showActionSheet(options: any): Promise<number>;
    };
};
export default _default;
