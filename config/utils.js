/*
 * @Author: zhangfeng16 907523110@qq.com
 * @Date: 2023-05-25 15:07:35
 * @LastEditors: zhangfeng16 907523110@qq.com
 * @LastEditTime: 2023-05-25 15:41:30
 * @FilePath: /zf-blog-serve/config/utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const jwt = require('jsonwebtoken')
const { secret } = require('./baseData')

exports.getUserInfo = (ctx) => {
  try {
    return jwt.verify(ctx.cookies.get('token'), secret)
  } catch (error) {
    return {}
  }
}