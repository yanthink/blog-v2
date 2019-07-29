// https://umijs.org/zh/guide/with-dva.html#%E9%85%8D%E7%BD%AE%E5%8F%8A%E6%8F%92%E4%BB%B6
// https://dvajs.com/api/
export const dva = {
  config: {
    onError(e) {
      // effect 执行错误或 subscription 通过 done 主动抛错时触发
      e.preventDefault();
    },
  },
};
