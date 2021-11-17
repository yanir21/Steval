<template>
	<v-row id="meetingActions" justify="end">
		<v-col cols="auto">
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn
						small
						rounded
						v-on="on"
						:color="darkMode ? 'green accent-5' : 'teal lighten-4'"
						@click="toggleSelection(true)"
					>
						הכל עבד
					</v-btn>
				</template>
				<span>
					Ctrl + Alt + v
				</span>
			</v-tooltip>
		</v-col>
		<v-col cols="auto">
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn
						small
						rounded
						v-on="on"
						:color="darkMode ? 'error' : 'red lighten-4'"
						@click="toggleSelection(false)"
						>כלום לא עבד</v-btn
					>
				</template>
				<span>
					Ctrl + Alt + x
				</span>
			</v-tooltip>
		</v-col>
		<v-col v-if="isRunMeeting" cols="auto">
			<final-pricing-modal
				:finalPricingData="finalPricingList"
				:filledPricings="filledFinalPricings"
				:filledPricingCount="filledFinalPricings.length"
				@pricingFilled="fillPricing"
				@pricingRemoved="removePricing"
			></final-pricing-modal>
		</v-col>
		<v-fade-transition mode="out-in">
			<v-col v-if="requestFulFilled" key="checkmark" cols="auto">
				<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
					<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
					<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
				</svg>
			</v-col>
			<v-col class="syncBlock" key="loading" v-else-if="requestPending" cols="auto">
				<v-progress-circular
					class="syncIcon"
					indeterminate
					color="primary"
				></v-progress-circular>
				<span class="savingText">
					שומר...
				</span>
			</v-col>
		</v-fade-transition>
	</v-row>
</template>

<script>
import FinalPricingModal from '@/components/eval/run/FinalPricingModal.vue';
import Swal from 'sweetalert2';
import { mapState, mapGetters } from 'vuex';
import {
	pricingByMilestone,
	filledPricingsForStudent,
	insertStudentPricings
} from '@/queries/PricingQueries.js';

export default {
	created() {
		document.addEventListener('keydown', this.shortcutsHandler);
	},
	destroyed() {
		document.removeEventListener('keydown', this.shortcutsHandler);
	},
	apollo: {
		pricingList: {
			query() {
				return pricingByMilestone;
			},
			variables() {
				return {
					milestone_id: this.$store.getters.currentMeeting
				};
			},
			skip() {
				return !this.$store.getters.currentMeeting;
			},
			fetchPolicy: 'no-cache'
		}
	},
	components: {
		'final-pricing-modal': FinalPricingModal
	},
	props: {
		isRunMeeting: {
			required: true,
			type: Boolean
		},
		filledPricing: {
			default: () => []
		},
		networkUpdates: {
			default: null
		}
	},
	data() {
		return {
			pricingList: [],
			requestPending: false,
			requestFulFilled: false,
			animations: []
		};
	},
	computed: {
		...mapState(['chosenStudentID', 'darkMode']),
		isStudentChosen() {
			return !(this.$store.state.chosenStudentID == '');
		},
		filledFinalPricings() {
			return this.filledPricing.filter(
				pricing =>
					pricing.milestone_special_pricing.milestone_id ==
					this.$store.getters.currentMeeting
			);
		},
		finalPricingList() {
			return this.pricingList.filter(
				pricing => pricing.milestone_id == this.$store.getters.currentMeeting
			);
		},
		...mapState(['chosenStudentID'])
	},
	methods: {
		shortcutsHandler(e) {
			if (e.ctrlKey && e.altKey) {
				e.preventDefault();
				switch (e.code) {
					case 'KeyV':
						this.toggleSelection(true);

						break;

					case 'KeyX':
						this.toggleSelection(false);

						break;

					case 'KeyC':
						this.validateDeleteSelection();

						break;
				}
			}
		},
		toggleSelection(didWork) {
			this.$emit('updateAllGrades', didWork ? '100' : '0');
		},
		pricings(criterionId) {
			return this.pricingList.filter(
				pricing => pricing.milestone_idmilestone_id == criterionId
			);
		},
		fillPricing(pricing) {
			this.$emit('pricingFilled', pricing);
		},
		removePricing(pricing) {
			this.$emit('pricingRemoved', pricing);
		},
		validateDeleteSelection() {
			Swal.fire({
				title: 'בטוח שאתה רוצה למחוק הכל?',
				text: 'תצטרך למלא את הכל מחדש!',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'כן, תמחק לי',
				customClass: {
					icon: 'swal2-arabic-question-mark'
				},
				cancelButtonText: 'אל תמחק, התחרטתי'
			}).then(result => {
				if (result.value) {
					this.$emit('deleteGrades');
				}
			});
		},
		clearPreviousAnimations() {
			this.animations.forEach(timeOut => clearTimeout(timeOut));
			this.animations.length = 0;
		},
		async waitForValidation() {
			this.requestPending = true;
			try {
				await this.networkUpdates;
				this.animations.push(
					setTimeout(() => {
						this.requestPending = false;
						this.requestFulFilled = true;
					}, 500)
				);
				this.animations.push(
					setTimeout(() => {
						this.requestFulFilled = false;
					}, 3000)
				);
			} catch (err) {
				this.requestPending = false;
			}
		}
	},
	watch: {
		networkUpdates() {
			this.clearPreviousAnimations();
			this.requestFulFilled = false;
			this.waitForValidation();
		}
	}
};
</script>

<style lang="css" scoped>
.syncIcon {
	/* margin-top: 2%; */
	position: fixed;
	box-sizing: border-box;
}

.savingText {
	position: relative;
	height: 10em;
	top: 2.2em;
	right: 0.2em;
	color: #1976d2;
}

.syncBlock {
	opacity: 0.8;
}
.checkmark__circle {
	stroke-dasharray: 166;
	stroke-dashoffset: 166;
	stroke-width: 3;
	stroke-miterlimit: 10;
	stroke: #1976d2;
	fill: none;
	animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark {
	position: fixed;
	width: 2em;
	height: 2em;
	border-radius: 50%;
	display: block;
	stroke-width: 2;
	stroke: #1976d2;
	stroke-miterlimit: 10;
	/* margin: 10% auto; */
	box-shadow: inset 0px 0px 0px blue;
	animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark__check {
	transform-origin: 50% 50%;
	stroke-dasharray: 48;
	stroke-dashoffset: 48;
	animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
	100% {
		stroke-dashoffset: 0;
	}
}
@keyframes scale {
	0%,
	100% {
		transform: none;
	}
	50% {
		transform: scale3d(1.1, 1.1, 1);
	}
}
</style>
