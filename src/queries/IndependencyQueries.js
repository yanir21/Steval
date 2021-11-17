import gql from 'graphql-tag';

export const getIndependencyCategories = gql`
	query($linkedMilestone: [Int!]!) {
		categories: fasteval_independency_categories(
			where: {
				_or: [
					{ linked_milestone: { _is_null: true } }
					{ linked_milestone: { _in: $linkedMilestone } }
				]
			}
			order_by: { price: asc }
		) {
			id
			description
			price
		}
	}
`;

export const insertNewQuestion = gql`
	mutation(
		$studentId: Int!
		$question: String!
		$answer: String!
		$categoryId: Int
		$milestoneId: Int!
	) {
		insertedQuestion: insert_fasteval_independency_questions_one(
			object: {
				student_id: $studentId
				question: $question
				answer: $answer
				category_id: $categoryId
				milestone_id: $milestoneId
			}
		) {
			id
		}
	}
`;

export const getQuestionsByMilestone = gql`
	subscription($milestoneId: Int!) {
		questions: fasteval_independency_questions(
			where: { milestone_id: { _eq: $milestoneId } }
			order_by: { id: desc }
		) {
			id
			question
			answer
			created_at
			independency_category {
				description
			}
			author {
				user {
					first_name
					last_name
				}
			}
			student: users_role {
				details
				id
				user {
					first_name
					last_name
				}
			}
		}
	}
`;

export const insertSpacialQuestion = gql`
	mutation($price: Int!, $questionId: Int!) {
		insert_fasteval_independency_special_questions_one(
			object: { price: $price, question_id: $questionId }
		) {
			price
			question_id
		}
	}
`;

export const getSpacialQuestionPrice = gql`
	query($questionId: Int!) {
		price: fasteval_independency_special_questions(
			where: { question_id: { _eq: $questionId } }
		) {
			price
		}
	}
`;

export const getQuestionsByStudentAndMilestone = gql`
	query($studentId: Int!, $milestoneId: Int!) {
		questions: fasteval_independency_questions(
			where: {
				_and: [{ student_id: { _eq: $studentId } }, { milestone_id: { _eq: $milestoneId } }]
			}
		) {
			id
			independency_category {
				id
				price
			}
		}
	}
`;

export const getSpecialQuestionPricingByStudentAndMilestone = gql`
	query($studentId: Int!, $milestoneId: Int!) {
		questions: fasteval_independency_special_questions(
			where: {
				_and: [
					{ independency_question: { milestone_id: { _eq: $milestoneId } } }
					{ independency_question: { student_id: { _eq: $studentId } } }
				]
			}
		) {
			id
			price
		}
	}
`;

export const deleteQuestion = gql`
	mutation($question_id: Int!) {
		delete_fasteval_independency_questions(where: { id: { _eq: $question_id } }) {
			affected_rows
		}
	}
`;
