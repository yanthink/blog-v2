import React from 'react';
import { Icon, Tooltip } from 'antd';
import RelationBtn from './RelationBtn';

export interface LikeBtnProps {
  relation: string;
  item: any;
  hideText?: boolean;
  onAfterToggle?: () => void;
}

export interface LikeBtnState {
  likesCount: number;
}

class LikeBtn extends React.Component<LikeBtnProps, LikeBtnState> {
  constructor (props: LikeBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      likesCount: item.cache.likes_count,
    };
  }

  componentWillReceiveProps (nextProps: Readonly<LikeBtnProps>, nextContext: any): void {
    this.setState({ likesCount: nextProps.item.cache.likes_count });
  }

  onAfterToggle = (status: boolean) => {
    let { likesCount } = this.state;
    status ? likesCount++ : likesCount--;
    this.setState({ likesCount });

    if (this.props.onAfterToggle) {
      this.props.onAfterToggle();
    }
  };

  getChildren = (slot: 'on' | 'off') => (
    <Tooltip title="点赞">
      <div className="btn like-btn">
        <Icon
          type="like"
          theme={slot === 'on' ? 'twoTone' : 'outlined'}
          twoToneColor="#13C2C2"
        />
        {!this.props.hideText && <span>{this.state.likesCount}</span>}
      </div>
    </Tooltip>
  );

  render () {
    const { relation, item } = this.props;

    return (
      <RelationBtn
        relation={relation}
        action="like"
        item={item}
        on={this.getChildren('on')}
        off={this.getChildren('off')}
        onAfterToggle={this.onAfterToggle}
      />
    );
  }
}

export default LikeBtn;
