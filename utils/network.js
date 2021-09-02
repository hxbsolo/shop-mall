const http = (url, data = {}, method = "GET") => {
  wx.showLoading({
    title: '加载中',
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      method,
      success(res) {
        if (res.statusCode === 200) {
          if (res.data.errno === 0) {
            resolve(res.data)
          } else {
            wx.showToast({
              title: res.data.errmsg,
            })
          }
        } else {
          wx.showToast({
            title: res.data.errmsg,
          })
        }
      },
      fail(err) {
        wx.showToast({
          title: err,
        })
        reject(err)
      },
      complete(){
        wx.hideLoading()
      }
    })
  })
}
export default http