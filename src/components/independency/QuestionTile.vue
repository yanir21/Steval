<template>
	<v-expansion-panel>
		<v-btn icon color="red" class="float-left" @click="deleteQuestion">
			<v-icon>delete</v-icon>
		</v-btn>
		<v-expansion-panel-header class="pt-1">
			<template v-slot:default="{ open }">
				<article class="pa-0 ma-0" on="open">
					<p v-if="open" class="mb-1">
						{{ question.student.number }} - {{ question.student.name }}:
					</p>
					<p class="text-h6 mb-1">"{{ question.question }}"</p>
				</article>
			</template>
		</v-expansion-panel-header>
		<v-expansion-panel-content>
			<p class="text-subtitle-1 ma-0">
				התשובה של
				<b>{{ question.guide }}</b
				>:
				{{ question.answer }}
			</p>
			<v-card-actions class="grey--text">
				<v-spacer></v-spacer>
				{{ category }}
				<v-divider vertical class="mx-4"></v-divider>
				{{ question.time }}
			</v-card-actions>
		</v-expansion-panel-content>
	</v-expansion-panel>
</template>

<script>
import { getSpacialQuestionPrice } from '@/queries/IndependencyQueries';
import { deleteIndependencyQuestion } from '@/DAL/independency';
import { calculateAndInsertIndependencyGrade } from '@/BL/independencyGrades';
import { CUSTOM_INDEPENDENCY_CATEGORIES } from '@/common/constants';

export default {
	apollo: {
		price: {
			query() {
				return getSpacialQuestionPrice;
			},
			variables() {
				return {
					questionId: this.question.id
				};
			},
			skip() {
				return (
					!this.question.id ||
					!CUSTOM_INDEPENDENCY_CATEGORIES.includes(this.question.category)
				);
			},
			result() {
				this.price = this.price[0].price;
			},
			fetchPolicy: 'no-cache'
		}
	},
	props: {
		question: {
			required: true,
			type: Object
		},
		independencyMilestoneId: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			price: 0
		};
	},
	computed: {
		category() {
			return this.question.category + (this.price ? `, תמחור: ${this.price}` : '');
		}
	},
	methods: {
		async deleteQuestion() {
			await deleteIndependencyQuestion(this, this.question.id);
			calculateAndInsertIndependencyGrade(
				this,
				this.question.student.id,
				this.independencyMilestoneId
			);
		}
	}
};
</script>
