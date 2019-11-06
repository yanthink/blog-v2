import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { GeographicItemType } from './data.d';
import * as services from './services';

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
    * fetchProvince (_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(services.queryProvince);
      yield put({
        type: 'setProvince',
        payload: response,
      });
    },
    * fetchCity ({ payload }, { call, put }) {
      const response = yield call(services.queryCity, payload);
      yield put({
        type: 'setCity',
        payload: response,
      });
    },
    * updateBaseInfo ({ payload }, { call }) {
      const { data } = yield call(services.updateBaseInfo, payload);

      window.g_app._store.dispatch({
        type: 'auth/setUser',
        user: data,
      });
    },
    * updateSettings ({ payload }, { call }) {
      const { data } = yield call(services.updateSettings, payload);

      window.g_app._store.dispatch({
        type: 'auth/setUser',
        user: data,
      });
    },
    * updatePassword ({ payload }, { call }) {
      yield call(services.updatePassword, payload);
    },
  },

  reducers: {
    setProvince (state, action) {
      return {
        ...state,
        province: action.payload,
      };
    },
    setCity (state, action) {
      return {
        ...state,
        city: action.payload,
      };
    },
    changeLoading (state, action) {
      return {
        ...state,
        isLoading: action.payload,
      };
    },
  },
};

export default Model;
