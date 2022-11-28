<!--红外光数据标注-->
<template>
    <div style="position:relative;width:100%">
        <div class="main">
            <div class="toolbar">
                <div class="toolBarLabel">
                  <label>工具栏</label>
                </div>
                <div class="steps">
                  <div class="stepTitle">目标识别</div>
                  <div class="stepActions">
                    <el-button type="primary" @click="imageRegistration">配准</el-button>
                    <InfraredImageRegister ref="InfraredImageRegister"></InfraredImageRegister>
                    <el-button type="primary" @click="setAutoMarker">自动标注</el-button>
                  </div> 
                  
                </div>
                
                <div class="toolBarLabel" style="top:350px">保存</div>
                <div class="steps" style="top: 385px;border: none;">
                  <div class="stepActions">
                    <el-button type="primary" @click="saveMarkedInfomation">暂存</el-button>
                    <el-button type="primary" @click="finishMark">完成</el-button>
                  </div> 
                </div>
            </div>
            <div class="markerArea">
              <div style="width: 100%; height: 32px; position: absolute">
                {{ this.videoDescription }}
              </div>
              <div class="mainMarkerArea">
                <MarkerArea ref="markerarea" :markMode="markMode" :mapId="mainMapId" :isSingleImg="isSingleImg" key="markerarea"></MarkerArea>
                <WaitForRespond ref="WaitForRespond"></WaitForRespond>
              </div>
              <div class="comparePart" style="position: relative; overflow: hidden">
                <MarkerArea ref="comparePart" :markMode="markMode" :mapId="compareMapId" :isSingleImg="isSingleImg" key="comparePart"></MarkerArea>
                  <el-button size="small" class="beforeImgBtn" @click="showBeforeImg"
                  >上<br />一<br />帧
                  </el-button>
                  <span class="currentFrame">第<br />{{ visibleVideoFrame }}<br />帧</span>
                  <el-button size="small" class="nextImgBtn" @click="showNextFrame"
                  >下<br />一<br />帧
                  </el-button>
              </div>
              <div class="chooseButton">
                <el-button @click="getBeforeFrame">上一帧</el-button>
                <label class="frameLabel">第{{ this.frame }}帧</label>
                <el-button @click="getNextFrame">下一帧</el-button>
              </div>
            </div>
            <div class="search">
              <div class="toolBarLabel" >分类查询</div>
              <ClassificationQuery ref="classificationQuery"></ClassificationQuery>
            <!--搜索区-->
            </div>
        </div>
        <div class="footer">
            <!--图片平铺效果-->
            <el-scrollbar>
              <div class="scrollbar-flex-content">
                <p v-for="item in imgArr" :key="item" class="scrollbar-demo-item">
                  <div style="margin-top:5px">
                    <img :src="item.src" alt="" class="imgItem" :class="item.index==frame?'hover':''"
                        @click="loadImg(item.index)"/>
                    <label>第{{item.index}}帧</label>
                  </div>
                </p>
              </div>
            </el-scrollbar>
        </div>

    </div>
