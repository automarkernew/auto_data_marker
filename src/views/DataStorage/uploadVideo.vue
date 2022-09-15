<template>
  <!-- 弹出框 -->
  <el-dialog
    v-model="visible"
    custom-class="class1"
    center
    draggable
    width="40%"
    title="视频文件上传"
  >
  <el-tabs >
    <el-tab-pane label="客户端上传" >
      <div class="form">
        <el-row type="flex" justify="space-around">
          <el-col :span="12">
            <div class="data">
              <div class="selectlabel">
                <label>拍摄时间</label>
              </div>
              <el-date-picker
                v-model="shootTime"
                type="datetime"
                placeholder="Select date and time"
                style="width: 214px"
              >
              </el-date-picker>
  
              <div class="selectlabel">
                <label>拍摄地点</label>
              </div>
              <el-input
                v-model="shootPlace"
                placeholder="Please input"
                style="width: 214px"
              />
              <!--  -->
              <div class="selectlabel">
                <label>传感器类型</label>
              </div>
              <el-select v-model="sensorType" placeholder="select" clearable>
                <el-option
                  v-for="item in sensorTypeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <div v-show="sensorType === 'IR'">
                <!-- 如果选到了红外就展示 可见光匹配列表 -->
                <div class="selectlabel">
                  <label>选择匹配的可见光视频文件</label>
                </div>
                <el-select v-model="visVideoId" clearable>
                  <el-option
                    v-for="item in visList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
              <div v-show="sensorType === 'HSI'">
                <!-- 如果选到了高光谱就展示 -->
                <div class="selectlabel">
                  <label>选择匹配的HSI头文件</label>
                </div>
                <!-- <el-select v-model="visVideoId" clearable>
                  <el-option
                    v-for="item in visList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select> -->
  
              </div>
            </div>
  
            <el-upload
              ref="upload"
              action="123"
              multiple
              show-file-list
              :data="fileList"
              :auto-upload="false"
              :on-change="fileChange"
              :limit="fileAmount"
            >
              <el-button slot="trigger" size="small" type="primary"
                >选取文件</el-button
              >
  
              <div slot="tip" class="el-upload__tip">
                {{ uploadTips }}
              </div>
            </el-upload>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer" style="float:right">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="upLoad">确 定</el-button>
        <span v-show="uploadStatus">
          <i class="el-icon-loading"></i>
          正在上传
        </span>
      </span>
    </el-tab-pane>
    <el-tab-pane label="服务器上传" >
      <div class="form">
        <el-row type="flex" justify="space-around">
          <el-col :span="12">
            <div class="data">
              <div class="selectlabel">
                <label>拍摄时间</label>
              </div>
              <el-date-picker
                v-model="shootTime"
                type="datetime"
                placeholder="Select date and time"
                style="width: 214px"
              >
              </el-date-picker>
  
              <div class="selectlabel">
                <label>拍摄地点</label>
              </div>
              <el-input
                v-model="shootPlace"
                placeholder="Please input"
                style="width: 214px"
              />
              <!--  -->
              <div class="selectlabel">
                <label>传感器类型</label>
              </div>
              <el-select v-model="sensorType" placeholder="select" clearable>
                <el-option
                  v-for="item in sensorTypeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
              <div class="selectlabel">
                <label>上传文件</label>
              </div>
              <el-tooltip :visible="inputTooltipVisible">
                <template #content>
                  <span>{{serverFileUrl}}</span>
                </template>
                <el-input :value="serverFileUrl" style="width: 214px" disabled @mouseenter="inputTooltipVisible = true" @mouseleave="inputTooltipVisible = false"/>
                
              </el-tooltip>
              <el-button type="primary" @click="choosefile" style="margin-left: 10px;margin-top: -5px;" >选择文件</el-button>
              <div v-show="sensorType === 'IR'">
                <!-- 如果选到了红外就展示 可见光匹配列表 -->
                <div class="selectlabel">
                  <label>选择匹配的可见光视频文件</label>
                </div>
                <el-select v-model="linkedFilename" clearable>
                  <el-option
                    v-for="item in visList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                </div>
              <div v-show="sensorType === 'HSI'">
                <!-- 如果选到了高光谱就展示 -->
                <div class="selectlabel">
                  <label>选择匹配的HSI头文件</label>
                </div>
                <el-input :value="serverFileUrl" style="width: 214px" disabled/>
              <el-button type="primary" @click="choosefile" style="margin-left: 10px;margin-top: -5px;">选择文件</el-button>
              </div>
            </div>
            
          </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer" style="float:right; margin-top: 15px;">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="upLoadFromServer">确 定</el-button>
        </span>
      </div>
      <chooseServerFile ref="chooseServerFile" @setServerFileUrl="setServerFileUrl" ></chooseServerFile>
     
    </el-tab-pane>
  </el-tabs>
  <WaitForRespond ref="WaitForRespond"></WaitForRespond>

   
  </el-dialog>
