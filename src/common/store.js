import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
	plugins: [createPersistedState({ storage: window.sessionStorage })],
	state: {
		testChosen: false,
		teamTest: false,
		test: '',
		teams: [],
		chosenTeam: '',
		chosenTeamName: '',
		chosenMeeting: 0,
		chosenStudentID: '',
		loading: false,
		darkMode: false,
		chosenStudentList: [],
		coursesList: [],
		studsProgressDetails: [],
		chosenCourse: 0,
		lastFillerUserRole: '',
		chosenManageTest: {},
		chosenManageRunMeeting: {},
		userRootMegama: {},
		rootsList: []
	},
	getters: {
		userRootMegama: state => state.userRootMegama,
		chosenManageRunMeetingId: state => state.chosenManageRunMeeting.id,
		chosenManageTestId: state => state.chosenManageTest.id,
		currentTest: state => {
			return state.test;
		},
		studsProgressDetails: state => {
			return state.studsProgressDetails;
		},
		teamTest: state => {
			return state.teamTest;
		},
		testChosen: state => {
			return state.testChosen;
		},
		currentTestId: state => {
			return state.test.test_id;
		},
		currentTest: state => {
			return state.test;
		},
		currentMeeting: state => {
			return state.chosenMeeting;
		},
		teams: state => {
			return state.teams;
		},
		chosenStudent: state => {
			return state.chosenStudentID;
		},
		chosenTeam: state => {
			return state.chosenTeam;
		},
		loading: state => {
			return state.loading;
		},
		chosenCourse: state => {
			return state.chosenCourse;
		},
		chosenCourseName: state => {
			return state.coursesList.find(course => course.id === state.chosenCourse).name;
		},
		chosenTeamName: state => state.chosenTeamName
	},
	mutations: {
		initUserRootMegama(state, payload) {
			state.userRootMegama = payload;
		},
		changeManageRunMeeting(state, payload) {
			state.chosenManageRunMeeting = payload;
		},
		changeManageTest(state, payload) {
			state.chosenManageTest = payload;
		},
		changeTest(state, payload) {
			state.test = payload;
		},
		chooseTest(state, payload) {
			state.testChosen = true;
			state.test = payload;
		},
		chooseTeam(state, payload) {
			state.chosenTeam = payload;
		},
		changeMeeting(state, payload) {
			state.chosenMeeting = payload;
		},
		changeTeamState(state, payload) {
			state.teamTest = payload;
		},
		chooseStudent(state, payload) {
			state.chosenStudentID = payload;
		},
		chooseCourse(state, payload) {
			state.chosenCourse = payload;
		},
		turnOnLoading(state) {
			state.loading = true;
		},
		turnOffLoading(state) {
			state.loading = false;
		},
		resetNavbar(state) {
			(state.testChosen = false),
				(state.teamTest = false),
				(state.test = ''),
				(state.teams = []),
				(state.chosenTeam = ''),
				(state.chosenMeeting = ''),
				(state.chosenStudentID = ''),
				(state.loading = false),
				(state.chosenStudentList = []);
		},
		setChosenStudentsList(state, payload) {
			state.chosenStudentList = payload;
		},
		emptyStudentsList(state) {
			state.chosenStudentList = [];
		},
		emptyTeamsList(state) {
			state.chosenTeam = '';
			state.chosenStudentID = '';
			state.teams = [];
		},
		changeCoursesList(state, payload) {
			state.coursesList = payload;
		},
		changeLastFillerUserRole(state, payload) {
			state.lastFillerUserRole = payload;
		},
		changeTeamName(state, payload) {
			state.chosenTeamName = payload;
		},
		updateTeams(state, teams) {
			state.teams = teams;
		},
		changeDarkMode(state, newMode) {
			state.darkMode = newMode;
		},
		changeRootsList(state, rootsList) {
			state.rootsList = rootsList;
		}
	},
	actions: {
		changeMeeting({ commit }, meeting) {
			commit('changeMeeting', meeting);
		},
		initUserRootMegama(context, rootMegama) {
			context.commit('initUserRootMegama', rootMegama);
		},
		chooseStudent({ commit }, chooseStudent) {
			commit('chooseStudent', chooseStudent);
		},
		chooseCourse({ commit, getters }, chooseCourse) {
			if (getters.chosenCourse !== chooseCourse) {
				commit('chooseCourse', chooseCourse);
				commit('emptyStudentsList');
			}
		},
		changeManageRunMeeting(context, runMeeting) {
			context.commit('changeManageRunMeeting', runMeeting);
		},
		changeManageTest(context, test) {
			context.commit('changeManageTest', test);
		},
		changeLastFillerUserRole(context, id) {
			context.commit('changeLastFillerUserRole', id);
		},
		loadTest({ commit, state }, test) {
			commit('chooseTest', test);
			let isTeam = false;
			test.type.forEach(type => {
				if (type.tag.tag == 'קבוצתי') {
					isTeam = true;
				}
			});
			if (state.teamTest !== isTeam) {
				commit('emptyStudentsList');
			}
			if (isTeam || state.teamTest) {
				commit('emptyTeamsList');
			}
			commit('changeTeamState', isTeam);
		},
		resetStore(context) {
			context.commit('resetNavbar');
		},
		loadCoursesList(context, list) {
			context.commit('changeCoursesList', list);
		},
		updateChosenStudentList({ commit }, list) {
			commit('setChosenStudentsList', list);
		},
		updateTeams({ commit }, teams) {
			commit('updateTeams', teams);
		},
		chooseTeam({ commit }, team) {
			commit('chooseTeam', team);
		},
		changeDarkMode({ commit }, newMode) {
			commit('changeDarkMode', newMode);
		},
		changeRootsList({ commit }, rootsList) {
			commit('changeRootsList', rootsList);
		},
		changeUserRoot({ commit, state }, root) {
			let userRootMegama = state.userRootMegama;
			userRootMegama.root = root;
			commit('initUserRootMegama', userRootMegama);
		}
	}
});
