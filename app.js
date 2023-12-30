/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2022-12-26 15:20:22
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-06-06 20:17:35
 * @FilePath: /zf-blog-server/app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { secret } = require('./config/baseData')
const jwt = require('jsonwebtoken')
const cors = require('koa2-cors')
const Koa=require('koa')
const app = new Koa()
const serve = require('koa-static')

app.use(cors({
  origin: "http://www.zfblog.top",
  // origin: "http://localhost:5000",
  credentials: true
}));
app.use(serve('/usr/local'))


const koaBody=require('koa-body')

const blog = require('./router/blog.js')
const label = require('./router/label.js')
const leaveMessage = require('./router/leaveMessage.js')
const userInfo = require('./router/userInfo.js')
const login = require('./router/login.js')
const { getUserInfo } = require('./config/utils.js')
const { adminList } = require('./config/baseData')

// require('./pushDate')

app.use(koaBody({ 
  multipart: true,
  formidable: {
    maxFileSize: 1000 * 1024 * 1024 // 设置上传文件大小最大限制，默认10M
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
  '/api/message/setMessage',
  '/zfBlogStatic',
  '/api/logOut'
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

const authRouterList = [
  '/api/blog/editBlog',
  '/api/blog/uploadPictures',
  '/api/blog/saveBlog',
  '/api/label/addLabel',
  '/api/label/getLabels'
]

app.use((ctx, next) => {
  if (authRouterList.some(item => !ctx.request.url.includes(item))) {
    return next()
  }
  const { user } = getUserInfo(ctx)
  if (!adminList.includes(user)) {
    console.log(user, '无操作权限啊')
    ctx.body = {
      success: false,
      message: '无操作权限'
    }
  } else {
    return next()
  }
})

//启动路由
app.use(blog.routes()).use(label.routes()).use(leaveMessage.routes()).use(userInfo.routes()).use(login.routes())


app.use(async ctx => {
  ctx.body = 'Hello koa'
});

app.listen(3006, () => {
  console.log('run 3006')
}, '0.0.0.0')