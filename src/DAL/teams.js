import { TestTeamsWithStudents } from '@/queries/TeamsQueries';

export async function getTestTeamsWithStudents(context, testId) {
	let res = await context.$apollo.query({
		query: TestTeamsWithStudents,
		variables: {
			milestone_id: testId
		},
		fetchPolicy: 'no-cache'
	});
	return res.data.testTeams;
}
