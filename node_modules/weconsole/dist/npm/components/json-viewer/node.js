import { WeComponent } from '../mixins/component';
WeComponent({
    properties: {
        data: Object,
        fontSize: Number,
        smallFontSize: Number,
        outerClass: String
    },
    methods: {
        tap() {
            this.triggerEvent('toggle', {
                open: !this.data.data.open,
                path: this.data.data.path
            });
        },
        tapChunk() {
            if (this.data.data.type === "compute" /* compute */) {
                this.triggerEvent('toggle', {
                    path: this.data.data.path,
                    fromCompute: true
                });
            }
        },
        toggle(e) {
            this.triggerEvent('toggle', e.detail);
        }
    }
});
