// vue3+typescript  create-vue  vant组件库   vue-router   pinia
// pnpm是一个高效的包管理工具，和npm/yarn没有区别，主要优势在于包安装速度极快，磁盘空间利用效率高
// npm i pnpm -g
// pnpm install     pnpm add 包名     pnpm add 包名 -D      pnpm dev

// 使用 create-vue 脚手架创建项目，vue2中使用基于webpack的vue-cli，vue3中使用基于vite的create-vue
// pnpm create vue     npm init vue@latest     yarn create vue

// 项目开发所用插件:Vue Language Features (Volar)vue3语法支持  TypeScript Vue Plugin (Volar)vue3中更好的ts提示  Eslint
// vscode安装了Prettier插件的可以先禁用，或者关闭保存自动格式化功能，避免和项目的 Eslint 风格冲突
// Error Lens插件提供行内错误提示       json2ts插件可以让json格式自动转ts类型(这个插件可以不装)
// 如果tsconfig.json报错，可以在"compilerOptions"节点下加上"ignoreDeprecations": "5.0"

// eslint的预制配置，在eslintrc.cjs中自行设置
// 修复格式的命令：pnpm lint    这是对所有文件进行统一修复，命令来源于package.json中的scripts节点下
// vscode开启eslint自动修复：在设置中的setting.json文件中加入editor.codeActionsOnSave节点，并开启"source.fixAll": true
// 这样保存该文件时就会自动eslint修复

// 代码检查工作流：为了防止git提交错误代码，在commit之前进行一次检查
// 先初始化git仓库，git init，然后再初始化husky工具配置，安装：pnpm dlx husky-init 然后 pnpm install
// 然后修改.husky/pre-commit文件：把npm test改成pnpm lint       最后执行pnpm lint命令就可以全量检查了
// 但是这样会有一个问题就是全量检查，对所有文件检查太耗时，解决办法是在暂存区进行eslint校验
// lint-staged安装：pnpm i lint-staged -D然后修改package.json文件，新增lint-staged节点进行配置，并在scripts添加lint-staged
// 然后修改.husky/pre-commit文件：把命令替换成pnpm lint-staged

// 项目目录：
// components：通用组件     composable：组合功能通用函数(和utils工具函数的区别是这里放的是基于vue的组合式api封装的工具函数)
// services：接口服务API(等同于人资项目中的api文件夹)      types：TS类型声明      utils：工具函数     enums存放枚举类型
// 项目使用sass预处理器，安装sass，即可支持scss语法：pnpm add sass -D

// 通过stores下的index.ts和modules下的user.ts来创建用户信息仓库，提供用户信息，修改用户信息，删除用户信息的方法
// 请求工具需要携带token，访问权限控制需要token，所以用户信息仓库先完成

// 使用vant组件库，按需导入，pnpm add vant，然后在main.ts中导入基本样式
// 参考vant官方文档的按需导入方式，使用 unplugin-vue-components 插件，它可以自动引入组件，并按需引入组件的样式
// pnpm add unplugin-vue-components -D
// 如果是基于 vite 的项目，在 vite.config.js 文件中配置插件

// 移动端适配：根据设备的大小，内容能够等比例的缩放
// 使用 vw 完成移动端适配，pnpm add -D postcss-px-to-viewport装包，然后新建并配置postcss.config.js
// 有一个控制台警告可忽略，或者使用 postcss-px-to-viewport-8-plugin 代替当前插件
// scss是css的预处理器，在css前面处理，postcss是css的后处理器，可以修改css的代码，包括对px的处理，或者前缀的处理webkit等

// 二次封装axios，在utils的request.ts中

// 使用css变量定制项目主题，和修改vant主题
// 在main.scss中定义css变量，:root，var，--都是固定写法
// :root {
//   --main: #999; // 一定要是以--开头
// }
// 然后可以使用这个变量
// a {
//   color: var(--main)
// }

// van-nav-bar组件的基础使用，抽取到 cp-nav-bar 组件，作为通用组件
// 提取原因：样式需要修改，项目中使用的 cp-nav-bar 组件功能有相似之处
// 注意，components文件夹下的全局组件不需要自己导入使用，上面的unplugin-vue-components插件会帮助我们自行导入
// 给组件添加类型，使得写属性和事件可以有提示，可以ctrl+鼠标左键点进vant组件的.d.ts文件仿照
// 给全局的组件添加类型的步骤：写一个类型声明文件，声明一个vue类型模块，添加全局组件的类型，在types下的components.d.ts

