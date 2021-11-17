import { getStudentListByRoot, getAllStudents } from '@/queries/StudentsQueries';

export const studentListByRoot = async (context, rootId) => {
	const {
		data: { roots }
	} = await context.$apollo.query({
		query: getStudentListByRoot,
		variables: { rootId }
	});

	return roots[0].group.students;
};

export const studentsByCourses = async (context, courses) => {
	const {
		data: { studentsList }
	} = await context.$apollo.query({
		query: getAllStudents,
		variables: {
			courses
		}
	});

	return studentsList;
};
