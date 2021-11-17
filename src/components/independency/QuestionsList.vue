<template>
	<v-container class="pa-0 ma-0">
		<v-row md="10" justify="space-between" align="center">
			<v-col class="my-0 py-0" cols="5" v-if="showSearch">
				<span class="text-h5">מה שאלו עד עכשיו</span>
			</v-col>
			<v-col class="my-0 py-0" cols="4" v-if="showSearch">
				<v-text-field
					v-model="search"
					prepend-icon="search"
					label="חיפוש לפי שם / קטגוריה / מספר חניך"
					clearable
				></v-text-field>
			</v-col>
		</v-row>
		<v-row justify="center">
			<v-col v-if="!questions.length"
				>היי, נראה שעוד לא שאלו שאלות. אחרי הוספה של שאלות הם יופיעו כאן :)</v-col
			>
			<v-col>
				<v-expansion-panels multiple accordion>
					<question-tile
						v-for="(question, i) in filterQuestions"
						:key="i"
						:question="question"
						:independencyMilestoneId="independencyMilestone.id"
						@refetch-questions="$emit('refetch-questions')"
					></question-tile>
				</v-expansion-panels>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import QuestionTile from '@/components/independency/QuestionTile';

export default {
	components: {
		QuestionTile
	},
	props: {
		showSearch: {
			default: true
		},
		independencyMilestone: {
			type: Object,
			required: true
		},
		questions: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			search: ''
		};
	},
	computed: {
		filterQuestions() {
			if (this.search) {
				return this.questions.filter(question => {
					let fullQuestion =
						question.question +
						' ' +
						question.student.name +
						' ' +
						question.category +
						' ' +
						question.student.number;

					return fullQuestion.toLowerCase().includes(this.search.toLowerCase());
				});
			}

			return this.questions;
		}
	}
};
</script>
