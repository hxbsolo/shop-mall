import {TopicList} from '../../config/config';
import getAll from '../../utils/network'
Page({
  data:{
    topic:[],
    page:1,
    totalpages:null,
    size:10
  },
  onLoad(opations){
    this.getAll();
  },
  async getAll(){
    const  res = await getAll(TopicList,{page:this.data.page,size:this.data.size});
    const pic = [...this.data.topic,...res.data.data]
    console.log(res)
    if(this.data.page<3){
      this.setData({
        topic:pic,
        totalpages:res.data.totalPages
      })}
  },
  bindscrolltolower(){
    let pages = this.data.page 
    pages +=1
    if(pages<= this.data.totalpages){
      this.setData({
        page:pages
      })
      this.getAll();
    }
  }
})