/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  // 下面是新增的配置
  rules: {
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true, // 单引号
        semi: false, // 没有分号
        printWidth: 80, // 行宽
        trailingComma: 'none', // 没有对象数组最后一个逗号
        endOfLine: 'auto' // 换行字符串自动
      }
    ],
    // vue 组件名需要大驼峰命名，除去 index 之外，App 是默认支持的
    'vue/multi-word-component-names': [
      'warn',
      {
        ignores: ['index']
      }
    ],
    // 允许对 props 进行解构，因为我们会开启解构保持响应式的语法糖
    'vue/no-setup-props-destructure': ['off'],
    // 让没有定义的变量不是报错，而是ts的警告
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  }
}
