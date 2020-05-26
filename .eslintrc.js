module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'react/no-array-index-key': [0],
    'react/no-danger': [0],
    'react/sort-comp': [0],
    'no-plusplus': [0],
    'no-unused-expressions': [0],
    'react/no-children-prop': [0],
    'consistent-return': [0],
  },
  globals: {
    page: true,
    REACT_APP_ENV: true,
    SOCKET_HOST: true,
    UPLOAD_URL: true,
  },
};
