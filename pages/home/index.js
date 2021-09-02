import http from '../../utils/network';
import {IndexUrl,GoodsCount} from '../../config/config';
Page({
  data: {
    data:{},
    GoodsCount:0,
    imgs:[
      'http://yanxuan.nosdn.127.net/149dfa87a7324e184c5526ead81de9ad.png',
      'http://yanxuan.nosdn.127.net/e84f2e3b3d39cfdc8af5c3954a877aae.png',
      'http://yanxuan.nosdn.127.net/a3a92057f10e5e6e804c19ef495e3dee.png',
      'http://yanxuan.nosdn.127.net/578ffec952eb25ff072d8ea1b676bfd2.png',
      'http://yanxuan.nosdn.127.net/9126151f028a8804026d530836b481cb.png'
    ]
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
})