import {
	questionsByStudentAndMilestone,
	specialQuestionPricingByStudentAndMilestone
} from '@/DAL/independency';
import { insertGradeByMilestoneAndStudent, insertUpdeteGradesArray } from '@/DAL/grades';
import { studentListByRoot } from '@/DAL/students';

export async function pricingByStudentAndMilestone(context, studentId, milestoneId) {
	let questions = await questionsByStudentAndMilestone(context, studentId, milestoneId);
	let specialQuestions = await specialQuestionPricingByStudentAndMilestone(
		context,
		studentId,
		milestoneId
	);

	questions = questions.map(question => question.independency_category.price);
	specialQuestions = specialQuestions.map(question => question.price);

	return [...questions, ...specialQuestions];
}

export async function calculateIndependencyGrade(context, studentId, milestoneId) {
	const pricing = await pricingByStudentAndMilestone(context, studentId, milestoneId);
	let grade = pricing.reduce((sum, price) => (sum -= price), 100);

	return grade < 0 ? 0 : grade;
}

export async function calculateAndInsertIndependencyGrade(context, studentId, milestoneId) {
	const grade = await calculateIndependencyGrade(context, studentId, milestoneId);
	insertGradeByMilestoneAndStudent(context, grade, milestoneId, studentId);
}

export async function insertGradeToStudentsList(context, grade, milestoneId, students) {
	let grades = students.map(studentId => ({
		student_id: studentId.student_id,
		milestone_id: milestoneId,
		grade
	}));
	insertUpdeteGradesArray(context, grades);
}

export async function insertGradeToStudentByRoot(context, grade, milestoneId, rootId) {
	const students = await studentListByRoot(context, rootId);
	await insertGradeToStudentsList(context, grade, milestoneId, students);
}
