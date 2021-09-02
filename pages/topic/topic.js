import {TopicList} from '../../config/config';
import getAll from '../../utils/network'
Page({
  data:{
    topic:[],
    page:1,
    size:10
  },
  onLoad(opations){
    this.getAll();
  },
  async getAll(){
    const  res = await getAll(TopicList,{page:this.data.page,size:this.data.size});
    const pic = [...this.data.topic,...res.data.data]
    if(this.data.page<3){
      this.setData({
        topic:pic
      })}
  },
  bindscrolltolower(){
    console.log(1)
    let pages = this.data.page 
    if(this.data.page <= 2){
      pages +=1
      this.setData({
        page:pages
      })
      this.getAll();
    }else{
      pages = 2
      console.log('专题只有两页数据')
    }
  }
})