// 打包svg图标，把icons文件夹下的svg图标打包到项目中，通过组件使用图标
// 安装插件pnpm install vite-plugin-svg-icons -D
// 使用插件，在vite.config.ts中配置，然后导入到main.ts中import 'virtual:svg-icons-register'
// icons文件打包的产物：会生成一个svg结构(js创建的)，包含所有图标，可以理解为精灵图
// 然后通过svg标签，并指定use标签下的href属性的值为 #icon-文件夹名称-图片名称 来指定图片，可以理解为精灵图定位坐标
// 把svg标签使用图标封装成一个公共组件，在components下的cp-icon组件，然后给组件添加类型，参考上面的步骤

// 对表单校验，在utils下的rules.ts

// 很多通用的逻辑就是在services下定义api函数，然后在types下写对应类型

// 通过手机号和密码进行登录：手机号：13230000001 - 13230000100          密码：abc12345
// 发送短信让用户手机接收到验证码是做不到的，一般来讲是调用第三方接口的，是后台处理
// 我们只需要发送给后台手机号就可以了，然后后台返回一个验证码，在网络中的响应里可以看到

// 使用 tab-bar 实现路由切换功能，需要登录的页面，需要判断是否有token，访问权限控制通过路由导航守卫，在router.ts中
// 因为to.meta的类型是接口RouteMeta，可以点进去看到这个接口类型什么也没写，所以要扩展元信息类型，在types/vue-router.d.ts中

// 添加进度条，由于都是懒加载的组件，在切换路由的时候需要加载资源，网速不好会静止，为了提高用户体验，加上进度条
// 安装插件pnpm add nprogress      然后安装它的类型声明文件pnpm add @types/nprogress -D
// 然后在router下的index.ts中导入插件和样式并使用，在main.scss中修改进度条的颜色

// 家庭档案在user下的PatientPage中

// vue2中v-model="count"等价于:value="count" 和 @input="count=$event" count是数据
// v-model只能使用一次，<com v-model="count"></com>
// vue2中xxx.sync="msg"等价于:xxx="msg" 和 @update:xxx="msg=$event"   xxx是属性名，msg是数据
// .sync可以使用多次，<com v-model="count" x.sync="msg1" xx.sync="msg2" xxx.sync="msg3"></com>

// vue3中只需要 v-model 指令可以支持对个数据在父子组件同步，不再支持 .sync 语法
// vue3中v-model="count"等价于:modelValue="count" 和 @update:modelValue="count=$event"  modelValue也可以写成model-value
// vue3中v-model:xxx等价于:xxx="count" 和 @update:xxx="count=$event"
// v-model可以使用多次，<com v-model="count" v-model:x="msg1" v-model:xx="msg2" v-model:xxx="msg3"></com>

// 在components下封装全局组件cp-radio-btn用来实现单选按钮的切换

// 从首页开始的一条线的功能都放在各目录的consult中
// 首页上的相关组件全在Home文件夹下，knowledge-list和card是文章组件，follow-doctor和doctor-card是医生卡片

// VueUse是一款基于组合式API的函数集合，提供了一些网站开发常用的工具函数，得到的是响应式数据
// 安装：pnpm add @vueuse/core
// import { useWindowSize } from '@vueuse/core'             const { width } = useWindowSize()
// 可以使用useWindowSize中的width获取屏幕当前宽度
// 如果遇见一些常见的需求可以先看看 @vueuse/core 是否提供，这样可以提高开发效率，如窗口尺寸，滚动距离，是否进入可视区，倒计时等

// composable文件夹下存放的是用组合API封装逻辑复用的函数，一般叫 hook 函数，是一种逻辑复用的思想
// KnowledgeCard和DoctorCard都用到关注医生，之前的短信验证码登录和qq登录都用到发送验证码
// 当逻辑相同，结构也相同，就要封装组件
// 当逻辑相同，但是结构不同，就要使用逻辑复用，封装到composable下，用组合api实现的函数
// 对象类型多的可以传递给少的，叫：类型兼容

// 极速问诊阶段：先记录问诊类型(极速问诊)，再记录极速问诊类型(三甲还是普通)，再记录科室，再记录病情描述的详细信息，再记录患者id
// 所有流程走完才能组合成完整的问诊记录，而且是不同的页面采集数据，这个实现需要pinia

