<template>
	<div>
		<v-list-item>
			<v-list-item-avatar>
				<v-badge left bordered class="mt-3">
					<template v-slot:badge>{{ index + 1 }}</template>
				</v-badge>
			</v-list-item-avatar>
			<v-list-item-content>
				{{ name }}
			</v-list-item-content>
			<v-list-item-action>
				<StarRating
					:ratingInfo="ratingList"
					:criterionGrade="criterionGrade"
					@insertGrade="insertGrade"
				></StarRating>
			</v-list-item-action>
		</v-list-item>
		<v-divider />
	</div>
</template>

<script>
import StarRating from '@/components/eval/stars/StarRating.vue';
import { insertCriterionGradeForStudent } from '@/queries/GradesQueries';
import { deleteStudentGradesByCriterions, insertCriterionGrade } from '@/DAL/grades.js';
import { studentsGradeAmount, totalFilledGrades } from '@/queries/GradesQueries';
import EventBus from '@/plugins/eventbus';

export default {
	components: {
		StarRating
	},
	props: {
		name: {
			required: true
		},
		ratingList: {
			required: true
		},
		criterionId: {
			required: true
		},
		criterionGrade: {
			required: true
		},
		index: {
			required: true
		}
	},

	methods: {
		async insertGrade(grade) {
			let currentStudentId = this.$store.state.chosenStudentID;
			await deleteStudentGradesByCriterions(this, [this.criterionId], currentStudentId);

			await insertCriterionGrade(this, grade, this.criterionId, currentStudentId);

			this.$emit('gradeInserted');
			EventBus.$emit('studentGradeFilled');
		}
	}
};
</script>

<style lang="css" scoped>
.v-card {
	max-width: 95%;
	width: 95%;
}
</style>
