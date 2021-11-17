<template>
	<div v-if="isStudentChosen" class="overflow-y-auto">
		<v-container id="runMeeting">
			<v-row class="ma-1" justify="space-between">
				<v-col cols="auto">
					<v-row>
						<v-col class="py-0" cols="auto">
							<v-text-field
								v-model="searchValue"
								label="חפש מקרה ספציפי..."
								@input="sortGrades"
							></v-text-field>
						</v-col>
						<v-col class="py-0" cols="auto">
							<run-meeting-actions
								id="meetingActions"
								:filledPricing="filledPricing"
								:isRunMeeting="true"
								@pricingFilled="addPricing($event, true)"
								:networkUpdates="updatePromise"
								@pricingRemoved="deletePricing($event, true)"
								@updateAllGrades="updateAllGrades"
								@deleteGrades="deleteGrades"
							></run-meeting-actions>
						</v-col>
					</v-row>
				</v-col>
				<v-col cols="auto" class="py-0 ml-2">
					<current-student-grade
						:student_id="teamTest ? chosenStudentList[0] : chosenStudentID"
						:meeting_id="currentMeeting"
						:networkUpdates="updatePromise"
					/>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12" class="pa-0">
					<section id="criterionsBlock" class="overflow-y-auto">
						<v-list>
							<run-criterion
								v-for="(criterion, index) in filteredCriterionList"
								:key="criterion.id"
								:criterionIndex="index"
								:name="criterion.name"
								:criterionId="criterion.id"
								:specialPricings="pricings(criterion.id)"
								:filledPricings="filledPricings(criterion.id)"
								:criterionGrade="sortedStudentGrades[index]"
								@gradeInserted="handleGradeChange"
								@pricingFilled="addPricing"
								@pricingRemoved="deletePricing"
								@pricingOfCriterionRemoved="deleteAllPricingsInCriterion"
								@input="pricingClicked()"
							></run-criterion>
						</v-list>
					</section>
				</v-col>
			</v-row>
			<v-row>
				<v-snackbar
					v-model="showSaveSnackbar"
					:color="`success`"
					:right="true"
					:timeout="2000"
					>השינויים נשמרו בהצלחה</v-snackbar
				>
				<v-snackbar
					v-model="showDeleteSnackbar"
					:color="`success`"
					:right="true"
					:timeout="2000"
					>הציונים נמחקו בהצלחה</v-snackbar
				>
				<v-snackbar
					v-model="showErrorSnackbar"
					:color="`error`"
					:right="true"
					:timeout="2000"
					>אופס! הייתה שגיאה בשמירת הנתונים...</v-snackbar
				>
			</v-row>
			<v-row justify="end">
				<v-col class="pb-0">
					<current-filler :fillerUserRole="lastFillerUserRole"></current-filler>
				</v-col>
				<v-col cols="auto">
					<delete-btn @delete-grades="deleteGrades"></delete-btn>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>

<script>
import CurrentFiller from '@/components/testInfo/CurrentFiller.vue';
import CurrentStudentGrade from '@/components/eval/CurrentStudentGrade.vue';
import RunCriterion from '@/components/eval/run/RunCriterion.vue';
import DeleteBtn from '@/components/eval/DeleteBtn.vue';
import FinalPricingModal from '@/components/eval/run/FinalPricingModal.vue';
import RunMeetingActions from '@/components/eval/run/RunMeetingActions.vue';
import { studentsGradesPerMeeting } from '@/queries/GradesQueries';
import { mapState, mapGetters } from 'vuex';
import Swal from 'sweetalert2';
import EventBus from '@/plugins/eventbus';
import log from '@/common/tovalogger.js';

