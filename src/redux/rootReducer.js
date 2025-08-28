import { combineReducers } from '@reduxjs/toolkit';
import selectedTestReducer from './selectedTestSlice';
//import slice file here...

const rootReducer = combineReducers({
    selectedTest: selectedTestReducer,
    // navigatetest:navigatetestReducer //key and value type
});

export default rootReducer;