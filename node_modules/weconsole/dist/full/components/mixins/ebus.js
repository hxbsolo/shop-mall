import { once, emit, on, off } from '../../modules/ebus';
import { each } from '../../modules/util';
export default {
    methods: {
        $wcOn(name, handler) {
            if (!this.$wcEvents) {
                this.$wcEvents = {};
            }
            if (!this.$wcEvents[name]) {
                this.$wcEvents[name] = [];
            }
            this.$wcEvents[name].push(handler);
            on(name, handler);
        },
        $wcOnce(name, handler) {
            if (!this.$wcEvents) {
                this.$wcEvents = {};
            }
            if (!this.$wcEvents[name]) {
                this.$wcEvents[name] = [];
            }
            this.$wcEvents[name].push(handler);
            once(name, handler);
        },
        $wcEmit(name, data) {
            emit(name, data);
        },
        $wcOff(name, handler) {
            if ((this === null || this === void 0 ? void 0 : this.$wcEvents) && this.$wcEvents[name]) {
                if (handler) {
                    const index = this.$wcEvents[name].indexOf(handler);
                    this.$wcEvents[name].splice(index, 1);
                    off(name, handler);
                }
                else {
                    this.$wcEvents[name].forEach((item) => {
                        off(name, item);
                    });
                    delete this.$wcEvents[name];
                }
            }
        }
    },
    detached() {
        if (this === null || this === void 0 ? void 0 : this.$wcEvents) {
            each(this.$wcEvents, (name) => {
                this.$wcOff(name);
            });
        }
    }
};
