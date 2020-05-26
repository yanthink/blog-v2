import moment from 'moment';
import 'moment/locale/zh-cn';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import { resetMarkedOptions } from '@/utils/utils';

moment.locale('zh-en');

emojiToolkit.sprites = true;
emojiToolkit.spriteSize = 32;
resetMarkedOptions();
