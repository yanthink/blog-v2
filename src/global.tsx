import moment from 'moment';
import 'moment/locale/zh-cn';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { resetMarkedOptions } from '@/utils/utils';

moment.locale('zh-en');

emojiToolkit.sprites = true;
emojiToolkit.spriteSize = 32;
resetMarkedOptions();

if (window.location.hostname === 'www.einsition.com') {
  // 百度统计
  (() => {
    const hm = document.createElement('script');
    hm.src = 'https://hm.baidu.com/hm.js?ac1bc08008f195f8b3c753b4b718104b';
    document.head.appendChild(hm);
  })();
}
