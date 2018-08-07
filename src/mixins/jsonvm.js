export default {
    data: function () {
        return {
            jsonvm: this.$slots && this.$slots['jsonvm'] && this.$slots['jsonvm'][0] ? JSON.parse(this.$slots['jsonvm'][0].text) : {}
        }
    }
};
