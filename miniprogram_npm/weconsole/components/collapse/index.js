import { WeComponent } from '../mixins/component';
WeComponent({
    options: {
        multipleSlots: true
    },
    properties: {
        open: {
            type: Boolean,
            observer(val) {
                this.setData({
                    innerOpen: val
                });
            }
        },
        inner: {
            type: Boolean,
            value: true
        },
        title: String,
        border: {
            type: Boolean,
            value: true
        }
    },
    data: {
        innerOpen: false
    },
    methods: {
        toggle() {
            this.triggerEvent('toggle');
            this.setData({
                innerOpen: !this.data.innerOpen
            });
        }
    }
});
