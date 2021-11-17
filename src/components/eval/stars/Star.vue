<template>
    <v-tooltip transition="slide-y-transition" offset-overflow bottom max-width="140">
        <template v-slot:activator="{ on }">
            <v-icon
                slot="activator"
                :color="starColor"
                large
                v-on="on"
                @mouseover="updateTempRating(starValue)"
                @[event]="setRating(starValue)"
                >{{ icon }}
            </v-icon>
        </template>
        <span class="text-body-1">{{ description }}</span>
    </v-tooltip>
</template>

<script>
export default {
    props: {
        starColor: {
            type: String,
            default: 'amber',
        },
        icon: {
            requierd: true,
        },
        starValue: {
            requierd: true,
        },
        description: {
            type: String,
        },
        canRate: {
            default: true,
        },
    },
    methods: {
        updateTempRating(currRating) {
            this.$emit('starRating', currRating);
        },

        setRating(starRatingValue) {
            if (this.canRate) {
                this.$emit('setRating', starRatingValue);
            }
        },
    },
    computed: {
        event() {
            return this.canRate ? 'click' : null;
        }
    },
};
</script>

<style lang="css" scoped>
#star {
    margin: 1%;
}

.v-tooltip__content {
    font-size: 120% !important;
}
</style>
