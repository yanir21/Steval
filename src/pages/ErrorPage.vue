<template>
	<v-container>
		<v-row justify="center">
			<v-col class="text-center">
				<span class="text-h1 font-weight-medium grey--text text--lighten-1">אופס!</span>
				<br />
				<span class="text-h5 grey--text text--lighten-1"> {{ errorMessage }}</span>
			</v-col>
		</v-row>
		<v-row justify="center" align="end">
			<v-btn @click="clearStorage" large color="primary">עוד ניסיון</v-btn>
		</v-row>
	</v-container>
</template>

<script>
export default {
	data() {
		return {
			errorMessage: 'הייתה בעיה בהתחברות לשרת...'
		};
	},
	methods: {
		clearStorage() {
			localStorage.removeItem('adal.idtoken');
			localStorage.removeItem('darkMode');
			localStorage.removeItem('currentRoot');
			sessionStorage.clear();
			localStorage.removeItem('wasAuthenticated');
			window.location.href = '/';
		}
	}
};
</script>

<style scoped></style>
