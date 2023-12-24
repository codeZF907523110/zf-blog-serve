/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2022-12-26 15:20:21
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-06-01 15:44:05
 * @FilePath: /zf-blog-server/router/router.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Router = require('koa-router')
const fs = require('fs'); // 图片路径
const path = require('path')
const { getUserInfo } = require('../config/utils')

//数据库模块
const { Blog } = require('../module/schema.js')
const bodyParser = require('koa-bodyparser')
const router = new Router()//实例化router
const { baseUrl } = require('../config/baseData')
router.use(bodyParser())

router.get('/', async (ctx) => {
  ctx.body = '张峰的博客哈哈哈'
})

// 点赞
router.post('/api/blog/giveALike', async (ctx) => {
  const userInfo = getUserInfo(ctx)
  let result = {}
  const form = ctx.request.body
  let data
  // 点赞的情况
  if (form.isAddLikePeople) {
    data = await Blog.updateOne({ _id: form._id }, { $addToSet: { likePeople: userInfo.user } })
  } else {
    data = await Blog.updateOne({ _id: form._id }, { $pull: { likePeople: userInfo.user } })
  }
  if (data) result = { success: true }
  ctx.body = result
})

// 增加文章阅读量
router.post('/api/blog/addOpenNum', async (ctx) => {
  let result = {}
  let { _id, openNum } = ctx.request.body
  await Blog.updateOne({_id}, { $set: { openNum: openNum+1 } }, (err, data) => {
    if (data)  result = { success: true }
  })
  ctx.body = result
})

// 条件查询博客
router.post('/api/blog/getAllBlog', async (ctx) => {
  const form = ctx.request.body
  let result, total
  if (!form.labels) delete form.labels
  try {
    result = await Blog.find({
      labels: form.labels ? form.labels : {$ne: null},
      _id: form._id ? form._id : {$ne: null}
    }).sort({_id: -1}).skip((form.pageNum - 1)*form.pageSize).limit(form.pageSize)
  } catch (error) {
  }
  try {
    total = await Blog.find({}).countDocuments()
  } catch (error) {
  }
  ctx.body = {
    result,
    total
  }
})

// 上传封面图片
router.post('/api/blog/uploadPictures', async (ctx) => {
  const file = ctx.request.files.file
  const fileNames = file.name.split('.')
  const reader = fs.createReadStream(file.path)
  const coverUrl = `/zfBlogStatic/cover/${fileNames[0]}${new Date().getTime()}.${fileNames[1]}`
  // 创建可写流
  const upStream = fs.createWriteStream(`/usr/local${coverUrl}`)
  // 可读流通过管道写入可写流
  reader.pipe(upStream)
  ctx.body={
    coverUrl: baseUrl+coverUrl
  }
})

// 新增博客
router.post('/api/blog/saveBlog', async (ctx) => {
  const body = ctx.request.body
  const fileUrl = `/zfBlogStatic/md/${body.title}${new Date().getTime()}.md`
  fs.writeFile(`/usr/local${fileUrl}`, body.text, (err, data) => {})
  await Blog.insertMany({
    ...body,
    blogUrl: baseUrl+fileUrl
  })
  ctx.body={
    msg: '发布成功',
    success: true
  }
})

// 编辑博客
router.post('/api/blog/editBlog', async (ctx) => {
  const body = ctx.request.body
  const fileUrl = `/zfBlogStatic/md/${body.title}${new Date().getTime()}.md`
  fs.writeFile(`/usr/local${fileUrl}`, body.text, (err, data) => {})
  body.blogUrl = baseUrl+fileUrl
  await Blog.updateOne({ _id: body._id }, { $set: body })
  ctx.body = {
    msg: '修改成功',
    success: true
  }
})

module.exports = router


