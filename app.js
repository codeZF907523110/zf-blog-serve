/*
 * @Author: zhangfeng16 zhangfeng16@shuidi-inc.com
 * @Date: 2022-12-26 15:20:22
 * @LastEditors: 流觞曲水 907523110@qq.com
 * @LastEditTime: 2023-02-06 16:09:52
 * @FilePath: /zf-blog-server/app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Koa=require('koa')
const koaBody=require('koa-body')
const static= require('koa-static')
const fs = require('fs')
const https = require('http')
const enforceHttps = require('koa-sslify')
const app=new Koa()
const cors = require('koa2-cors')
const blog = require('./router/blog.js')
const label = require('./router/label.js')
const leaveMessage = require('./router/leaveMessage.js')
const userInfo = require('./router/userInfo.js')
//  证书
const options = {
  // key: fs.readFileSync('./static/SSL/9207781_zfblog.top.key'),
  // cert: fs.readFileSync('./static/SSL/9207781_zfblog.top.pem')
}
// 静态路由
app.use(static('./static'))
app.use(koaBody({ 
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
  }
}))
app.use(cors({
  origin:"*", // 允许来自指定域名请求
  maxAge: 5, // 本次预检请求的有效期，单位为秒。
  methods:['GET','POST'],  // 所允许的HTTP请求方法
  alloweHeaders:['Conten-Type'], // 服务器支持的所有头信息字段
  credentials: true // 是否允许发送Cookie
}))
//启动路由
app.use(blog.routes()).use(label.routes()).use(leaveMessage.routes()).use(userInfo.routes())

app.use(async ctx => {
  ctx.body = 'Hello koa'
});

https.createServer(options, app.callback()).listen(3006,()=>{
  console.log('run 3006')
},'0.0.0.0')