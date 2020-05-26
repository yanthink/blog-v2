import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { ActionType, ProColumns } from '@ant-design/pro-table/es/Table';
import { useRequest } from 'umi';
import { Button, Input, message } from 'antd';
import { ConnectProps } from '@/models/connect';
import { IPermission, IRole, ResponseResultType } from '@/models/I';
import AssignPermissionModal from '@/components/AssignPermissionModal';
import { getAllPermissions } from '@/services';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import * as services from './services';

interface RoleListProps extends ConnectProps {}

const RoleList: React.FC<RoleListProps> = () => {
  const action = useRef<ActionType>();
  const [name, setName] = useState();

  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [assignPermissionModalVisible, handleAssignPermissionModalVisible] = useState<boolean>(
    false,
  );
  const [selectedRole, setSelectedRole] = useState<IRole>({});

  // 获取所有权限
  const { data: allPermissions } = useRequest<ResponseResultType<IPermission[]>>(
    getAllPermissions,
    { cacheKey: 'allPermissions' },
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
  // 创建角色
  const { loading: createModalSubmitting, run: storeRole } = useRequest(services.storeRole, {
    manual: true,
    onSuccess() {
      action.current?.reload();
      message.success('角色创建成功！');
    },
  });
  // 更新角色
  const { loading: updateModalSubmitting, run: updateRole } = useRequest(services.updateRole, {
    manual: true,
    onSuccess() {
      action.current?.reload();
      message.success('角色更新成功！');
    },
  });

  function request({ current, pageSize, ...params }: any) {
    return services.queryRoles({ ...params, page: current, per_page: pageSize });
  }

  const columns: ProColumns<IRole>[] = [
    {
      title: '角色标识',
      dataIndex: 'name',
    },
    {
      title: '角色名称',
      dataIndex: 'display_name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'id',
      render: (_, role) => [
        <a
          onClick={() => {
            setSelectedRole(role);
            handleUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          onClick={async () => {
            if (!role.permissions) {
              const hide = message.loading('正在加载权限数据...', 0);
              try {
                const { data } = await services.getRolePermissions(role.id as number);
                // eslint-disable-next-line no-param-reassign
                role.permissions = data;
              } finally {
                hide();
              }
            }
            setSelectedRole(role);
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
      <ProTable<IRole, { name: string }>
        actionRef={action}
        headerTitle="角色列表"
        rowKey="id"
        params={{ name }}
        request={request}
        columns={columns}
        toolBarRender={() => [
          <Input.Search placeholder="角色名称" onSearch={(value) => setName(value)} />,
          <Button type="primary" onClick={() => handleCreateModalVisible(true)}>
            新建
          </Button>,
        ]}
        search={false}
      />
      <CreateModal
        title="创建角色"
        visible={createModalVisible}
        onSubmit={async (values) => {
          await storeRole(values);
          handleCreateModalVisible(false);
        }}
        onCancel={() => handleCreateModalVisible(false)}
        submitting={createModalSubmitting}
      />
      {updateModalVisible && (
        <UpdateModal
          title="编辑角色"
          visible={updateModalVisible}
          onSubmit={async (values) => {
            await updateRole(selectedRole.id as number, values);
            handleUpdateModalVisible(false);
          }}
          onCancel={() => handleUpdateModalVisible(false)}
          submitting={updateModalSubmitting}
          initialValues={selectedRole}
        />
      )}
      {assignPermissionModalVisible && (
        <AssignPermissionModal
          title={`给「${selectedRole.name}」分配权限`}
          visible={assignPermissionModalVisible}
          allPermissions={allPermissions}
          currentPermissions={selectedRole.permissions}
          onSubmit={async (values) => {
            await assignPermissions(selectedRole.id as number, values);
            setSelectedRole({});
            handleAssignPermissionModalVisible(false);
          }}
          onCancel={() => {
            setSelectedRole({});
            handleAssignPermissionModalVisible(false);
          }}
          submitting={assignPermissionsModalSubmitting}
        />
      )}
    </GridContent>
  );
};

export default RoleList;
