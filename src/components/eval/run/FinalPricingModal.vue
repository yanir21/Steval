<template>
	<div id="modalContainer">
		<v-dialog v-model="dialog" width="500">
			<template v-slot:activator="{ on }">
				<v-badge
					:value="filledPricingCount"
					overlap
					color="blue-grey"
					id="finalPricingCount"
				>
					<template v-slot:badge>{{ filledPricingCount }}</template>
				</v-badge>
				<v-btn
					rounded
					id="finalPricingButton"
					small
					:class="darkMode ? 'amber--text' : null"
					:color="darkMode ? 'grey darken-3' : 'amber lighten-3'"
					:disabled="finalPricingData.length === 0"
					@shortkey="dialog = !dialog"
					@click="dialog = true"
					v-shortkey="['ctrl', 'alt', 'd']"
				>
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<span v-on="on">
								תמחור סופי
							</span>
						</template>
						<span>
							בקרץ שגוי? הערה כללית? <br />
							בדיוק בשביל זה יש תמחור סופי <br />
							(Ctrl + Alt + d)
						</span>
					</v-tooltip>
				</v-btn>
				<div
					id="finalPricingHebrewShortkey"
					@shortkey="dialog = !dialog"
					v-shortkey="['ctrl', 'alt', 'ג']"
				></div>
			</template>
			<v-card>
				<v-card-title
					class="headline grey"
					:class="darkMode ? 'darken-3' : 'lighten-2'"
					primary-title
				>
					מה קרה לו בתר"ץ?
				</v-card-title>
				<v-card-text>
					<v-virtual-scroll
						:items="finalPricingData"
						item-height="70"
						height="500"
						width="700"
					>
						<template v-slot="{ item }">
							<pricing-property
								:pricing="item.text.description"
								@selectPricing="addPricing(item)"
								@removePricing="remove(item)"
								:isChecked="isFilled(item.value)"
							>
							</pricing-property>
						</template>
					</v-virtual-scroll>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn :color="darkMode ? 'white' : 'primary'" text @click="dialog = false">
						סיימתי!
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import PricingProperty from '@/components/eval/run/PricingProperty.vue';
import { mapState } from 'vuex';

export default {
	components: {
		'pricing-property': PricingProperty
	},
	props: {
		finalPricingData: {
			requierd: true
		},
		filledPricings: {
			default: () => []
		},
		filledPricingCount: Number
	},
	data() {
		return {
			dialog: false
		};
	},
	computed: {
		...mapState(['chosenStudentID', 'darkMode'])
	},
	methods: {
		addPricing(pricing) {
			let finalPricingFormat = {
				milestone_pricing_id: pricing.value,
				milestone_special_pricing: {
					milestone_id: this.$store.getters.currentMeeting,
					special_pricing: { id: pricing.text.id, price: pricing.text.price }
				}
			};
			this.$emit('pricingFilled', finalPricingFormat);
		},
		remove(pricing) {
			this.$emit(
				'pricingRemoved',
				this.filledPricings.filter(
					current => current.milestone_pricing_id == pricing.value
				)[0]
			);
		},
		isFilled(pricingId) {
			return (
				this.filledPricings
					.map(pricing => pricing.milestone_pricing_id)
					.indexOf(pricingId) !== -1
			);
		}
	}
};
</script>

<style>
#finalPricingCount {
	z-index: 1;
	opacity: 0.9;
	top: -1px;
	right: 2px;
	position: absolute;
	background-color: blueviolet;
}

#modalContainer {
	position: relative;
}
</style>
