import gql from 'graphql-tag';

export const getRootByMegama = gql`
	query($megama_id: Int!) {
		api_all_tree_roots(
			where: {
				group: {
					parent_id: { _eq: $megama_id }
					_and: { children: { end_date: { _gt: "now()" } } }
				}
			}
		) {
			id
			name
		}
	}
`;
