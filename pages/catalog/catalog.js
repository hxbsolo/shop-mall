import http from '../../utils/network';
import {CatalogList,CatalogCurrent} from '../../config/config';
Page({
  data:{
    categoryList:[],
    currentCategory:[],
    itemType:0,
    id:''
  },
  onLoad(opations){
    this.getAll()
  },
  async getAll(){
    if(this.data.id == ''){
      const list = await http(CatalogList);
      let {categoryList,currentCategory} = list.data;
      this.setData({
        categoryList:categoryList,
        currentCategory:currentCategory
      })
    }else{
      const current = await http(CatalogCurrent,{id:this.data.id});
      this.setData({
        currentCategory:current.data.currentCategory
      })
    }
  },
  //侧边分类
  Cate(e){
    this.setData({
      id:e.currentTarget.dataset.id,
      itemType:e.currentTarget.dataset.i
    })
    this.getAll();
  }
})