</template>
<script>
import AILabel from 'ailabel'
import { ElMessage } from "element-plus";
import MarkerArea from '../DataMarkerAction/MarkerArea.vue'
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
import { ArrowDown } from '@element-plus/icons-vue'
import WaitForRespond from '../DataMarkerAction/WaitForRespond.vue'
import ClassificationQuery from "../DataMarkerAction/ClassificationQuery.vue";
import InfraredImageRegister from "./InfraredImageRegister.vue"
export default{
  name: 'DataMarker',
  components: {
      MarkerArea,
      ArrowDown,
      WaitForRespond,
      ClassificationQuery,
      InfraredImageRegister
  },
  data () {
    return {
      //载入界面中带参数
      videoInformation:{},
      visibleVideoInfo:{},//可见光视频信息
      videoDescription:"",
      videoId:"",
      LinkedVideoId:"",
      //设置红外视频是否可以自动标注：当对应的可见光视频已经完成标注，才可以对红外视频进行自动标注
      allowedMark:false,
      isSingleImg:false,
      //传入MarkerArea
      mainMapId:"map",
      compareMapId: "compareMap",
      markMode: "",
      //进入页面所需参数
      frameNumber:"", //视频总帧数
      visibleVideoFrameNumber:"",
      frame: "1",     //标注区当前帧
      visibleVideoFrame:"1",//可见光当前帧
      imgArr:[],      //视频全部帧地址列表 exp[{src:""}]
      markered: "",//当前视频是否已经标注
      tracked: "",
      option:"",
      //点击一键标注
      recs: [],       //标注框的坐标数组 
      //修改，删除标注框
      upLoadDialogStatus: false,
      multipleSelection: [],
      VisibleTaggingGetCoordinateRsp:[],
      drawer:false,
      deleteForm:{},
      centerDialogVisible:false,
      trackIdList:[]
    }
  },
  watch:{
  },
  async mounted(){
    //载入红外光视频后需要与对应的可见光视频做配对
    this.videoInformation=JSON.parse(this.$route.params.data)//接收从标注信息列表页面得到的红外光视频数据
    this.videoId=this.videoInformation.videoId
    this.LinkedVideoId=this.videoInformation.typeLinkId //获取关联的可见光视频
    //查看关联的可见光视频状态
    this.checkVisibleVideoStatus(this.LinkedVideoId)
    this.frameNumber=await this.getFrameNumber(this.videoId)
    this.visibleVideoFrameNumber=await this.getFrameNumber(this.LinkedVideoId)
    // this.visibleVideoFrameNumber=this.getVisibleFrameNumber(this.LinkedVideoId)
    this.videoDescription=this.handleTimestamp(this.videoInformation.shootTime)+"   拍摄时间："+this.videoInformation.shootPlace+"     传感器类别："+this.handleSensorType(this.videoInformation.sensorType)
    this.frame="1"
    this.$refs.classificationQuery.init(this.videoInformation)
    // console.log("this.markered:",this.markered,"this.tracked:",this.tracked)
    //初始化视频状态
    this.initVideo(this.videoId)
    this.getImage()
  },
  methods: {
    async  getFrameNumber(videoId) {
       try {
        const res = await request({
          url: "/videoInformation/queryVideoLength",
          method: "post",
          data: {
            VideoLengthReq :  {
              videoId
            },
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        this.frameNumber = res.data.VideoLengthRsp.length
      } catch (error) {
        console.log(error);
      }
      this.imgArr=[]
      return this.frameNumber
    },
    getImage(){
       this.imgArr=[]
       var slidenum  = 10
       if(this.frameNumber < 10){
        slidenum = this.frameNumber
       }
      for(var i=0;i<slidenum;i++){
        var  firstImageId = parseInt(this.frame)
        if(firstImageId>parseInt(this.frameNumber)-9&&parseInt(this.frameNumber)-9>0){
          firstImageId = parseInt(this.frameNumber)-9
        }
        const imgId =  firstImageId +i
        const imgPath = {
            src: MINIO+"img/"+ this.videoId + "/" + imgId+ ".jpg",
            index: imgId,
          };
        console.log(imgPath)
        this.imgArr.push(imgPath);
      }
    },
    async initVideo(VideoId){
      const VideoInformationQueryByIdReq = {
        videoId: this.videoId
      };
      try {
        const res = await request({
          url: "/videoInformation/queryById",
          method: "post",
          data: {
            VideoInformationQueryByIdReq,
          },
        });
        
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        this.videoInformation=res.data.VideoInformationQueryByIdRsp
        this.markered = this.videoInformation.isTagged;
        this.tracked = this.videoInformation.isMoted;
      } catch (error) {
        console.log(error);
      }
      if(this.videoInformation.isMoted=="1"){
        console.log("this.videoInformation.isMoted",this.videoInformation.isMoted,this.videoInformation)
        this.$refs.markerarea.initMap(this.videoInformation,this.frame,"track")
        this.$refs.markerarea.tracker(this.frame)
        return
      }
      if(this.videoInformation.isTagged=="1"){
        this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
        this.$refs.markerarea.marker(this.frame)
        return
      }
      this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
    },
    //查看可见光视频状态，完成标注后才可以进行标注
    async checkVisibleVideoStatus(VideoId){
      const VideoInformationQueryByIdReq = {
        videoId: this.LinkedVideoId
      };
      try {
        const res = await request({
          url: "/videoInformation/queryById",
          method: "post",
          data: {
            VideoInformationQueryByIdReq,
          },
        });
        
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        this.visibleVideoInfo=res.data.VideoInformationQueryByIdRsp
        this.allowedMark=this.visibleVideoInfo.tagStatus=="F"?true:false
      } catch (error) {
        console.log(error);
      }
      if(this.visibleVideoInfo.isMoted=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"track")
        this.$refs.comparePart.tracker(this.frame)
        return
      }
      if(this.visibleVideoInfo.isTagged=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
        this.$refs.comparePart.marker(this.frame)
        return
      }
      this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
    },
    // 打开手动分类弹窗
    openClassificationDialog() {
      this.dialogFormVisible = true;
      // 初始化手动分类
      this.$nextTick(() => {
        this.$refs.manualClassification.init(this.videoInformation.videoId);
      });
    },
    // 分类成功后关闭手动分类弹窗，刷新分类查询初始化
    refreshClassificationQuery() {
      // 初始化分类查询
      this.$refs.classificationQuery.init(this.videoInformation);
      this.dialogFormVisible = false;
    },
    showBeforeImg(){
      if(this.visibleVideoFrame==1){
          ElMessage.warning("已经是第一帧了")
          return
        }
        this.visibleVideoFrame=parseInt(this.visibleVideoFrame)-1
      if(this.visibleVideoInfo.isMoted=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"track")
        this.$refs.comparePart.tracker(this.visibleVideoFrame)
        return
      }
      if(this.visibleVideoInfo.isTagged=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
        this.$refs.comparePart.marker(this.visibleVideoFrame)
        return
      }
      this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
    },
    showNextFrame(){
       if(this.visibleVideoFrame==this.visibleVideoFrameNumber){
          ElMessage.warning("已经是最后一帧了")
          return
        }
        this.visibleVideoFrame=parseInt(this.visibleVideoFrame)+1
        if(this.visibleVideoInfo.isMoted=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"track")
        this.$refs.comparePart.tracker(this.visibleVideoFrame)
        return
      }
      if(this.visibleVideoInfo.isTagged=="1"){
        this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
        this.$refs.comparePart.marker(this.visibleVideoFrame)
        return
      }
      this.$refs.comparePart.initMap(this.visibleVideoInfo,this.visibleVideoFrame,"mark")
    },
    getBeforeFrame(){
        if(this.frame==1){
          ElMessage.warning("已经是第一帧了")
          return
        }
        this.frame=parseInt(this.frame)-1
       
        if(this.tracked=="1"){
          this.$refs.markerarea.initMap(this.videoInformation,this.frame,"track")
          this.$refs.markerarea.tracker(this.frame)
          this.getImage()
          return
        }
        if(this.markered=="1"){
          this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
          this.$refs.markerarea.marker(this.frame)
           this.getImage()
          return
        }
        this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
         this.getImage()
    },
    getNextFrame(){
        if(this.frame==this.frameNumber){
          ElMessage.warning("已经是最后一帧了")
          return
        }
        this.frame=parseInt(this.frame)+1
        this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
        if(this.tracked=="1"){
          this.$refs.markerarea.initMap(this.videoInformation,this.frame,"track")
          this.$refs.markerarea.tracker(this.frame)
          this.getImage()
          return
        }
        if(this.markered=="1"){
          this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
          this.$refs.markerarea.marker(this.frame)
           this.getImage()
          return
        }
        this.$refs.markerarea.initMap(this.videoInformation,this.frame,"mark")
         this.getImage()
    },
    imageRegistration(){
        //图像配准
        //判断视频是否已经配准
        this.$nextTick(()=>{
          this.$refs.InfraredImageRegister.openDialog(this.videoInformation,this.visibleVideoInfo)
        }
        )
    },
    async setAutoMarker () {
      //如果可见光视频还没有完全标注，返回
      if(!this.allowedMark){
        ElMessage({
                    message: "关联的可见光视频为标注，不可进行红外标注",
                    type: "warning",
                });
        return
      }
        //点击自动标注
      const InfraredImageTaggingTagReq = {
        videoId: this.videoId,
        linkedVideoId: this.LinkedVideoId
      };
      this.$refs.WaitForRespond.openDialog();
      try {
        const res = await request({
          url: "/InfraredImageTagging/tag",
          method: "post",
          data: {
            InfraredImageTaggingTagReq,
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          this.$refs.WaitForRespond.closeDialog();
          return;
        }
        ElMessage.success("标注成功");
        this.$refs.WaitForRespond.closeDialog();
        this.markered = "1";
        this.tracked = "1"
      } catch (error) {
        console.log(error);
      }
      this.option = "track";
      this.$refs.markerarea.initMap(
        this.videoInformation,
        this.frame,
        this.option
      );
      //将标注区的帧所有标注画出
      this.$refs.markerarea.tracker(this.frame);
      console.log("this.markered:",this.markered,"this.tracked:",this.tracked)
      console.log("红外匹配成功")
    },
    
    loadImg(index){
      this.frame=index
      this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
        if(this.tracked=="1"){
          this.$refs.markerarea.tracker(this.frame)
          return
        }
        if(this.markered=="1"){
          this.$refs.markerarea.marker(this.frame)
          return
        }
    },
    handleTimestamp(str){
      //20220309114140
      var year=str.substring(0,4)
      var month=str.substring(4,6)
      var day=str.substring(6,8)
      var hour=str.substring(8,10)
      var minute=str.substring(10,12)
      var second=str.substring(12,14)
      return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second
    },
    handleSensorType(type){
      //VIS-可见光; IR-红外光；SAR-SAR图像；HSI-高光谱 
      switch(type){
        case "VIS":{
          return "可见光" 
          break;
        }
        case "IR":{
          return "红外光" 
          break;
        }
        case "SAR":{
          return "SAR图像" 
          break;
        }
        case "HSI":{
          return "高光谱 " 
          break;
        }
      }
    },
    async saveMarkedInfomation() {
      //点击暂存按钮，改变标注状态
      const YoloTaggingSaveReq = {
        videoId: this.videoId,
      };
      try {
        const res = await request({
          url: "/yoloTagging/save",
          method: "post",
          data: {
            YoloTaggingSaveReq,
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
      } catch (error) {
        console.log(error);
      }
      this.$router.push({
        path: "/dataMarkerInformation",
        name: "DataMarkerInformation",
      });
    },
    async finishMark() {
      if(this.markered=="0"||this.tracked=="0"){
        return
      }
      //点击完成按钮，改变标注状态
      const YoloTaggingFinishReq = {
        videoId: this.videoId,
      };
      try {
        const res = await request({
          url: "/yoloTagging/finish",
          method: "post",
          data: {
            YoloTaggingFinishReq,
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
      } catch (error) {
        console.log(error);
      }
      this.$router.push({
        path: "/dataMarkerInformation",
        name: "DataMarkerInformation",
      });
    },
  },

  
  
}
</script>
<style scoped>
.main {
  display: flex;
  justify-content: flex-start;
  position: absolute;
  width: 100%;
  height: 630px;
  left: 0px;
  top: 0px;
}
.toolbar {
  position: relative;
  left: 10px;
  top: 5px;
  width: 15%;
  height: 610px;
  background: whitesmoke;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(121, 121, 121, 1);
  border-radius: 0px;
  display: flex;
}
.toolBarLabel {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 30px;
  background: #527399;
  text-align: center;
  font-size: 23px;
  font-weight: bold;
  color: whitesmoke;
}
.steps {
  position: absolute;
  top: 40px;
  left: 5px;
  width: 95%;
  height: 140px;
  border: 1px solid rgba(121, 121, 121, 1);
  border-radius: 5px;
}
.stepTitle {
  background-color: white;
  position: absolute;
  left: 30px;
  top: -10px;
}
.stepActions {
  position: absolute;
  top: 15px;
  left: 10px;
}
.stepSubAction {
  position: relative;
  margin-left: 10px;
}

.markerArea {
  display: flex;
  position: relative;
  justify-content: flex-start;
  left: 10px;
  top: 5px;
  width: 70%;
  height: 610px;
  background: whitesmoke;
  float: right;
  margin-left: 10px;
}
.markContain {
  display: flex;
  left: 0;
  width: 50%;
  height: 400px;
  border: 1px solid;
}
/* .markFile {
  display: flex;
  position: relative;
  width: 50%;
  height: 400px;
  margin-left: 10px;
  border: 1px solid;
} */
.markFileImg {
  position: absolute;
  height: 400px;
  left: 25px;
  top: 0;
}
#map {
  position: relative;
  top: 0px;
  left: 0px;
  height: 520px;
  border: 1px solid;
}
#markerFileArea {
  position: relative;
  top: 0px;
  left: 0px;
  height: 520px;
  border: 1px solid;
}
.chooseButton {
  position: absolute;
  width: 25%;
  top: 560px;
  left: 30px;
  margin-top: 10px;
}
.frameLabel {
  margin: 0 10px;
}
.chooseFrame {
  position: absolute;
  display: flex;
  top: 540px;
  left: 300px;
  width: 75%;
  height: 100px;
  align-items: center;
}

.mainMarkerArea {
  position: relative;
  overflow: hidden;
  top: 32px;
  left: 0px;
  width: 50%;
  border: 1px solid;
  height: 520px;
  margin-right: 5px;
}
.comparePart {
  position: relative;
  overflow: hidden;
  top: 32px;
  left: 0px;
  width: 50%;
  border: 1px solid;
  height: 520px;
  margin-left: 5px;
}
.beforeImgBtn {
  position: absolute;
  display: flex;
  width: 20px;
  height: 60px;
  margin: 0;
  top: 130px;
  left: 0;
  z-index: 15;
}
.currentFrame {
  position: absolute;
  display: flex;
  font-size: 13px;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 60px;
  margin: 0;
  top: 195px;
  left: 0;
  z-index: 15;
  font-weight: bold;
  color: red;
}
.nextImgBtn {
  position: absolute;
  display: flex;
  width: 20px;
  height: 60px;
  margin: 0;
  top: 260px;
  left: 0;
  z-index: 15;
}
.search {
  position: relative;
  left: 10px;
  top: 5px;
  width: 13%;
  height: 610px;
  display: flex;
  background: whitesmoke;
  margin-left: 10px;
}
.footer {
  position: absolute;
  top: 630px;
  left: 10px;
  width: 99%;
  height: 260px;
  background: whitesmoke;
  margin-right: 10px;
}
.scrollbar-flex-content {
  display: flex;
}
.scrollbar-demo-item,
img {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 200px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
.imgItem.hover {
  border: 2px solid red;
}

</style>
