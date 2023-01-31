/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2023-01-12 15:37:47
 * @LastEditors: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @LastEditTime: 2023-01-13 18:33:35
 * @FilePath: /zf-blog-server/router/label.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Router = require('koa-router')
const router = new Router()
const bodyParser = require('koa-bodyparser')
router.use(bodyParser())
const { Label } = require('../module/schema.js')

// 添加标签
router.post('/api/label/addLabel', async (ctx) => {
  let result = {}
  const { name } = ctx.request.body
  const data = await Label.insertMany({ name })
  if (data) result = { success: true }
  ctx.body = result
})

// 获取标签
router.post('/api/label/getLabels', async (ctx) => {
  let result = {}
  const form = ctx.request.body
  const data = await Label.find(form)
  if (data) result = { result: data, success: true }
  ctx.body = result
})
module.exports = router