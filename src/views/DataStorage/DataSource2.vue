<template>
  <!--数据标注信息列表页面-->
  <div>
    <div class="main">
      <upload-video 
        :upLoadDialogStatus="uploadSourceOpen"
        @uploadSuccess="uploadSourceSuccess"
        @close="uploadSourceOpen=false"
      ></upload-video>
      <div class="data">
        <div class="searchPart">
          <div class="searchCom">
            <div class="selectlabel">
              <label>数据类型：</label>
            </div>
            <el-select
              v-model="queryData.VideoInformationQueryReq.sensorType"
              class="m-2"
              placeholder="Select"
              clearable
              width="150px"
            >
              <el-option
                v-for="item in sensorTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="searchCom" id="date-picker">
            <div class="selectlabel" style="margin-top: -1px">
              <label>拍摄时间：</label>
            </div>
            <el-date-picker
              v-model="selectShootTime"
              type="daterange"
              start-placeholder="Start Date"
              end-placeholder="End Date"
              value-format="YYYYMMDD"
              clearable
              @change="shootTimeChange"
              style="width: 300px; height: 32px"
            >
              <!-- :default-value="[new Date(2022, 9, 1), new Date(2022, 10, 1)]" -->
            </el-date-picker>
          </div>
          <div class="searchCom">
            <div class="selectlabel">
              <label>拍摄地点：</label>
            </div>
            <el-input
              v-model="queryData.VideoInformationQueryReq.shootPlace"
              placeholder="Please input"
              style="width: 100px"
            />
          </div>
          <div class="searchCom">
            <div class="selectlabel">
              <label>标注：</label>
            </div>
            <el-select
              v-model="queryData.VideoInformationQueryReq.tagStatus"
              class="m-2"
              placeholder="Select - 等待后台接口"
              clearable
            >
              <el-option
                v-for="item in markStateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="searchCom">
            <el-button
              type="primary"
              style="height: 32px; margin-left: 10px"
              @click="dataSourceQuery"
              >查找</el-button
            >
          </div>
          <div class="searchCom">
            <el-button
              type="primary"
              style="height: 32px; margin-left: 10px"
              @click="uploadSourceOpen = true"
              >上传</el-button>
          </div>
          <div class="searchCom">
            <el-button
              type="primary"
              style="height: 32px; margin-left: 10px"
              @click="deleteBatch"
              >批量删除</el-button
            >
          </div>
        </div>
        <div class="dataMarkTable">
          <el-table
            class="elDataMarkTable"
            height="750"
            highlight-current-row
            :data="content"
          >
            <el-table-column width="40px">
              <template v-slot="sth">
                <input
                  type="checkbox"
                  class="check"
                  name = "allInputCheck"
                  @input="selectItem(sth.row.videoId)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="videoId" label="序号" class="tableColumn" />
            <el-table-column
              prop="sensorType"
              label="数据类型"
              class="tableColumn"
              ><template v-slot="scope">
                <div>
                  <el-input
                    v-model="scope.row.sensorType"
                    @change="sensorTypeChange()"
                  ></el-input>
                  <span
                    ><div v-if="scope.row.sensorType === 'VIS'">可见光</div>
                    <div v-else-if="scope.row.sensorType === 'IR'">红外光</div>
                    <div v-else-if="scope.row.sensorType === 'SAR'">
                      SAR图像
                    </div>
                    <div v-else-if="scope.row.sensorType === 'HSI'">高光谱</div>
                    <div v-else-if="scope.row.sensorType === 'HRV'">高分辨率</div>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="videoName"
              label="视频文件名"
              class="tableColumn"
            />
            <el-table-column
              prop="shootTime"
              label="拍摄时间"
              class="tableColumn"
            >
              <template v-slot="scope">
                <span>{{myhandleTimestamp(scope.row.shootTime)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="shootPlace"
              label="地点"
              class="tableColumn"
            />
            <el-table-column
              prop="tagStatus"
              label="标注状态"
              class="tableColumn"
            >
            <template v-slot="scope">
                <div>
                  <span
                    ><div v-if="scope.row.tagStatus === 'W'">未标注</div>
                    <div v-else-if="scope.row.tagStatus === 'P'">部分标注</div>
                    <div v-else-if="scope.row.tagStatus === 'F'">已标注</div>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" class="tableColumn">
              <template v-slot="scope">
                <span
                  @click="checkItem(scope.row)"
                  style="margin-right: 10px; color: rgb(86, 169, 255)"
                  >查看</span
                >
                <span
                  @click="deleteItem(scope.row.videoId)"
                  style="margin-right: 10px; color: rgb(86, 169, 255)"
                  >删除</span
                >
                <span
                  @click="downloadItem(scope.row)"
                  style="margin-right: 10px; color: rgb(86, 169, 255)"
                  >下载</span
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagenation">
          <el-pagination
            small
            background
            class="mt-4"
            style="margin-top: 5px"
            layout="total, sizes, prev, pager, next, jumper"
            :total="contentLength"
            :page-sizes="[5, 10, 20, 50, 100]"
            v-model:currentPage="currentPage"
            v-model:pageSize="currentSize"
          >
          </el-pagination>
        </div>
      </div>
      <div class="preview">
        <am-preview
          :videoInfo="previewData"
        >
        </am-preview>
      </div>
    </div>
  </div>
</template>
<script>
import { Axios, axios } from "axios";
import { request } from "@/js/axiosResquest";
import Preview from "@/components/Preview.vue";
import uploadVideo from "./uploadVideo.vue";
import {handleTimestamp} from "@/js/handleTimeStamp"

export default {
  components: {
    "am-preview": Preview,
    "upload-video": uploadVideo,
  },
  name: "DataSource2",
  data() {
    return {
      selectShootTime:"",
      // selectPart 选择框区域
      sensorTypeOptions: [
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
      markStateOptions: [
        {
          value: "W",
          label: "未标注",
        },
        {
          value: "P",
          label: "部分标注",
        },
        {
          value: "F",
          label: "已标注",
        },
      ],
      uploadSourceOpen: false,
      content: [], // 一次性获取的所有标注信息
      // 符合筛选条件的标注信息
      showcontent: [
        {
          videoId: 1000,
          videoName: "videoName",
          videoFileUrl: "@url",
          sensorType: ["VIS", "IR", "SAR", "HSI","HRV"],
          shootTime: '@datetime("yyyy-MM-dd A HH:mm:ss")',
          shootPlace: "深大",
          tagStatus: ["未标注", "部分标注", "已标注"],
          tagUserId: "@cname",
          motUserId: "@cname",
          tagTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        },
      ],
      contentLength: 1,
      currentPage: 1,
      currentSize: 20,
      selected: new Set(),  // 勾选的视频
      queryData: {
        VideoInformationQueryReq: {
          videoName: "",
          shootTime: "",
          shootPlace: "",
          sensorType: "",
        },
        QueryPagingParamsReq: {
          offset: 0,
          queryCount: 20,
        },
      },

      previewData: {
        videoId: "",
        videoName: "",
        videoFileUrl: "",
        shootTime: "",
        shootPlace: "",
        sensorType: "",
      },
    };
  },
  watch: {
    currentPage() {
      console.log("currentPage");
      this.queryData.QueryPagingParamsReq.offset =
        (this.currentPage - 1) * this.currentSize;
      this.queryData.QueryPagingParamsReq.queryCount = this.currentSize;
      this.cancelSelectItems();
      this.refreshContent();
    },
    currentSize() {
      console.log("pageSize");
      this.queryData.QueryPagingParamsReq.offset =
        (this.currentPage - 1) * this.currentSize;
      this.queryData.QueryPagingParamsReq.queryCount = this.currentSize;
      this.cancelSelectItems();
      this.refreshContent();
    },
  },
  methods: {
    async refreshContent() {
      // 刷新content值
      console.log("refreshContent");
      const queryData = {};
      try {
        const config = {
          method: "post",
          url: "/videoInformation/query",
          data: this.queryData,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        };
        const res = await request(config);
        // console.log("res", res);
        this.content = res.data.VideoInformationQueryRsp; // 拉取数据
        this.contentLength = res.data.QuerySummaryRsp.dataAmount; // 后台总条数
        console.log("content", this.content);

        // 装入选中的内容数组中准备输出

        this.selected.clear();
      } catch (error) {
        console.log(error);
      }
    },
    cancelSelectItems(){
      // 一个用来清除勾选的方法
      var theInputCheck = document.getElementsByName("allInputCheck") ;
      // 获取所有的checbox勾选框，把所有的置为false
      // console.log("theInputCheck",theInputCheck);
      theInputCheck.forEach(element => {
        element.checked = false;
        // console.log("element",element);
      });

    },
    myhandleTimestamp(value){
      return handleTimestamp(value);
    },
    deleteBatch() {
      if (window.confirm("确定批量删除当前页面勾选的项目吗？"))
      // if (window.confirm("确定批量删除操作" + `${(this.selected)}吗？`))   // 不知道如何展示数据 待改进
       {
        this.selected.forEach((element) => {
          console.log(element);
          this.deleteItem(element, true);
        });
        this.cancelSelectItems();
        this.refreshContent();
      }
    },
    dataSourceQuery() {
      console.log(this.queryData);
      this.refreshContent();
    },
    shootTimeChange() {
      if (this.selectShootTime === null || this.selectShootTime.length == 0) {
        // 空字符串加工
        // console.log("this.selectShootTimeYes",this.selectShootTime);
        this.queryData.VideoInformationQueryReq.shootTimeBegin = "";
        this.queryData.VideoInformationQueryReq.shootTimeEnd = "";
      } else {
        // console.log("this.selectShootTimeNo",this.selectShootTime);
        // console.log(this.selectShootTime.length);
        this.queryData.VideoInformationQueryReq.shootTimeBegin =
          this.selectShootTime[0] + "000000"; //完整日期需加上详细时间
        this.queryData.VideoInformationQueryReq.shootTimeEnd =
          this.selectShootTime[1] + "235959";
      }
    },
    selectTest() {
      console.log("selectTest");
    },
    selectItem(videoId) {
      console.log("event", event);
      console.log(videoId);
      if (event.target.checked) {
        if (!this.selected.has(videoId)) {
          this.selected.add(videoId);
        }
      } else {
        if (this.selected.has(videoId)) {
          this.selected.delete(videoId);
        }
      }
      console.log(this.selected);
    },
    checkItem(item) {
      // 把值传给子组件
      console.log("checkItem", item);
      this.previewData = {
        ...item,
      };
      console.log(this.previewData);
    },
    async deleteItem(videoId, isOutside = false) {
      const that = this;
      // console.log(videoId);
      var config = {
        method: "post",
        url: "/videoInformation/delete",
        data: {
          VideoInformationDeleteReq: {
            videoId: videoId,
          },
        },
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      };
      // isOutside 非直接deleteitem的事件，不再提醒
      if (isOutside || window.confirm("确定删除吗?")) {
        try {
          const rsp = await request(config);
          console.log(rsp);
          that.refreshContent();
        } catch (err) {
          console.log(err);
        }
      }
    },
    uploadSourceSuccess() {
      console.log("DataSource -----uploadSourceSuccess");
      this.uploadSourceOpen = false;
      this.refreshContent();
    },
    onChangeUploadStatus(){
    },
    // goToTag 本页面未用
    goToTag(item) {
      // navigation
      console.log("goToTag", item);
      this.$router.push({
        name: "DataMarker",
        params: {
          data: JSON.stringify(item),
        },
      });
    },
    getDataAll() {
      console.log(this);
    },
  },
  mounted() {
    this.refreshContent(); // 挂载即拉取数据
  },
};
</script>
<style scoped>
.main {
  display: flex;
  justify-content: flex-start;
  /* position: absolute; */
  left: 0px;
  top: 105px;
  width: 100%;
  height: 860px;
}
.data {
  position: relative;
  left: 10px;
  top: 5px;
  width: 75%;
  height: 860px;
  background: whitesmoke;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  display: flex;
  border-width: 1px;
  border-style: solid;
  border-color: #486586;
  border-radius: 5px;
}
.searchPart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
}
.searchCom {
  position: relative;
  top: 0px;
  left: 0px;
  height: 32px;
  display: inline-block;
  margin-left: 5px;
  margin-top: 15px;
  vertical-align: middle;
}
.selectlabel {
  position: relative;
  top: 2px;
  left: 0px;
  height: 32px;
  display: inline-block;
  margin-left: 8px;
}
.m-2 {
  width: 130px;
}
#date-picker {
  vertical-align: middle;
}
.dataMarkTable {
  width: 100%;
}
.elDataMarkTable {
  position: absolute;
  left: 0;
  top: 50px;
  width: 100%;
}
.elDataMarkTable .el-input {
  display: none;
}
/* 行内修改参考 */
/* .elDataMarkTable .current-row .el-input {
  display: block;
}
.elDataMarkTable .current-row .el-input + span {
  display: none;
} */
.pagenation {
  position: absolute;
  bottom: 5px;
  left: 0px;
  width: 100%;
  height: 40px;
}
.pagenation button {
  position: absolute;
  bottom: 5px;
  left: 400px;
  /* width:100%; */
  /* height:40px; */
}
.tableColumn {
  min-width: 10px;
  max-width: 160px;
  /* 无效 */
}
.el-date-editor {
  width: 200px;
}

.preview {
  position: relative;
  left: 10px;
  right: 10px;
  top: 5px;
  width: 23%;
  height: 860px;
  background: whitesmoke;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: #486586;
  border-radius: 5px;
  display: flex;
  margin-left: 5px;

  display: flex;
  justify-content: center;
}
.testButtonPart {
  position: absolute;
  z-index: 100;
}
</style>