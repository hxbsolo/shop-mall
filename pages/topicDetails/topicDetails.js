import {TopicDetail} from '../../config/config';
import http from '../../utils/network';
var WxParse = require('../../lib/wxParse/wxParse.js');
Page({
  data:{
    details:[]
  },
  onLoad(opations){
    this.getAll(opations.id)
  },
  async getAll(id){
    const res = await http(`${TopicDetail}?id=${id}`)
    this.setData({
      details:res.data
    })
    var article = '<div>我是HTML代码</div>';
var that = this;
WxParse.wxParse('article', 'html', article, that, 5);
  }
})