import { wcScope } from '../../modules/util';
const WcScope = wcScope();
const Mixin = {
    methods: {
        $getCanvasContext() {
            if (this.$wcCanvasContext) {
                return Promise.resolve(this.$wcCanvasContext);
            }
            const ctx = WcScope.CanvasContext;
            if (ctx) {
                this.$wcCanvasContext = ctx;
                return Promise.resolve(this.$wcCanvasContext);
            }
            if (!this.$wcCanvasContextResolves) {
                this.$wcCanvasContextResolves = [];
            }
            return new Promise((resolve) => {
                this.$wcCanvasContextResolves.push(resolve);
            });
        }
    },
    created() {
        this.$wcOn("WcCanvasContextReady" /* WcCanvasContextReady */, (type, data) => {
            this.$wcCanvasContext = data;
            if (this.$wcCanvasContextResolves) {
                this.$wcCanvasContextResolves.forEach((item) => {
                    item === null || item === void 0 ? void 0 : item();
                });
                delete this.$wcCanvasContextResolves;
            }
        });
        this.$wcOn("WcCanvasContextDestory" /* WcCanvasContextDestory */, () => {
            delete this.$wcCanvasContext;
        });
    }
};
export default Mixin;
