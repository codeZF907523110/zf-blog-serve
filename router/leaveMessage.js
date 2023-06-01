/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2023-01-12 20:05:03
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-06-01 15:45:13
 * @FilePath: /zf-blog-server/router/leaveMessage.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Router = require('koa-router')
const router = new Router()
const bodyParser = require('koa-bodyparser')
router.use(bodyParser())
const { LeaveMessage } = require('../module/schema.js')
const { Blog } = require('../module/schema.js')
const { baseUrl } = require('../config/baseData')
const { getUserInfo } = require('../config/utils')

// 获取留言或评论（此处不需要递归，只需要将parentId改完最上层的留言即可）
router.post('/api/message/getMessages', async (ctx) => {
  const form = ctx.request.body
  let result = {}
  // 获取最外一层的message
  const data = await LeaveMessage.find({ ...form, parentId: '' }).sort({ _id: -1 })
  for (let item of data) {
    item.sub = await LeaveMessage.find({ parentId: item.id })
  }
  if (data) result = { result: data, success: true }
  ctx.body = result
})

// 留言或评论
router.post('/api/message/setMessage', async (ctx) => {
  const userInfo = getUserInfo(ctx)
  let result = {}
  const form = ctx.request.body
  form.userHeadPicture = userInfo.icon || `${baseUrl}/zfBlogStatic/headPicture/defaultPicture.jpeg`
  form.userName = userInfo.user || `尊敬的游客大人${new Date().getTime()}`
  const data = await LeaveMessage.insertMany({ ...form })
  if (data) result = { success: true }
  if (form.articleId && !form.parentId) {
    const data = await Blog.find({ _id: form.articleId })
    const { commentNum } = data[0]
    await Blog.updateOne({ _id: form.articleId }, { $set: { commentNum: commentNum+1} })
  }
  ctx.body = result
})

// 点赞
router.post('/api/message/giveALike', async (ctx) => {
  const userInfo = getUserInfo(ctx)
  let result = {}
  const form = ctx.request.body
  let data
  // 点赞的情况
  if (form.isAddLikePeople) {
    data = await LeaveMessage.updateOne({ _id: form.parentId }, { $addToSet: { likePeople: userInfo.user } })
  } else {
    data = await LeaveMessage.updateOne({ _id: form.parentId }, { $pull: { likePeople: userInfo.user } })
  }
  if (data) result = { success: true }
  ctx.body = result
})

module.exports = router