<template>
	<div>
		<v-expand-transition>
			<div v-show="fillerUserRole" height="25" min-width="100" max-width="250" class="mr-1">
				<p class="caption font-weight-bold mb-0">ממלא אחרון</p>
				{{ lastFiller }}
			</div>
		</v-expand-transition>
	</div>
</template>

<script>
import { getNameByUserRole } from '@/queries/UsersQueries';

export default {
	apollo: {
		lastFiller: {
			query() {
				return getNameByUserRole;
			},
			variables() {
				return { user_role_id: this.fillerUserRole };
			},
			skip() {
				return !this.fillerUserRole;
			},
			result({ data: { lastFiller } }) {
				this.lastFiller = lastFiller[0].first_name + ' ' + lastFiller[0].last_name;
			},
			fetchPolicy: 'no-cache'
		}
	},
	data() {
		return {
			lastFiller: ''
		};
	},
	props: {
		fillerUserRole: {
			default: ''
		}
	}
};
</script>
