import {
	studentsFilledGardesPerTestCount,
	totalFilledGrades,
	studentsGradesPerMeeting,
	deleteStudentGrades,
	insertGradesArray,
	studentsGradeAmount,
	insertCriterionGradeForStudent,
	insertAndUpdeteGradesArray
} from '@/queries/GradesQueries';

import { getTeamStudents } from '@/queries/TeamsQueries.js';

export async function loadTotalFilledGrades(context, testId, courses) {
	return (
		await context.$apollo.query({
			query: totalFilledGrades,
			variables: {
				milestone_id: testId,
				courses: courses
			},
			fetchPolicy: 'no-cache'
		})
	).data.totalFilledGrades;
}

export async function getStudentsGradesPerMeeting(context, currentMeeting, chosenStudent) {
	return (
		await context.$apollo.query({
			query: studentsGradesPerMeeting,
			variables: {
				milestone_id: currentMeeting,
				student_id: chosenStudent
			},
			fetchPolicy: 'no-cache'
		})
	).data.studentsGradesPerMeeting;
}

export async function deleteStudentGradesByCriterions(context, criterion_ids, student_id) {
	await context.$apollo.mutate({
		refetchQueries: [
			context.$store.state.teamTest
				? {
						query: getTeamStudents,
						variables: {
							milestone_id: context.$store.state.test.id,
							group_id: context.$store.state.chosenTeam
						}
				  }
				: ''
		],
		mutation: deleteStudentGrades,
		variables: {
			milestone_ids: criterion_ids,
			student_id: student_id
		}
	});
}

export async function deleteOldAuthorGrades(context, grades) {
	// get the distinct student ids
	const studentIds = grades
		.map(grade => grade.student_id)
		.filter((value, index, self) => self.indexOf(value) === index);

	// get the distinct criterion ids
	const criterions = grades
		.map(grade => grade.milestone_id)
		.filter((value, index, self) => self.indexOf(value) === index);

	await deleteGradesArray(context, criterions, studentIds);
}

export async function insertGradesList(context, grades) {
	await deleteOldAuthorGrades(context, grades);

	let res = await context.$apollo.mutate({
		refetchQueries: [
			{
				query: studentsGradesPerMeeting,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.getters.chosenStudent
				}
			},
			context.$store.state.teamTest
				? {
						query: getTeamStudents,
						variables: {
							milestone_id: context.$store.state.test.id,
							group_id: context.$store.state.chosenTeam
						}
				  }
				: ''
		],
		mutation: insertGradesArray,
		variables: {
			grades: grades
		}
	});

	return res.data.insert_eval_inserted_grades.returning;
}

export async function deleteGradesArray(context, criterions, studentList) {
	for (const student of studentList) {
		await deleteStudentGradesByCriterions(
			context,
			criterions,
			student.id ? student.id : student
		);
	}
}

export async function insertCriterionGrade(context, grade, criterionId, currentStudentId) {
	await deleteOldAuthorGrades(context, [
		{ student_id: currentStudentId, milestone_id: criterionId, grade: grade }
	]);
	await context.$apollo.mutate({
		refetchQueries: [
			{
				query: studentsGradesPerMeeting,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.getters.chosenStudent
				}
			},
			{
				query: studentsGradeAmount,
				variables: { milestone_id: context.$store.state.test.id }
			},
			{
				query: totalFilledGrades,
				variables: { milestone_id: context.$store.state.test.id }
			}
		],
		mutation: insertCriterionGradeForStudent,
		variables: {
			grade: grade,
			milestone_id: criterionId,
			student_id: currentStudentId
		}
	});
}

export async function insertGradeByMilestoneAndStudent(
	context,
	grade,
	milestoneId,
	currentStudentId
) {
	await deleteOldAuthorGrades(context, [
		{ student_id: currentStudentId, milestone_id: milestoneId, grade: grade }
	]);
	await context.$apollo.mutate({
		mutation: insertCriterionGradeForStudent,
		variables: {
			grade: grade,
			milestone_id: milestoneId,
			student_id: currentStudentId
		}
	});
}

export async function insertUpdeteGradesArray(context, grades, update_columns = '') {
	await context.$apollo.mutate({
		mutation: insertAndUpdeteGradesArray(update_columns),
		variables: { grades }
	});
}
