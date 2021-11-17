<template>
	<v-card>
		<v-card-title class="headline">
			מחק {{ selectedCriterions.length === 1 ? 'קריטריון' : 'קריטריונים' }}?
		</v-card-title>
		<v-card-text>
			האם אתה בטוח שאתה רוצה למחוק את
			{{ selectedCriterions.length === 1 ? 'הקריטריון הזה' : 'הקריטריונים האלו' }}?
			<span v-for="criterion in selectedCriterions" :key="criterion.id"
				>{{ criterion.name }}, &nbsp;</span
			>
		</v-card-text>
		<v-card-actions>
			<v-spacer></v-spacer>
			<v-btn text @click="$emit('close-dialog')">
				עזוב, לא באלי
			</v-btn>
			<v-btn color="error darken-1" text @click="deleteCriterions">
				מחק
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import { deleteMilestone } from '@/queries/ManageQueries';

export default {
	props: {
		selectedCriterions: {
			type: Array,
			required: true
		}
	},
	computed: {
		selectedIds() {
			return this.selectedCriterions.map(criterion => criterion.id);
		}
	},
	methods: {
		deleteCriterions() {
			this.$emit('close-dialog');
			this.$apollo
				.mutate({
					mutation: deleteMilestone,
					variables: {
						milestonesIds: this.selectedIds
					}
				})
				.then(() => {
					this.$emit('reload-criterion');
				});
		}
	}
};
</script>

<style></style>
