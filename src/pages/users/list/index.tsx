import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ActionType, ProColumns } from '@ant-design/pro-table/es/Table';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Input, message } from 'antd';
import { useRequest } from 'umi';
import { ConnectProps } from '@/models/connect';
import { IPermission, IRole, IUser, ResponseResultType } from '@/models/I';
import AssignRoleModal from '@/components/AssignRoleModal';
import AssignPermissionModal from '@/components/AssignPermissionModal';
import { getAllRoles, getAllPermissions } from '@/services';
import * as services from './services';

interface UserListProps extends ConnectProps {}

const UserList: React.FC<UserListProps> = () => {
  const action = useRef<ActionType>();

  const [username, setUsername] = useState();
  const [assignRoleModalVisible, handleAssignRoleModalVisible] = useState<boolean>(false);
  const [assignPermissionModalVisible, handleAssignPermissionModalVisible] = useState<boolean>(
    false,
  );
  const [selectedUser, setSelectedUser] = useState<IUser>({});

  // 获取所有角色
  const { data: allRoles } = useRequest<ResponseResultType<IRole[]>>(getAllRoles, {
    cacheKey: 'allRoles',
  });
  // 获取所有权限
  const { data: allPermissions } = useRequest<ResponseResultType<IPermission[]>>(
    getAllPermissions,
    { cacheKey: 'allPermissions' },
  );
  // 分配角色
  const { loading: assignRoleModalSubmitting, run: assignRoles } = useRequest(
    services.assignRoles,
    {
      manual: true,
      onSuccess() {
        action.current?.reload();
        message.success('角色分配成功！');
      },
    },
  );
  // 分配权限
  const { loading: assignPermissionsModalSubmitting, run: assignPermissions } = useRequest(
    services.assignPermissions,
    {
      manual: true,
      onSuccess() {
        action.current?.reload();
        message.success('权限分配成功！');
      },
    },
  );

  function request({ current, pageSize, ...params }: any) {
    return services.queryUsers({ ...params, page: current, per_page: pageSize });
  }

  const columns: ProColumns<IUser>[] = [
    {
      title: '头像',
      dataIndex: 'avatar',
      render(avatar: string) {
        return <Avatar src={avatar} icon={<UserOutlined />} />;
      },
    },
    {
      title: '用户编号',
      dataIndex: 'id',
    },
    {
      title: '用户名称',
      dataIndex: 'username',
    },
    {
      title: '邮箱号码',
      dataIndex: 'email',
    },
    {
      title: '所在地区',
      dataIndex: 'extends',
      render(_, user) {
        return (
          <>
            <span>{user.extends?.province}</span>
            <span>&nbsp;&nbsp;{user.extends?.city}</span>
          </>
        );
      },
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'id',
      render: (_, user) => [
        <a
          key="assignRoles"
          onClick={async () => {
            if (!user.roles) {
              const hide = message.loading('正在加载角色数据...', 0);
              try {
                const { data } = await services.getUserRoles(user.id as number);
                // eslint-disable-next-line no-param-reassign
                user.roles = data;
              } finally {
                hide();
              }
            }
            setSelectedUser(user);
            handleAssignRoleModalVisible(true);
          }}
        >
          分配角色
        </a>,
        <a
          key="assignPermissions"
          onClick={async () => {
            if (!user.permissions) {
              const hide = message.loading('正在加载权限数据...', 0);
              try {
                const { data } = await services.getUserPermissions(user.id as number);
                // eslint-disable-next-line no-param-reassign
                user.permissions = data;
              } finally {
                hide();
              }
            }
            setSelectedUser(user);
            handleAssignPermissionModalVisible(true);
          }}
        >
          分配权限
        </a>,
      ],
    },
  ];

  return (
    <GridContent>
      <ProTable<IUser, { username: string }>
        actionRef={action}
        headerTitle="用户列表"
        rowKey="id"
        params={{ username }}
        request={request}
        columns={columns}
        toolBarRender={() => [
          <Input.Search placeholder="用户名" onSearch={(value) => setUsername(value)} />,
        ]}
        search={false}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: false,
          showSizeChanger: false,
          // showTotal: undefined,
        }}
      />
      {assignRoleModalVisible && (
        <AssignRoleModal
          title={`给「${selectedUser.username}」分配角色`}
          visible={assignRoleModalVisible}
          allRoles={allRoles}
          currentRoles={selectedUser.roles}
          onSubmit={async (values) => {
            await assignRoles(selectedUser.id as number, values);
            setSelectedUser({});
            handleAssignRoleModalVisible(false);
          }}
          onCancel={() => {
            setSelectedUser({});
            handleAssignRoleModalVisible(false);
          }}
          submitting={assignRoleModalSubmitting}
        />
      )}
      {assignPermissionModalVisible && (
        <AssignPermissionModal
          title={`给「${selectedUser.username}」分配权限`}
          visible={assignPermissionModalVisible}
          allPermissions={allPermissions}
          currentPermissions={selectedUser.permissions}
          onSubmit={async (values) => {
            await assignPermissions(selectedUser.id as number, values);
            setSelectedUser({});
            handleAssignPermissionModalVisible(false);
          }}
          onCancel={() => {
            setSelectedUser({});
            handleAssignPermissionModalVisible(false);
          }}
          submitting={assignPermissionsModalSubmitting}
        />
      )}
    </GridContent>
  );
};

export default UserList;
