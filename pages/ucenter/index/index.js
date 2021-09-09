import { AuthLoginByWeixin } from '../../../config/config';
import http from '../../../utils/network';
const app = getApp();
Page({
  data: {
    user_menu: [
      { name: '我的订单', url: '../order/order', img: 'item_order' },
      { name: '优惠券', url: '../discount/discount', img: 'item_discount' },
      { name: '礼品卡', url: '../gift/gift', img: 'item_gift' },
      { name: '我的收藏', url: '../collection/collection', img: 'item_Collection' },
      { name: '我的足迹', url: '../footprint/footprint', img: 'item_footprint' },
      { name: '会员福利', url: '../member/member', img: 'item_member' },
      { name: '地址管理', url: '../address/address', img: 'item_address' },
      { name: '账号安全', url: '../security/security', img: 'item_account' },
      { name: '联系客服', url: '../customer/customer ', img: 'item_customer' },
      { name: '帮助中心', url: '../help/help', img: 'item_help' },
      { name: '意见反馈', url: '../opinion/opinion', img: 'item_feedback' }
    ],
    openid: null,
    session_key: null,
    code: null,
    userInfo: null
  },
  onLoad(opations) {
    if (wx.getStorageSync('userInfo')) {
      this.getInfo();
    }
  },
  onShow() {
    if (wx.getStorageSync('userInfo')) {
      this.getInfo();
    }
  },
  ToLogin() {
    if (wx.getStorageSync('userInfo')) {
      wx.showToast({
        title: '已登录'
      })
    } else {
      wx.navigateTo({
        url: '../login/login',
      });
    }
  },
  getInfo() {
    const user = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: user
    })
  },
  //退出登录
  signout(){
    wx.clearStorageSync();
    this.setData({
      userInfo: null
    })
    wx.showToast({
    title:'已退出'
    })
  }
})