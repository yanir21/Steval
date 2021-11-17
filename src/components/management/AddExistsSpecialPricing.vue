<template>
	<v-container>
		<v-row>
			<v-col>
				<v-text-field
					clearable
					label="סינון"
					prepend-icon="search"
					v-model="searchInput"
				></v-text-field>
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<v-chip
					v-for="(price, index) in filterdPricingList"
					class="mx-1"
					:key="index"
					@click="selectSpecialPricingToAdd(price)"
					:class="{
						success: pricesToAdd.find(priceToAdd => priceToAdd.price_id === price.id)
					}"
					>{{ price.description }}</v-chip
				>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import {
	insertSpecialPricingsPerMilestone,
	pricingsByTest,
	finalPricingsOfSubjectByTest
} from '@/queries/PricingQueries';
import { mapGetters } from 'vuex';
export default {
	apollo: {
		pricingList: {
			query() {
				if (this.milestone.milestones_tags) {
					if (this.milestone.milestones_tags.find(tag => tag.tag.tag === 'ריצה'))
						return finalPricingsOfSubjectByTest;
				}

				return pricingsByTest;
			},
			variables() {
				return {
					parent_milestone_id: this.chosenManageTestId,
					curr_milestone_id: this.milestone.id
				};
			},
			fetchPolicy: 'network-only'
		}
	},
	data() {
		return {
			pricingList: [],
			pricesToAdd: [],
			searchInput: ''
		};
	},
	props: {
		milestone: {
			type: Object
		},
		isShowing: {
			type: Boolean
		}
	},
	computed: {
		...mapGetters(['chosenManageTestId']),
		filterdPricingList() {
			return this.pricingList.filter(price => price.description.includes(this.searchInput));
		}
	},
	watch: {
		isShowing() {
			this.fetchList();
			this.pricesToAdd = [];
		},
		pricesToAdd() {
			this.$emit('update-valid', this.pricesToAdd.length > 0);
		}
	},
	methods: {
		fetchList() {
			this.$apollo.queries.pricingList.refetch();
		},
		selectSpecialPricingToAdd(priceToAdd) {
			const priceIndex = this.pricesToAdd.findIndex(
				price => price.price_id === priceToAdd.id
			);

			if (priceIndex !== -1) {
				this.pricesToAdd.splice(priceIndex, 1);
			} else {
				this.pricesToAdd.push({
					price_id: priceToAdd.id,
					milestone_id: this.milestone.id
				});
			}
		},
		insertSpecialPricings() {
			this.$apollo
				.mutate({
					mutation: insertSpecialPricingsPerMilestone,
					variables: {
						specialPricings: this.pricesToAdd
					}
				})
				.then(data => {
					this.pricesToAdd = [];
					this.$emit('add-price');
					this.fetchList();
				});
		}
	}
};
</script>

<style scoped></style>
