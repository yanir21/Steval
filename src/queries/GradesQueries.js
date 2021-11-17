import gql from 'graphql-tag';

export const insertCriterionGradeForStudent = gql`
	mutation($grade: float8!, $milestone_id: Int!, $student_id: Int!) {
		insert_eval_inserted_grades(
			objects: { grade: $grade, milestone_id: $milestone_id, student_id: $student_id }
		) {
			returning {
				id
				grade
				milestone_id
				student_id
			}
		}
	}
`;

export const insertGradesArray = gql`
	mutation($grades: [eval_inserted_grades_insert_input!]!) {
		insert_eval_inserted_grades(objects: $grades) {
			returning {
				id
				grade
				milestone_id
				student_id
				author_id
			}
		}
	}
`;

export const studentsGradePerCriterion = gql`
	query($milestone_id: Int!, $student_id: Int!) {
		criterionGrade: eval_inserted_grades(
			where: { student_id: { _eq: $student_id }, milestone_id: { _eq: $milestone_id } }
		) {
			grade
		}
	}
`;

export const studentsGradesPerMeeting = gql`
	query($milestone_id: Int!, $student_id: Int!) {
		studentsGradesPerMeeting: eval_inserted_grades(
			where: {
				milestone: { parent: { _eq: $milestone_id } }
				student_id: { _eq: $student_id }
			}
		) {
			student_id
			grade
			milestone_id
			author_id
			milestone {
				weight
			}
		}
	}
`;

export const studentsGradeAmount = gql`
	query($milestone_id: Int!) {
		gradesPerTeam: eval_group_eval_roots(where: { milestone: { id: { _eq: $milestone_id } } }) {
			id
			team: group {
				name
				assigns {
					users_role {
						inserted_grades_aggregate(
							where: {
								milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
							}
						) {
							aggregate {
								count
							}
						}
					}
				}
			}
		}
	}
`;
export const allTestGrades = gql`
	query($milestone_id: Int!, $courses: [Int!]!) {
		allGrades: core_users_roles(
			where: {
				inserted_grades: {
					milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
				}
				_and: { assigns: { group: { edgesByChild: { parent: { _in: $courses } } } } }
				_not: { users_roles_termination: {} }
			}
			order_by: { details: asc }
		) {
			details
			user {
				first_name
				last_name
				id
			}
			assigns(where: { group: { edgesByChild: { parent: { _in: $courses } } } }) {
				group {
					name
					id
					edgesByChild {
						groupByParent {
							name
							id
						}
					}
				}
			}
			inserted_grades(
				where: { milestone: { parent_milestone: { parent: { _eq: $milestone_id } } } }
				order_by: { milestone_id: asc }
			) {
				grade
				milestone_id
			}
			students_pricings {
				data: milestone_special_pricing {
					milestone_id
					special_pricing {
						price
						description
					}
				}
			}
		}
	}
`;

export const getAllMeetings = gql`
	query($milestone_id: Int!) {
		allMeetings: eval_milestones(
			where: { parent: { _eq: $milestone_id } }
			order_by: { order: asc }
		) {
			name
			id
			weight
			children(order_by: { order: asc }) {
				name
				weight
				id
			}
		}
	}
`;

export const totalFilledGrades = gql`
	query($milestone_id: Int, $courses: [Int!]) {
		totalFilledGrades: eval_inserted_grades_aggregate(
			where: {
				milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
				_and: {
					users_role: {
						assigns: { group: { edgesByChild: { parent: { _in: $courses } } } }
					}
					_and: { user: { role: { role: { _eq: "מדריך" } } } }
				}
				_not: { users_role: { users_roles_termination: {} } }
			}
		) {
			aggregate {
				count
			}
		}
	}
`;

export const studentsFilledGardesPerTestCount = gql`
	query($milestone_id: Int, $student_ids: [Int!]) {
		filledGrades: eval_inserted_grades_aggregate(
			where: {
				_and: {
					student_id: { _in: $student_ids }
					milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
				}
			}
		) {
			nodes {
				student_id
			}
		}
	}
`;

export const deleteStudentGrades = gql`
	mutation($milestone_ids: [Int!]!, $student_id: Int!) {
		delete_eval_inserted_grades(
			where: { milestone_id: { _in: $milestone_ids }, student_id: { _eq: $student_id } }
		) {
			affected_rows
		}
	}
`;

export const getStudentMeetingGrades = gql`
	query($milestone_id: Int!, $user_role: Int!) {
		eval_inserted_grades(
			where: {
				milestone: { parent: { _eq: $milestone_id } }
				_and: { users_role: { user: { id: { _eq: $user_role } } } }
			}
		) {
			grade
			milestone {
				weight
			}
		}
	}
`;

export const insertAndUpdeteGradesArray = (update_columns = '') => gql`
	mutation($grades: [eval_inserted_grades_insert_input!]!) {
		insert_eval_inserted_grades(
			objects: $grades
			on_conflict: {
				constraint: inserted_grades_student_id_milestone_id_author_id_key
				update_columns: [${update_columns}]
			}
		) {
			returning {
				id
				grade
				milestone_id
				student_id
				author_id
			}
		}
	}
`;
