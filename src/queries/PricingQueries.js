import gql from 'graphql-tag';

export const pricingByMilestone = gql`
	query($milestone_id: Int!) {
		pricingList: fasteval_milestones_special_pricings(
			where: {
				_or: [
					{ milestone: { parent: { _eq: $milestone_id } } }
					{ milestone_id: { _eq: $milestone_id } }
				]
			}
		) {
			value: id
			milestone_id
			text: special_pricing {
				description
				price
				id
			}
		}
	}
`;

export const filledPricingsForStudent = gql`
	query($milestone_id: Int!, $student_id: Int!) {
		filledPricing: fasteval_students_pricing(
			where: {
				milestone_special_pricing: {
					milestone: {
						_or: [{ parent: { _eq: $milestone_id } }, { id: { _eq: $milestone_id } }]
					}
				}
				_and: { student_id: { _eq: $student_id } }
			}
		) {
			milestone_pricing_id
			id
			student_id
			milestone_special_pricing {
				milestone_id
				special_pricing {
					id
					price
				}
			}
		}
	}
`;

export const filledPricingsWithoutFinalPricingsForStudent = gql`
	query($milestone_id: Int!, $student_id: Int!) {
		filledPricing: fasteval_students_pricing(
			where: {
				milestone_special_pricing: { milestone: { parent: { _eq: $milestone_id } } }
				_and: { student_id: { _eq: $student_id } }
			}
		) {
			milestone_pricing_id
			id
			student_id
			milestone_special_pricing {
				milestone_id
				special_pricing {
					id
					price
				}
			}
		}
	}
`;

export const getFinalPricingsForStudent = gql`
	query($milestone_id: Int!, $student_id: Int!) {
		finalPricings: fasteval_students_pricing(
			where: {
				milestone_special_pricing: { milestone: { id: { _eq: $milestone_id } } }
				_and: { student_id: { _eq: $student_id } }
			}
		) {
			milestone_pricing_id
			id
			student_id
			milestone_special_pricing {
				milestone_id
				special_pricing {
					id
					price
				}
			}
		}
	}
`;

export const insertStudentPricings = gql`
	mutation($pricings: [fasteval_students_pricing_insert_input!]!) {
		insert_fasteval_students_pricing(
			objects: $pricings
			on_conflict: {
				constraint: students_pricing_milestone_pricing_id_student_id_key
				update_columns: [milestone_pricing_id]
			}
		) {
			affected_rows
		}
	}
`;

export const deleteStudentPricingsArray = gql`
	mutation($milestone_pricing_ids: [Int!]!, $student_ids: [Int!]!) {
		delete_fasteval_students_pricing(
			where: {
				milestone_pricing_id: { _in: $milestone_pricing_ids }
				_and: { student_id: { _in: $student_ids } }
			}
		) {
			affected_rows
		}
	}
`;

export const deleteStudentPricingsByCriterion = gql`
	mutation($criterion_id: Int!, $student_ids: [Int!]!) {
		delete_fasteval_students_pricing(
			where: {
				student_id: { _in: $student_ids }
				_and: { milestone_special_pricing: { milestone_id: { _eq: $criterion_id } } }
			}
		) {
			affected_rows
			returning {
				milestone_pricing_id
				student_id
			}
		}
	}
`;

export const getPricingId = gql`
	query($studentId: Int!, $pricingId: Int!) {
		fasteval_students_pricing(
			where: {
				_and: { milestone_pricing_id: { _eq: $pricingId }, student_id: { _eq: $studentId } }
			}
		) {
			id
			student_id
			milestone_pricing_id
		}
	}
`;

export const insertSpecialPricingsPerMilestone = gql`
	mutation($specialPricings: [fasteval_milestones_special_pricings_insert_input!]!) {
		insert_fasteval_milestones_special_pricings(objects: $specialPricings) {
			returning {
				id
			}
		}
	}
`;

export const pricingsByTest = gql`
	query($parent_milestone_id: Int!, $curr_milestone_id: Int!) {
		pricingList: fasteval_special_pricing(
			where: {
				_and: [
					{
						milestones_special_pricings: {
							milestone: {
								parent_milestone: { parent: { _eq: $parent_milestone_id } }
							}
						}
					}
					{
						_not: {
							milestones_special_pricings: {
								milestone_id: { _eq: $curr_milestone_id }
							}
						}
					}
				]
			}
		) {
			id
			description
		}
	}
`;

export const ManagePricingByMilestone = gql`
	query($milestone_id: Int!) {
		pricingList: fasteval_milestones_special_pricings(
			where: { _or: [{ milestone_id: { _eq: $milestone_id } }] }
		) {
			value: id
			milestone_id
			text: special_pricing {
				description
				price
				id
			}
		}
	}
`;

export const finalPricingsOfSubjectByTest = gql`
	query($parent_milestone_id: Int!, $curr_milestone_id: Int!) {
		pricingList: fasteval_special_pricing(
			where: {
				_and: [
					{
						milestones_special_pricings: {
							milestone: {
								parent_milestone: {
									parent_milestone: {
										children: { id: { _eq: $parent_milestone_id } }
									}
								}
							}
						}
					}
					{
						_not: {
							milestones_special_pricings: {
								milestone_id: { _eq: $curr_milestone_id }
							}
						}
					}
				]
			}
		) {
			id
			description
		}
	}
`;
