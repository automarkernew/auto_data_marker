<template>
  <!--数据标注信息列表页面-->
  <div style="position: absolute;width:100%">
    <div class="main">
      <div class="data">
        <div class="searchPart">
          <div class="searchCom">
            <div class="selectlabel">
              <label>数据类型：</label>
            </div>
            <el-select
              v-model="sensorType"
              class="m-2"
              placeholder="Select"
              clearable
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
              v-model="shootTimeRange"
              type="daterange"
              start-placeholder="Start Date"
              end-placeholder="End Date"
              :default-value="[new Date(2020, 9, 1), new Date(2020, 10, 1)]"
              clearable
              @change="shootTimeChange"
              style="width: 300px; height: 32px"
            >
            </el-date-picker>
          </div>
          <div class="searchCom">
            <div class="selectlabel">
              <label>拍摄地点：</label>
            </div>
            <el-input
              v-model="shootPlace"
              placeholder="Please input"
              style="width: 200px"
            />
          </div>
          <div class="searchCom">
            <div class="selectlabel">
              <label>标注：</label>
            </div>
            <el-select
              v-model="markState"
              class="m-2"
              placeholder="Select"
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
              @click="selectChange"
              >查找</el-button
            >
          </div>
        </div>
        <div class="testButtonPart">
        </div>
        <div class="dataMarkTable">
          <el-table class="elDataMarkTable" height="750" :data="showcontent">
            <el-table-column
              prop="videoId"
              label="序号"
              class="tableColumn"
              width="150px"
            />
            <el-table-column
              prop="videoName"
              label="视频文件名"
              class="tableColumn"
            />
            <el-table-column
              prop="videoFileUrl"
              label="文件路径"
              class="tableColumn"
              style="overflow: hidden"
            />
            <el-table-column
              prop="sensorType"
              label="数据类型"
              class="tableColumn"
            >
            <template v-slot="scope">
                <div>
                  <!-- <el-input  v-model="scope.row.sensorType"
                    @change="sensorTypeChange()"
                  ></el-input> -->
                  <span
                    ><div v-if="scope.row.sensorType === 'VIS'">可见光</div>
                    <div v-else-if="scope.row.sensorType === 'IR'">红外光</div>
                    <div v-else-if="scope.row.sensorType === 'SAR'">SAR图像</div>
                    <div v-else-if="scope.row.sensorType === 'HSI'">高光谱</div>
                    <div v-else-if="scope.row.sensorType === 'HRV'">高分辨率 </div>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="shootTime"
              label="拍摄时间"
              class="tableColumn"
            >
            <template v-slot="scope">
              <span>{{handleTimestamp(scope.row.shootTime)}}</span>
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
            <!-- <el-table-column
              prop="tagUserId"
              label="目标跟踪用户"
              class="tableColumn"
            />
            <el-table-column
              prop="motUserId"
              label="轨迹跟踪用户"
              class="tableColumn"
            />
            <el-table-column
              prop="tagTime"
              label="标注时间"
              class="tableColumn"
            /> -->
            <el-table-column label="操作" class="tableColumn">
              <template v-slot="scope">
                <el-button type="primary" @click="checkitem(scope.row)" style="width:40px">查看</el-button>
                <el-button type="primary" @click="goToTag(scope.row)" style="width:40px" >标注</el-button>
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
            layout="total, sizes, prev, pager, next, ,jumper"
            :total="contentLength"
            :page-sizes="[5, 10, 20, 50, 100]"
            v-model:currentPage="currentPageNum"
            v-model:pageSize="pageSizeNum"
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
import axios from "axios";
import { request } from "@/js/axiosResquest";
import { async } from "ailabel";
import Preview from '@/components/Preview.vue'