import {
	pricingByMilestone,
	filledPricingsForStudent,
	insertStudentPricings
} from '@/queries/PricingQueries.js';
import { insertGradesList, deleteGradesArray, getStudentsGradesPerMeeting } from '@/DAL/grades';
import {
	insertPricingArray,
	deletePricingArray,
	deletePricingForStudents,
	deletePricingForStudentsByCriterion
} from '@/DAL/pricings';
import DeleteBtnVue from '@/components/eval/DeleteBtn.vue';
import { calculateGradeWithPricings } from '@/BL/grades';
export default {
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
		},
		filledPricing: {
			query() {
				return filledPricingsForStudent;
			},
			variables() {
				return {
					milestone_id: this.$store.getters.currentMeeting,
					student_id: this.$store.getters.chosenStudent
				};
			},
			skip() {
				return !this.$store.getters.chosenStudent || !this.$store.getters.currentMeeting;
			}
		},
		studentsGradesPerMeeting: {
			query() {
				return studentsGradesPerMeeting;
			},
			variables() {
				return {
					milestone_id: this.currentMeeting,
					student_id: this.teamTest ? this.chosenStudentList[0] : this.chosenStudentID
				};
			},
			result({ data: { studentsGradesPerMeeting } }) {
				this.sortGrades();
			},
			skip() {
				return (
					!this.currentMeeting ||
					(this.teamTest ? !this.chosenStudentList[0] : !this.chosenStudentID)
				);
			},
			fetchPolicy: 'no-cache'
		}
	},
	components: {
		DeleteBtn,
		RunCriterion,
		RunMeetingActions,
		CurrentFiller,
		CurrentStudentGrade
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
			pricingList: [],
			searchValue: '',
			filledPricing: [],
			unsavedFilledPricing: [],
			showSaveSnackbar: false,
			showErrorSnackbar: false,
			showDeleteSnackbar: false,
			selectAllPressed: false,
			updatePromise: null
		};
	},
	computed: {
		...mapGetters(['currentMeeting', 'chosenTeam']),
		isStudentChosen() {
			return !(this.chosenStudentID == '');
		},
		filteredCriterionList: {
			get() {
				return this.criterionsList.filter(criterion =>
					criterion.name.includes(this.searchValue)
				);
			}
		},
		...mapState(['chosenStudentID', 'chosenStudentList', 'teamTest', 'lastFillerUserRole'])
	},
	watch: {
		studentsGradesPerMeeting() {
			this.$emit('meetingChanged', this.studentsGradesPerMeeting);
			this.sortGrades();
		}
	},
	methods: {
		sortGrades() {
			this.sortedStudentGrades = [];
			let currGrade;
			this.filteredCriterionList.forEach(criterion => {
				currGrade = this.studentsGradesPerMeeting.find(grade => {
					return grade.milestone_id === criterion.id;
				});

				this.sortedStudentGrades.push(
					!!currGrade && currGrade.grade !== 'NO_VALUE' ? currGrade.grade : false
				);
			});
		},
		async handleGradeChange(grade, criterionId) {
			if (grade === 'NO_VALUE') {
				const deletePromise = deleteGradesArray(
					this,
					[criterionId],
					this.studentsToFillOn()
				);
				this.showLoadingIndicator(deletePromise);
				await deletePromise;
				this.studentsGradesPerMeeting = this.studentsGradesPerMeeting.filter(
					gradeDetails => gradeDetails.milestone_id !== criterionId
				);
			} else {
				await this.updateGrade(grade, criterionId);
			}
			this.sortGrades();
			EventBus.$emit('studentGradeFilled');
		},

		async updateGrade(grade, criterionId) {
			try {
				let gradesToInsert = [];
				this.studentsToFillOn().forEach(student =>
					gradesToInsert.push({
						student_id: student,
						milestone_id: criterionId,
						grade: grade
					})
				);

				const insertionPromise = await insertGradesList(this, gradesToInsert);
				this.showLoadingIndicator(insertionPromise);
				const newGrade = (await insertionPromise)[0];

				const oldGradeIndex = this.studentsGradesPerMeeting.findIndex(
					grade => newGrade.milestone_id === grade.milestone_id
				);

				if (oldGradeIndex === -1) {
					this.studentsGradesPerMeeting.push(newGrade);
				} else {
					this.studentsGradesPerMeeting[oldGradeIndex].grade = newGrade.grade;
				}
			} catch (error) {
				log('error', "Can't update single grade in MeetingInfo", this, error);
				this.callErrorSnackbar();
			}
		},

		async updateAllGrades(newGrade) {
			try {
				const studentsList = this.studentsToFillOn();
				const gradesToInsert = [];
				studentsList.forEach(student =>
					this.filteredCriterionList.forEach(criterion => {
						gradesToInsert.push({
							student_id: student,
							milestone_id: criterion.id,
							grade: newGrade
						});
					})
				);
				const insertionPromise = await insertGradesList(this, gradesToInsert);
				this.showLoadingIndicator(insertionPromise);
				await insertionPromise;
				this.$apollo.queries.studentsGradesPerMeeting.refetch();
				EventBus.$emit('studentGradeFilled');
			} catch (error) {
				log('error', "Can't update all grades in RunMeetingInfo", this, error);
				this.callErrorSnackbar();
			}
		},
		getCriterionIndex(criterionId) {
			return this.studentsGradesPerMeeting.findIndex(e => e.milestone_id === criterionId);
		},
		addNewGrade(grade, criterionId, studentId) {
			this.studentsGradesPerMeeting.push({
				grade: grade,
				milestone_id: criterionId,
				student_id: studentId
			});
		},
		async deleteGrades() {
			this.showErrorSnackbar = false;
			this.showDeleteSnackbar = false;
			const milestoneIds = this.filteredCriterionList.map(criterion => {
				return criterion.id;
			});
			const studentsList = this.studentsToFillOn();

			try {
				for (const id of milestoneIds) {
					await this.deleteAllPricingsInCriterion(id);
				}
				const deletePromise = deleteGradesArray(this, milestoneIds, studentsList);
				this.showLoadingIndicator(deletePromise);
				await deletePromise;
				this.$apollo.queries.studentsGradesPerMeeting.refetch();
				EventBus.$emit('studentGradeFilled');
				this.showDeleteSnackbar = true;
			} catch (error) {
				log('error', "Can't delete all grades in RunMeetingInfo", this, error);
				this.showErrorSnackbar = true;
			}
		},
		pricings(criterionId) {
			return this.pricingList.filter(pricing => pricing.milestone_id == criterionId);
		},
		filledPricings(criterionId) {
			return this.filledPricing.filter(
				pricing => pricing.milestone_special_pricing.milestone_id == criterionId
			);
		},
		insertGradesAfterAllPricingCalculation(pricing) {
			const currCriterionId = pricing.milestone_special_pricing.milestone_id;
			const pricingsOfCriterion = this.filledPricings(currCriterionId);

			const gradeToInsert = calculateGradeWithPricings(pricing, pricingsOfCriterion);
			this.handleGradeChange(gradeToInsert, pricing.milestone_special_pricing.milestone_id);
		},
		async addPricing(pricing, isFinalPricing = false) {
			try {
				const pricingsToInsert = [];
				this.studentsToFillOn().forEach(student =>
					pricingsToInsert.push({
						student_id: student,
						milestone_pricing_id: pricing.milestone_pricing_id
					})
				);
				const insertionPromise = insertPricingArray(this, pricingsToInsert);
				this.showLoadingIndicator(insertionPromise);
				await insertionPromise;

				if (!isFinalPricing) {
					this.insertGradesAfterAllPricingCalculation(pricing);
				}
			} catch (error) {
				log('error', "Can't add pricing in RunMeetingInfo", this, error);
				this.callErrorSnackbar();
			}
		},
		deletePricing(pricing, isFinalPricing = false) {
			try {
				const deletePromise = deletePricingForStudents(
					this,
					pricing,
					this.studentsToFillOn()
				);
				this.showLoadingIndicator(deletePromise);

				if (!isFinalPricing) {
					this.insertGradesAfterAllPricingCalculation(pricing);
				}
			} catch (error) {
				log('error', "Can't delete pricing in RunMeetingInfo", this, error);
				this.callErrorSnackbar();
			}
		},
		async deleteAllPricingsInCriterion(criterionId) {
			try {
				await deletePricingForStudentsByCriterion(
					this,
					criterionId,
					this.studentsToFillOn()
				);
			} catch (error) {
				log('error', "Can't delete pricing in RunMeetingInfo", this, error);
				this.callErrorSnackbar();
			}
		},
		studentsToFillOn() {
			return this.$store.state.teamTest
				? this.$store.state.chosenStudentList
				: [this.$store.state.chosenStudentID];
		},
		refetchGrades() {
			this.$apollo.queries.studentsGradesPerMeeting.refetch();
		},
		callErrorSnackbar() {
			this.showErrorSnackbar = false;
			this.showErrorSnackbar = true;
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
	max-height: 45vh;
	min-height: 40vh;
	position: relative;
}
</style>