// 点击极速问诊之后，进入的有关问诊的页面放在views下的Consult页面中，包括极速问诊，选择科室，病情描述，支付四个组件
// 选择患者页面和家庭档案复用一个，在家庭档案基础上进行修改

// 问诊支付的流程
// 点击支付按钮，调用生成订单接口，得到订单ID，打开选择支付对话框，选择支付方式(测试环境需要配置 回跳地址)
// 回跳地址：http://localhost:5173/room
// 然后调用获取支付地址接口，把订单ID和支付方式给到后端，后端生成一个加密的支付地址给到前端
// 前端打开支付地址，跳转到支付平台，在手机端访问可以唤起支付宝应用(需要在手机上安装沙箱支付宝)，也可以使用浏览器账号密码支付
// 注意：我们这里使用在浏览器上支付
// 最后支付成功回跳到问诊室页面
// 支付宝沙箱账号：
// 买家账号：jfjbwb4477@sandbox.com
// 登录密码：111111
// 支付密码：111111

// 底部弹出的选择支付方式封装到components下的cp-pay-sheet组件中
// 点击第一次的立即支付就直接生成订单id，点击第二次的立即支付就会把订单id和支付方式发到后台，然后返回支付地址

// 在上述完成之后会进入问诊室，问诊室在Room文件夹下
// 状态栏组件room-status(等待接诊，咨询中，已结束)，操作栏组件room-action(需要禁用，接诊后开启)
// 消息卡片组件room-message(根据消息类型判断显示不同消息卡片)

// 问诊室聊天中的医生是在文档中的辅助-超级医生，点击测试抢单，然后输入orderId问诊订单，就可以接诊，然后实现聊天等功能

// websocket是一种网络通信协议，和HTTP协议一样，也是和后端做交互的，底层都是基于tcp协议的
// 为什么需要websocket? 因为HTTP协议有一个缺陷：通信只能由客户端发起，所以对于即时聊天，要使用websocket双向通讯
// http协议是客户端向服务端发请求request，然后服务端响应response，每一次的过程都是客户端发起，然后得到服务端的响应
// websocket协议是客户端先询问服务端建立连接handshake，然后服务端返回同意之后acknowledge，客户端和服务端就可以互相发消息了
// 最后结束时connection end，在websocket的测试.html有具体代码介绍

// 我们项目中使用 socket.io-client 来实现客户端代码，它是基于 websocket 的库
// socket.io是一个基于 WebSocket 的 CS（客户端-服务端）的实时通信库，官网：https://socket.io/zh-CN/
// 使用它可以在后端提供一个即时通讯服务，可以在node.js，java等使用
// 它也提供一个客户端js库，让我们在前端可以去链接后端的 socket.io 创建的服务
// 总结：它是一套基于 websocket 前后端即时通讯解决方案
// 官方提供的demo：git clone https://github.com/socketio/chat-example.git
// 在socket.io的使用.js中介绍socket.io的用法

// 本项目问诊室的通讯规则
// 分为患者端，服务器，医生端三部分
// 1.连接成功之后，患者端接收服务器主动发来的之前的聊天记录，事件名为chatMsgList
// 2.患者端想给医生发消息，是要发给服务器的，事件名为sendChatMsg
// 3.服务器会接收到刚才发来的消息，然后把刚才的消息再重新发给患者端，如果患者端接收到则代表发送成功
// 此外还要把消息发送给医生端，上面两个的事件名为receiveChatMsg
// 4.医生端给患者发消息，也是要发给服务器的，事件名和之前的一样，都是sendChatMsg
// 5.然后服务器和第3步会进行一样的操作，完成后患者端就会接收到医生发的消息
// 6.患者端收到消息之后需要把消息状态改成已读，通过事件名为updateMsgStatus发送给服务器
// 消息已读这个功能没法验证，只是为了加一下这个功能，保证进入room下的index.vue之后，把消息都改成已读
// 7.最开始服务器发送过来的聊天记录是一页的，如果聊天记录不止一页，那么需要患者端主动向服务器获取聊天记录，事件名getChatMsgList
// 第7步的发送获取聊天记录的事件之后，服务器响应回来的聊天记录，通过的事件名是第1步的chatMsgList
// 8.订单状态变化之后，服务器就会主动的给患者端发送事件(没有数据)，事件名为statusChange

