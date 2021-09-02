import http from '../../utils/network';
import {
  GoodsCategory,
  GoodsList,
  CatalogList
} from '../../config/config';
Page({
  data: {
    id: '',
    page: 1,
    size: 50
  },
  onLoad(opations) {
    if (opations.id) {
      this.setData({
        id: opations.id
      })
    }
    this.getAll();
  },
  async getAll() {
    const nav = await http(GoodsCategory, {
      id: this.data.id
    });
    const res = await http(GoodsList,{categoryId:this.data.id,page:this.data.page,size:this.data.size})
    this.setData({
      navlist: nav.data.brotherCategory,
      currentCategory: nav.data.currentCategory,
      goodlist:res.data.data
    })
  }
})