import React from 'react';
import { List } from 'antd';
import { parse } from 'qs';
import { AccountNotificationsModelState, ConnectProps, Loading } from '@/models/connect';

const defaultQueryParams = {};

interface SystemsProps extends ConnectProps {
  loading: Loading;
  accountNotifications: AccountNotificationsModelState;

  [key: string]: any;
}

class Systems extends React.Component<SystemsProps> {
  UNSAFE_componentWillMount() {
    this.querySystems(this.props.location.search);
  }

  querySystems = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'accountNotifications/fetchSystems',
      payload: queryParams,
    });
  };

  handlePageChange = (page: number, pageSize?: number) => {
    const { location: { search } } = this.props;
    const query = parse(search.replace(/^\?/, ''));
    this.querySystems({ ...query, page, pageSize });
  };

  render() {
    const {
      loading,
      accountNotifications: { systems: { list, pagination } },
    } = this.props;

    // todo

    return (
      <List
        size="large"
        rowKey="id"
        itemLayout="vertical"
        loading={loading.effects['accountNotifications/fetchSystems']}
        dataSource={list}
        pagination={{
          ...pagination,
          onChange: this.handlePageChange,
        }}
        renderItem={(item: any) => (
          <List.Item
            key={item.id}
          >
            systems
          </List.Item>
        )}
      />
    );
  }
}

export default Systems;
