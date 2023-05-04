import type { KnowledgeList } from '@/types/consult'
import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 数组中，每一个对象就是一个接口
const rules: MockMethod[] = [
  {
    url: '/patient/home/knowledge',
    method: 'get',
    timeout: 1000, // 模拟接口的延迟
    // response就是响应的数据，是假的
    response: () => {
      const rows: KnowledgeList = []
      for (let i = 0; i < 5; i++) {
        // Mock.mock是Mock的用法，随机生成数据
        const item = Mock.mock({
          id: '@id', // @id就会随机生成id
          title: '@ctitle(10,20)', // @ctitle随机生成中文字的标题，10到20个字
          coverUrl:
            i % 2
              ? [
                  'https://yanxuan-item.nosdn.127.net/27afb774345de98c87dddf89042ab33a.jpg'
                ]
              : [
                  'https://yanxuan-item.nosdn.127.net/27afb774345de98c87dddf89042ab33a.jpg',
                  'https://yanxuan-item.nosdn.127.net/b6e1cfa68ee53719b7ab2c8e0dc20916.jpg',
                  'https://yanxuan-item.nosdn.127.net/17d32665d53e351aa499fb1e56796e58.jpg'
                ],
          topics: ['@ctitle(2,4)', '@ctitle(2,4)'],
          collectionNumber: '@integer(10,100)', // 随机生成数字，并限定范围
          commentNumber: '@integer(10,100)',
          creatorName: '@cname',
          creatorAvatar:
            'https://yanxuan-item.nosdn.127.net/ca17e384dc1c005c24c06e1abfde6ab4.jpg',
          creatorHospatalName: '积水潭医院',
          likeFlag: '@integer(10,100)',
          content: '@ctitle(30,60)',
          creatorDep: '内科',
          creatorTitles: '主任医师'
        })
        rows.push(item) // 放到rows数组中
      }
      // 返回的数据按照后端接口的规范，真实模拟数据
      return {
        code: 10000,
        message: '获取数据成功',
        data: {
          pageTotal: 5,
          total: 25,
          rows
        }
      }
    }
  },
  {
    url: '/patient/message/list',
    method: 'get',
    timeout: 1000,
    response: () => {
      const data: {
        id: string
        avatar: string
        title: string
        lastContent: string
        sendTime: string
      }[] = []
      for (let i = 0; i < 10; i++) {
        data.push(
          Mock.mock({
            id: '@id',
            avatar: '@image("100x100")', // 随机生成图片，并指定宽和高
            title: '@ctitle(3,10)',
            lastContent: '@ctitle(10,40)',
            sendTime: '@datetime()' // 随机生成时间
          })
        )
      }
      return {
        code: 10000,
        message: '获取数据成功',
        data
      }
    }
  }
]

export default rules
