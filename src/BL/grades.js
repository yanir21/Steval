import {
	getStudentsGradesPerMeeting,
	insertUpdeteGradesArray,
	deleteOldAuthorGrades
} from '@/DAL/grades.js';
import {
	finalPricingsForStudent,
	getfilledPricingsWithoutFinalPricingsForStudent
} from '@/DAL/pricings';
import { studentsByCourses } from '@/DAL/students';
import { milestonesByParent } from '@/DAL/tests';

export async function getMeetingFinalGrade(context, studentId, meetingId) {
	const grades = await calculateCiretrionsGrades(context, meetingId, studentId);
	const gradesPricings = await finalPricingsForStudent(context, meetingId, studentId);

	let totalGrade = gradeWithoutFinalPricing(grades) - calculateFinalPricing(gradesPricings);

	return totalGrade < 0 ? 0 : totalGrade;
}

const gradeWithoutFinalPricing = grades =>
	grades.reduce(
		(sum, gradeDetails) => (sum += (gradeDetails.grade * gradeDetails.milestone.weight) / 100),
		0
	);

const calculateFinalPricing = gradesPricings => {
	return gradesPricings.reduce((sum, price) => (sum += price), 0);
};

export const calculateGradeWithPricings = (pricing, pricingsOfCriterion) => {
	const exisitngPriceIndex = pricingsOfCriterion.findIndex(
		({
			milestone_special_pricing: {
				special_pricing: { id }
			}
		}) => id === pricing.milestone_special_pricing.special_pricing.id
	);

	if (exisitngPriceIndex !== -1) {
		pricingsOfCriterion.splice(exisitngPriceIndex, 1);
	} else {
		pricingsOfCriterion.push(pricing);
	}

	const pricesValues = pricingsOfCriterion.map(
		({
			milestone_special_pricing: {
				special_pricing: { price }
			}
		}) => price
	);

	const criterionGrade = pricesValues.reduce((sum, price) => sum - price, 100);

	return criterionGrade > 0 ? criterionGrade : 0;
};

// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
// ---------------------- Final Pricings Calculations To IGrade ----------------------
// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------
const calculateFinalGradesForStudentsList = async (context, studentsIds, milestone_id) => {
	for (const studentId of studentsIds) {
		let gradesPricings = await finalPricingsForStudent(context, milestone_id, studentId);
		const finalPricing = gradesPricings.reduce((acc, sum) => (sum += acc), 0);

		const ciretrionsGrades = await calculateCiretrionsGrades(context, milestone_id, studentId);
		ciretrionsGrades.sort(
			({ milestone: { weight: a } }, { milestone: { weight: b } }) => b - a
		);

		const studentFinalGrades = calculateFinalGrade(ciretrionsGrades, finalPricing);

		const formattedFinalGrades = studentFinalGrades.map(
			({ grade, student_id, milestone_id }) => ({
				grade,
				student_id,
				milestone_id
			})
		);

		await deleteOldAuthorGrades(context, formattedFinalGrades);
		await insertUpdeteGradesArray(context, formattedFinalGrades, 'grade');
	}
};

const calculateCiretrionsGrades = async (context, meeting_id, studentId) => {
	const ciretrionsGrades = await getStudentsGradesPerMeeting(context, meeting_id, studentId);
	let checkedCriterions = ciretrionsGrades.filter(({ grade }) => grade > 0);
	const pricings = await getfilledPricingsWithoutFinalPricingsForStudent(
		context,
		meeting_id,
		studentId
	);

	checkedCriterions = checkedCriterions.map(({ grade, ...rest }) => ({ ...rest, grade: 100 }));

	pricings.forEach(
		({
			milestone_special_pricing: {
				milestone_id,
				special_pricing: { price }
			}
		}) => {
			const currGrade = checkedCriterions.find(grade => grade.milestone_id === milestone_id);

			if (currGrade) {
				currGrade.grade -= price;

				if (currGrade.grade < 0) {
					currGrade.grade = 0;
				}
			}
		}
	);

	return checkedCriterions;
};

// This function is the main algorithm of calculating the criterions grades
// including the final pricings. It iterate each criterion and try to subtract
// the final pricing point (after weight calculation) from it. if it has rest
// it means we have more points to subtract, therefore we move to the next criterion.
// In the end we return the criterions grades array
const calculateFinalGrade = (criterionsGrades, finalPricing) => {
	for (let index = 0; index < criterionsGrades.length && finalPricing > 0; index++) {
		const weightPercentage = criterionsGrades[index].milestone.weight / 100;
		const priceToRemove = finalPricing / weightPercentage;

		const rest = criterionsGrades[index].grade - priceToRemove;

		criterionsGrades[index].grade = rest > 0 ? rest : 0.1;

		finalPricing = rest > 0 ? 0 : (Math.abs(rest) + 0.1) * weightPercentage;
	}

	return criterionsGrades;
};

export const insertCalculatedFinalGrades = async (context, course_id, test_id) => {
	const studentsList = await studentsByCourses(context, [course_id]);
	const studentsIdsList = studentsList.map(({ user_role: { id } }) => id);

	const meetings = await milestonesByParent(context, test_id);

	const runMeetingsIds = meetings
		.filter(({ milestones_tags: tags }) => tags.find(({ tag: { id } }) => id === 35))
		.map(({ id }) => id);

		let promises = [];

	runMeetingsIds.forEach(meeting_id => {
		promises.push(calculateFinalGradesForStudentsList(context, studentsIdsList, meeting_id));
	});

	await Promise.all(promises);
};
