import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 这个包可以导入Components这个用来自动导入的插件，需要和下面的解析器配合
import Components from 'unplugin-vue-components/vite'
// 下面这个包可以导入各种组件库的解析器，VantResolver，ElementPlusResolver，AntDesignVueResolver
// 解析器就是帮助我们自动加载组件库里的组件
import { VantResolver } from 'unplugin-vue-components/resolvers'

// 这个包是打包svg图标用的，同时也要用到path
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// 导入此插件，为了在index.html中使用如<%=VITE_APP_TITLE%>的环境变量的动态的值，在下面plugins中需要配置
import { createHtmlPlugin } from 'vite-plugin-html'

// 使用mock插件
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig({
  // base配置路由基准路径，默认是'/'
  base: '/',
  server: {
    port: 80, // 端口号改为80
    host: true, // 指定服务器监听的ip地址，设置为true是监听所有地址，包括局域网和公网地址
    open: true
  },
  plugins: [
    vue({}),
    // 配置unplugin-vue-components插件，这个插件还会自动导入components目录下的自己定义的全局组件
    Components({
      // 默认是true，开启自动生成组件的类型声明文件，但是vant的组件已经有类型声明文件了，只要导入就会使用类型声明
      dts: false,
      // importStyle: false的原因是在main.ts中已经全局导入样式了，所以要关闭再次导入，只需要自动导入组件即可
      resolvers: [VantResolver({ importStyle: false })]
    }),
    // 打包svg图标
    createSvgIconsPlugin({
      // 指定图标文件夹，借助path把这里的路径由相对路径转成绝对路径
      iconDirs: [path.resolve(process.cwd(), 'src/icons')]
    }),
    // 使用插件扫描src/mock下的文件
    viteMockServe({
      mockPath: './src/mock',
      localEnabled: true // 在本地开发的时候开启mock
    }),
    // 配置html模板插件
    createHtmlPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
