/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2022-12-26 15:20:22
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-05-30 14:27:13
 * @FilePath: /zf-blog-server/app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { secret } = require('./config/baseData')
const koaJwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const cors = require('koa2-cors')
const Koa=require('koa')
const app = new Koa()
app.use(cors({
  origin: "http://www.zfblog.top",
  credentials: true
}));


const koaBody=require('koa-body')

const blog = require('./router/blog.js')
const label = require('./router/label.js')
const leaveMessage = require('./router/leaveMessage.js')
const userInfo = require('./router/userInfo.js')
const login = require('./router/login.js')
// require('./pushDate')

app.use(koaBody({ 
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
  }
}))

// token验证白名单
const whiteList = [
  '/api/github/login',
  '/api/github/callback',
  '/api/userInfo/getUserInfo',
  '/api/blog/addOpenNum',
  '/api/blog/getAllBlog',
  '/api/label/getLabels',
  '/api/message/getMessages',
  '/api/message/setMessage'
]
// 验证token是否有效
app.use((ctx, next) => {
  if (whiteList.some(item => ctx.request.url.includes(item))) {
    return next()
  }
  if (ctx.header) {
    const token = ctx.cookies.get('token')
    try {
      jwt.verify(token, secret, {
        complete: true
      });
      return next()
    } catch (error) {
      console.log('token不合法', 'error');
      ctx.body = {
        success: false,
        msg: 'token不合法'
      }
    }
  }
});

// 路由权限控制 除了path里的路径不需要验证token 其他都要
// app.use(
//   koaJwt({
//     secret
//   }).unless({
//     path: whiteList
//   })
// )

//启动路由
app.use(blog.routes()).use(label.routes()).use(leaveMessage.routes()).use(userInfo.routes()).use(login.routes())

app.use(async ctx => {
  ctx.body = 'Hello koa'
});

app.listen(3006, () => {
  console.log('run 3006')
}, '0.0.0.0')