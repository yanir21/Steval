<template>
	<v-card>
		<v-card-title class="primary pa-2 text-subtitle-1">רוצה להוסיף שאלה?</v-card-title>
		<v-card-text>
			<v-container class="pa-0">
				<v-form v-model="valid" ref="form">
					<v-row justify="center">
						<v-col cols="3">
							<drop-down-selector
								ref="studentSelect"
								:height="30"
								placeholder="מי?"
								:list="studentsList"
								no-data-text="אוי לא, אין פה חניכים"
								@selected="student = $event"
							/>
						</v-col>
						<v-col cols="6">
							<v-row>
								<autosuggest
									label="מה?"
									:rules="[rules.name]"
									v-model="question"
									:suggestList="questionSuggest"
									itemText="question"
									@selectedObject="answer = $event.answer"
								>
								</autosuggest>
							</v-row>
							<v-row>
								<v-scroll-y-transition>
									<v-text-field
										:rules="[rules.name]"
										height="30"
										v-if="question"
										v-model="answer"
										clearable
										required
										label="מה ענית?"
									></v-text-field>
								</v-scroll-y-transition>
							</v-row>
						</v-col>
						<v-col cols="2" class="mr-3">
							<v-row>
								<drop-down-selector
									:height="30"
									placeholder="קטגוריה"
									itemText="description"
									:hint="selectedCategoryPrice"
									:list="categories"
									@selected="category = $event"
								/>
							</v-row>
							<v-row v-if="isCustomCategory">
								<v-scroll-y-transition>
									<v-text-field
										ref="typeSelect"
										:rules="[rules.precentage]"
										height="30"
										v-model="price"
										required
										label="תמחור"
										type="number"
									></v-text-field>
								</v-scroll-y-transition>
							</v-row>
							<v-row>
								<v-btn
									class="mt-2"
									@click="save"
									:disabled="canCommit"
									width="100%"
									color="success"
									>הוספת שאלה</v-btn
								>
							</v-row>
						</v-col>
					</v-row>
				</v-form>
			</v-container>
		</v-card-text>
	</v-card>
</template>

<script>
import DropDownSelector from '@/components/testInfo/DropDownSelector.vue';
import { getAllStudents } from '@/queries/StudentsQueries';
import { getIndependencyCategories } from '@/queries/IndependencyQueries';
import { insertQuestion, insertSpacialPricedQuestion } from '@/DAL/independency';
import { mapState } from 'vuex';
import { calculateAndInsertIndependencyGrade } from '@/BL/independencyGrades';
import Autosuggest from '@/components/general/Autosuggest';
import { CUSTOM_INDEPENDENCY_CATEGORIES } from '@/common/constants';

export default {
	apollo: {
		studentsList: {
			query() {
				return getAllStudents;
			},
			variables() {
				return {
					courses: this.chosenCourse
				};
			},
			skip() {
				return !this.chosenCourse;
			},
			result() {
				this.studentsList = this.studentsList.map(student => {
					student.name = `${student.user_role.details.student_number} - ${student.user_role.user.first_name} ${student.user_role.user.last_name}`;
					return student;
				});

				this.studentsList.sort(
					(
						{
							user_role: {
								details: { student_number: a }
							}
						},
						{
							user_role: {
								details: { student_number: b }
							}
						}
					) => a - b
				);
			},
			fetchPolicy: 'no-cache'
		},
		categories: {
			query() {
				return getIndependencyCategories;
			},
			variables() {
				return {
					linkedMilestone: this.releventMilestonsIds
				};
			},
			skip() {
				return !this.releventMilestonsIds.length;
			},
			fetchPolicy: 'no-cache'
		}
	},
	props: {
		independencyMilestone: {
			type: Object,
			required: true
		},
		questionSuggest: {
			type: Array,
			default: () => []
		}
	},
	components: {
		DropDownSelector,
		Autosuggest
	},
	data() {
		return {
			rules: {
				precentage: value => (value > 0 && value <= 100) || 'משקל לא תקין',
				name: value => value !== '' || 'עליך להוסיף תיאור'
			},
			valid: false,
			studentsList: [],
			student: {},
			question: '',
			answer: '',
			category: '',
			price: '',
			categories: []
		};
	},
	computed: {
		...mapState(['chosenCourse', 'userRootMegama']),
		isCustomCategory() {
			return (
				this.category && CUSTOM_INDEPENDENCY_CATEGORIES.includes(this.category.description)
			);
		},
		canCommit() {
			return !this.valid || !this.student || !this.category || !this.answer || !this.question;
		},
		releventMilestonsIds() {
			return [
				this.independencyMilestone.id,
				this.independencyMilestone.parent.id,
				this.independencyMilestone.parent.subject.id,
				this.userRootMegama.root
			];
		},
		selectedCategoryPrice() {
			return this.category && !this.isCustomCategory
				? `תמחור: ${this.category.price.toString()}`
				: '';
		}
	},
	methods: {
		async save() {
			const insertedQuestion = await insertQuestion(
				this,
				this.student.user_role.id,
				this.question,
				this.answer,
				this.category.id,
				this.independencyMilestone.id
			);
			if (this.isCustomCategory) {
				await insertSpacialPricedQuestion(this, this.price, insertedQuestion.id);
			}
			calculateAndInsertIndependencyGrade(
				this,
				this.student.user_role.id,
				this.independencyMilestone.id
			);
			this.clearForm();
		},
		clearForm() {
			this.question = undefined;
			this.answer = undefined;
			this.student = undefined;
			this.category = undefined;
			this.$refs.form.reset();
		}
	},
	watch: {
		category() {
			if (!this.isCustomCategory) {
				this.price = undefined;
			}
		},
		question(val) {
			if (!val) {
				this.answer = undefined;
			}
		}
	}
};
</script>
