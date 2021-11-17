import { activate, deActivate } from '@/queries/ManageQueries.js';

export async function insertMilestoneTag(context, milestone, tag) {
	const test = await context.$apollo.query({
		query: activate,
		variables: {
			milestone_id: milestone,
			tag_id: tag
		},
		skip: !milestone || !tag,
		fetchPolicy: 'no-cache'
	});

	return test.data.test.returning[0].milestone;
}

export async function deleteMilestoneTag(context, milestone, tag) {
	const test = await context.$apollo.query({
		query: deActivate,
		variables: {
			milestone_id: milestone,
			tag_id: tag
		},
		skip: !milestone || !tag,
		fetchPolicy: 'no-cache'
	});

	return test.data.test.returning[0].milestone;
}
