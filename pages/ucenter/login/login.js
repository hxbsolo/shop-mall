import http from '../../../utils/network';
import { AuthLoginByWeixin } from '../../../config/config';
Page({
  onLoad(opations) {

  },
  GetUserInfo(e) {
    let that = this;
    console.log(e.detail.errMsg == 'getUserInfo:ok')
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.login({
        success(res) {
          that.setData({
            code: res.code
          }, () => {
            that.getUser(e.detail)
          })
        }
      })
    } else {
      wx.showToast({
        title: '微信登录失败'
      })
    }

    // wx.login({
    //   success(res) {
    //     that.setData({
    //       code: res.code
    //     }, () => {
    //       console.log(e)
    //       wx.getUserInfo({
    //         withCredentials: 'false',
    //         lang: 'zh_CN',
    //         timeout: 10000,
    //         success: (result) => {
    //           console.log(result)
    //           that.setData({
    //             userInfo: result
    //           }, () => {
    //             that.getUser();
    //           })
    //         },
    //         fail: () => { },
    //         complete: () => { }
    //       });
    //     })
    //     wx.request({
    //       url: "https://api.weixin.qq.com/sns/jscode2session",
    //       data: {
    //         appid: 'wx6b421b50bf500174',
    //         secret: '165ddbe0c601021803a55b6369e17146',
    //         js_code: res.js_code,
    //         grant_type: 'authorization_code'
    //       },
    //       success(res) {
    //         if (res.statusCode == '200') {
    //           if (res.errMsg == "request:ok") {
    //             that.setData({
    //               openid: res.data.openid,
    //               session_key: res.data.session_key
    //             })
    //           }
    //         }
    //       }
    //     })
    //   }
    // })

    //弹出授权框 获取userinfo
    //新版本授权
    // wx.getUserProfile({
    //   lang: 'zh_CN',
    //   desc: '授权登录',
    //   success(res) {
    //     console.log(res)
    //     that.setData({
    //       userInfo: res
    //     }, () => {
    //       // 携带 code/userInfo 请求登录
    //       that.getUser();
    //     })
    //   }
    // });
  },
  async getUser(userinfo = this.data.userInfo) {
    const res = await http(AuthLoginByWeixin, { code: this.data.code, userInfo: userinfo }, 'POST');
    if (res.data.token) {
      // 成功存储token
      wx.setStorageSync('token',res.data.token)
      wx.setStorageSync('userInfo',res.data.userInfo)
      wx.navigateBack({
      });
    }else{
      wx.showToast({
        title: '后台返回失败'
      })
    }
  }
})