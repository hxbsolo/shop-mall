import http from '../../utils/network';
// CartList 获取购物车的数据
// CartChecked 商品是否选中
// CartDelete 删除商品
// CartUpdate 更新购物车商品  
import { CartList, CartChecked, CartUpdate, CartDelete } from '../../config/config';
Page({
  data: {
    cartList: [],//商品列表
    cartTotal: {}, //总价格/总数量
    editlist: [],//编辑后 渲染商品列表
    editCount: 0,//编辑后,被选中的数量
    edit: false,//编辑状态
    edittext: '编辑',//编辑/完成
    push: '下单',//下单/删除所选
    checkAll: true,//全选状态
    crementStatus: false,
    // query: 
  },
  onLoad() {
    this.getAll(true)
    console.log(this.data.query)
  },
  onShow(opations) {
    this.getAll();
  },
  //请求商品
  async getAll(s) {
    const res = await http(CartList);
    res.data.cartTotal.checkedGoodsAmount = `¥${res.data.cartTotal.checkedGoodsAmount}`
    res.data.cartTotal.goodsAmountgoodsAmount = `¥${res.data.cartTotal.goodsAmountgoodsAmount}`
    this.setData({
      cartList: res.data.cartList,
      cartTotal: res.data.cartTotal,
    })
    this.setData({
      checkAll: this.allchecked(this.data.cartList)
    })
  },
  //修改商品checked
  async checkted(checked, product) {
    const ck = await http(CartChecked, {
      isChecked: checked,
      productIds: product
    }, 'POST');
    let checkedd = ck.data.cartList.every(v => {
      return v.checked
    })
    ck.data.cartTotal.checkedGoodsAmount = `¥${ck.data.cartTotal.checkedGoodsAmount}`
    ck.data.cartTotal.goodsAmountgoodsAmount = `¥${ck.data.cartTotal.goodsAmountgoodsAmount}`
    this.setData({
      checkAll: checkedd,
      cartList: ck.data.cartList,
      cartTotal: ck.data.cartTotal,
    })
  },
  //修改数量
  // async updateshop(data) {
  //   const res = await http(CartUpdate, data, 'POST');
  //   console.log(res)
  // },
  //点击编辑
  changeedit() {
    if (!this.data.edit) {
      const arr = this.data.cartList.map(v => {
        v.checked = false
        return v
      })
      this.setData({
        edit: !this.data.edit,
        edittext: '完成',
        push: '删除所选',
        editlist: arr,
        checkAll: false,
        editCount: 0
      })
    } else {

      this.setData({
        edit: !this.data.edit,
        edittext: '编辑',
        push: '下单',
      })
      this.getAll();
    }
  },
  //单选按钮
  setstatus(e) {
    let ctk = e.currentTarget.dataset.ck
    if (ctk) {
      ctk = 0
    } else {
      ctk = 1
    }
    if (!this.data.edit) {
      this.checkted(ctk, e.currentTarget.dataset.id);
    } else {
      this.data.editlist.forEach((v, k, arr) => {
        if (k == e.currentTarget.dataset.i) {
          v.checked = !v.checked
        }
      })
      this.setData({
        editlist: this.data.editlist,
        editCount: this.quantity(),
        checkAll: this.allchecked(this.data.editlist)
      })
    }
  },
  //全选按钮
  allstatus() {
    this.setData({
      checkAll: !this.data.checkAll
    });
    //获取所有商品的product_id
    if (!this.data.edit) {
      let arr = [];
      this.data.cartList.filter(v => {
        if (v) {
          arr.push(v.product_id)
        }
      })
      this.checkted(this.data.checkAll ? 1 : 0, arr);
    } else {
      this.data.editlist.forEach(i => {
        i.checked = this.data.checkAll
      })
      this.setData({
        editlist: this.data.editlist,
        editCount: this.quantity(),
        checkAll: this.allchecked(this.data.editlist)
      })
    }
  },
  //删除所选
  deletecart() {
    console.log('fffff')
    if (this.data.edit) {
      console.log('sfsfsfsfsf')
      const arr = [];
      this.data.cartList.filter(v => {
        if (v.checked) {
          arr.push(v.product_id)
        }
      })
    }else{
      console.log('pklacesf')
      wx.navigateTo({
        url:'/pages/placeorder/placeorder'
      })
    }
  },
  //购物车商品是否全选
  allchecked(arr) {
    const status = arr.every(v => {
      return v.checked
    })
    return status
  },
  //总数量
  quantity() {
    var total = 0;
    console.log(this.data.editlist)
    this.data.editlist.map(v => {
      if (v.checked) {
        total +=v.number
      }
    })
    return total
  },
  //加
  increment(e) {
    const v = e.currentTarget.dataset.v;
    Number(v.number)
    v.number+=1
    http(CartUpdate, {
      productId: v.product_id,
      goodsId: v.goods_id,
      number: v.number,
      id: v.id,
    },'POST').then(res=>{
      let arr = this.data.editlist;
      res.data.cartList.forEach((v,i)=>[
        arr[i].number = v.number
      ])
      this.setData({
        cartList:res.data.cartList,
        editlist:arr, 
        cartTotal:res.data.cartTotal
      })
    })
  },
  //减
  decrement(e) {
    const v = e.currentTarget.dataset.v;
    Number(v.number)
    if(v.number-1>=1){
      v.number-=1;
    }
    http(CartUpdate, {
      productId: v.product_id,
      goodsId: v.goods_id,
      number: v.number,
      id: v.id,
    },'POST').then(res=>{
      let arr = this.data.editlist;
      res.data.cartList.forEach((v,i)=>[
        arr[i].number = v.number
      ])
      this.setData({
        cartList:res.data.cartList,
        editlist:arr, 
        cartTotal:res.data.cartTotal
      })
    })
  },
  //下单/删除
  deletecart(){
    if(this.data.edit){
      let arr = [];
      this.data.editlist.forEach(v=>{
        if(v.checked){
          arr.push(v.product_id)
        }
      })
      arr = arr.join();
      let that = this;
      http(CartDelete,{productIds:arr},'POST').then(res=>{
        res.data.cartList.forEach(v=>{
          v.checked = false
        });
        that.setData({
          editlist:res.data.cartList,
          cartList:res.data.cartList,
          checkAll:false
        })
        
      })
    }else{
      
    }
  }
})