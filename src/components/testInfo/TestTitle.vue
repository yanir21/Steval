<template>
	<v-row align="center">
		<span id="title" class="text-h4">
			<title-menu
				icon="arrow_drop_down"
				:list="coursesList"
				@choose-item="chooseCourse($event.id)"
			/>
			{{ chosenCourseName }} -
			<title-menu
				icon="arrow_drop_down"
				:list="testList"
				@choose-item="
					loadTest($event);
					$emit('change-test');
				"
			/>
			{{ test.name }}
		</span>
		<v-menu offset-y left v-if="calculateFinalGradesBtn">
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					:loading="loading || generatingExcel"
					icon
					v-bind="attrs"
					v-on="on"
					class="mr-2"
				>
					<v-icon large>
						more_vert
					</v-icon>
				</v-btn>
			</template>
			<v-list>
				<v-list-item @click="exportToExcel">
					<svg
						class="ml-3"
						width="19"
						height="30"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M30.825 7.45807L23.8333 1.06725C23.0833 0.381702 22.0667 -0.0067749 21.0083 -0.0067749H4C1.79167 0.000842285 0 1.63854 0 3.65709V35.3446C0 37.3631 1.79167 39.0008 4 39.0008H28C30.2083 39.0008 32 37.3631 32 35.3446V10.0479C32 9.08053 31.575 8.14362 30.825 7.45807ZM27.675 9.75084H21.3333V3.95416L27.675 9.75084ZM4 35.3446V3.65709H17.3333V11.579C17.3333 12.5921 18.225 13.4071 19.3333 13.4071H28V35.3446H4ZM21.6667 17.0633H19.2667C18.9 17.0633 18.5667 17.2462 18.3917 17.5432C16.8917 20.0645 16.5417 20.7729 16.0083 21.9383C14.85 19.7217 15.4333 20.6206 13.625 17.5432C13.45 17.2462 13.1083 17.0633 12.7417 17.0633H10.3333C9.55833 17.0633 9.08333 17.8251 9.46667 18.4344L13.325 24.3758L9.46667 30.3172C9.075 30.9266 9.55833 31.6883 10.3333 31.6883H12.7417C13.1083 31.6883 13.4417 31.5055 13.6167 31.2085C15.425 28.1616 15.5333 27.7807 16 26.8133C17.2417 29.1137 16.4917 28.0245 18.3833 31.2085C18.5583 31.5055 18.9 31.6883 19.2667 31.6883H21.6667C22.4417 31.6883 22.9167 30.9266 22.5333 30.3172L18.6667 24.3758C18.725 24.2921 21.1917 20.5292 22.525 18.4344C22.9167 17.8251 22.4333 17.0633 21.6667 17.0633Z"
							:fill="darkMode ? 'white' : '#757575'"
						/>
					</svg>
					<v-list-item-content>
						<v-list-item-title>ייצא לאקסל</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				<v-list-item @click="dialog = true">
					<v-icon class="ml-2">fact_check</v-icon>
					<v-list-item-content>
						<v-list-item-title>חשב ציונים סופיים</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-menu>
		<generic-dialog
			title="חישוב ציונים סופיים"
			:dialog="dialog"
			:commit="true"
			:cancle="true"
			@cancle="dialog = false"
			@commit="calculateFinalGrades"
			max-width="45vw"
		>
			<template v-slot:content>
				<span class="text-subtitle-1">
					א. תרץ יקר, האם אה בטוח שאתה רוצה לחשב כעת את הציונים הסופיים של החניכים? <br />
					וודא שכל אנשי הסגל מילאו סטיבל. <br />
					<b>פעולה זו יכולה לקחת מספר דקות, נא לא לסגור את העמוד. </b>
				</span>
			</template>
		</generic-dialog>
	</v-row>
</template>

<script>
import TitleMenu from '@/components/testInfo/TitleMenu';
import GenericDialog from '@/components/general/GenericDialog';
import { allTestGrades, getAllMeetings } from '@/queries/GradesQueries';
import { mapState, mapGetters, mapActions } from 'vuex';
import { insertCalculatedFinalGrades } from '@/BL/grades';
import { generateExcel } from '@/common/excelWriter';

export default {
	props: {
		relevantCourses: {
			required: true,
			type: Array
		},
		testList: {
			required: true,
			type: Array
		},
		calculateFinalGradesBtn: {
			type: Boolean,
			default: true
		},
		exportExcel: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			dialog: false,
			loading: false,
			generatingExcel: false
		};
	},
	components: {
		TitleMenu,
		GenericDialog
	},
	computed: {
		...mapState(['test', 'coursesList', 'userRootMegama', 'darkMode']),
		...mapGetters(['chosenCourseName', 'chosenCourse'])
	},
	methods: {
		...mapActions(['chooseCourse', 'loadTest']),
		async calculateFinalGrades() {
			this.dialog = false;
			this.loading = true;
			await insertCalculatedFinalGrades(this, this.chosenCourse, this.test.id);
			this.loading = false;
		},
		async exportToExcel() {
			this.generatingExcel = true;
			let allGrades = await this.$apollo.query({
				query: allTestGrades,
				variables: {
					milestone_id: this.test.id,
					courses: this.relevantCourses
				},
				fetchPolicy: 'no-cache'
			});

			allGrades = allGrades.data.allGrades.sort((a, b) => {
				if (
					a.assigns[0].group.edgesByChild[0].groupByParent.name ===
					b.assigns[0].group.edgesByChild[0].groupByParent.name
				) {
					return a.details.student_number - b.details.student_number;
				}
				return a.assigns[0].group.edgesByChild[0].groupByParent.name.split(`"`).join('') >
					b.assigns[0].group.edgesByChild[0].groupByParent.name.split(`"`).join('')
					? 1
					: -1;
			});
			let allMeetings = await this.$apollo.query({
				query: getAllMeetings,
				variables: {
					milestone_id: this.test.id
				},
				fetchPolicy: 'no-cache'
			});

			try {
				await generateExcel(allMeetings.data.allMeetings, allGrades);
			} catch {
				this.$emit('error-bar', 'אופס! הייתה שגיאה בייצור האקסל...');
			}
			this.generatingExcel = false;
		}
	}
};
</script>

<style scoped>
.exportExcel {
	margin-bottom: 0.75vh;
	margin-right: 1vw;
}
</style>
