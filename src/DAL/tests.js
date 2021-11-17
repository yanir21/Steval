import { getTestCriterionsAmount, getMilestonesByParent } from '@/queries/TestQueries';

export async function getTestGradesAmount(context, testId) {
	let res = await context.$apollo.query({
		query: getTestCriterionsAmount,
		variables: {
			milestone_id: testId
		},
		fetchPolicy: 'no-cache'
	});

	return res.data.maximumAmountOfCriterions.aggregate.count;
}

export async function milestonesByParent(context, parent_id) {
	const {
		data: { criterions: milestones }
	} = await context.$apollo.query({
		query: getMilestonesByParent,
		variables: {
			meeting_id: parent_id
		}
	});

	return milestones;
}
