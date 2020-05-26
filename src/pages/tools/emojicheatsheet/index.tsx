import React from 'react';
import { Alert, Input, Row, Col, message } from 'antd';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
// @ts-ignore
import strategy from 'emoji-toolkit/emoji.json';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  createEmojiDataFromStrategy,
  EmojiDataType,
  EmojiType,
  createEmojisSelector,
} from './utils';
import 'emoji-assets/sprites/joypixels-sprite-32.min.css';
import styles from './style.less';

export interface CategoriesType {
  [key: string]: { title: string; emoji: string };
}

interface EmojiCheatSheetState {
  emojiData: EmojiDataType;
  modifier: number; // 肤色 0-5
  term: string;
}

const categories: { [key: string]: { title: string; emoji: string } } = {
  people: {
    title: '表情符号与任务',
    emoji: 'smile',
  },
  nature: {
    title: '动物与自然',
    emoji: 'hamster',
  },
  food: {
    title: '食物与饮料',
    emoji: 'pizza',
  },
  activity: {
    title: '活动',
    emoji: 'soccer',
  },
  travel: {
    title: '旅行与地点',
    emoji: 'earth_americas',
  },
  objects: {
    title: '物体',
    emoji: 'bulb',
  },
  symbols: {
    title: '符号',
    emoji: 'symbols',
  },
  flags: {
    title: '旗帜',
    emoji: 'flag_cn',
  },
};

const modifiers = ['#FFDE5C', '#FFE1BB', '#FFD0A9', '#D7A579', '#B57D52', '#8B6858'];

class EmojiCheatSheet extends React.Component {
  state: EmojiCheatSheetState = {
    emojiData: createEmojiDataFromStrategy(strategy),
    modifier: 0,
    term: '',
  };

  emojisSelector: any;

  UNSAFE_componentWillMount() {
    this.emojisSelector = createEmojisSelector();
  }

  handleSearch = (e: any) => {
    const { value } = e.target;
    this.setState({ term: value });
  };

  handleModifierClick = (modifier: number) => {
    this.setState({ modifier });
  };

  handleCopy = (text: string) => {
    message.destroy();
    message.success(`${text} Copied！🎉`);
  };

  render() {
    const { emojiData, modifier, term } = this.state;

    emojiToolkit.sprites = true;
    emojiToolkit.spriteSize = 32;

    const emojisSelectorData = this.emojisSelector(categories, emojiData, modifier, term);

    return (
      <div className={styles.emojiWrapper}>
        <h1>EMOJI CHEAT SHEET</h1>
        <Alert
          style={{ marginBottom: 16 }}
          message={
            <span>
              基于 <a href="https://github.com/joypixels/emoji-toolkit">emoji-toolkit</a>，
              点击图片即可复制。
            </span>
          }
          type="info"
          showIcon
        />
        <Row gutter={24} style={{ marginBottom: 16 }}>
          <Col sm={6}>
            <Input.Search size="large" onChange={this.handleSearch} placeholder="搜索" />
          </Col>
          <Col sm={18}>
            <ol className="modifiers">
              {modifiers.map((hex: string, index: number) => (
                <li key={hex}>
                  <span
                    onClick={() => this.handleModifierClick(index)}
                    className={modifier === index ? 'modifier active' : 'modifier'}
                    style={{ background: hex }}
                    aria-label={`Fitzpatrick type ${modifier}`}
                  />
                </li>
              ))}
            </ol>
          </Col>
        </Row>
        {emojisSelectorData.map((item: any) => (
          <div key={item.heading.id}>
            <h3>{item.heading.category.title}</h3>
            <ul>
              {item.emojis.map((emoji: EmojiType) => (
                <CopyToClipboard
                  text={emoji.shortname}
                  onCopy={this.handleCopy}
                  key={emoji._key /* eslint-disable-line */}
                >
                  <li>
                    <div>
                      <span
                        className="emoji"
                        style={{ float: 'left' }}
                        dangerouslySetInnerHTML={{
                          __html: emojiToolkit.shortnameToImage(emoji.shortname),
                        }}
                      />
                      <span className="shortname">{emoji.shortname}</span>
                    </div>
                  </li>
                </CopyToClipboard>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

export default EmojiCheatSheet;
