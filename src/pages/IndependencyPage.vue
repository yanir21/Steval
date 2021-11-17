<template>
	<div>
		<v-container v-if="testList.length">
			<v-row>
				<test-title
					:calculateFinalGradesBtn="false"
					:exportExcel="false"
					:testList="testList"
					class="pa-3"
					:relevantCourses="relevantCourses"
				></test-title
			></v-row>
			<v-row justify="center">
				<v-col cols="11">
					<new-question
						:independencyMilestone="independencyMilestone"
						:questionSuggest="questions"
					/>
				</v-col>
			</v-row>
			<v-row justify="center">
				<v-col cols="11">
					<questions-list
						ref="questionList"
						:questions="questions"
						:independencyMilestone="independencyMilestone"
					/>
				</v-col>
			</v-row>
		</v-container>
		<v-container v-else class="text-h5 text-center">
			היי, נראה שאין שום מבחן פתוח שבודקים בו עצמאות <br />
			אם בעמוד ניהול המבחן לא פעיל אז יש להפעיל אותו <br />
			אם המבחן כן פעיל אז צריך לדבר עם האחראי על המבחן שיוסיף לו פגישת עצמאות (דרך IGRADE)
		</v-container>
	</div>
</template>

<script>
import TestTitle from '@/components/testInfo/TestTitle.vue';
import NewQuestion from '@/components/independency/NewQuestion.vue';
import QuestionsList from '@/components/independency/QuestionsList.vue';
import { mapState, mapActions } from 'vuex';
import { getTestsByMilestoneName } from '@/queries/TestQueries';
import { getQuestionsByMilestone } from '@/queries/IndependencyQueries';

//קבוע עצמאות עד שיהיה תג
const INDEPENDENCY = 'עצמאות';
export default {
	apollo: {
		//צריך לשלוף לפי תג
		testList: {
			query() {
				return getTestsByMilestoneName;
			},
			variables() {
				return {
					root_id: this.userRootMegama.root,
					milestone_name: INDEPENDENCY
				};
			},
			skip() {
				return !this.userRootMegama.root;
			},
			result() {
				if (!this.test && this.testList.length) {
					this.loadTest(this.testList[0]);
				}
			}
		},
		questions: {
			query() {
				return getQuestionsByMilestone;
			},
			variables() {
				return {
					milestoneId: this.independencyMilestone.id
				};
			},
			skip() {
				return !this.independencyMilestone.id;
			},
			result() {
				this.questions.map(question => {
					question.category = question.independency_category.description;
					question.guide = `${question.author.user.first_name} ${question.author.user.last_name}`;
					question.student = {
						number: question.student.details.student_number,
						name: `${question.student.user.first_name} ${question.student.user.last_name}`,
						id: question.student.id
					};
					let time = new Date(question.created_at);
					time = new Date(
						time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
					).toLocaleTimeString('he-IL');
					question.time = time.substring(0, time.length - 3);
				});
			},
			fetchPolicy: 'no-cache'
		}
	},
	data() {
		return {
			testList: [],
			questions: []
		};
	},
	components: {
		TestTitle,
		NewQuestion,
		QuestionsList
	},
	computed: {
		...mapState(['test', 'coursesList', 'chosenCourse', 'userRootMegama']),
		relevantCourses() {
			return this.coursesList.map(course => course.id);
		},
		// Todo: כשיהיה תג לשלוף לפי תג
		independencyMilestone() {
			if (!this.test) {
				return {};
			}

			let milestone = this.test.children.find(milestone => milestone.name === INDEPENDENCY);
			let test = { ...this.test };
			test.children = [];
			milestone.parent = test;
			return milestone;
		}
	},
	methods: {
		...mapActions(['loadTest'])
	}
};
</script>

<style></style>
