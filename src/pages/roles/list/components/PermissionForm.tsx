import { Form, Modal, Checkbox, Tooltip } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import React from 'react';
import { groupBy, map } from 'lodash';
import { IPermission, IRole } from '@/models/data';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 18,
  },
};

interface PermissionFormProps extends FormComponentProps {
  modalVisible: boolean;
  handleAssignPermissions: (role_id: number, values: { permissions: number }) => Promise<void>;
  handleModalVisible: () => void;
  loading: boolean;
  currentRole: IRole,
  currentPermissions: IPermission[];
  allPermissions: IPermission[];
}

const PermissionForm: React.FC<PermissionFormProps> = props => {
  const {
    modalVisible,
    form,
    handleAssignPermissions,
    handleModalVisible,
    loading,
    currentRole,
    currentPermissions,
    allPermissions,
  } = props;
  const { getFieldDecorator } = form;

  const groupPermissions = groupBy(allPermissions, item => (item.name as string).split('.')[0]);

  const okHandle = () => {
    form.validateFields(async (err, values) => {
      if (err) return;
      await handleAssignPermissions(currentRole.id as number, values);
      form.resetFields();
    });
  };

  return (
    <Modal
      destroyOnClose
      title={`给「${currentRole.name}」分配权限`}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
      confirmLoading={loading}
      width={800}
    >
      {getFieldDecorator('permissions', {
        initialValue: currentPermissions.map(item => item.id),
      })(
        <CheckboxGroup style={{ display: 'block' }}>
          {map(groupPermissions, (permissions: IPermission[], key) => (
            <FormItem {...formItemLayout} key={key} label={key}>
              {permissions.map(item => (
                <Tooltip title={item.name} key={item.id}>
                  <Checkbox value={item.id}>{item.display_name}</Checkbox>
                </Tooltip>
              ))}
            </FormItem>
          ))}
        </CheckboxGroup>,
      )}
    </Modal>
  );
};

export default Form.create<PermissionFormProps>()(PermissionForm);
