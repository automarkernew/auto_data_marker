<template>
  <div style="position:relative;width:100%">
    <div class="main">
      <div class="toolbar">
        <div class="toolBarLabel">
          <label>工具栏</label>
        </div>
        <div class="steps">
          <label class="stepTitle">目标识别</label>
          <el-tabs type="card" class="demo-tabs">
            <el-tab-pane label="识别" name="first">
              <div class="stepSubAction">
                <el-button type="primary" @click="setAutoMarker" >识别</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="修正" name="second">
              <div class="stepSubAction">
                <el-button @click="drawNewRect">新增</el-button>
                <el-button @click="editRect">修改</el-button>
                <el-button @click="deleteRect">删除</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="steps" style="top:200px">
          <label class="stepTitle">目标标注</label>
          <el-tabs
              type="card"
              class="demo-tabs"
          >
            <el-tab-pane label="分类" name="third">
              <div class="stepSubAction">
                <el-button >自动</el-button>
                <el-button @click="openClassificationDialog">手动</el-button>
                <el-dialog
                    title="手动分类"
                    width="35%"
                    v-model="dialogFormVisible"
                >
                  <ManualClassification
                      ref="manualClassification"
                      @refreshClassificationQuery="refreshClassificationQuery"
                  ></ManualClassification>
                </el-dialog>
              </div>
            </el-tab-pane>
          </el-tabs>
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
        <div style="width: 100%; height: 32px; position: absolute;">
          {{this.videoDescription}}</div>
        <div class="mainMarkerArea">
          <MarkerArea ref="markerarea" :markMode="markMode" :mapId="mainMapId" :isSingleImg="isSingleImg"></MarkerArea>
          <WaitForRespond ref="WaitForRespond"></WaitForRespond>
        </div>
        <div class="comparePart" style="position: relative;overflow: hidden;">
          <MarkerDrawer
            @showImg="showImg"
            @getBeforeFrame="showImg"
            @getNextFrame="showImg"
          ></MarkerDrawer>
          <MarkerFileArea
            ref="comparePart"
            @refreshClassificationQuery="refreshClassificationQuery"
            style="width: 100%"
          ></MarkerFileArea>
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
                 @click="loadImg(item.index)">

            <label >高分辨率图像</label>
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
import MarkerFileArea from "@/views/DataMarker/DataMarkerAction/MarkerFileArea";
import MarkNumber from "@/views/DataMarker/DataMarkerAction/MarkNumber";
import ManualClassification from "@/views/DataMarker/DataMarkerAction/ManualClassification";
import MarkerDrawer from "@/views/DataMarker/DataMarkerAction/MarkerDrawer";
import ClassificationQuery from "@/views/DataMarker/DataMarkerAction/ClassificationQuery";
export default {
  name: 'HighResolutionImageMarker',
  components: {
    MarkerArea,
    MarkerFileArea,
    ArrowDown,
    WaitForRespond,
    MarkNumber,
    ManualClassification,
    MarkerDrawer,
    ClassificationQuery,
  },
  data () {
    return {
      //载入界面中带参数
      videoInformation:{},
      videoDescription:"",
      videoId:"",
      //传入MarkerArea
      mainMapId:"map",
      markMode: "",
      isSingleImg: true,
      //进入页面所需参数
      frameNumber:"", //视频总帧数
      frame: "1",     //标注区当前帧
      imgArr:[],      //视频全部帧地址列表 exp[{src:""}]
      // imageUrl: "",   //标注区当前帧地址
      markered: "",//当前视频是否已经标注
      tracked: "",
      option:"",
      //点击一键标注
      recs: [],       //标注框的坐标数组
      //修改，删除标注框
      activeRecId:"",
      upLoadDialogStatus: false,
      multipleSelection: [],
      VisibleTaggingGetCoordinateRsp:[],
      dialogFormVisible: false, // 分类弹窗
      drawer:false,
      deleteForm:{},
      centerDialogVisible:false,
      trackIdList:[]
    }
  },
  watch:{
  },
  async mounted(){
    this.videoInformation=JSON.parse(this.$route.params.data)
    // console.log(this.videoInformation)
    this.videoId=this.videoInformation.videoId
    this.frameNumber=await this.getFrameNumber(this.videoId)
    console.log(this.frameNumber)
    this.videoDescription=this.handleTimestamp(this.videoInformation.shootTime)+"   拍摄时间："+this.videoInformation.shootPlace+"     传感器类别："+this.handleSensorType(this.videoInformation.sensorType)
    this.frame="1"
    //初始化视频状态
    this.markered=this.videoInformation.isTagged
    this.tracked=this.videoInformation.isMoted
    console.log("this.markered:",this.markered,"this.tracked:",this.tracked)
    // 初始化分类查询
    this.$refs.classificationQuery.init(this.videoInformation);
    //如果视频已经进行轨迹跟踪，则获取轨迹跟踪后的图片
    if(this.tracked=="1"){
      this.option="track"
      this.frame=this.frameNumber
      this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
      this.$refs.markerarea.tracker(this.frame)
      this.getImage()
      return
    }
    // if(this.markered=="1"){
    //   this.option="mark"
    //   // this.frame=this.frameNumber
    //   this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
    //   this.$refs.markerarea.marker(this.frame)
    //   this.$refs.markerarea.tracker(this.frame)
    //   return
    // }
    this.option="mark"
    this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
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
      // for(var i=1;i<parseInt(this.frameNumber)+1;i++){
      //   const imgPath = {
      //       src: MINIO+"img/"+ videoId + "/" + i + ".jpg",
      //       index: i,
      //     };
      //   console.log(imgPath)
      //   this.imgArr.push(imgPath);
      // }
      return  this.frameNumber
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
    // 在标注文件区域载入标注文件图片
    showImg(videoId, frame, trackId, height, width) {
      const videoInformation2 = {
        videoId: videoId,
        height: height,
        width: width,
      };
      const option2 = "track";
      const relationVideoId = this.videoId;
      this.$refs.comparePart.initMap(
          videoInformation2,
          frame,
          option2,
          relationVideoId
      );
      this.$refs.comparePart.tracker(frame, trackId);
      // this.imgSrc = imgSrc;
    },
    async setAutoMarker () {
      console.log(this.markered);
      //向后端发送请求，后端得到所有已标注的帧的标注框坐标，存入数据库
      const YoloTaggingTagReq = {
        videoId: this.videoId,
      };
      this.$refs.WaitForRespond.openDialog();
      try {
        const res = await request({
          url: "/yoloTagging/tag",
          method: "post",
          data: {
            YoloTaggingTagReq,
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
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
    },
    drawNewRect(){
      this.markMode="rect"
      this.$refs.markerarea.changeMapMode(this.markMode)

    },
    //修改标注框
    editRect(){
      this.markMode="edit"
      this.$refs.markerarea.changeMapMode(this.markMode)
    },
    //删除标注框
    deleteRect(){
      this.markMode="delete"
      this.$refs.markerarea.changeMapMode(this.markMode)
    },
    loadImg(index){
      this.frame=index
      this.$refs.markerarea.initMap(this.videoInformation,this.frame,this.option)
      if(this.markered=="1"){
        this.$refs.markerarea.marker(this.frame)
        this.$refs.markerarea.tracker(this.frame);
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
        case "HR": {
          return "高分辨率 ";
          break;
        }
      }
    },
    async saveMarkedInfomation(){
      //点击暂存按钮，改变标注状态
      const YoloTaggingSaveReq={
        videoId: this.videoId
      }
      try{
        const res = await request({
          url: "/yoloTagging/save",
          method: "post",
          data: {
            YoloTaggingSaveReq
          }
        });
        console.log("res.data:",res)
        if(res.code!=2000){
          console.log("服务器异常")
          return;
        }
      } catch(error){
        console.log(error)
      }
      this.$router.push({
        path:"/dataMarkerInformation",
        name: "DataMarkerInformation",
      })
    },
    async finishMark(){
      //点击完成按钮，改变标注状态
      const YoloTaggingFinishReq={
        videoId: this.videoId
      }
      try{
        const res = await request({
          url: "/yoloTagging/finish",
          method: "post",
          data: {
            YoloTaggingFinishReq
          }
        });
        console.log("res.data:",res)
        if(res.code!=2000){
          console.log("服务器异常")
          return;
        }
      } catch(error){
        console.log(error)
      }
      this.$router.push({
        path:"/dataMarkerInformation",
        name: "DataMarkerInformation",
      })
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