import { Reducer } from 'redux';
import { Effect } from '@/models/connect';
import { INotification, IMeta } from '@/models/data';
import { queryNotifications } from './service';

export interface StateType {
  notifications: {
    list: INotification[];
    pagination: IMeta;
  },
  messages: {
    list: [];
    pagination: IMeta;
  },
  systems: {
    list: [];
    pagination: IMeta;
  },
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchNotifications: Effect;
    fetchMessages: Effect;
    fetchSystems: Effect;
  };
  reducers: {
    queryNotifications: Reducer<StateType>;
    queryMessages: Reducer<StateType>;
    querySystems: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'accountNotifications',
  state: {
    notifications: {
      list: [],
      pagination: {},
    },
    messages: {
      list: [],
      pagination: {},
    },
    systems: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    * fetchNotifications({ payload }, { call, put }) {
      const { data: list, pagination } = yield call(queryNotifications, payload);

      yield put({
        type: 'queryNotifications',
        payload: {
          list,
          pagination,
        },
      });
    },
    * fetchMessages() {
      yield;
      // todo
    },
    * fetchSystems() {
      yield;
      // todo
    },
  },
  reducers: {
    queryNotifications(state, action) {
      return {
        ...state,
        notifications: action.payload,
      } as StateType;
    },
    queryMessages(state, action) {
      return {
        ...state,
        messages: action.payload,
      } as StateType;
    },
    querySystems(state, action) {
      return {
        ...state,
        systems: action.payload,
      } as StateType;
    },
  },
};

export default Model;
