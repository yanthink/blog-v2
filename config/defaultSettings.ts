import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = ProSettings & {
  pwa: boolean;
};

const proSettings: DefaultSettings = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#13C2C2',
  layout: 'topmenu',
  contentWidth: 'Fixed',
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  menu: {
    locale: false,
  },
  title: '平凡的博客',
  pwa: false,
  iconfontUrl: '',
};

export { DefaultSettings };

export default proSettings;
