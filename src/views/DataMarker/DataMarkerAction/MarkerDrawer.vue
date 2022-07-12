<template>
  <el-button type="primary" size="small" class="drawerBtn" @click="openDrawer"
    >载<br />入<br />标<br />注<br />文<br />件
  </el-button>
  <div v-if="!isSingleImg">
  <el-button size="small" class="beforeImgBtn" @click="getBeforeFrame"
    >上<br />一<br />帧
  </el-button>
  <span class="currentFrame">第<br />{{ frame }}<br />帧</span>
  <el-button size="small" class="nextImgBtn" @click="getNextFrame"
    >下<br />一<br />帧
  </el-button>
  </div>
  <el-drawer v-model="drawer" title="标注文件" direction="rtl" size="20%">
    <div class="drawerContent">
      <el-form class="formContent">
        <el-form-item label="类别">
          <el-select
            v-model="visibleTaggingObject.objectType"
            placeholder="请选择类别"
            @click="getObjectType"
            @change="showObjectModel"
            clearable
          >
            <el-option
              v-for="item in objectTypeList"
              :key="item"
              :label="item.objectType"
              :value="item.objectType"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="型号">
          <el-select
            v-model="visibleTaggingObject.objectModel"
            placeholder="请选择型号"
            :disabled="objectModelShow"
            @click="getObjectModel"
            clearable
          >
            <el-option
              v-for="item in objectModelList"
              :key="item"
              :label="item.objectModel"
              :value="item.objectModel"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="传感器">
          <el-select
            v-model="visibleTaggingObject.sensorType"
            placeholder="请选择传感器"
            clearable
          >
            <el-option
              v-for="item in sensorTypeList"
              :key="item"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="拍摄地点">
          <el-select
            v-model="visibleTaggingObject.shootPlace"
            placeholder="请选择拍摄地点"
            @click="getShootPlace"
            clearable
          >
            <el-option
              v-for="item in shootPlaceList"
              :key="item"
              :label="item.shootPlace"
              :value="item.shootPlace"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="拍摄时间">
          <div class="block">
            <el-date-picker
              v-model="visibleTaggingObject.shootTime"
              type="date"
              placeholder="请选择日期"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
            >
            </el-date-picker>
          </div>
        </el-form-item>
      </el-form>
      <div class="drawerFooter">
        <el-button class="queryBtn" type="primary" @click="getMarkerFile"
          >查询</el-button
        >
      </div>
    </div>
    <div class="imageContain">
      <el-scrollbar>
        <p v-for="item in fileList" :key="item" class="scrollbar-demo-item">
          <el-image
            :src="item.imgUrl"
            @click="
              chooseImg(
                item.videoId,
                item.frame,
                item.trackId,
                item.height,
                item.width
              )
            "
          ></el-image>
        </p>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script>
import { request } from "../../../js/axiosResquest.js";
import { ElMessage } from "element-plus";

