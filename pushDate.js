var request = require('request'); //request请求模块
var schedule = require('node-schedule'); //定时执行模块
let appID = 'wxfc5f5fc95bb3e405' //测试号appID（写你自己的）
let appsecret = '51d89e08da50e0c4140cdf75c78d53af' //测试号appsecret（写你自己的）

let getAccessToken = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}` //获取AccessToken
let getWeather = `https://www.yiketianqi.com/free/day?appid=43656176&appsecret=I42og6Lm&unescape=1&city=${encodeURI('北京')}` //获取指定地区天气（写你自己的）
let sendMessage = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' //发送模板

function getTargetTime(t) { //获取指定日期到今天的天数
  date = new Date();
  nowDate = new Date();
  date.setYear(t.split("-")[0])
  date.setMonth(t.split("-")[1] - 1)
  date.setDate(t.split("-")[2])
  if (nowDate.getTime() > date.getTime()) {
    return (nowDate.getTime() - date.getTime()) / (1000 * 3600 * 24)
  } else {
    return (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24)
  }
}

function coloring() { //随机颜色
  return '#' + (Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'))
}

let AccessToken = new Promise((res, rej) => { //获取微信AccessToken
  request({
      url: getAccessToken,
      method: "get",
      json: true,
      headers: {
        "content-type": "application/json"
      },
    },
    (error, response, body) => {
      if (!error) {
        res(body.access_token)
      }
    });
});

let Weather = new Promise((res, rej) => { //获取指定地区天气
  request({
      url: getWeather,
      method: "get",
      json: true,
      headers: {
        "content-type": "application/json"
      },
    },
    (error, response, body) => {
      if (!error) {
        res(body)
      }
    });
});

// let Statements = new Promise((res, rej) => { //获取每日一句
//   request({
//       url: getStatements,
//       method: "get",
//       json: true,
//       headers: {
//         "content-type": "application/json"
//       },
//     },
//     (error, response, body) => {
//       if (!error) {
//         res(body.data.content)
//       }
//     });
// });
//测试的时候可以改为    3 * * * * *   每分钟的第三秒执行一次
schedule.scheduleJob(' * * 8 * * *', () => { //每天早上7点执行一次
  Promise.all([AccessToken, Weather]).then((res) => {
    let data = {
      touser: 'olCFH6GVsm8z3wFbUNvJdFCn1_E4', //发送人的微信号ID（写你自己的）
      template_id: 'mUucP3qJK5exhXnvVKnhjTcKLDYTzcjZMSpbHknrIiI', //测试模板的ID（写你自己的）
      data: {
        data1: { //多少天
          value: String(getTargetTime('2022-08-04')), //设置在一起的日子，格式别变
          color: coloring()
        },
        remake: { //备注
          value: '比昨天更爱你的一天',
          color: coloring()
        },
        content: { //每日一句
          value: res[2],
          color: coloring()
        },
        city: { //城市
          value: res[1].city,
          color: '#000'
        },
        date: { //当前日期
          value: res[1].date,
          color: '#000'
        },
        week: { //星期几
          value: res[1].week,
          color: '#000'
        },
        wea: { //天气
          value: res[1].wea,
          color: coloring()
        },
        win: { //什么风
          value: res[1].win,
          color: coloring()
        },
        win_speed: { //风力
          value: res[1].win_speed,
          color: coloring()
        },
        win_meter: { //分速
          value: res[1].win_meter,
          color: coloring()
        },
        tem_day: { //最高温度
          value: res[1].tem_day,
          color: coloring()
        },
        tem_night: { //最低温度
          value: res[1].tem_night,
          color: coloring()
        },
        pressure: { //气压值
          value: res[1].pressure,
          color: coloring()
        },
        humidity: { //相对湿度
          value: res[1].humidity,
          color: coloring()
        },
      }
    }
    request({
        url: sendMessage + res[0],
        method: "post",
        json: true,
        headers: {
          "content-type": "application/json"
        },
        body: data
      },
      (error, response, body) => {
        if (!error) {
          if (body.errcode == 0) {
            console.log('发送成功！！！')
          }
        }
      });
  })
});
console.log('运行成功，等待程序发送中........')

//模板示例
// {{remake.DATA}}

// {{date.DATA}}  {{week.DATA}}

// {{city.DATA}}天气：{{wea.DATA}}，{{win.DATA}}
// 风力：{{win_speed.DATA}}
// 风速：{{win_meter.DATA}}
// 温度：{{tem_night.DATA}}℃~{{tem_day.DATA}}℃
// 气压值：{{pressure.DATA}}
// 相对湿度：{{humidity.DATA}}

// 我们已经恋爱了：{{data1.DATA}}天

// {{content.DATA}}
