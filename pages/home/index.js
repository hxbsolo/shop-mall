import http from '../../utils/network';
import {IndexUrl,GoodsCount} from '../../config/config';
Page({
  data: {
    data:{},
    GoodsCount:0
  },
  async getAll(){
    const res = await http(IndexUrl);
    const Count = await http(GoodsCount);
    this.setData({
      data:res.data,
      GoodsCount:Count.data.goodsCount
    })
  },
  onLoad: function (options) {
    this.getAll()
  },
  //跳转商品搜索页面
  Tosearch(){

  },
})