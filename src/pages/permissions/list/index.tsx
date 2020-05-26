import React, { useRef, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { useRequest } from 'umi';
import { Button, Input, message } from 'antd';
import { ConnectProps } from '@/models/connect';
import { IPermission } from '@/models/I';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import * as services from './services';
import { ActionType, ProColumns } from '@ant-design/pro-table/es/Table';

interface PermissionListProps extends ConnectProps {}

const PermissionList: React.FC<PermissionListProps> = () => {
  const action = useRef<ActionType>();
  const [name, setName] = useState();

  const [createModalVisible, handleCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<IPermission>({});

  function request({ current, pageSize, ...params }: any) {
    return services.queryPermissions({ ...params, page: current, per_page: pageSize });
  }
  // 创建权限
  const { loading: createModalSubmitting, run: storePermission } = useRequest(
    services.storePermission,
    {
      manual: true,
      onSuccess() {
        action.current?.reload();
        message.success('权限创建成功！');
      },
    },
  );
  // 更新权限
  const { loading: updateModalSubmitting, run: updatePermission } = useRequest(
    services.updatePermission,
    {
      manual: true,
      onSuccess() {
        action.current?.reload();
        message.success('权限更新成功！');
      },
    },
  );

  const columns: ProColumns<IPermission>[] = [
    {
      title: '权限标识',
      dataIndex: 'name',
    },
    {
      title: '权限名称',
      dataIndex: 'display_name',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
    },
    {
      title: '操作',
      valueType: 'option',
      dataIndex: 'id',
      render: (_, permission) => [
        <a
          onClick={() => {
            setSelectedPermission(permission);
            handleUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <GridContent>
      <ProTable<IPermission, { name: string }>
        actionRef={action}
        headerTitle="权限列表"
        rowKey="id"
        params={{ name }}
        request={request}
        columns={columns}
        toolBarRender={() => [
          <Input.Search placeholder="权限名称" onSearch={(value) => setName(value)} />,
          <Button type="primary" onClick={() => handleCreateModalVisible(true)}>
            新建
          </Button>,
        ]}
        search={false}
      />
      <CreateModal
        title="创建权限"
        visible={createModalVisible}
        onCancel={() => handleCreateModalVisible(false)}
        onSubmit={async (values) => {
          await storePermission(values);
          handleCreateModalVisible(false);
        }}
        submitting={createModalSubmitting}
      />
      {updateModalVisible && (
        <UpdateModal
          title="更新权限"
          visible={updateModalVisible}
          onCancel={() => handleUpdateModalVisible(false)}
          onSubmit={async (values) => {
            await updatePermission(selectedPermission.id as number, values);
            setSelectedPermission({});
            handleUpdateModalVisible(false);
          }}
          submitting={updateModalSubmitting}
          initialValues={selectedPermission}
        />
      )}
    </GridContent>
  );
};

export default PermissionList;
