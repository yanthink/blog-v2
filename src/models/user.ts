import { Effect } from 'dva';
import { Reducer } from 'redux';
import { queryCurrent, query as queryUsers } from '@/services/user';
import { IUser } from '@/models/data';

export interface UserModelState {
  currentUser?: IUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    * fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    * fetchCurrent(_, { call, put }) {
      const { data: user } = yield call(queryCurrent);
      if (user && user.name) {
        yield put({
          type: 'saveCurrentUser',
          payload: user,
        });
      }
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
  },
};

export default UserModel;
