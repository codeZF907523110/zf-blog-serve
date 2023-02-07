/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2023-01-12 19:15:25
 * @LastEditors: 流觞曲水 907523110@qq.com
 * @LastEditTime: 2023-02-07 19:25:48
 * @FilePath: /zf-blog-server/router/siteInformation.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Router = require('koa-router')
const router = new Router()
const bodyParser = require('koa-bodyparser')
router.use(bodyParser())
const { Label } = require('../module/schema.js')
const { LeaveMessage } = require('../module/schema.js')
const { Blog } = require('../module/schema.js')
const baseUrl = require('../config/baseUrl')

// 获取作者信息
router.get('/api/userInfo/getUserInfo', async (ctx) => {
  const result = {
    userName: '张峰',
    signature: '世上本无难易,为之则易!',
    articlesNumber: 0,
    messageNumber: 0,
    viewsNumber: 0,
    labelsNumber: 0,
    pagesNumber: 4,
    classificationNumber: 3,
    userHeadPicture: `${baseUrl}/headPicture/defaultPicture.jpeg`
  }
  // result.labelsNumber = await Label.find().count()
  // result.messageNumber = await LeaveMessage.find({ parentId: '', isMessage: true }).count()
  // result.articlesNumber = await Blog.find().count()
  ctx.body = {
    result
  }
})
// 获取最新的五条留言
router.post('/api/userInfo/getNewMessage', async (ctx) => {
  let result = {}
  result = await LeaveMessage.find({ parentId: '', isMessage: true }).sort({_id:-1}).limit(6)
  ctx.body = {
    result
  }
})

module.exports = router