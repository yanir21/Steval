<template>
    <v-card-text id="formBlock">
        <v-form v-model="valid" ref="form">
            <v-row>
                <v-col cols="10">
                    <v-text-field
                        :rules="descriptionRules"
                        label="תיאור"
                        v-model="description"
                        required
                    ></v-text-field>
                    <v-text-field
                        label="משקל"
                        type="number"
                        v-model="price"
                        :rules="priceRules"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-form>
    </v-card-text>
</template>

<script>
import { addSpecialPricing } from '@/queries/ManageQueries';
export default {
	props: {
		milestone: {
			type: Object
		},
		isShowing: {
			type: Boolean
		}
	},
	data() {
		return {
			valid: true,
			price: 0,
			priceRules: [value => (value > 0 && value <= 100) || 'לא משקל תקין'],
			description: '',
			descriptionRules: [value => value !== '' || 'עליך להוסיף תיאור']
		};
	},
	watch: {
		isShowing() {
			this.description = '';
			this.price = 0;
		},
		valid() {
			this.$emit('update-valid', this.valid);
		}
	},
	methods: {
		async addSpecialPricingToList() {
			try {
				await this.$apollo.query({
					query: addSpecialPricing,
					variables: {
						price: this.price,
						description: this.description,
						milestone_id: this.milestone.id
					},
					fetchPolicy: 'no-cache'
				});

				this.addPriceEvent();
			} catch (error) {
				log('error', "Can't add pricing", this, error);
			}
		},
		resetForm() {
			this.$refs.form.reset();
		},
		fetchExistsPricings() {
			this.$refs.addExistsSpecialPricing.fetchList();
		},
		addPriceEvent() {
			this.$emit('add-price');
		}
	}
};
</script>

<style scoped>
#formBlock {
    overflow: auto;
    overflow-x: hidden;
    max-height: 25vh;
    min-height: 25vh;
    position: relative;
}
</style>
