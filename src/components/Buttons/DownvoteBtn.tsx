import React from 'react';
import { DislikeOutlined, DislikeTwoTone } from '@ant-design/icons';
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
  constructor(props: DownvoteBtnProps) {
    super(props);

    const { item } = props;

    this.state = {
      downVotesCount: item.cache?.down_voters_count || 0,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<DownvoteBtnProps>) {
    this.setState({ downVotesCount: nextProps.item.cache?.down_voters_count || 0 });
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
      {slot === 'on' ? <DislikeTwoTone twoToneColor="#ff4d4f" /> : <DislikeOutlined />}
      {!this.props.hideText && <span>{this.state.downVotesCount}</span>}
    </div>
  );

  render() {
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
