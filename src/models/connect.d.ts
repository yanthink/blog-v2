import { ConnectProps as DefaultConnectProps } from 'umi';
import { MenuDataItem, Settings as ProSettings } from '@ant-design/pro-layout';
// eslint-disable-next-line import/no-extraneous-dependencies
import { match } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location, LocationState } from 'history';
import { GlobalModelState } from './global';
import { StateType as AuthModelState } from './auth';
import { DefaultSettings as SettingModelState } from '../../config/defaultSettings';

export { GlobalModelState, SettingModelState, AuthModelState };

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean };
  models: {
    global: boolean;
    setting: boolean;
    auth: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  settings: ProSettings;
  auth: AuthModelState;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}

export interface ConnectProps<P extends { [K in keyof P]?: string } = {}, S = LocationState>
  extends DefaultConnectProps {
  match?: match<P>;
  location: Location<S> & { query: { [key: string]: any } };
}
