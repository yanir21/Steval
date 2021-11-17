// Method in the component:
// async exportToExcel() {
// 			this.generatingExcel = true;
// 			let allGrades = await this.$apollo.query({
// 				query: allTestGrades,
// 				variables: {
// 					milestone_id: this.test.id,
// 					courses: this.relevantCourses
// 				},
// 				fetchPolicy: 'no-cache'
// 			});
// 			allGrades = allGrades.data.allGrades.sort((a, b) => {
// 				if (
// 					a.assigns[0].group.edgesByChild[0].groupByParent.name ===
// 					b.assigns[0].group.edgesByChild[0].groupByParent.name
// 				) {
// 					return a.details.student_number - b.details.student_number;
// 				}
// 				return a.assigns[0].group.edgesByChild[0].groupByParent.name.split(`"`).join('') >
// 					b.assigns[0].group.edgesByChild[0].groupByParent.name.split(`"`).join('')
// 					? 1
// 					: -1;
// 			});
// 			let allMeetings = await this.$apollo.query({
// 				query: getAllMeetings,
// 				variables: {
// 					milestone_id: this.test.id
// 				},
// 				fetchPolicy: 'no-cache'
// 			});
// 			try {
// 				await generateExcel(allMeetings.data.allMeetings, allGrades);
// 			} catch {
// 				this.$emit('error-bar', 'אופס! הייתה שגיאה בייצור האקסל...');
// 			}
// 			this.generatingExcel = false;
// 		}


import XLSX from 'xlsx';
const ROW_START_VALUE = 1;
const COL_START_VALUE = 2;
const DEFAULT_GRADE = 0;

const pricingsArray = [];
let row;
let col;

const generateExcel = (meetings, grades) => {
	const workBook = configureExcel();
	row = ROW_START_VALUE;
	col = COL_START_VALUE;
	const allCriterions = [];
	meetings.forEach(meeting =>
		allCriterions.push(
			...meeting.children.map((col, index) => [col.id, { index: index, weight: col.weight }])
		)
	);
	const criterionsMap = new Map(allCriterions);
	const finalGradesMap = new Map();
	let workSheet, sheetName, currentMeetingData;
	meetings.forEach(meeting => {
		sheetName = meeting.name;
		currentMeetingData = [['מ.ח', 'שם', ...meeting.children.map(col => col.name), 'סופי']];
		fillStudentsData(currentMeetingData, grades, criterionsMap, meeting, finalGradesMap);
		addSheet(workBook, workSheet, sheetName, currentMeetingData);
		pricingsArray.length = 0;
	});

	const finalData = generateFinalData(workBook, meetings, finalGradesMap);
	addSheet(workBook, workSheet, 'סופי', finalData);
	downloadExcel(workBook);
};

const generateFinalData = (workBook, meetings, finalGradesMap) => {
	let finalData = [
		['מ.ח', 'שם', ...meetings.map(meeting => 'סופי ' + meeting.name), 'ציון סופי']
	];
	const meetingWeights = meetings.map(meeting => meeting.weight);
	let totalGrade;
	finalGradesMap.forEach((value, key) => {
		totalGrade = value.reduce(
			(sum, grade, index) => sum + (grade * meetingWeights[index]) / 100,
			0
		);
		finalData.push(createStudentRow(key, value, totalGrade));
	});

	return finalData;
};

const fillStudentsData = (meetingData, grades, criterionsMap, meeting, finalGradesMap) => {
	grades.forEach(student => {
		col = COL_START_VALUE;
		const { studentGrades, finalGrade } = calculateStudentGradesForMeeting(
			student,
			criterionsMap,
			meeting
		);

		if (!finalGradesMap.has(student)) {
			finalGradesMap.set(student, []);
		}

		finalGradesMap.get(student).push(finalGrade);
		meetingData.push(createStudentRow(student, studentGrades, finalGrade));
		row++;
	});
};

const createStudentRow = (student, grades, finalGrade) => {
	return [
		student.details.student_number,
		student.user.first_name + ' ' + student.user.last_name,
		...grades,
		finalGrade
	];
};

const calculateStudentGradesForMeeting = (student, criterionsMap, meeting) => {
	let studentGrades = new Array(meeting.children.length).fill(DEFAULT_GRADE);
	let finalGrade = 0;
	let calculatedGrade;
	gradesForMeeting(student.inserted_grades, meeting).forEach(gradeFill => {
		calculatedGrade = gradeFill.grade;
		if (calculatedGrade) {
			calculatedGrade -= sumPricingForMilestone(student, gradeFill.milestone_id);
			if (calculatedGrade < 0) {
				calculatedGrade = 0;
			}
		}

		studentGrades[criterionsMap.get(gradeFill.milestone_id).index] = calculatedGrade / 100;
		finalGrade += (calculatedGrade * criterionsMap.get(gradeFill.milestone_id).weight) / 100;
		col++;
	});

	if (finalGrade) {
		finalGrade -= sumPricingForMilestone(student, meeting.id);
		if (calculatedGrade < 0) {
			calculatedGrade = 0;
		}
	}

	return { studentGrades, finalGrade };
};

const sumPricingForMilestone = (student, milestoneId) => {
	const releventPricings = student.students_pricings
		.filter(pricing => pricing.data)
		.map(pricings => pricings.data)
		.filter(pricing => pricing.milestone_id === milestoneId);

	releventPricings.forEach(pricing => {
		pricingsArray.push({
			x: row,
			y: col,
			t: pricing.special_pricing.description
		});
	});
	return releventPricings.reduce((sum, pricing) => sum + pricing.special_pricing.price, 0);
};

const gradesForMeeting = (grades, meeting) => {
	const criterions = meeting.children.map(criterion => criterion.id);
	return grades.filter(grade => criterions.includes(grade.milestone_id));
};

const downloadExcel = workBook => {
	const filename = 'GRD.xlsx';
	XLSX.writeFile(workBook, filename);
};

const configureExcel = () => {
	const workBook = XLSX.utils.book_new();
	workBook.Workbook = {
		Views: [{ RTL: true }]
	};

	return workBook;
};

const addSheet = (workBook, workSheet, sheetName, data) => {
	workSheet = XLSX.utils.aoa_to_sheet(data);
	addPricings(workSheet, pricingsArray);

	row = ROW_START_VALUE;
	XLSX.utils.book_append_sheet(workBook, workSheet, sheetName);
};

const addPricings = (sheet, pricings) => {
	pricings.forEach(pricing => {
		let cellref = XLSX.utils.encode_cell({ c: pricing.y, r: pricing.x });
		if (sheet[cellref].c) {
			sheet[cellref].c[0].t = sheet[cellref].c[0].t.concat(',', pricing.t);
		} else {
			sheet[cellref].c = [{ t: pricing.t }];
		}
	});
};

export { generateExcel };
