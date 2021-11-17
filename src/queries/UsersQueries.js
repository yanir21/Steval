import gql from 'graphql-tag';

export const getNameByUserRole = gql`
	query($user_role_id: Int!) {
		lastFiller: core_users(where: { users_roles: { id: { _eq: $user_role_id } } }) {
			first_name
			last_name
		}
	}
`;

export const userDetailsBySoldierId = gql`
	query($soldier_id: Int!) {
		userDetailsBySoldierId: api_all_users(where: { soldier_id: { _eq: $soldier_id } }) {
			user_id
			assignments(where: { course: { end_date: { _gte: "now()" } } }) {
				user_role_id
				role_name
				role_id
				course {
					name
					id
				}
				department_or_team_id
				group_name
				cycle_id
				megama_id
			}
		}
	}
`;