export default {
  name: "ManualClassification",
  components: {},
  props: {
    isSingleImg:Boolean
  },
  emits: ["getBeforeFrame", "getNextFrame", "showImg"],
  data() {
    return {
      videoId: "",
      frame: "", //当前帧
      startFrame: "", //起始帧
      endFrame: "", //结束帧
      trackId: "",
      height: "",
      width: "",
      drawer: false,
      objectModelShow: true, // 分类型号禁用
      objectTypeList: [], // 类别列表
      objectModelList: [], // 型号列表
      shootPlaceList: [], // 拍摄地点列表
      sensorTypeList: [
        {
          value: "VIS",
          label: "可见光",
        },
        {
          value: "IR",
          label: "红外光",
        },
        {
          value: "SAR",
          label: "SAR图像",
        },
        {
          value: "HSI",
          label: "高光谱",
        },
      ], // 传感器类型列表
      visibleTaggingObject: {
        objectType: "",
        objectModel: "",
        sensorType: "",
        shootPlace: "",
        shootTime: "",
      },
      fileList: [], //图片列表
    };
  },
  methods: {
    //打开抽屉
    openDrawer() {
      this.drawer = true;
      this.getMarkerFile();
    },
    getBeforeFrame() {
      if (!this.videoId) {
        ElMessage.warning("请先载入标注文件");
        return;
      }
      if (this.frame == this.startFrame) {
        ElMessage.warning("已经是起始帧了");
        return;
      }
      this.frame--;
      this.$emit(
        "getBeforeFrame",
        this.videoId,
        this.frame,
        this.trackId,
        this.height,
        this.width
      );
    },
    getNextFrame() {
      if (!this.videoId) {
        ElMessage.warning("请先载入标注文件");
        return;
      }
      if (this.frame == this.endFrame) {
        ElMessage.warning("已经是最后一帧了");
        return;
      }
      this.frame++;
      this.$emit(
        "getNextFrame",
        this.videoId,
        this.frame,
        this.trackId,
        this.height,
        this.width
      );
    },
    // 获取类别下拉框
    async getObjectType() {
      try {
        const res = await request({
          url: "ObjectType/queryType",
          method: "get",
        });
        if (res && res.code === 2000) {
          this.objectTypeList = res.data.QueryAllTypeRsp;
        } else {
          this.$message.error("获取分类列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 分类型号显示或禁用
    showObjectModel() {
      this.visibleTaggingObject.objectModel = "";
      this.objectModelShow = !this.visibleTaggingObject.objectType;
    },
    // 获取型号下拉框
    async getObjectModel() {
      try {
        const res = await request({
          url: "ObjectType/queryModel",
          method: "post",
          data: {
            ObjectTypeModelReq: {
              objectType: this.visibleTaggingObject.objectType,
            },
          },
        });
        if (res && res.code === 2000) {
          this.objectModelList = res.data.ObjectTypeModelRsp;
        } else {
          this.$message.error("请求型号列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 获取拍摄地点下拉框
    async getShootPlace() {
      try {
        const res = await request({
          url: "videoInformation/queryShootPlace",
          method: "get",
        });
        if (res && res.code === 2000) {
          this.shootPlaceList = res.data.VideoInformationQueryShootPlaceRsp;
        } else {
          this.$message.error("请求拍摄地点列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 查询
    async getMarkerFile() {
      try {
        const res = await request({
          url: "visibleTagging/loadFile",
          method: "post",
          data: {
            VisibleTaggingLoadFileReq: this.visibleTaggingObject,
          },
        });
        if (res && res.code === 2000) {
          this.fileList = res.data.VisibleTaggingLoadFileRsp;
          this.fileList.forEach((rec) => {
            rec.imgUrl =
              "http://localhost:9000" + rec.imageUrl + rec.frame + ".jpg";
          });
        } else {
          this.$message.error("请求标注文件失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 将图片载入标注区
    chooseImg(videoId, frame, trackId, height, width) {
      this.videoId = videoId;
      this.startFrame = frame;
      this.endFrame = this.getFrameNumber(videoId);
      this.frame = frame;
      this.trackId = trackId;
      this.height = height;
      this.width = width;
      this.$emit("showImg", videoId, frame, trackId, height, width);
    },
    // 获取视频帧总数
    getFrameNumber(videoId) {
      const files = require
        .context("/home/hdtx/code/minio_server/motimg", true, /.jpg$/)
        .keys();
      var i = 0;
      files.forEach((filePath) => {
        var tmp = filePath.substring(0, filePath.lastIndexOf("/"));
        if (tmp.substring(tmp.lastIndexOf("/") + 1, tmp.length) == videoId) {
          i++;
        }
      });
      return i;
    },
    // 超过当前时间不可选
    disabledDate(time) {
      return time.getTime() > Date.now();
    },
  },
};
</script>

<style scoped>
.drawerBtn {
  position: absolute;
  display: flex;
  width: 20px;
  height: 100px;
  z-index: 15;
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
.drawerContent {
  width: 100%;
}
.imageContain {
  margin-top: 10px;
  width: 100%;
  height: 80%;
}
</style>
