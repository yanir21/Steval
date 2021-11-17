<template>
	<v-container>
		<div name="row" align="center">
			<span v-for="(m, index) in members" id="members" :key="index" name="row">
				<div class="ma-0" name="col" :key="index">
					<b v-if="heads.includes(m)" @click="changeName(m)"> {{ m }} </b>
					<span v-else> {{ m }} </span>
				</div>
			</span>
			<span>
				<br />
				<h1>מערכת Steval התחילה בהאקתון ב17/3/2019</h1>
			</span>
		</div>
	</v-container>
</template>
<script>
export default {
	data() {
		return {
			members: [
				'יניר טמיר',
				'עידן ארד',
				'אוהד שן',
				'שחר ענתי',
				'הילי רפפורט',
				'אלמוג שדאור',
				'עמית סופר',
				'תום בן ארויה',
				'יעל כהן',
				'ניצן יאיר חמצני'
			],
			heads: ['יניר טמיר', 'תום בן ארויה']
		};
	},
	methods: {
		changeName(name) {
			if (name.includes('יניר')) {
				this.members.splice(0, 1);
				this.members.unshift('נדב טמיר');
				this.heads.push('נדב טמיר');
			}
		}
	}
};
</script>
<style>
#members {
	font-size: 280%;
}
</style>
