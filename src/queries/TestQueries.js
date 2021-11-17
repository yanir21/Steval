import gql from 'graphql-tag';

export const getTestNames = gql`
	query($root_id: Int!) {
		testList: eval_milestones(
			where: {
				root: { root: { root: { root: { id: { _eq: $root_id } } } } }
				_and: {
					milestones_tags: { tag: { id: { _in: [2, 7] } } }
					_and: { milestones_tags: { tag: { tag: { _eq: "פעיל" } } } }
				}
			}
		) {
			name
			id
			type: milestones_tags(order_by: { tag_id: asc }) {
				tag {
					tag
				}
			}
			order
			parent_milestone {
				id
				name
			}
		}
	}
`;

export const getTestsByMilestoneName = gql`
	query($root_id: Int!, $milestone_name: String!) {
		testList: eval_milestones(
			where: {
				_and: [
					{ root: { root: { root: { root: { id: { _eq: $root_id } } } } } }
					{ milestones_tags: { tag: { id: { _in: [2, 7] } } } }
					{ milestones_tags: { tag: { tag: { _eq: "פעיל" } } } }
					{ children: { name: { _eq: $milestone_name } } }
				]
			}
		) {
			id
			name
			children(where: { name: { _eq: $milestone_name } }) {
				id
				name
			}
			subject: parent_milestone {
				id
				name
			}
			type: milestones_tags(order_by: { tag_id: asc }) {
				tag {
					tag
				}
			}
		}
	}
`;

export const getTest = gql`
	query($testId: Int!) {
		test: eval_milestones(where: { id: { _eq: $testId } }) {
			name
		}
	}
`;

export const getTestCriterionsAmount = gql`
	query($milestone_id: Int!) {
		maximumAmountOfCriterions: eval_milestones_aggregate(
			where: { parent_milestone: { parent: { _eq: $milestone_id } } }
		) {
			aggregate {
				count
			}
		}
	}
`;

export const getTestMeetings = gql`
	query($milestone_id: Int!) {
		meetingsList: eval_milestones(
			where: {
				parent: { _eq: $milestone_id }
				_and: { name: { _nilike: "הערכות חניכים%" }, _and: { children: {} } }
			}
			order_by: { order: asc }
		) {
			name
			id
		}
	}
`;

export const getTestMeetingCriterions = gql`
	query($meeting_id: Int!) {
		meetingCriterionsList: eval_milestones(where: { id: { _eq: $meeting_id } }) {
			name
			tags: milestones_tags {
				currentTag: tag {
					name: tag
				}
			}
			criterions: children(order_by: { order: asc }) {
				name
				id
			}
		}
	}
`;

export const testNamesAndMeetings = gql`
	query($root_id: Int) {
		testList: eval_milestones(
			where: {
				root: { root: { root: { root: { id: { _eq: $root_id } } } } }
				_and: { milestones_tags: { tag: { id: { _in: [2, 7] } } } }
			}
			order_by: { order: asc }
		) {
			id
			name
			milestones_tags {
				tag {
					tag
				}
			}
			children(order_by: { order: asc }) {
				name
				id
				weight
				order
				milestones_tags {
					tag {
						tag
					}
				}
			}
			subject: parent_milestone {
				id
				name
				order
			}
		}
	}
`;

export const getMilestonesByParent = gql`
	query($meeting_id: Int!) {
		criterions: eval_milestones(
			where: { parent: { _eq: $meeting_id } }
			order_by: { order: asc }
		) {
			name
			weight
			id
			order
			milestones_tags {
				tag {
					tag
					id
				}
			}
			parent_milestone {
				milestones_tags {
					tag {
						tag
					}
				}
				id
			}
		}
	}
`;

export const countCriterions = gql`
	query($meeting_id: Int!) {
		criterionsCount: eval_milestones_aggregate(where: { parent: { _eq: $meeting_id } }) {
			aggregate {
				count
			}
		}
	}
`;
