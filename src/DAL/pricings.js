import {
	insertStudentPricings,
	filledPricingsForStudent,
	deleteStudentPricingsByCriterion,
	deleteStudentPricingsArray,
	getFinalPricingsForStudent,
	filledPricingsWithoutFinalPricingsForStudent
} from '@/queries/PricingQueries';

export async function insertPricingArray(context, pricings) {
	context.$apollo.mutate({
		refetchQueries: [
			{
				query: filledPricingsForStudent,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.getters.chosenStudent
				}
			}
		],
		mutation: insertStudentPricings,
		variables: {
			pricings: pricings
		}
	});
}

export async function deletePricingArray(context, pricings, studList) {
	context.$apollo.mutate({
		refetchQueries: [
			{
				query: filledPricingsForStudent,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.state.chosenStudentID
				}
			}
		],
		mutation: deleteStudentPricingsArray,
		variables: {
			milestone_pricing_ids: pricings,
			student_ids: studList
		}
	});
}

export async function deletePricingForStudents(context, pricing, studList) {
	context.$apollo.mutate({
		refetchQueries: [
			{
				query: filledPricingsForStudent,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.state.chosenStudentID
				}
			}
		],
		mutation: deleteStudentPricingsArray,
		variables: {
			milestone_pricing_ids: [pricing.milestone_pricing_id],
			student_ids: studList
		}
	});
}

export async function deletePricingForStudentsByCriterion(context, criterion_id, studList) {
	context.$apollo.mutate({
		refetchQueries: [
			{
				query: filledPricingsForStudent,
				variables: {
					milestone_id: context.$store.getters.currentMeeting,
					student_id: context.$store.state.chosenStudentID
				}
			}
		],
		mutation: deleteStudentPricingsByCriterion,
		variables: {
			criterion_id: criterion_id,
			student_ids: studList
		}
	});
}

export async function getFilledPricingsForStudent(context, currentMeeting, chosenStudent) {
	return (
		await context.$apollo.query({
			query: filledPricingsForStudent,
			variables: {
				milestone_id: currentMeeting,
				student_id: chosenStudent
			},
			fetchPolicy: 'no-cache'
		})
	).data.filledPricing;
}

export async function getfilledPricingsWithoutFinalPricingsForStudent(
	context,
	currentMeeting,
	chosenStudent
) {
	return (
		await context.$apollo.query({
			query: filledPricingsWithoutFinalPricingsForStudent,
			variables: {
				milestone_id: currentMeeting,
				student_id: chosenStudent
			},
			fetchPolicy: 'no-cache'
		})
	).data.filledPricing;
}

export async function finalPricingsForStudent(context, currentMeeting, chosenStudent) {
	return (
		await context.$apollo.query({
			query: getFinalPricingsForStudent,
			variables: {
				milestone_id: currentMeeting,
				student_id: chosenStudent
			},
			fetchPolicy: 'no-cache'
		})
	).data.finalPricings.map(
		({
			milestone_special_pricing: {
				special_pricing: { price }
			}
		}) => price
	);
}
