/*
 * @Author: zhangfeng16 907523110@qq.com
 * @Date: 2023-05-06 11:10:14
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-05-06 15:38:03
 * @FilePath: /zf-blog-serve/router/login.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Router = require('koa-router')
const router = new Router()
const axios = require('axios')
const querystring = require("querystring")
const bodyParser = require('koa-bodyparser')
router.use(bodyParser())


const config = {
  client_id: '0d93b9312fe7245afd1e', //github生成的ID及密码
  client_secret: '8ae014b0f570d796c081578386e5baacb0b6e69b'
};
let redirectPath = ''
router.get('/api/github/login', async (ctx) => {
  if (ctx.query.path) redirectPath = ctx.query.path
  var dataStr = (new Date()).valueOf();
  //重定向到认证接口,并配置参数
  var path = "https://github.com/login/oauth/authorize";
  path += '?client_id=' + config.client_id;
  //将地址及参数返回前端
  ctx.body = path;
});
//认证后的github回调
router.get('/api/github/callback', async (ctx) => {
  console.log('callback...')
  const code = ctx.query.code; //返回的授权码
  const params = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    code: code
  }
  //使用这个授权码，向 GitHub 请求令牌
  let res = await axios.post('https://github.com/login/oauth/access_token', params)
  const access_token = querystring.parse(res.data).access_token
  //再通过令牌获取用户信息
  res = await axios.get('https://api.github.com/user', {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
      Authorization: `token ${access_token}`
    }
  })
  // ctx.body = res.data
  ctx.cookies.set('user', res.data.login) //用户名称
  ctx.cookies.set('icon', res.data.avatar_url) //用户图片
  ctx.redirect(redirectPath) //重定向到请求页面
})

module.exports = router