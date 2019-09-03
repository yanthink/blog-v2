import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { GeographicItemType } from './data.d';
import { queryCity, queryProvince, updateBaseInfo, updatePassword } from './service';

export interface ModalState {
  province?: GeographicItemType[];
  city?: GeographicItemType[];
  isLoading?: boolean;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & { select: <T>(func: (state: ModalState) => T) => T },
) => void;

export interface ModelType {
  namespace: string;
  state: ModalState;
  effects: {
    fetchProvince: Effect;
    fetchCity: Effect;
    updateBaseInfo: Effect;
    updatePassword: Effect;
  };
  reducers: {
    setProvince: Reducer<ModalState>;
    setCity: Reducer<ModalState>;
    changeLoading: Reducer<ModalState>;
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
