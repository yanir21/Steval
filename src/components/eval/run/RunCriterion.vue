<template>
	<div>
		<v-list-item>
			<v-list-item-avatar class="my-0" min-width="12vw" min-height="7vh">
				<v-badge left bordered class="ml-4 mt-4 mx-3">
					<template v-slot:badge>{{ criterionIndex + 1 }}</template>
				</v-badge>

				<tri-toggle
					:criterionGrade="grade"
					:currCriterionId="criterionId"
					@gradePressed="gradeChanged"
				></tri-toggle>
			</v-list-item-avatar>
			<v-list-item-content>
				{{ name }}
			</v-list-item-content>
			<v-list-item-action class="my-0 ml-4 mr-4">
				<v-menu bottom :close-on-content-click="false">
					<template v-slot:activator="{ on, attrs }">
						<v-badge
							v-show="isSpacielPricingEnabled"
							:value="filledPricings.length"
							overlap
							color="blue-grey"
							bordered
						>
							<template v-slot:badge>{{ filledPricings.length }}</template>
							<v-slide-y-transition>
								<v-btn
									v-show="isSpacielPricingEnabled"
									fab
									elevation="0.5"
									x-small
									color="primary"
									v-bind="attrs"
									v-on="on"
								>
									<v-icon>add_comment</v-icon>
								</v-btn>
							</v-slide-y-transition>
						</v-badge>
					</template>

					<v-list>
						<pricing-property
							v-for="(price, index) in specialPricings"
							:key="index"
							:pricing="price.text.description"
							@selectPricing="addPricing(price)"
							@removePricing="removePricing(price)"
							:isChecked="isFilled(price.value)"
						></pricing-property>
					</v-list>
				</v-menu>
			</v-list-item-action>
		</v-list-item>
		<v-divider />
	</div>
</template>

<script>
import Swal from 'sweetalert2';
import TriToggle from '@/components/eval/run/TriToggle';
import { mapState } from 'vuex';
import PricingProperty from '@/components/eval/run/PricingProperty';

export default {
	data() {
		return {
			grade: this.criterionGrade,
			filled: []
		};
	},
	components: {
		'tri-toggle': TriToggle,
		PricingProperty
	},
	props: {
		name: {
			required: true
		},
		criterionId: {
			required: true
		},
		criterionGrade: {
			required: true
		},
		specialPricings: {
			default: []
		},
		filledPricings: {
			default: []
		},
		criterionIndex: {
			required: true
		}
	},
	watch: {
		criterionGrade() {
			this.grade = this.criterionGrade;
		},
		filledPricings() {
			this.filled.length = 0;
			this.filledPricings.forEach(pricing => {
				this.filled.push(pricing.milestone_pricing_id);
			});
		}
	},
	computed: {
		...mapState(['darkMode']),

		isSpacielPricingEnabled() {
			return Number(this.grade) && this.specialPricings.length;
		}
	},
	methods: {
		gradeChanged(grade) {
			if (this.grade !== grade) {
				if (grade != 100) {
					this.$emit('pricingOfCriterionRemoved', this.criterionId);
				}
				this.grade = grade;
				this.$emit('gradeInserted', grade, this.criterionId);
			}
		},
		addPricing(pricing) {
			this.$emit('pricingFilled', {
				milestone_pricing_id: pricing.value,
				milestone_special_pricing: {
					milestone_id: this.criterionId,
					special_pricing: { id: pricing.text.id, price: pricing.text.price }
				}
			});
		},
		removePricing(pricing) {
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
