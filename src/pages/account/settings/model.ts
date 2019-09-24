import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { GeographicItemType } from './data.d';
import {
  queryCity,
  queryProvince,
  updateBaseInfo,
  updateSettings,
  updatePassword,
} from './service';

export interface StateType {
  province?: GeographicItemType[];
  city?: GeographicItemType[];
  isLoading?: boolean;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchProvince: Effect;
    fetchCity: Effect;
    updateBaseInfo: Effect;
    updateSettings: Effect;
    updatePassword: Effect;
  };
  reducers: {
    setProvince: Reducer<StateType>;
    setCity: Reducer<StateType>;
    changeLoading: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'accountSettings',

  state: {
    province: [],
    city: [],
    isLoading: false,
  },

  effects: {
    * fetchProvince(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryProvince);
      yield put({
        type: 'setProvince',
        payload: response,
      });
    },
    * fetchCity({ payload }, { call, put }) {
      const response = yield call(queryCity, payload);
      yield put({
        type: 'setCity',
        payload: response,
      });
    },
    * updateBaseInfo({ payload, callback }, { call }) {
      const { data } = yield call(updateBaseInfo, payload);

      // @ts-ignore
      window.g_app._store.dispatch({
        type: 'user/saveCurrentUser',
        payload: data,
      });

      if (callback) {
        callback();
      }
    },
    * updateSettings({ payload, callback }, { call }) {
      const { data } = yield call(updateSettings, payload);

      // @ts-ignore
      window.g_app._store.dispatch({
        type: 'user/saveCurrentUser',
        payload: data,
      });

      if (callback) {
        callback();
      }
    },
    * updatePassword({ payload, callback }, { call }) {
      yield call(updatePassword, payload);

      if (callback) {
        callback();
      }
    },
  },

  reducers: {
    setProvince(state, action) {
      return {
        ...state,
        province: action.payload,
      };
    },
    setCity(state, action) {
      return {
        ...state,
        city: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
  },
};

export default Model;