export default {
  components:{
    'am-preview':Preview
  },
  data() {
    return {
      // selectPart 选择框区域
      sensorType: "",
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
      shootTimeRange: "",
      shootPlace: "",
      markState: "",
      markStateOptions: [
        {
          value: "W",
          label: "未标注",
        },
        {
          value: "F",
          label: "已标注",
        },
        {
          value: "P",
          label: "部分标注",
        },
      ],
      content: [], // 一次性获取的所有标注信息
      // 符合筛选条件的标注信息
      selectContent: [],
      // 显示在当页的标注信息
      showcontent: [
        {
          videoId: 1000,
          videoName:"videoName",
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
      currentPageNum: 1,
      pageSizeNum: 20,
      showcontentOptions: {
        start: 0, // content slice() 起始展示下标
        end: 5, // content slice() 结束展示下标
      },

      previewData:{
        videoId:"",
        videoName:"",
        videoFileUrl:"",
        shootTime:"",
        shootPlace:"",
        sensorType:"",

      }
    };
  },
  watch: {
    currentPageNum(newvalue, lastvalue) {
      // console.log("watch currentPageNum" + newvalue + "from" + lastvalue);
      // console.log(this.currentPageNum); //成功获取
      this.pagechange(false);
    },
    pageSizeNum(newvalue, lastvalue) {
      // console.log("watch pageSizeNum" + newvalue + "from" + lastvalue);
      // console.log(this.pageSizeNum); //成功获取
      this.pagechange(true);
    },
  },
  methods: {
    // 刷新列表（获取全体数据内容） 
    // 注意数据获取只进行两次，一次拿到res.data.QuerySummaryRsp.dataAmount后改写queryCount，一次用实际的queryCount去query
    // 剩下的筛选操作都由前端完成
    async refreshContent() {
      // 刷新content值
      let realQueryCount = 1;
      try {
        const config = {
          method: "post",
          url: "/videoInformation/query",
          data: {
            VideoInformationQueryReq: {
              videoName: "",
              shootTime: "",
              shootPlace: "",
              sensorType: "",
            },
            QueryPagingParamsReq: {
              offset: 0,
              queryCount: 1 // 第一次执行的时候是1
            },
          },
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        };
        const res_pre = await request(config);
        // console.log("config->",config.data.QueryPagingParamsReq.queryCount);
        realQueryCount = res_pre.data.QuerySummaryRsp.dataAmount // 后台总条数
        config.data.QueryPagingParamsReq.queryCount = 1 >= realQueryCount ? 1 : realQueryCount // 第二次执行的时候是实际值
        // console.log("realQueryCount", realQueryCount);
        const res = await request(config);
        
        // console.log("res", res);
        this.content = res.data.VideoInformationQueryRsp  // 拉取的数据
        this.contentLength = res.data.QuerySummaryRsp.dataAmount; // 后台总条数
        // console.log("content",this.content)

        // 装入选中的内容数组中准备输出
        this.selectContent = this.content;  // 没有筛选条件下的数据全部放入 -> 选中的数据
        this.pagechange(false); // 触发内容渲染

      } catch (error) {
        console.log(error);
      }
    },
    // 筛选内容改变
    selectChange() {
      let that = this;

      // 依次筛选出需要展示的信息
      function selectSensorType(item) {
        return item.sensorType === that.sensorType;
      }
      function selectShootTime(item) {
        var theDate = new Date(item.shootTime);
        /*
            Date 构造参考
            new Date();
            new Date(value);
            new Date(dateString);
            new Date(year, monthIndex [, day [, hours [, minutes [, seconds [, milliseconds]]]]]);
            */
           console.log("now shootTimeRange : ", this.shootTimeRange);
        return (
          theDate >= that.shootTimeRange[0] && theDate <= that.shootTimeRange[1]
        );
      }
      function selectShootPlace(item) {
        return item.shootPlace === that.shootPlace;
      }
      function selectMarkState(item) {
        return item.tagStatus === that.markState;
      }

      let mySelectContent = this.content.slice();
      if (that.sensorType != "") {
        // console.log("sensorTypeyes");
        mySelectContent = mySelectContent.filter(selectSensorType);
      }
      if (that.shootTimeRange != "") {
        // console.log("shootTimeRangeyes");
        mySelectContent = mySelectContent.filter(selectShootTime);
      }
      if (that.shootPlace != "") {
        // console.log("shootPlaceyes");
        mySelectContent = mySelectContent.filter(selectShootPlace);
      }
      if (that.markState != "") {
        // console.log("markStateyes");
        mySelectContent = mySelectContent.filter(selectMarkState);
      }

      this.selectContent = mySelectContent;
      this.pagechange(false);
    },
    // 分页器事件
    pagechange(isSizeChange) {
      // isSizeChange 用于判别是currentPageNum 变了 还是 pageSizeNum 变了
      if (isSizeChange) {
        this.currentPageNum = 1;
      }

      let pagenow = this.currentPageNum;
      let pagesize = this.pageSizeNum;

      this.showcontentOptions.start = (pagenow - 1) * pagesize;

      let mystart = this.showcontentOptions.start;
      this.showcontentOptions.end = mystart + pagesize;

      let myend = this.showcontentOptions.end;

      this.showcontent = this.selectContent.slice(mystart, myend);

      // console.log(this.showcontent); //成功改变
    },
    shootTimeChange(value) {
      // 拍摄时间范围选定时触发
      // console.log(this.shootTimeRange);
      // 本方法暂不需要
    },
    checkitem(item){
      // 把值传给子组件
      // console.log("checkitem", item);
      this.previewData = {
        ...item
      };
      // console.log(this.previewData);

    },
    goToTag(item){
      // navigation
      console.log("goToTag",item.sensorType);
      switch(item.sensorType){
        case "VIS":{
          this.$router.push({
            path:"/dataMarkerInformation/dataMarker",
            name: "DataMarker",
            params:{
              data: JSON.stringify(item)
            }
          })
          break
        }
        case "HSI":{
          this.$router.push({
            path:"/dataMarkerInformation/HyperspectralImageMarker",
            name: "HyperspectralImageMarker",
            params:{
              data: JSON.stringify(item)
            }
          })
          break
        }
        case "HRV":{
          this.$router.push({
            path:"/dataMarkerInformation/HighResolutionImageMarker",
            name: "HighResolutionImageMarker",
            params:{
              data: JSON.stringify(item)
            }
          })
          break
        }
        case "IR":{
          this.$router.push({
            path:"/dataMarkerInformation/InfraredImageMarker",
            name: "InfraredImageMarker",
            params:{
              data: JSON.stringify(item)
            }
          })
          console.log(item)
          break
        }
        case "SAR":{
          this.$router.push({
            path:"/dataMarkerInformation/SARImageMarker",
            name: "SARImageMarker",
            params:{
              data: JSON.stringify(item)
            }
          })
          break
        }
      }
      
    },
    handleTimestamp(str) {
      //20220309114140
      var year = str.substring(0, 4);
      var month = str.substring(4, 6);
      var day = str.substring(6, 8);
      var hour = str.substring(8, 10);
      var minute = str.substring(10, 12);
      var second = str.substring(12, 14);
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second
      );
    },
  },
  mounted() {
    console.log("I am mounted");
    this.refreshContent();  // 挂载即拉取数据
  },
};
</script>
<style scoped>
.main {
  display: flex;
  justify-content: flex-start;
  position: absolute;
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
#date-picker {
  vertical-align: middle;
}
.dataMarkTable {
  width: 100%;
}
.elDataMarkTable {
  position: absolute;
  left: 0;
  top: 60px;
  width: 100%;
}
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