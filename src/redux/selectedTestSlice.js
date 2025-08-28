import { createSlice } from "@reduxjs/toolkit";

const selectedTestSlice = createSlice({
  name: "selectedTest",
  initialState: {
    testDetails: {},
    testCategory: {},
    selectedSubject: {},
    selectedUnit: {},
    paramsId: null,
    startTestData: {},
    testResults:{},
  },
  reducers: {
    setSelectedTest: (state, action) => {
      state.testDetails = action.payload;
    },
    clearSelectedTest: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setTestCategory: (state, action) => {
      state.testCategory = action.payload;
    },
    clearTestCategory: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },
    clearSelectedSubject: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setSelectedUnit: (state, action) => {
      state.selectedUnit = action.payload;
    },
    clearSelectedUnit: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setStartTestData: (state, action) => {
      state.startTestData = action.payload;
    },
    clearStartTestData: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setTestResults: (state, action) => {
      state.testResults = action.payload;
    },
    clearTestResults: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
    setId: (state, action) => {
      state.paramsId = action.payload;
    },
    clearId: (state, action) => {
      if (action.payload) {
        delete state[action.payload];
      } else {
        return {};
      }
    },
  },
});

export const {
  setSelectedTest,
  clearSelectedTest,
  setTestCategory,
  clearTestCategory,
  setSelectedSubject,
  clearSelectedSubject,
  setSelectedUnit,
  clearSelectedUnit,
  setStartTestData,
  clearStartTestData,
  setTestResults,
  clearTestResults,
  setId,
  clearId,
} = selectedTestSlice.actions;
export default selectedTestSlice.reducer;
