const mongoose=require('mongoose')
let url = "mongodb+srv://zhangfeng:zf1234..@cluster0.rmkvqrx.mongodb.net/zfBlog"
const Schema = mongoose.Schema
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if(err){
    console.log(err)
    return
  }
  console.log('连接成功')
})
// 博客
const Blog = new Schema({
  author: { //作者
    type: String,
    default: ''
  },
  blogUrl: { //文章地址
    type: String,
    default: ''
  },
  title: { // 标题
    type: String,
    default: ''
  },
  coverUrl: { // 封面url
    type: String,
    default: ''
  },
  abstract: { // 摘要
    type: String,
    default: ''
  },
  classifiedColumn: { //分类专栏
    type: String,
    default: ''
  },
  labels: { //标签
    type: Array,
    default: () => []
  },
  articleType: { //文章类型
    type: String,
    default: ''
  },
  likePeople: { //点赞人
    type: Array,
    default: () => []
  },
  releaseTime: { //发布时间
    type: String,
    default: ''
  },
  commentNum: { //评论数量
    type: Number,
    default: 0
  },
  openNum: { //阅读量
    type: Number,
    default: 0
  }
})
// 标签
const Label = new Schema({
  name: {
    type: String,
    default: '',
    unique:true
  },
  parentLevel: {
    type: Array,
    default: () => []
  },
  articleNum: {
    type: Number,
    default: 0
  }
})
// 用户信息
const UserInfo = new Schema({
  
})
// 留言或者评论
const LeaveMessage = new Schema({
  content: { //评论内容
    type: String,
    default: ''
  },
  createTime: { //评论时间
    type: String,
    default: ''
  },
  userHeadPicture: { //用户头像
    type: String,
    default: ''
  },
  userName: { //用户名
    type: String,
    default: ''
  },
  articleId: { //文章id
    type: String,
    default: ''
  },
  isMessage: { //是否是留言，留言true，评论false
    type: Boolean,
    default: false
  },
  parentId: { //父级留言或评论的id
    type: String,
    default: ''
  },
  reviewerUserName: { //被评论人用户名
    type: String, 
    default: ''
  },
  reviewerId: {
    type: String,
    default: ''
  },
  likePeople: { //点赞的人
    type: Array,
    default: () => []
  },
  sub: {
    type: Array,
    default: () => []
  }
})
//发布模型
exports.Blog = mongoose.model('Blog', Blog)
exports.Label = mongoose.model('Label', Label)
exports.LeaveMessage = mongoose.model('LeaveMessage', LeaveMessage)
