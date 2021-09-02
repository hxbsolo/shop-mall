import http from '../../utils/network';
import {CommentCount,CommentList} from '../../config/config';
import { getAllExtensions } from '../../lib/wxParse/showdown';
Page({
  data:{
    valueId: 314,
    typeId: 1,
    size: 20,
    page: 1,
    showType: 0
  },
  onLoad(opations){
    this.setData({
      valueId:opations.valueId,
      typeId:opations.typeId
    })
    this.getAll();
  },
  async getAll(){
    const res = await http(CommentList,{valueId:this.data.valueId,typeId:this.data.typeId,size:this.data.size,page:this.data.page,showType:this.data.showType});
    this.setData({
      list:res.data.data
    })
  }
})