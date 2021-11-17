import {
	insertNewQuestion,
	insertSpacialQuestion,
	getQuestionsByStudentAndMilestone,
	getSpecialQuestionPricingByStudentAndMilestone,
	deleteQuestion
} from '@/queries/IndependencyQueries';

export async function insertQuestion(
	context,
	studentId,
	question,
	answer,
	categoryId,
	milestoneId
) {
	const data = await context.$apollo.mutate({
		mutation: insertNewQuestion,
		variables: {
			studentId,
			question,
			answer,
			categoryId,
			milestoneId
		},
		fetchPolicy: 'no-cache'
	});

	return data.data.insertedQuestion;
}

export function insertSpacialPricedQuestion(context, price, questionId) {
	context.$apollo.mutate({
		mutation: insertSpacialQuestion,
		variables: {
			price,
			questionId
		},
		fetchPolicy: 'no-cache'
	});
}

export async function questionsByStudentAndMilestone(context, studentId, milestoneId) {
	const {
		data: { questions }
	} = await context.$apollo.query({
		query: getQuestionsByStudentAndMilestone,
		variables: {
			studentId,
			milestoneId
		},
		fetchPolicy: 'no-cache'
	});

	return questions;
}

export async function specialQuestionPricingByStudentAndMilestone(context, studentId, milestoneId) {
	const {
		data: { questions }
	} = await context.$apollo.query({
		query: getSpecialQuestionPricingByStudentAndMilestone,
		variables: {
			studentId,
			milestoneId
		},
		fetchPolicy: 'no-cache'
	});

	return questions;
}

export async function deleteIndependencyQuestion(context, question_id) {
	await context.$apollo.mutate({
		mutation: deleteQuestion,
		variables: {
			question_id
		}
	});
}
