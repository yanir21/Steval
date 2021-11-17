import gql from 'graphql-tag';

export const getDescriptionByMeeting = gql`
	query($milestone_id: Int!) {
		MeetingDescriptionsList: fasteval_milestones_descriptions(
			where: { milestone: { parent: { _eq: $milestone_id } } }
			order_by: { milestone_id: asc, stars: asc }
		) {
			description
			id
			point: stars
			milestone_id
		}
	}
`;

export const descriptionsByCriterion = gql`
	query($milestone_id: Int!) {
		descriptions: fasteval_milestones_descriptions(
			where: { milestone_id: { _eq: $milestone_id } }
			order_by: { stars: asc }
		) {
			description
			id
			point: stars
			milestone_id
		}
	}
`;

export const editDescription = gql`
	mutation($description: Int!, $text: String!) {
		description: update_fasteval_milestones_descriptions(
			where: { id: { _eq: $description } }
			_set: { description: $text }
		) {
			returning {
				id
				description
				milestone_id
				point: stars
			}
		}
	}
`;

export const insertDescriptions = gql`
	mutation($descriptions: [fasteval_milestones_descriptions_insert_input!]!) {
		addStars: insert_fasteval_milestones_descriptions(
			objects: $descriptions
			on_conflict: { constraint: milestones_descriptions_pkey, update_columns: [description] }
		) {
			returning {
				description
				id
				point: stars
				milestone_id
			}
		}
	}
`;
