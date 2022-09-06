<template>
  <div class="preview-container">
    <h4>Preview</h4>
    <div v-if="notSelect">
      未选择项目
    </div>
    <div v-else>
      <div>{{ showFilename }}
        <span
          ><span v-if="showSensorType === 'VIS'">可见光</span>
          <span v-else-if="showSensorType === 'IR'">红外光</span>
          <span v-else-if="showSensorType === 'SAR'">SAR图像</span>
          <span v-else-if="showSensorType === 'HSI'">高光谱</span>
          <span v-else-if="showSensorType === 'HRV'">高分辨率 </span>
        </span>
      </div>
      <!-- <div style="max-width: 500px; max-height:500px; border: 1px solid purple">
        <video 
          width="400"
          :src="showVideoUrl"
          controls>
        </video>
      </div> -->
      <!-- <div style="max-width: 400px; max-height:500px; border: 1px solid purple">
        <img 
          width="400"
          :src="showVideoUrl"
        />
      </div> -->
      <div style="max-width: 400px; max-height:500px; border: 2px solid rgb(64, 158, 255)">
        <img 
          width="400"
          :src="showVideoUrl"
        />
      </div>

      <div style="padding: 20px;">
        <!-- 详细内容框 -->
        <div>拍摄时间 {{showShootTime}}</div>
        <div>拍摄地点 {{showShootPlace}}</div>
        <div>传感器类别 
          <span v-if="showSensorType === 'VIS'">可见光</span>
          <span v-else-if="showSensorType === 'IR'">红外光</span>
          <span v-else-if="showSensorType === 'SAR'">SAR图像</span>
          <span v-else-if="showSensorType === 'HSI'">高光谱</span>
          <span v-else-if="showSensorType === 'HRV'">高分辨率 </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import {handleTimestamp} from "@/js/handleTimeStamp"
import {MINIO} from "@/js/axiosResquest.js"
export default {
  name: "Preview",
  data() {
    return {
      notSelect: true, // 还未选择要展示的数据
      showFilename: "",
      showSensorType: "",
      showVideoUrl:"",
      showShootTime:"",
      showShootPlace:"",
      showFlightHeight:"", // 飞行高度，暂时未用
    };
  },
  methods:{
    myhandleTimestamp(value){
      let str = handleTimestamp(value);
      console.log("str",str);
      return str;
    },
    changeSelect(){
      if(this.$props.videoInfo.videoId != "")
      {
        // 因为videoId肯定是必备的，所以可以用videoId判定有没有选择
        this.notSelect = false;
      }else {
        this.notSelect = true;
      }
    }
  },
  props: ["videoInfo"],
  updated() {
    this.showFilename = this.$props.videoInfo.videoName;
    this.showVideoUrl = MINIO +this.$props.videoInfo.tagImgUrl+"/1.jpg"
    let judgeType = this.showVideoUrl.split(".").pop();  // 获取文件后缀
    this.showShootTime = this.myhandleTimestamp(this.$props.videoInfo.shootTime);
    this.showShootPlace = this.$props.videoInfo.shootPlace;
    this.showSensorType = this.$props.videoInfo.sensorType;

    this.changeSelect();
    console.log("judgeType",judgeType);
    console.log("showVideoUrl", this.showVideoUrl);
    console.log("接收到的videoInfo", this.$props.videoInfo);
    
  },
};
</script>

<style scoped>
.preview-container {
  text-align: center;
}
.mobile {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background-color: #1a1;
  cursor: w-resize;
}

img {
  max-height: 500px;
  width: 400px;
}
</style>