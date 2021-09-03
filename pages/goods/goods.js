import http from '../../utils/network';
// CartGoodsCount 获取购物车商品数量
// GoodsDetail  获取商品详情 传入id
// GoodsRelated 商品详情关联商品 传入id
// CartAdd 添加购物车
// 参数   goodsId(商品ID): 1147048  number(商品数量): 1 productId(商品id请求过来的productid): 228
import { GoodsDetail, CartGoodsCount, GoodsRelated, CartAdd } from '../../config/config';
// 富文本
var WxParse = require('../../lib/wxParse/wxParse.js');
Page({
  data: {
    id: true,//根据获取到的id请求数据
    detail: [],//详情页总数据
    cartGoodsCount: 0, //购物车商品的数量
    goodslist: [], //相关联商品
    openAttr: false,//决定是否弹出
    checkedSpecText: '请选择规格参数',
    number: 1, //绑定商品数量
  },
  onLoad(opations) {
    if(opations.id){
      this.setData({
        id:opations.id
      })
    }
    this.getAll();
  },
  async getAll() {
    if (this.data.id) {
      const res = await http(GoodsDetail, { id: this.data.id });
      const count = await http(CartGoodsCount);
      const related = await http(GoodsRelated, { id: this.data.id })
      res.data.info.retail_price = `¥${res.data.info.retail_price}`;
      this.setData({
        detail: res.data,
        cartGoodsCount: count.data.cartTotal.goodsCount,
        goodslist: related.data.goodsList
      })
      var article = this.data.detail.info.goods_desc;
      var that = this;
      WxParse.wxParse('article', 'html', article, that, 5);
    }
  },
  //选择规格
  setAttrPop() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      })
    }
  },
  // 叉关闭弹窗
  closeAttr() {
    if (this.data.openAttr) {
      this.setData({
        openAttr: !this.data.openAttr
      })
    }
  },
  //数量减少
  cutNumber() {
    let cut = this.data.number;
    cut--
    if (cut >= 1) {
      this.setData({
        number: cut
      })
    }
  },
  //数量增加
  addNumber() {
    let cut = this.data.number;
    cut++
    this.setData({
      number: cut
    })
  },
  //向购物车添加商品
  addToCart() {
    if (this.data.openAttr  ) {
      this.addCart();
    } else {
      this.setData({
        openAttr: true
      })
    }
  },
  //推送商品
  addCart() {
    let _this = this;
    wx.request({
      url:CartAdd,
      data: { goodsId: _this.data.id, number: _this.data.number, productId: _this.data.detail.productList[0].id },
      method: 'POST',
      success: (result) => {
        if (result.data.errno == 0) {
          wx.showToast({
            title: '添加成功'
          });
          _this.setData({
            openAttr:false,
            cartGoodsCount: result.data.data.cartTotal.goodsCount
          })
        } else {
          wx.showToast({
            image: '/static/images/icon_error.png',
            title: result.errmsg,
            mask: true
          });
        }
      },
    });
  }
})