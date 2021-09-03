import http from '../../utils/network';
import {
  GoodsCategory,
  GoodsList,
  CatalogList
} from '../../config/config';
Page({
  data: {
    id: true,
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
    //类别
      const nav = await http(GoodsCategory, {
        id: this.data.id
      });
    //类别相关商品
    const res = await http(GoodsList,{categoryId:this.data.id,page:this.data.page,size:this.data.size})
    this.setData({
      goodlist:res.data.data,
      navlist: nav.data.brotherCategory,
      currentCategory: nav.data.currentCategory,
    })
  },
  //nav 点击切换商品
  switchcategories(e){
    this.setData({
      id:e.currentTarget.dataset.id
    })
    this.getAll();
  }
})