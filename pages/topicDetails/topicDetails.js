import {
  TopicDetail,
  CommentList,
  TopicRelated,
  CommentPost
} from '../../config/config';
import http from '../../utils/network';
var WxParse = require('../../lib/wxParse/wxParse.js');
Page({
  data: {
    details: [],//图片
    list:[],//评论
    typeId: 1, //页数
    size: 5, //评论一页的数量
    count:0, // 评论总数
    topic:[],//其他主体
  },
  onLoad(opations) {
    this.setData({
      id:opations.id
    })
    this.getAll(opations.id)
  },
  async getAll(id) {
    const res = await http(`${TopicDetail}?id=${id}`);
    const list = await http(CommentList,{valueId:this.data.id,typeId:this.data.typeId,size:this.data.size})
    const topic = await http(TopicRelated,{id:this.data.id})
    this.setData({
      details: res.data,
      list:list.data.data,
      count:list.data.count,
      topic:topic.data
    })

    var article = this.data.details.content;
    var that = this;
    WxParse.wxParse('article', 'html', article, that, 5);
  }
})