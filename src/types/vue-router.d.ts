import 'vue-router'

declare module 'vue-router' {
  // 扩展元信息类型
  interface RouteMeta {
    // 标题
    title?: string
  }
}
