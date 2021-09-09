// components/pages/cart/index.js
import  { CartList } from '../../config/config';
// import _ from 'underscore'
import 
  http
from '../../utils/network'
Page({
  /**
   * 组件的属性列表
   */

  /**
   * 组件的初始数据
   */
  data: {
    obj: null,
    productIds: '',
    editStatus: false,
    _obj: null,
    editAllChoose: false,
    editNum: 0,
    editProductIds: [],
    num: -1
  },
  // observers: {
  //   //监听编辑状态下，cartlist的状态变化
  //   '_obj.**': function (val) {
  //     let status = val.editCartList.every(item => item.checked === 1)
  //     let arr = []
  //     val.editCartList.map(item => {
  //       if(item.checked){
  //         arr.push(item.product_id)
  //       }
  //     })
  //     this.setData({
  //       editAllChoose: status,//编辑状态的全选与否
  //       editNum: this.getCheckedNum(),//编辑状态下的选中商品数
  //       editProductIds: arr.join()//编辑状态下选中商品productIds
  //     })
  //   }
  // },

  /**
   * 组件的方法列表
   */
  onLoad(options) {
    this.getCart();
  },
  //获取购物车商品列表
  async getCart() {
    const res = await http(CartList)
    let arr = []
    res.data.cartList.map(item => {
      arr.push(item.product_id)
    })
    this.setData({
        obj: res.data,
        productIds: arr.join()
    })
  }
})