import React, { Component, Fragment } from 'react';
import { Card, Col, Form, Button, Input, Row, Table, Divider, message } from 'antd';
import { router } from 'umi';
import { parse, stringify } from 'qs';
import { FormComponentProps } from 'antd/es/form';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import { ConnectState, ConnectProps, RoleListModelState, Loading } from '@/models/connect';
import { IPermission, IRole } from '@/models/data';
import { getAntdPaginationProps } from '@/utils/XUtils';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';
import PermissionForm from './components/PermissionForm';
import * as services from './services';
import styles from './style.less';

const FormItem = Form.Item;

const defaultQueryParams = {};

interface RoleListProps extends ConnectProps, FormComponentProps {
  loading: Loading;
  roleList: RoleListModelState;
}

interface RoleListState {
  createModalVisible: boolean;
  updateModalVisible: boolean;
  permissionModalVisible: boolean;
  currentRole: IRole;
  allPermissions: IPermission[];
  currentPermissions: IPermission[];
}

@connect(({ roleList, loading }: ConnectState) => ({
  roleList,
  loading,
}))
class RoleList extends Component<RoleListProps, RoleListState> {
  state: RoleListState = {
    createModalVisible: false,
    updateModalVisible: false,
    permissionModalVisible: false,
    currentRole: {},
    allPermissions: [],
    currentPermissions: [],
  };

  columns = [
    {
      title: '角色标识',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色名称',
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
      render: (_: any, role: IRole) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, role)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handlePermissionModalVisible(true, role)}>分配权限</a>
        </Fragment>
      ),
    },
  ];

  UNSAFE_componentWillMount () {
    this.queryList(this.props.location.search);
  }

  UNSAFE_componentWillReceiveProps (nextProps: Readonly<RoleListProps>): void {
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
      type: 'roleList/fetch',
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

  handleUpdateModalVisible = (flag?: boolean, role?: IRole) => {
    this.setState({
      updateModalVisible: !!flag,
      currentRole: role || {},
    });
  };

  handlePermissionModalVisible = async (flag?: boolean, role?: IRole) => {
    if (!!flag && role) {
      const hide = message.loading('正在加载权限数据...', 0);

      try {
        const { allPermissions } = this.state;
        if (allPermissions.length === 0) {
          const { data: allPermissions } = await services.getAllPermissions();
          this.setState({ allPermissions });
        }

        const { data: currentPermissions } = await services.getRolePermissions(role.id as number);
        this.setState({ currentPermissions });
      } finally {
        hide();
      }
    }

    this.setState({
      permissionModalVisible: !!flag,
      currentRole: role || {},
    });
  };

  handleAdd = async (values: object) => {
    await this.props.dispatch({
      type: 'roleList/create',
      payload: {
        ...values,
      },
    });

    message.success('添加成功！');

    this.handleCreateModalVisible();
    this.queryList(this.props.location.search);
  };

  handleUpdate = async (id: number, values: object) => {
    await this.props.dispatch({
      type: 'roleList/update',
      id,
      payload: {
        ...values,
      },
    });

    message.success('修改成功！');

    this.handleUpdateModalVisible();
    this.queryList(this.props.location.search);
  };

  handleAssignPermissions = async (role_id: number, values: { permissions: number }) => {
    await this.props.dispatch({
      type: 'roleList/assignPermissions',
      role_id,
      payload: { ...values },
    });

    message.success('权限分配成功');
    this.handlePermissionModalVisible();
  };

  renderSearchForm () {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="角色标识">
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
                  icon="Role-add"
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
      roleList: { list, meta },
      loading,
      location: { pathname, search },
    } = this.props;
    const {
      createModalVisible,
      updateModalVisible,
      permissionModalVisible,
      currentRole,
      allPermissions,
      currentPermissions,
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
              loading={loading.effects['roleList/fetch']}
              rowKey="id"
            />
          </div>
        </Card>
        <CreateForm
          handleAdd={this.handleAdd}
          handleModalVisible={this.handleCreateModalVisible}
          modalVisible={createModalVisible}
          loading={loading.effects['roleList/create']}
        />

        <UpdateForm
          handleUpdate={this.handleUpdate}
          handleModalVisible={this.handleUpdateModalVisible}
          modalVisible={updateModalVisible}
          loading={loading.effects['roleList/update']}
          role={currentRole}
        />
        <PermissionForm
          handleAssignPermissions={this.handleAssignPermissions}
          handleModalVisible={this.handlePermissionModalVisible}
          modalVisible={permissionModalVisible}
          loading={loading.effects['roleList/assignPermissions']}
          currentRole={currentRole}
          allPermissions={allPermissions}
          currentPermissions={currentPermissions}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Form.create<RoleListProps>()(RoleList);
