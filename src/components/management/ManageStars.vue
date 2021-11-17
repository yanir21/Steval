<template>
	<v-card min-width="60vw">
		<v-card-title class="pa-0 ma-0">
			<v-row align="center" justify="space-between" class="pa-0 ma-0">
				<v-col cols="8" class="pb-0 mb-0">
					<p class="text-h6 font-weight-regular ma-0">
						תיאור המקרה:
					</p>
					<v-text-field class="text-h4 ma-0 pa-0" v-model="displayName"></v-text-field>
				</v-col>
				<v-col cols="auto" class="pb-0 mb-0">
					<v-text-field
						prefix="%"
						outlined
						:rules="[rules.precentage]"
						height="70"
						max-width="500"
						class="text-h6 text-center rounded-circle circle-percent circle"
						v-model="displayWeight"
					></v-text-field>
				</v-col>
			</v-row>
		</v-card-title>
		<v-divider></v-divider>
		<v-card-text>
			<v-row>
				<v-col>
					<span>לא טוב</span>
				</v-col>
			</v-row>
			<v-row v-for="(description, index) in dispalyDescription" :key="index" align="center">
				<v-col>
					<v-textarea
						label="תיאור הכוכב"
						hide-details
						placeholder="כדי שהכוכב יהיה פעיל הוא חייב תיאור"
						no-resize
						outlined
						rows="1"
						clearable
						v-model="description.description"
					>
						<template v-slot:prepend>
							<v-icon large :color="isDisabled(description) ? 'grey' : 'amber'"
								>star</v-icon
							>
						</template>
					</v-textarea>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<span>מצויין</span>
				</v-col>
			</v-row>
		</v-card-text>
		<v-divider></v-divider>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn text color="green darken-1" x-large @click="save">נראה טוב</v-btn>
		</v-card-actions>
	</v-card>
</template>
<script>
import { updateMilestone } from '@/queries/ManageQueries';
import { insertDescriptions } from '@/queries/DescriptionsQueries';

export default {
	props: {
		criterion: {
			type: Object,
			required: true
		},
		descriptions: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			displayName: '',
			displayWeight: 0,
			dispalyDescription: [],
			rules: {
				precentage: value => (value >= 0 && value <= 100) || ''
			}
		};
	},
	mounted() {
		this.updateDisplayDescriptions();
	},
	methods: {
		isDisabled(description) {
			return description && (description.description === '' || !description.description);
		},
		descriptionToInsert(text) {
			return !text ? 'x' : text === '' ? 'x' : text;
		},
		async save() {
			await this.updateCriterion();
			await this.insertStars();

			this.$emit('close');
		},
		async insertStars() {
			let insertedDescriptions = [...this.dispalyDescription].map(item => {
				let newItem = { ...item };
				newItem.description = this.descriptionToInsert(item.description);
				return newItem;
			});
			await this.$apollo.mutate({
				mutation: insertDescriptions,
				variables: {
					descriptions: insertedDescriptions
				}
			});
		},
		async updateCriterion() {
			await this.$apollo.mutate({
				mutation: updateMilestone,
				variables: {
					milestoneId: this.criterion.id,
					weight: this.displayWeight,
					name: this.displayName
				}
			});
		},
		updateDisplayDescriptions() {
			this.displayName = this.criterion.name;
			this.displayWeight = this.criterion.weight;
			this.dispalyDescription = [...this.descriptions].map(item => {
				let newItem = {};
				newItem.description = item.description === 'x' ? '' : item.description;
				newItem.stars = item.point;
				newItem.id = item.id;
				newItem.milestone_id = item.milestone_id;
				return newItem;
			});
		}
	}
};
</script>
<style scoped>
.hidden {
	color: #ffffff;
}

.circle {
	width: 70px !important;
}
</style>
