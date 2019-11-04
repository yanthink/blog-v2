import React from 'react';
import { Icon } from 'antd';
import RelationBtn from './RelationBtn';

export interface DownvoteBtnProps {
  relation: string;
  item: any;
  hideText?: boolean;
  onAfterToggle?: () => void;
}

export interface DownvoteBtnState {
  downVotesCount: number;
}

class DownvoteBtn extends React.Component<DownvoteBtnProps, DownvoteBtnState> {
  constructor (props: DownvoteBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      downVotesCount: item.cache.down_voters_count,
    };
  }

  componentWillReceiveProps (nextProps: Readonly<DownvoteBtnProps>, nextContext: any): void {
    this.setState({ downVotesCount: nextProps.item.cache.down_voters_count });
  }

  onAfterToggle = (status: boolean) => {
    let { downVotesCount } = this.state;
    status ? downVotesCount++ : downVotesCount--;
    this.setState({ downVotesCount });

    if (this.props.onAfterToggle) {
      this.props.onAfterToggle();
    }
  };

  getChildren = (slot: 'on' | 'off') => (
    <div className="downvote downvote-btn">
      <Icon
        type="dislike"
        theme={slot === 'on' ? 'twoTone' : 'outlined'}
        twoToneColor="#ff4d4f"
      />
      {!this.props.hideText && <span>{this.state.downVotesCount}</span>}
    </div>
  );

  render () {
    const { relation, item } = this.props;

    return (
      <RelationBtn
        relation={relation}
        action="downvote"
        item={item}
        on={this.getChildren('on')}
        off={this.getChildren('off')}
        onAfterToggle={this.onAfterToggle}
      />
    );
  }
}

export default DownvoteBtn;
