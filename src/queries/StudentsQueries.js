import gql from 'graphql-tag';

export const getAllCourses = gql`
	query($coursesRoot: Int!) {
		coursesList: api_now_courses(where: { megama_id: { _eq: $coursesRoot } }) {
			id
			name
		}
	}
`;

export const getAllStudents = gql`
	query($courses: [Int!]!) {
		studentsList: core_users_roles_groups(
			where: {
				user_role: {
					role: { role: { _eq: "חניך" } }
					groups: {
						user_role: {
							assigns: { group: { edgesByChild: { parent: { _in: $courses } } } }
						}
					}
				}
				_not: { user_role: { users_roles_termination: {} } }
			}
		) {
			user_role {
				id
				user {
					first_name
					last_name
					id
					soldier_id
				}
				details
			}
		}
	}
`;

export const getStudentById = gql`
	query($stud_id: Int!) {
		currentStudent: core_users_roles_groups(
			where: { user_role: { id: { _eq: $stud_id } } }
			distinct_on: user_role_id
		) {
			user_role {
				user {
					first_name
					last_name
					id
				}
				details
			}
		}
	}
`;

export const GetCourseId = gql`
	query($soldier_id: Int!) {
		courseId: api_all_users(where: { soldier_id: { _eq: $soldier_id } }) {
			assignments(where: { course: { end_date: { _gte: "now()" } } }) {
				course_id
			}
		}
	}
`;

export const getCourseByRoot = gql`
	query($rootId: Int!) {
		cycles: eval_group_eval_roots(where: { root_id: { _eq: $rootId } }) {
			group {
				id
				name
				courses: edgesByParent {
					group {
						id
						name
					}
				}
			}
		}
	}
`;

export const getStudentListByRoot = gql`
	query($rootId: Int!) {
		roots: eval_group_eval_roots(where: { root_id: { _eq: $rootId } }) {
			group {
				id
				students {
					student_id
				}
			}
		}
	}
`;

export const getLinkedRootsAndGroupsBySoldierId = gql`
	query($soldierId: Int!) {
		roots: eval_group_eval_roots(
			where: {
				group: { users: { user: { soldier_id: { _eq: $soldierId } } } }
				_and: { group: { groups_period: { end_date: { _gt: "now()" } } } }
			}
			order_by: { group: { groups_period: { start_date: desc } } }
		) {
			root_id
			group {
				id
				name
			}
		}
	}
`;
