import React, { ReactNode } from 'react';
import { debounce } from 'lodash';
import request from '@/utils/request';

export interface RelationBtnProps {
  relation: string;
  action: string;
  item: any;
  on: ReactNode;
  off: ReactNode;
  onAfterToggle?: (status: boolean) => void;
}

export interface RelationBtnState {
  status: boolean;
}

class RelationBtn extends React.Component<RelationBtnProps, RelationBtnState> {
  static types = {
    article: 'App\\Models\\Article',
    comment: 'App\\Models\\Comment',
  };

  static actions = {
    like: 'has_liked',
    favorite: 'has_favorited',
    upvote: 'has_up_voted',
    downvote: 'has_down_voted',
  };

  constructor (props: RelationBtnProps) {
    super(props);

    const { item, action } = props;

    this.state = {
      status: item[RelationBtn.actions[action]]
    };
  }

  componentWillReceiveProps (nextProps: Readonly<RelationBtnProps>, nextContext: any): void {
    const { item, action } = nextProps;
    this.setState({ status: item[RelationBtn.actions[action]] });
  }

  toggle = debounce(async () => {
    const { relation, action, item, onAfterToggle } = this.props;

    await request(`relations/${action}`, {
      method: 'POST',
      data: {
        followable_type: RelationBtn.types[relation],
        followable_id: item.id,
      },
    });

    const status = !this.state.status;

    if (onAfterToggle) {
      onAfterToggle(status);
    }

    this.setState({ status });
  }, 600);

  render () {
    return (
      <div onClick={this.toggle} style={{ cursor: 'pointer' }}>
        {this.state.status ? this.props.on : this.props.off}
      </div>
    );
  }
}

export default RelationBtn;