// 问诊室建立连接在room下的index.vue中：
// 安装 sokect.io-client 包：pnpm add socket.io-client
// 在组件挂载完毕，进行socket连接
// 监听连接成功，监听错误消息，监听关闭连接
// 组件卸载关闭连接

// 把有关timeOptions和flagOptions以及它们的取值方法封装到工具函数中(utils下的filter.ts)，方便多个组件共用
// dayjs是用来格式化时间的插件
// 开处方需要去在线文档中的辅助-超级医生开处方

// 问诊记录可以在个人中心点击问诊记录，也可以在首页的极速问诊中点击右上角的问诊记录进入
// 问诊记录放在user文件夹下的ConsultPage中，ConsultItem和ConsultList是它的子组件，ConsultDetail是问诊详情

// import { useClipboard } from '@vueuse/core'      const { copy, copied, isSupported } = useClipboard()
// 利用vueuse中的useClipboard函数实现复制功能，在user下的consult-detail组件中使用

// 在问诊室开过处方之后可以购买药品，然后来到药品支付，药品相关在Order文件夹下
// order-pay是药品支付页面(在问诊室中点击购买药品，并且没有药品订单就会进入药品支付)
// order-pay-result是支付成功后的显示页面，用于查看药品订单和返回问诊室
// order-detail是药品订单详情页面
// order-medical组件是药品组件，渲染药品信息

// 高德地图开放平台官网：https://lbs.amap.com/
// 然后注册登录账号，进入应用管理，创建新应用，新应用中添加key，服务平台选择Web端(JS API)
// 创建成功后，可获取 key 和安全密钥
// key：          e17859ca39b5df32a6e2bed994f4c173
// 安全密钥jscode：891564a7bb63066aa501a2df7518d733
// 在开发支持中选择 地图JS API：https://lbs.amap.com/api/jsapi-v2/summary/
// 可以在其中的参考手册中查看各种操作
// 安装：npm i @amap/amap-jsapi-loader --save
// 在order文件夹下的order-logistics组件中配置高德地图

// 扩展 Window 的类型(在根目录下的env.d.ts)：
// interface Window {
//   _AMapSecurityConfig: {
//     securityJsCode: string
//   }
// }

// qq登录会有个问题就是回跳地址的问题，
// 之前支付宝可以告诉服务器回跳地址是多少，可以回跳回来，但是qq登录不能随意写一个地址，必须要用qq互联配置
// 并且回跳地址不能是http://localhost:80 而必须是有备案的域名，所以如果使用qq登录，则最后就不会回到项目中了！！！！！！

// 需要在QQ互联平台注册(自己不要去注册，过程繁琐，很难成功)https://connect.qq.com/index.html 实名身份认证，审核通过
// 然后创建我的web应用，需要提供网站域名、域名备案号(已备案的域名)，然后设置qq登录回跳地址，审核通过，得到appid和回跳地址
// 这里直接用老师配好的appid和redirect_uri
// appid：102015968
// redirect_uri(回跳地址)：http://consult-patients.itheima.net/login/callback
// 也就是说qq登录后回跳是回到上面这个地址的，而不会回到本地项目中来，本项目的地址应该是http://localhost:80/login/callback

// 第三方登录(qq登录)的登录流程：
// 1.点击页面上的qq按钮，跳转qq登录
// 跳转qq登录步骤
// 在index.html中引入qq登录sdk，使用步骤：https://wiki.connect.qq.com/js_sdk%e4%bd%bf%e7%94%a8%e8%af%b4%e6%98%8e
// <script
//   src="https://connect.qq.com/qc_jssdk.js"
//   data-appid="102015968"
//   data-redirecturi="http://consult-patients.itheima.net/login/callback"
// ></script>
// 引入qq登录sdk之后就会有个全局变量QC
// 而全局变量是在window下面的，所以相当于是window.QC，并且有一个方法为window.QC.Login({ btnId: 'qq' })
// 准备一个标签(div就行)，id值为qq，<div class="icon" id="qq"></div>
// 然后onMounted(() => { QC.Login({ btnId: 'qq' })})就会把这个标签变成可以跳转到qq登录的按钮，但是比较丑
// 用这个按钮的目的是为了在页面中f12之后审查元素看到这个元素上绑定的地址，然后复制给一个自己的a链接，绑定到href属性上

