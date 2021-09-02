const http = (url, data = {}, method = "GET") => {
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
      }
    })
  })
}
export default http