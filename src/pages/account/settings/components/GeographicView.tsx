import React from 'react';
import { useRequest } from 'umi';
import { Select, Spin } from 'antd';
import * as services from '../services';
import { GeographicItemType } from '../data';
import styles from './GeographicView.less';

interface GeographicViewProps {
  value?: {
    province: SelectItem;
    city: SelectItem;
  };
  onChange?: (value: any) => void;
}

interface SelectItem {
  label: string;
  key: string;
}

const nullSelectItem: SelectItem = {
  label: '',
  key: '',
};

const GeographicView: React.FC<GeographicViewProps> = (props) => {
  const { loading: provinceLoading, data: province = [nullSelectItem] } = useRequest(
    services.queryProvince,
  );
  const {
    loading: cityLoading,
    data: city = [nullSelectItem],
    run: fetchCity,
  } = useRequest(services.queryCity, { manual: true });

  function getOption(list: GeographicItemType[]) {
    if (!list || list.length < 1) {
      return (
        <Select.Option key={0} value={0}>
          没有找到选项
        </Select.Option>
      );
    }
    return list.map((item) => (
      <Select.Option key={item.id} value={item.id}>
        {item.name}
      </Select.Option>
    ));
  }

  function getProvinceOption() {
    if (province) {
      return getOption(province);
    }
    return [];
  }

  async function selectProvinceItem(item: SelectItem) {
    await fetchCity(item.key);
    console.info(city);
    props.onChange!({
      province: item,
      city: nullSelectItem,
    });
  }

  function selectCityItem(item: SelectItem) {
    props.onChange!({
      province: props.value?.province,
      city: item,
    });
  }

  function getCityOption() {
    if (city) {
      return getOption(city);
    }
    return [];
  }

  return (
    <Spin spinning={provinceLoading || cityLoading} wrapperClassName={styles.row}>
      <Select
        className={styles.item}
        value={(props.value?.province || nullSelectItem) as any}
        labelInValue
        showSearch
        onSelect={selectProvinceItem}
      >
        {getProvinceOption()}
      </Select>
      <Select
        className={styles.item}
        value={(props.value?.city || nullSelectItem) as any}
        labelInValue
        showSearch
        onSelect={selectCityItem}
      >
        {getCityOption()}
      </Select>
    </Spin>
  );
};

export default GeographicView;
