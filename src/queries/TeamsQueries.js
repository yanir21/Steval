import gql from 'graphql-tag';

export const getTestTeams = gql`
	query($milestone_id: Int!) {
		teamsList: fasteval_teams(
			where: { team_members: { milestone_id: { _eq: $milestone_id } } }
		) {
			id
			name
		}
	}
`;

export const getTeamStudents = gql`
	query($milestone_id: Int!, $group_id: [Int!]!) {
		teamStudentsList: fasteval_teams(where: { id: { _in: $group_id } }) {
			id
			name
			team_members(
				where: { users_role: { role: { role: { _eq: "חניך" } } } }
				order_by: { users_role: { user: { first_name: asc } } }
			) {
				users_role {
					id
					user {
						id
						first_name
						last_name
						soldier_id
					}
					details
					grade: inserted_grades_aggregate(
						where: {
							milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
							_and: { user: { role: { role: { _eq: "מדריך" } } } }
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
`;

export const getTeamFilledGrades = gql`
	query($milestone_id: Int!, $team_id: Int!) {
		eval_inserted_grades_aggregate(
			where: {
				milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
				_and: { users_role: { team_members: { team_id: { _eq: $team_id } } } }
			}
		) {
			aggregate {
				count
			}
		}
	}
`;

export const countTeamsStudents = gql`
	query($milestone_id: Int!) {
		teamsCount: fasteval_teams(
			where: { team_members: { milestone_id: { _eq: $milestone_id } } }
		) {
			id
			name
			team_members_aggregate(
				where: { _not: { users_role: { users_roles_termination: {} } } }
			) {
				aggregate {
					count
				}
			}
		}
	}
`;

export const TestTeamsWithStudents = gql`
	query($milestone_id: Int!) {
		testTeams: fasteval_teams(
			where: { team_members: { milestone: { id: { _eq: $milestone_id } } } }
		) {
			id
			name
			team_members(
				where: { users_role: { role: { role: { _eq: "חניך" } } } }
				order_by: { users_role: { user: { first_name: asc } } }
			) {
				users_role {
					id
					user {
						id
						first_name
						last_name
					}
					details
					grade: inserted_grades_aggregate(
						where: {
							milestone: { parent_milestone: { parent: { _eq: $milestone_id } } }
							_and: { user: { role: { role: { _eq: "מדריך" } } } }
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
`;
