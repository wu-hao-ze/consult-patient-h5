/* eslint-disable @typescript-eslint/no-unused-vars */
// 需要掌握的客户端几个 api 的基本使用：
// 如何使用客户端js库?  pnpm add socket.io-client

// 如何建立连接？
import io from 'socket.io-client'
// io()中有两个参数
// 参数1：不传参数默认是当前服务域名，开发中传入服务器地址
// 参数2：配置参数，根据需要再来介绍
const socket = io()

// 如何确定连接成功？
socket.on('connect', () => {
  // 建立连接成功
})

// 如何发送消息？
// chat message 是发送消息事件，由后台约定，可变
socket.emit('chat message', '消息内容')

// 如何接收消息？
// chat message 是接收消息事件，由后台约定，可变
socket.on('chat message', (ev) => {
  // ev 是服务器发送的消息
})

// 如何关闭连接？
// 离开组件需要使用
socket.close()
