import React, { Component, Fragment } from 'react';
import { Card, Col, Form, Button, Input, Row, Table } from 'antd';
import { router } from 'umi';
import { parse, stringify } from 'qs';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { ConnectState, ConnectProps, PermissionListModelState, Loading } from '@/models/connect';
import { IPermission } from '@/models/data';
import { getAntdPaginationProps } from '@/utils/XUtils';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

interface PermissionListProps extends ConnectProps, FormComponentProps {
  loading: Loading;
  permissionList: PermissionListModelState;
}

interface PermissionListState {
  createModalVisible: boolean;
  updateModalVisible: boolean;
  currentPermission: IPermission;
}

@connect(({ permissionList, loading }: ConnectState) => ({
  permissionList,
  loading,
}))
class PermissionList extends Component<PermissionListProps, PermissionListState> {
  state: PermissionListState = {
    createModalVisible: false,
    updateModalVisible: false,
    currentPermission: {},
  };

  columns = [
    {
      title: '权限标识',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },
    {
      title: '操作',
      render: (_: any, permission: IPermission) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, permission)}>编辑</a>
        </Fragment>
      ),
    },
  ];

  UNSAFE_componentWillMount () {
    this.queryList(this.props.location.search);
  }

  UNSAFE_componentWillReceiveProps (nextProps: Readonly<PermissionListProps>): void {
    if (nextProps.location.search !== this.props.location.search) {
      this.queryList(nextProps.location.search);
    }
  }

  queryList = (params: object | string) => {
    const query = params instanceof Object ? params : parse(params.replace(/^\?/, ''));

    const queryParams = {
      ...defaultQueryParams,
      ...query,
    };

    this.props.dispatch({
      type: 'permissionList/fetch',
      payload: queryParams,
    });
  };

  handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const { location: { pathname }, form: { getFieldsValue } } = this.props;

    router.push({
      pathname,
      search: stringify({
        ...getFieldsValue(),
      }),
    });
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.queryList({});
  };

  handleCreateModalVisible = (flag?: boolean) => {
    this.setState({
      createModalVisible: !!flag,
    });
  };

  handleUpdateModalVisible = (flag?: boolean, role?: IPermission) => {
    this.setState({
      updateModalVisible: !!flag,
      currentPermission: role || {},
    });
  };

  handleAdd = async (values: object) => {
    await this.props.dispatch({
      type: 'permissionList/create',
      payload: {
        ...values,
      },
    });

    this.handleCreateModalVisible();
    this.queryList(this.props.location.search);
  };

  handleUpdate = async (id: number, values: object) => {
    await this.props.dispatch({
      type: 'permissionList/update',
      id,
      payload: {
        ...values,
      },
    });

    this.handleUpdateModalVisible();
    this.queryList(this.props.location.search);
  };

  renderSearchForm () {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="权限标识">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={16} sm={24}>
            <div className={styles.action}>
              <div className={styles.submitButtons}>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </div>
              <div className={styles.operator}>
                <Button
                  icon="Permission-add"
                  type="primary"
                  onClick={() => this.handleCreateModalVisible(true)}
                >
                  新建
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render () {
    const {
      permissionList: { list, meta },
      loading,
      location: { pathname, search },
    } = this.props;
    const {
      createModalVisible,
      updateModalVisible,
      currentPermission,
    } = this.state;

    const query = parse(search.replace(/^\?/, ''));

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.searchForm}>{this.renderSearchForm()}</div>
            <Table
              dataSource={list}
              pagination={getAntdPaginationProps(meta, pathname, query)}
              columns={this.columns}
              loading={loading.effects['permissionList/fetch']}
              rowKey="id"
            />
          </div>
        </Card>
        <CreateForm
          handleAdd={this.handleAdd}
          handleModalVisible={this.handleCreateModalVisible}
          modalVisible={createModalVisible}
          loading={loading.effects['permissionList/create']}
        />
        <UpdateForm
          handleUpdate={this.handleUpdate}
          handleModalVisible={this.handleUpdateModalVisible}
          modalVisible={updateModalVisible}
          loading={loading.effects['permissionList/update']}
          permission={currentPermission}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<PermissionListProps>()(PermissionList);
