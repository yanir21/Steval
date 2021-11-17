import gql from 'graphql-tag';

export const editCriterionWeight = gql`
	mutation($criterion: Int, $weight: Float) {
		criterion: update_eval_milestones(
			where: { id: { _eq: $criterion } }
			_set: { weight: $weight }
		) {
			returning {
				id
				name
				weight
				milestones_tags {
					tag {
						tag
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
	}
`;

export const deActivate = gql`
mutation($milestone_id: Int!, $tag_id: Int!) {
				test: delete_eval_milestones_tags(
					where: {
						milestone_id: { _eq: $milestone_id }
						_and: { tag_id: { _eq: $tag_id } }
					}
				) {
					returning {
						milestone {
							id
							name
							milestones_tags {
								tag {
									tag
								}
							}
							children(order_by: { order: asc }) {
								id
								name
								weight
								milestones_tags {
									tag {
										tag
										id
									}
								}
							}
							subject: parent_milestone {
								id
								name
							}
						}
					}
				}
			}
		`;

export const activate = gql`
mutation($milestone_id: Int!, $tag_id: Int!) {
				test: insert_eval_milestones_tags(
					objects: { milestone_id: $milestone_id, tag_id: $tag_id }
				) {
					returning {
						milestone {
							id
							name
							milestones_tags {
								tag {
									tag
								}
							}
							children(order_by: { order: asc }) {
								id
								name
								milestones_tags {
									tag {
										tag
										id
									}
								}
							}
							subject: parent_milestone {
								id
								name
							}
						}
					}
				}
			}
		`;

export const insertMilestone = gql`
	mutation($name: String, $order: Int, $weight: Float, $parent_id: Int) {
		insert_eval_milestones(
			objects: [
				{
					name: $name
					order: $order
					weight: $weight
					parent: $parent_id
					milestones_tags: { data: { tag_id: 4 } }
				}
			]
		) {
			insertedCriterion: returning {
				id
			}
		}
	}
`;

export const insertTag = gql`
	mutation($milestone_id: Int, $tag_id: Int) {
		insert_eval_milestones_tags(objects: [{ milestone_id: $milestone_id, tag_id: $tag_id }]) {
			affected_rows
		}
	}
`;

export const getTags = gql`
	{
		tags: eval_tags(
			where: {
				_or: [
					{ tag: { _eq: "פגישה" } }
					{ tag: { _eq: "קריטריון" } }
					{ tag: { _eq: "ריצה" } }
				]
			}
		) {
			tag
			id
		}
	}
`;

export const getActiveTag = gql`
	{
		activeTag: eval_tags(where: { tag: { _eq: "פעיל" } }) {
			id
		}
	}
`;

export const addSpecialPricing = gql`
	mutation($price: Int!, $description: String!, $milestone_id: Int!) {
		insert_fasteval_special_pricing(
			objects: {
				description: $description
				price: $price
				milestones_special_pricings: { data: { milestone_id: $milestone_id } }
			}
		) {
			affected_rows
		}
	}
`;

export const deleteSpecialPricing = gql`
	mutation($specialPricing_id: Int!, $milestone_id: Int!) {
		delete_fasteval_milestones_special_pricings(
			where: {
				price_id: { _eq: $specialPricing_id }
				_and: { milestone_id: { _eq: $milestone_id } }
			}
		) {
			affected_rows
		}
	}
`;

export const deleteSpecialPricingFromTest = gql`
	mutation($specialPricing_id: Int!, $milestone_id: Int!) {
		delete_fasteval_milestones_special_pricings(
			where: {
				price_id: { _eq: $specialPricing_id }
				_and: {
					milestone: {
						_or: [
							{ parent: { _eq: $milestone_id } }
							{ parent_milestone: { parent: { _eq: $milestone_id } } }
						]
					}
				}
			}
		) {
			affected_rows
		}
	}
`;

export const deleteMilestone = gql`
	mutation($milestonesIds: [Int!]!) {
		delete_eval_milestones(
			where: {
				_or: [
					{ id: { _in: $milestonesIds } }
					{ parent_milestone: { id: { _in: $milestonesIds } } }
				]
			}
		) {
			affected_rows
		}
	}
`;

export const getSubject = gql`
	query($milestoneId: Int!) {
		eval_milestones(
			where: {
				_and: [
					{ id: { _eq: $milestoneId } }
					{ parent_milestone: { milestones_tags: { tag: { tag: { _eq: "מקצוע" } } } } }
				]
			}
			limit: 1
		) {
			parent_milestone {
				name
			}
		}
	}
`;

export const changeOrder = gql`
	mutation($criterionId: Int, $order: Int) {
		update_eval_milestones(_set: { order: $order }, where: { id: { _eq: $criterionId } }) {
			affected_rows
		}
	}
`;

export const updateMilestoneListOrder = gql`
	mutation($milestones: [eval_milestones_insert_input!]!) {
		criterions: insert_eval_milestones(
			objects: $milestones
			on_conflict: { constraint: milestones_pkey, update_columns: [order] }
		) {
			returning {
				name
				weight
				id
				order
				milestones_tags {
					tag {
						tag
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
	}
`;

export const updateMilestone = gql`
	mutation($milestoneId: Int, $weight: Float, $name: String) {
		update_eval_milestones(
			_set: { weight: $weight, name: $name }
			where: { id: { _eq: $milestoneId } }
		) {
			affected_rows
		}
	}
`;

export const updateSpacielPricing = gql`
	mutation($id: Int!, $description: String!, $price: Int!) {
		specialPricing: update_fasteval_special_pricing(
			where: { id: { _eq: $id } }
			_set: { description: $description, price: $price }
		) {
			returning {
				id
				description
				price
			}
		}
	}
`;
