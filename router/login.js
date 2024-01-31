const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const router = new Router()
const axios = require('axios')
const querystring = require("querystring")
const bodyParser = require('koa-bodyparser')
router.use(bodyParser())
const { getUserInfo } = require('../config/utils')
const { adminList } = require('../config/baseData')

const config = {
  client_id: '0d93b9312fe7245afd1e', //github生成的ID及密码
  client_secret: '8ae014b0f570d796c081578386e5baacb0b6e69b'
};
let redirectPath = ''


// github登录
router.get('/api/github/login', async (ctx) => {
  if (ctx.query.path) redirectPath = ctx.query.path
  //重定向到认证接口,并配置参数
  var path = "https://github.com/login/oauth/authorize";
  path += '?client_id=' + config.client_id;
  //将地址及参数返回前端
  ctx.body = {
    path
  }
});

// QQ登录回调
router.get('/api/qq/callback', async(ctx) => {
  ctx.body = {
    success: true
  }
  ctx.redirect('http://www.zfblog.top/display/technology?label=%E5%85%A8%E9%83%A8')
})

// QQ登录
router.get('/api/QQ/login', async(ctx) => {
  const { access_token, expires_in } = ctx.query
  // client_id: appid，openid
  let { data } = await axios.get(`https://graph.qq.com/oauth2.0/me?access_token=${access_token}&fm=json`)
  const jsonStr = data.replace('callback(', '').replace(')', '').replace(';', '').trim(); // 去掉开头的callback和结尾的括号  
  const obj = JSON.parse(jsonStr);
  const client_id = obj.client_id; // 102086457  
  const openid = obj.openid; // 768C400BA6E3B19E2EAD6B3B87CBFC88  
  let res = await axios.get(`https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${client_id}&openid=${openid}`)
  const user = encodeURI(res.data.nickname)
  const icon = res.data.figureurl
  const { secret } = require('../config/baseData')
  const payload = {user, icon}
  const token = jwt.sign(payload, secret, { expiresIn:  '24h' });
  ctx.cookies.set('user', user, { httpOnly: false, maxAge: 86400000, domain: 'zfblog.top' }) //用户名称
  ctx.cookies.set('icon', icon, { httpOnly: false, maxAge: 86400000, domain: 'zfblog.top' }) //用户图片
  ctx.cookies.set('token', token, { maxAge: 86400000, domain: 'zfblog.top' }) //设置token
  // ctx.redirect('http://www.zfblog.top/')
  ctx.body = {
    success: true
  }
})

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
  // console.log(res, '这是登录信息哦')
  const { secret } = require('../config/baseData')
  const payload = {user: res.data.login, icon: res.data.avatar_url}
  const token = jwt.sign(payload, secret, { expiresIn:  '24h' });
  // ctx.body = res.data
  ctx.cookies.set('user', res.data.login, { httpOnly: false, maxAge: 86400000, domain: 'zfblog.top' }) //用户名称
  ctx.cookies.set('icon', res.data.avatar_url, { httpOnly: false, maxAge: 86400000, domain: 'zfblog.top' }) //用户图片
  ctx.cookies.set('token', token, { maxAge: 86400000, domain: 'zfblog.top' }) //设置token
  ctx.body = {
    success: true,
    msg: '登录成功'
  }
})

// 登出
router.get('/api/logOut', async (ctx) => {
  ctx.cookies.set('user', '', { httpOnly: false, maxAge: 0, domain: 'zfblog.top' }) //用户名称
  ctx.cookies.set('icon', '', { httpOnly: false, maxAge: 0, domain: 'zfblog.top' }) //用户图片
  ctx.cookies.set('token', '', { maxAge: 0, domain: 'zfblog.top' }) //设置token
  ctx.body = { success: true }
})

// 判断是否是Admin
router.get('/api/getIsAdmin', async (ctx) => {
  const result = { isAdmin: false }
  const { user } = getUserInfo(ctx)
  if (adminList.includes(user)) result.isAdmin = true
  ctx.body = {
    data: result,
    success: true
  }
})

module.exports = router