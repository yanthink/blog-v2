import { join } from 'path';
import Config from 'webpack-chain';
import fs from 'fs';

export default (config: Config) => {
  config.plugin('copy').tap((args) => [
    [
      ...args[0],
      ...[
        {
          from: join(__dirname, '../node_modules/emoji-assets'),
          to: join(__dirname, '../dist/emoji-assets'),
          toType: 'dir',
        },
        {
          from: join(__dirname, '../node_modules/font-awesome'),
          to: join(__dirname, '../dist/font-awesome'),
          toType: 'dir',
        },
      ],
    ],
  ]);

  const configStr = '/* eslint-disable */\nexport default ' + config.toString();
  fs.writeFileSync('./.webpack.config.js', configStr);
};
