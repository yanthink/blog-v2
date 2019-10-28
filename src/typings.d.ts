declare module 'slash2';
declare module 'antd-theme-webpack-plugin';

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'react-copy-to-clipboard';
declare module 'react-fittext';
declare module '@antv/data-set';
declare module 'nzh/cn';
declare module 'webpack-theme-color-replacer';
declare module 'webpack-theme-color-replacer/client';

// google analytics interface
interface GAFieldsObject {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
}

interface Window {
  ga: (
    command: 'send',
    hitType: 'event' | 'pageview',
    fieldsObject: GAFieldsObject | string,
  ) => void;
  jQuery: any;
  io: any;
  Echo: any;
  g_app: {
    _store: {
      dispatch: Function;
    };
  };
}

declare let ga: Function;
declare let API_URL: string;
declare let USER_TOKEN_STORAGE_KEY: string;
declare let AUTHORITY_STORAGE_KEY: string;
declare let SOCKET_ID_STORAGE_KEY: string;
declare let SOCKET_HOST: string;
declare let UPLOAD_URL: string;
declare let phpdebugbar: any | undefined;
