<template>
	<div>
		<v-menu offset-x nudge-right="10">
			<template v-slot:activator="{ on }">
				<v-btn icon text color="error" v-on="on">
					<v-icon>more_vert</v-icon>
				</v-btn>
			</template>

			<v-list hoverable dense>
				<v-list-item @click="isEditing = true" width="unset" class="primary--text">
					<v-list-item-title>ערוך</v-list-item-title>
				</v-list-item>
				<v-list-item @click="deletePriceFromCriterion" class="error--text">
					<v-list-item-title>מחק עבור מקרה זה</v-list-item-title>
				</v-list-item>
				<v-list-item
					v-if="chosenManageRunMeetingId != milestone_id"
					@click="deletePriceFromTest"
					class="error--text"
				>
					<v-list-item-title>מחק עבור כל התרץ</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
		<v-dialog v-model="isEditing" max-width="450" @blur="resetDialog">
			<v-card>
				<v-card-title>
					עריכת תמחור מיוחד
				</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<v-form v-model="valid" ref="form">
						<v-layout align-center justify-space-between row fill-height id="preceder">
							<v-spacer></v-spacer>
							<v-flex xs2 grow align-self-center id="grid">
								<v-text-field
									:rules="priceRules"
									label="משקל"
									type="number"
									prefix="%"
									v-model="priceWeight"
									required
								></v-text-field>
							</v-flex>
							<v-spacer></v-spacer>
							<v-flex>
								<v-text-field
									label="תיאור"
									v-model="priceDescription"
									required
									:rules="descriptionRules"
								></v-text-field>
							</v-flex>
							<v-spacer></v-spacer>
						</v-layout>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>

					<v-btn text color="red" @click="resetDialog">
						בעצם לא
					</v-btn>

					<v-btn text color="green" @click="updatePricing" :disabled="isUpdated">
						עדכן
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { deleteSpecialPricing } from '@/queries/ManageQueries';
import { deleteSpecialPricingFromTest } from '@/queries/ManageQueries';
import { updateSpacielPricing } from '@/queries/ManageQueries';
import { mapGetters, createLogger } from 'vuex';
export default {
	props: {
		specialPricing_id: {
			type: Number,
			required: true
		},
		milestone_id: {
			type: Number,
			required: true
		},
		price: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			isEditing: false,
			valid: false,
			descriptionToInsert: '',
			weightToInsert: 0,
			priceRules: [value => (value > 0 && value <= 100) || 'לא משקל תקין'],
			descriptionRules: [value => value !== '' || 'עליך להוסיף תיאור']
		};
	},
	computed: {
		...mapGetters(['chosenManageTestId', 'chosenManageRunMeetingId']),
		priceDescription: {
			set(description) {
				this.descriptionToInsert = description;
			},
			get() {
				return this.price.description;
			}
		},
		priceWeight: {
			set(weight) {
				this.weightToInsert = weight;
			},
			get() {
				return this.price.price;
			}
		},
		isUpdated() {
			return (this.descriptionToInsert !== '' || this.weightToInsert !== 0) && !this.valid;
		}
	},
	methods: {
		async deletePriceFromCriterion() {
			this.$apollo
				.mutate({
					mutation: deleteSpecialPricing,
					variables: {
						specialPricing_id: this.specialPricing_id,
						milestone_id: this.milestone_id
					}
				})
				.then(date => {
					this.$emit('refetch-price');
				});
		},
		async deletePriceFromTest() {
			this.$apollo
				.mutate({
					mutation: deleteSpecialPricingFromTest,
					variables: {
						specialPricing_id: this.specialPricing_id,
						milestone_id: this.chosenManageTestId
					}
				})
				.then(() => {
					this.$emit('refetch-price');
				});
		},
		resetDialog() {
			this.isEditing = false;
			this.weightToInsert = this.weight;
			this.descriptionToInsert = this.name;
		},
		async updatePricing() {
			this.isEditing = false;
			await this.$apollo
				.mutate({
					mutation: updateSpacielPricing,
					variables: {
						id: this.price.id,
						description:
							this.descriptionToInsert === ''
								? this.price.description
								: this.descriptionToInsert,
						price: this.weightToInsert === 0 ? this.price.price : this.weightToInsert
					},
					optimisticResponse: {
						__typename: 'Mutation',
						specialPricing: {
							returning: [
								{
									__typename: 'fasteval_special_pricing',
									id: this.price.id,
									description:
										this.descriptionToInsert === ''
											? this.price.description
											: this.descriptionToInsert,
									price:
										this.weightToInsert === 0
											? this.price.price
											: this.weightToInsert
								}
							],
							__typename: 'fasteval_special_pricing_mutation_response'
						}
					}
				})
				.then(data => {
					this.$emit('update-price', data.data.specialPricing.returning[0]);
				});
		}
	}
};
</script>

<style scoped></style>