// 2.跳转qq登录会根据设备自动选择电脑端登录(手机qq扫码)还是手机端登录(唤起手机qq登录)，然后授权登录，会跳转到回跳地址
// qq授权登录之后回跳的链接如下(后面的参数根据账户不同而变化)：
// http://consult-patients.itheima.net/login/callback#access_token=B417C0C3EBF93A380A22A188A9C491A4&expires_in=7776000
// 注意把/login/callback加入到router文件夹下的index.ts的白名单中

// 3.扩展window类型，提供QC相关的类型，然后使用QQ的SDK提供的QC的相关API获取openId
// 扩展Window的类型(在根目录下的env.d.ts)：
// interface Window {
//   QC: {
//     Login: {
//       check(): boolean
//       getMe(cb: (openId: string) => void): void
//     }
//   }
// }
// 通过QC.Login.getMe((openId)=>{})拿到openId

// 4.根据openId向后台发请求，后台审核该openId有没有绑定手机号
// 如果之前没绑定，则失败(需要先绑定手机)，如果之前绑定过，则成功(和之前登录成功一样的逻辑)

// 如果要解绑的话，可以去接口文档中，找到解除绑定的接口，设置Btoken变量值，环境变量的变量名就是Btoken
// 变量值为Bearer token字符串的值(不带引号)
// token字符串的值可以去项目的应用中找到本地存储，然后点击对应项，然后查看下方的信息就会有token，直接复制就拿到了
// 然后根据接口文档设置请求参数，比如这里的Path参数，参数名userinfo，参数值就是绑定的手机号，点击发送，就可以解绑了

// 部署-开发生产环境
// 生产环境的域名为：https://cp.itheima.net
// 开发环境的域名为：http://consult-patients.itheima.net
// 但是开发环境中都是在用本地localhost，也就是在用http://localhost:80
// 新建.env.development和.env.production文件，这两个文件分别对应开发环境和生产环境使用的
// 然后在使用的时候通过 import.meta.env.环境变量 就可以使用到这两个文件中定义的环境变量

// 如果要在index.html中也使用上述环境变量动态的值，需要安装html模板插件 pnpm add vite-plugin-html -D
// 然后在vite.config.ts中配置，然后在index.html中通过<%=环境变量名%>可以使用值
// 在手机端，浏览器使用什么进行调试呢？Eruda手机调试面板工具，使用方式：https://github.com/liriliri/eruda
// 在index.html中引入eruda

// 在开发过程中后台未开发好接口，前端要推进业务就需要进行mock模拟数据
// mock接口数据，官网：https://www.npmjs.com/package/vite-plugin-mock
// 安装vite-plugin-mock和mockjs    pnpm i vite-plugin-mock mockjs -D
// 安装对应的类型声明文件           pnpm i --save-dev @types/mock.js
// 使用插件扫描 src/mock 下文件，在vite.config.ts中配置
// 使用的时候直接发请求就可以，默认是本地的域名，注意不要用request，因为已经指定了baseURL，请求的就是真实的接口了
// axios.get('/patient/message/list').then((res) => {
//   console.log(res)
// })

// 本地打包 pnpm build 得到dist资源包，然后直接上传到服务器，服务器一般是 linux系统，使用 XFTP 进行文件的上传和下载
// 如果是本地服务器使用pm2进行部署(本地演示)托管静态资源 https://pm2.keymetrics.io/docs/usage/expose/
// 全局装包 npm i pm2 -g
// 然后进入dist目录下！！！！！！
// pm2 serve 目录 端口  --name 服务名称
// pm2 serve ./ 8080 --name my-cp-server

// history路由模式问题，如果有子路径，刷新页面会404
// 原因：history改变路由是前端切换，不会请求服务器来响应对应目录下的文件，所以只有一个目录下的index.html
// 但是一旦刷新浏览器，比如/consult/dep这种就会按照这个地址请求服务器，但是在服务器上没有对应文件夹，也就只能404
// 注意#的hash路由是不会存在这种问题的，因为#后面的改变是不会影响的，不会请求服务器
// 解决：让服务器定位到index.html页面返回给前端即可
// pm2 serve --spa ./ 8080 --name my-cp-server
// 查看服务列表pm2 list       删除服务pm2 delete my-cp-server
