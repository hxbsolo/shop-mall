import http from '../../utils/network';
// CartList 获取购物车的数据
import {CartList} from '../../config/config';
Page({
  data:{
    cartList:[],//商品
    cartTotal:{}, //总价格/总数量
    edit:false,//编辑状态
    edittext:'编辑',//编辑/完成
    push:'下单',//下单/删除所选
  },
  onShow(opations){
    this.getAll();
  },
  async getAll(){
    const res = await http(CartList);
    res.data.cartList.forEach(v=>{
      v.retail_price = `¥${v.retail_price}`
      v.number = `x${v.number}`
    })
    res.data.cartTotal.checkedGoodsAmount=`¥${res.data.cartTotal.checkedGoodsAmount}`
    res.data.cartTotal.goodsAmountgoodsAmount=`¥${res.data.cartTotal.goodsAmountgoodsAmount}`
    this.setData({
      cartList:res.data.cartList,
      cartTotal:res.data.cartTotal
    })
  },
  //点击编辑
  changeedit(){
    if(!this.data.edit){
      this.setData({
        edit:!this.data.edit,
        edittext:'完成',
        push:'删除所选'
      })
    }else{
      this.setData({
        edit:!this.data.edit,
        edittext:'编辑',
        push:'下单'
      })
      this.getAll();
    }
  },
  //单选按钮
  setstatus(){

  },
  //全选按钮
  allstatus(){
    
  }
})