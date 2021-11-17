<template>
	<v-card>
		<v-card-title primary-title id="title" class="font-weight-medium">
			{{ step === 1 ? 'תמחורים מיוחדים' : 'הוסף תמחור מיוחד' }} עבור&nbsp;
			<b>{{ criterion.name }}</b>
			<v-spacer></v-spacer>
			<v-btn color="error" fab small @click="close">
				<v-icon dark>close</v-icon>
			</v-btn>
		</v-card-title>
		<v-divider></v-divider>
		<v-window v-model="step">
			<v-window-item :value="1" class="pricingsBlock">
				<special-pricings-list
					:pricingList="pricingList"
					@close="close"
					@refetch-price="refetchPrices"
					@update-price="updatePrices"
				></special-pricings-list>
			</v-window-item>
			<v-window-item :value="2" class="pricingsBlock">
				<add-exists-special-pricing
					ref="addExistsSpecialPricing"
					@add-price="addPrice"
					@update-valid="valid = $event"
					:milestone="criterion"
					:isShowing="step === 2"
				></add-exists-special-pricing>
			</v-window-item>
			<v-window-item :value="3" class="pricingsBlock">
				<add-special-pricing
					ref="addSpecialPricing"
					@close="close"
					@add-price="addPrice"
					@update-valid="valid = $event"
					:milestone="criterion"
					:isShowing="step === 3"
				></add-special-pricing>
			</v-window-item>
		</v-window>
		<v-divider></v-divider>
		<v-card-actions>
			<v-tooltip top>
				<template v-slot:activator="{ on }">
					<v-btn
						v-show="step !== 1"
						v-on="on"
						color="primary darken-1"
						class="mr-1"
						fab
						small
						@click="step = 1"
					>
						<v-icon medium dark>keyboard_arrow_right</v-icon>
					</v-btn>
				</template>
				<span>חזור</span>
			</v-tooltip>
			<v-spacer></v-spacer>
			<v-btn
				v-show="step !== 1"
				@click="addCurrentSpecialPricing"
				color="green darken-1"
				text
				:disabled="!valid"
			>
				הוסף
			</v-btn>
			<div v-show="step === 1">
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<v-btn
							v-on="on"
							color="primary darken-1"
							class="mr-1"
							fab
							small
							@click="step = 2"
						>
							<v-icon dark medium>playlist_add</v-icon>
						</v-btn>
					</template>
					<span>בחר תמחור קיים</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<v-btn
							v-on="on"
							color="primary darken-1"
							class="mr-1"
							fab
							small
							@click="step = 3"
						>
							<v-icon medium dark>add</v-icon>
						</v-btn>
					</template>
					<span>הוסף תמחור חדש</span>
				</v-tooltip>
			</div>
		</v-card-actions>
	</v-card>
</template>

<script>
import AddExistsSpecialPricing from '@/components/management/AddExistsSpecialPricing';
import { ManagePricingByMilestone } from '@/queries/PricingQueries';
import SpecialPricingsList from '@/components/management/SpecialPricingsList';
import AddSpecialPricing from '@/components/management/AddSpecialPricing';
export default {
	components: {
		SpecialPricingsList,
		AddSpecialPricing,
		AddExistsSpecialPricing
	},
	apollo: {
		pricingList: {
			query() {
				return ManagePricingByMilestone;
			},
			variables() {
				return {
					milestone_id: this.criterion.id
				};
			},
			skip() {
				return !this.criterion.id;
			},
			fetchPolicy: 'no-cache'
		}
	},
	props: {
		criterion: {}
	},
	data() {
		return {
			pricingList: [],
			step: 1,
			valid: false
		};
	},
	methods: {
		close() {
			this.resetForm();
			this.$emit('close');
		},
		addPrice() {
			this.$apollo.queries.pricingList.refetch();
			this.resetForm();
		},
		refetchPrices() {
			this.$apollo.queries.pricingList.refetch();
		},
		resetForm() {
			if (this.step === 3) {
				this.$refs.addSpecialPricing.resetForm();
			}
			this.step = 1;
		},
		addCurrentSpecialPricing() {
			if (this.step === 2) {
				this.$refs.addExistsSpecialPricing.insertSpecialPricings();
			} else if (this.step === 3) {
				this.$refs.addSpecialPricing.addSpecialPricingToList();
			}
		},
		updatePrices(newPrice) {
			let price = this.pricingList.find(price => price.text.id === newPrice.id);
			price.text.description = newPrice.description;
			price.text.price = newPrice.price;
		}
	}
};
</script>

<style scoped>
#title {
	font-size: 3vh;
}

.pricingsBlock {
	overflow: auto;
	overflow-x: hidden;
	max-height: 25vh;
	min-height: 25vh;
	position: relative;
}

.break {
	word-break: normal;
}
</style>
