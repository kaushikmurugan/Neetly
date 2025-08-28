import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['selectedTest'], // Only persist selectedTest //only the name of the slice in the sliced function file.
  };

  export default persistConfig;