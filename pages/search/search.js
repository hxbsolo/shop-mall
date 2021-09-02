import http from '../../utils/network';
import {
  SearchIndex,
  GoodsList,
  SearchClearHistory,
  SearchHelper
} from '../../config/config';
Page({
  data: {
    defaultKeyword: {}, //placeholder
    historyKeywordList: [], //搜索历史
    hotKeywordList: [], //热门搜索
    current: false, // 搜索商品 热门/历史 隐藏
    type: {}, //搜索商品请求参数
    shopList: [], //搜索商品列表
    vaguelist: [], //模糊搜索列表
    keyword: '', //商品类型
    page: 1, //页数
    sort: 'default', //综合/价格/分类(default/price)
    order: '', //asc desc 升/降价格
    categoryId: 0, //分类具体分类 传入相应id
    filterCategory:[],//商品具体分类
    cateIndex:0,
    catecurrent:true,
    cateIndex:0,
    key:''
  },
  onLoad(options) {
    this.getAll()
  },
  async getAll() {
    const res = await http(SearchIndex);
    //模糊搜索商品
    if (this.data.keyword !== '') {
      const vague = await http(`${SearchHelper}?keyword=${this.data.keyword}`)
      this.setData({
        vaguelist: vague.data
      })
    }
    this.setData({
      defaultKeyword: res.data.defaultKeyword,
      hotKeywordList: res.data.hotKeywordList,
      historyKeywordList: res.data.historyKeywordList,
    })
  },
  //请求相应商品
  async getData() {
    const res = await http(GoodsList, {
      keyword: this.data.keyword,
      page: this.data.page,
      sort: this.data.sort,
      order: this.data.order,
      categoryId: this.data.categoryId
    })
    this.setData({
      shopList: res.data.data,
      filterCategory:res.data.filterCategory,
      current: true
    })
  },
  ToBack() {
    wx.navigateBack()
  },
  //input内容发生变化
  //热门/历史显隐,商品列表展示,模糊搜索
  inputChange(e) {
    if (e.detail.value.length > 0) {
      this.getAll(e.detail.value)
      this.setData({
        current: true,
        shopList: [],
        type: {}
      })
    } else {
      this.setData({
        key:'default',
        current: false,
        vaguelist: [],
        shopList: [],
      })
    }
  },
  //删除历史记录
  removehistory() {
    this.setData({
      historyKeywordList: []
    })
    http(SearchClearHistory, {}, 'POST').then(res => [
      console.log('clear History')
    ])
  },
  //点击标题 进行搜索
  Changeval(e) {
    this.setData({
        keyword: e.currentTarget.dataset.val,
        current: true
      }),
      this.getData()
  },
  // 清空input
  clearinput() {
    this.setData({
      keyword: '',
      current: false,
      shopList: [],
      vaguelist: [],
      catecurrent:true
    })
  },
  // 监听input 回车请求数据
  onKeywordConfirm(e) {
    console.log(e)
    if(this.data.key == 'default'|| e.detail.value == '' ){
      this.setData({
        keyword:this.data.defaultKeyword.keyword,
        key:''
      })
    }
    this.getData()
    this.getAll()
  },
  //聚焦
  clearshoplist() {
    this.setData({
      catecurrent:true
    })
    console.log(this.keyword !=='')
    if (this.data.keyword !== '') {
      this.getAll()
      this.setData({
        shopList: []
      })
    }
  },
  //商品重新过滤拍排序
  shopSortFilter(e) {
    const type = e.currentTarget.dataset.current
    switch(type){
      case 'catecurrent':
        this.setData({
          catecurrent:!this.data.catecurrent,
          order:'desc'
        })
        this.getData()
      break;
      case 'price':
      let temorder = 'desc';
      if(this.data.order == 'desc'){
        temorder = 'asc'
      }
      this.setData({
        sort:'price',
        order:temorder,
        page:1,
      })
      this.getData()
      break;
      default:
        this.setData({
          sort:'default',
          currentSortOrder: 'desc',
          catecurrent:true
        }),
        this.getData()
    }
  },
  //分类修改
  changecateIndex(e){
    this.setData({
      cateIndex :e.currentTarget.dataset.i,
      categoryId:e.currentTarget.dataset.id
    })
    this.getData();
  }
})