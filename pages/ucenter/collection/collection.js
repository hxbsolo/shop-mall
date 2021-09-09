import http from '../../../utils/network';
import {
  CollectList
} from '../../../config/config';
Page({
  data: {
    list:[]
  },
  onLoad(options) {
    if (wx.getStorageSync('token')) {
      this.getAll();
    } else {
     wx.navigateTo({
       url: '../login/login',
     })
    }
  },
  async getAll(){
    const res = await http(CollectList,{typeId:0})
    console.log(res.data)
    res.data.data.forEach(v=>{
      v.retail_price = '¥'+v.retail_price
    })
    this.setData({
      list:res.data.data
    })
  }
})