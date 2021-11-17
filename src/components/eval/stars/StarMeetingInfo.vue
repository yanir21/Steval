<template>
	<v-container v-if="isMeetingChosen">
		<section id="criterionsBlock">
			<v-list>
				<Criterion
					v-for="(criterion, index) in criterionsList"
					:key="criterion.id"
					:name="criterion.name"
					:ratingList="relaventStars(criterion.id)"
					:criterionId="criterion.id"
					:criterionGrade="sortedStudentGrades[index]"
					:index="index"
					@gradeInserted="refetchGradesAndLoadingIndicator()"
				></Criterion>
			</v-list>
		</section>
		<v-row justify="end">
			<v-col>
				<current-filler :fillerUserRole="lastFillerUserRole"></current-filler>
			</v-col>
			<v-col cols="auto">
				<delete-btn @delete-grades="deleteGrades"></delete-btn>
			</v-col>
		</v-row>

		<v-row>
			<v-snackbar
				v-model="showDeleteSnackbar"
				:color="`success`"
				:right="true"
				:timeout="2000"
				>הציונים נמחקו בהצלחה</v-snackbar
			>
			<v-snackbar v-model="showErrorSnackbar" :color="`error`" :right="true" :timeout="2000"
				>אופס! הייתה שגיאה בשמירת הנתונים...</v-snackbar
			>
		</v-row>
	</v-container>
</template>

<script>
import Criterion from '@/components/eval/stars/StarCriterion.vue';
import DeleteBtn from '@/components/eval/DeleteBtn.vue';
import CurrentFiller from '@/components/testInfo/CurrentFiller.vue';
import { getDescriptionByMeeting } from '@/queries/DescriptionsQueries';
import { getStudentsGradesPerMeeting, deleteGradesArray } from '@/DAL/grades.js';
import { studentsGradesPerMeeting } from '@/queries/GradesQueries';
import { mapGetters, mapState } from 'vuex';
import log from '@/common/tovalogger.js';
import EventBus from '@/plugins/eventbus';

export default {
	apollo: {
		MeetingDescriptionsList: {
			query() {
				return getDescriptionByMeeting;
			},
			variables() {
				return {
					milestone_id: this.currentMeeting
				};
			},
			skip() {
				return !this.currentMeeting;
			}
		},
		studentsGradesPerMeeting: {
			query() {
				return studentsGradesPerMeeting;
			},
			variables() {
				return {
					milestone_id: this.currentMeeting,
					student_id: this.chosenStudent
				};
			},
			result({ data: { studentsGradesPerMeeting } }) {
				this.sortGrades();
			},
			skip() {
				return !this.currentMeeting || !this.chosenStudent;
			},
			fetchPolicy: 'no-cache'
		}
	},
	components: {
		Criterion,
		'delete-btn': DeleteBtn,
		'current-filler': CurrentFiller
	},
	props: {
		criterionsList: {
			default: ''
		}
	},
	data() {
		return {
			studentsGradesPerMeeting: [],
			sortedStudentGrades: [],
			showErrorSnackbar: false,
			showDeleteSnackbar: false,
			updatePromise: null
		};
	},
	computed: {
		...mapGetters(['currentMeeting', 'chosenStudent']),
		...mapState(['lastFillerUserRole']),
		isMeetingChosen() {
			return !(this.$store.state.chosenMeeting == '');
		}
	},
	watch: {
		studentsGradesPerMeeting() {
			this.$emit('meetingChanged', this.studentsGradesPerMeeting);
		}
	},
	methods: {
		async deleteGrades() {
			this.showErrorSnackbar = false;
			this.showDeleteSnackbar = false;
			const milestoneIds = this.criterionsList.map(criterion => criterion.id);
			try {
				const deletePromis = await deleteGradesArray(this, milestoneIds, [
					this.$store.state.chosenStudentID
				]);
				this.studentsGradesPerMeeting = [];
				EventBus.$emit('studentGradeFilled');
				this.showDeleteSnackbar = true;
				this.showLoadingIndicator(deletePromis);
				this.refetchGrades();
			} catch (error) {
				log('error', "Can't delete grades in starmeeting", this, error);
				this.showErrorSnackbar = true;
			}
		},
		sortGrades() {
			this.sortedStudentGrades = [];
			let currGrade;
			this.criterionsList.forEach(criterion => {
				currGrade = this.studentsGradesPerMeeting.find(grade => {
					return grade.milestone_id == criterion.id;
				});
				this.sortedStudentGrades.push(currGrade != undefined ? currGrade.grade : 0);
			});
		},
		relaventStars(criterionId) {
			let relaventStarsArray = [];
			if (this.MeetingDescriptionsList) {
				return this.MeetingDescriptionsList.filter(
					star => star.milestone_id == criterionId
				);
			} else {
				return relaventStarsArray;
			}
		},
		async refetchGrades() {
			this.$apollo.queries.studentsGradesPerMeeting.refetch();
			this.sortGrades();
		},
		refetchGradesAndLoadingIndicator() {
			this.showLoadingIndicator(this.refetchGrades());
		},
		showLoadingIndicator(promise) {
			this.updatePromise = promise;
		}
	}
};
</script>

<style lang="css" scoped>
#criterionsBlock {
	overflow: auto;
	overflow-x: hidden;
	max-height: 50vh;
	min-height: 47vh;
	position: relative;
}
</style>