</template>

<script>
import { request , MINIO, TOKEN} from "@/js/axiosResquest.js";
import { ElMessage } from "element-plus";
import chooseServerFile from "./FileFromServer.vue";
import WaitForRespond from "@/views/DataMarker/DataMarkerAction/WaitForRespond.vue"
export default {
  name: "uploadVideo",
  components:{
    chooseServerFile,
    WaitForRespond
  },
  data() {
    return {
      uploadStatus: false,
      shootTime: new Date(),
      shootPlace: "",
      // videoLength:""， 上传文件是自动获取
      sensorType: "",
      sensorTypeTypeOptions: [
        {
          value: "HSI",
          label: "HSI-高光谱",
        },
        {
          value: "IR",
          label: "IR-红外光",
        },
        {
          value: "SAR",
          label: "SAR-SAR图像",
        },
        {
          value: "VIS",
          label: "VIS-可见光",
        },
        {
          value: "HRV",
          label: "HRV-高分辨率",
        },
      ],
      visVideoId: "", // 红外光关联的可见光视频ID
      visList: [],
      uploadTips:
        "已有文件将覆盖，非高光谱时只能上传1个文件且每个文件不超过10GB",
      fileAmount: 1,
      fileLegal: false, // 文件格式或文件大小是否合法
      fd: new FormData(),
      url: "",
      fileList: [],
      // 上传窗口是否可见
      visible: false,
      VisibleTaggingTag: [],
      serverFileUrl:"",
      linkedFilename:"",
      inputTooltipVisible: false
    };
  },
  props: [
    "upLoadDialogStatus", // 目前仅此有效
    "selectInfo",
    "multipleSelection",
  ],
  emits: ["uploadSuccess", "changeUploadStatus", "getVideoImg"],
  computed: {},
  watch: {
    upLoadDialogStatus() {
      this.openUpLoadDialog();
    },
    sensorType() {
      console.log(this.$refs.upload);
      this.$refs.upload.clearFiles(); // 清除显示文件列表
      this.fd.delete("file"); // 清除待上传文件列表
      console.log("fd.delete - > result fd:", this.fd);
      if (this.sensorType === "IR") {
        // 红外
        this.visVideoId = "";     //清空上一次选择
        this.openMatchVis(true); // 展示匹配可见光的选择列表
        this.getVisList();
        this.fileAmount = 1;
        this.uploadTips =
          "请选择可见光视频文件作为匹配，再上传红外视频文件(大小不超过10GB)";
      } else if (this.sensorType === "HSI") {
        // 高光谱
        this.fileAmount = 2;
        this.uploadTips =
          "请同时选中并上传两个文件, HDR头文件和高光谱文件，文件名除后缀外需一致";
      } else {
        this.fileAmount = 1;
        this.uploadTips =
          "已有文件将覆盖，只能上传1个文件，且每个文件不超过10GB";
      }
    },
    visVideoId() {
      console.log(this.visVideoId);
    },
  },
  methods: {
    // 打开上传对话框
    openUpLoadDialog() {
      if (this.$props.upLoadDialogStatus == true) {
        this.visible = true;
      }
    },
    cancel() {
      this.visible = false;
    },
    openMatchVis(isOpen) {
      //isOpen = true -> 打开 红外视频与可见光视频的 匹配列表;  false -> 关闭
      // 目前好像没什么用
      console.log("openMatchVis", isOpen);
    },
    fileChange(file) {
      const isLt10G = file.size / 10240 / 1024< 1024; // 单位为MB ( B / 1024 -> KB )
      //判断大小
      console.log("----文件大小判断----");
      if (!isLt10G) {
        this.fileLegal = false;
        this.$message.error("上传视频大小不能超过10G哦!");
        this.$refs.upload.clearFiles();
        return false;
      } else {
        console.log("文件大小合适");
        this.fileLegal = true;
      }

      // 上传文件类型限制
      console.log("----文件类型判断----");
      if (this.sensorType == "HSI") {
        // 高光谱
        console.log("HSI file", file);
        // 不判断文件类型，仅判断是否满足两个文件，且两个文件同名
        // 判断文件大小
        this.fileLegal = true;
        this.fd.append("file", file.raw);
        console.log("fd.file",this.fd.get("file"));
        console.log("file.raw", file.raw);
      } else if (this.sensorType == "IR") {
        // 红外光
        if (
          [
            "video/mp4",
            "video/ogg",
            "video/flv",
            "video/avi",
            "video/wmv",
            "video/rmvb",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/tiff",
          ].indexOf(file.raw.type) == -1
        ) {
          this.fileLegal = false;
          this.$refs.upload.clearFiles();
          this.$message.error("文件格式不正确");
          return false;
        } else {
          this.fd.delete("file");
          this.fd.append("file", file.raw);
          console.log("file.raw", file.raw);
          this.fileLegal = true;
        }
      } else {
        // 可见光等一般文件
        // 判断文件类型
        console.log(file.raw.type)
        if (
          [
            "video/x-msvideo",
            "video/mp4",
            "video/ogg",
            "video/x-flv",
            "video/avi",
            "video/wmv",
            "video/rmvb",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/tiff",
          ].indexOf(file.raw.type) == -1
        ) {
          this.fileLegal = false;
          this.$refs.upload.clearFiles();
          this.$message.error("文件格式不正确");
          return false;
        } else {
          this.fd.delete("file");
          this.fd.append("file", file.raw);
          console.log("file.raw", file.raw);
          this.fileLegal = true;
        }
      }

      console.log("fileList", this.fileList);
    },
    submitUpload() {
      // 这个方法好像没什么用
      this.$refs.upload.submit();
    },
    fdMerge() {
      // 把信息载入fd
      // console.log(this.dataSourceName, this.dataSourceType);
      // this.fd.set("shootTime", this.shootTime);
      // this.fd.set("shootPlace", this.shootPlace);
      // this.fd.set("sensorType", this.sensorType);

      let uploadInfo = {
        shootTime: this.dataFormat(this.shootTime,"yyyyMMddhhmmss"),
        shootPlace: this.shootPlace,
        sensorType: this.sensorType,
        typeLinkId: this.visVideoId,
      };
      console.log("new uploadInfo --> ", uploadInfo);
      //验证过此处能更新uploadInfo

      // this.fd.append("VideoInformationCreateReq",JSON.stringify(uploadInfo))
      // console.log('this.fd.set "VideoInformationCreateReq"',JSON.stringify(uploadInfo));
      // console.log("fd: ", this.fd.get("dataSourceName"));//此处验证fd可以获取到值

      // const obj = {
      //   "VideoInformationCreateReq":JSON.stringify(uploadInfo)
      // };
      // console.log("obj",obj);
      
      let json = JSON.stringify(uploadInfo);
      console.log(json);
      let blob = new Blob([json], {
        type: "application/json;",
      });
      console.log("blob", blob);
      this.fd.delete("VideoInformationCreateReq");
      this.fd.append("VideoInformationCreateReq", blob);
      console.log(this.fd.get("VideoInformationCreateReq"));
    },
    async getVisList() {
      // 获取可见光实例列表
      let that = this;
      try {
        const res = await request({
          url: "/videoInformation/query",
          method: "post",
          data: {
            VideoInformationQueryReq: {
              videoName: "",
              shootTime: "",
              shootPlace: "",
              sensorType: "VIS",
            },
            QueryPagingParamsReq: {
              offset: 0,
              queryCount: 10000,
            },
          },
        });
        console.log("getVisList", res);
        res.data.VideoInformationQueryRsp.forEach((element) => {
          let _ = {
            label: element.videoName,
            value: element.videoId,
          };
          that.visList.push(_);
        });
        console.log("visList", that.visList);
      } catch (error) {
        console.log(error);
      }
    },
    // 信息完整性检查
    isInfoNotComplete() {
      if (this.shootTime === "") {
        this.$message.error("请选择拍摄时间");
        return "请选择拍摄时间";
      }
      if (this.shootPlace === "") {
        this.$message.error("请填写拍摄地点");
        return "请填写拍摄地点";
      }
      if (this.sensorType === "") {
        this.$message.error("请选择传感器类型");
        return "请选择传感器类型";
      }else if (this.sensorType === "IR"){
        if(this.visVideoId === ""){
          this.$message.error("请选择广联可见光视频");
          return "请选择广联可见光视频"
        }
      }
      return false;
    },
    // 上传
    async upLoad() {
      this.$refs.WaitForRespond.openDialog()
      if (this.isInfoNotComplete()) {
        return false;
      }
      if (!this.fileLegal) {
        // 文件不合法时无法上传;
        this.$message.error("文件格式、大小不合法或未选择文件");
        return;
      }
      this.fdMerge();
      let that = this;
      try {
        const res = await request({
          url: "/videoInformation/create",
          method: "post",
          // data: [...this.fd],
          data: that.fd,
          headers: { ContentType: "multipart/form-data" },
        });
        console.log("res.data:", res);
        this.VisibleTaggingTag = res.data.VisibleTaggingTagRsp;
        // console.log("video:",this.VisibleTaggingTag[0].videoId,",imagUrl",this.VisibleTaggingTag[0].imageUrl)
        that.$emit("getVideoImg", this.VisibleTaggingTag);

        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        } else {
          ElMessage({
            message: "上传成功",
            type: "success",
          });
          that.$emit("uploadSuccess");
          this.$refs.WaitForRespond.closeDialog()
          // console.log("准备that.visible = false;");
          that.visible = false;
        }
      } catch (error) {
        console.log(error);
      }
    },
    choosefile(){
     this.$refs.chooseServerFile.openChooseServerFile()
    },
    setServerFileUrl(fileUrl){
      this.serverFileUrl = fileUrl
      console.log("this.serverFileUrl",this.serverFileUrl)
    },
    async upLoadFromServer(){
      this.$refs.WaitForRespond.openDialog()
      try {
        const res = await request({
          url: "/videoInformation/serverVideoCreate",
          method: "post",
          data: {
            VideoFromServerCreateReq:{
              shootTime: this.dataFormat(this.shootTime,"yyyyMMddhhmmss"),
              shootPlace: this.shootPlace,
              sensorType: this.sensorType,
              typeLinkId: this.linkedFilename,
              fileName: this.serverFileUrl
            }
          }
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        } else {
          ElMessage({
            message: "上传成功",
            type: "success",
          });
          this.visible = false;
          this.$refs.WaitForRespond.closeDialog()
        }
      } catch (error) {
        console.log(error);
      }
    },
    dataFormat(date,fmt){
    let o = {
          "M+": date.getMonth() + 1, //月份
          "d+": date.getDate(), //日
          "h+": date.getHours(), //小时
          "m+": date.getMinutes(), //分
          "s+": date.getSeconds(), //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          S: date.getMilliseconds(), //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
          );
        for (let k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
              RegExp.$1,
              RegExp.$1.length == 1
                ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length)
            );
        return fmt;
  }
  },
 
};

/*
  bug
  1、[solved]上传文件时信息重复问题时： 
    this.fd.append 之前没有 fd.delete
  2、HSI两文件上传时出错
*/
</script>

<style scoped>
.modifydialog {
  font-weight: bold;
}

.form {
  padding: 20px;
}
</style>
