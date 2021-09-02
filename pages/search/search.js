import getData from '../../utils/network';
import {SearchIndex} from '../../config/config';
Page({
  data:{

  },
  onLoad(options){
    getData(SearchIndex).then(res=>{
      console.log(res)
    })
  }
})