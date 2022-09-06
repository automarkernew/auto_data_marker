<template>
  <!-- 目标库 -->
  <div class="main">
    <div class="data">
      <div class="searchpart">
        <div class="searchCom">
          <div class="inputLabel">
            <label>文件名：</label>
          </div>
          <el-input
            v-model="queryData.TargetTrackGetListReq.videoName"
            placeholder="Please input"
            style="width: 150px"
            clearable
          />
        </div>

        <div class="searchCom">
          <div class="inputLabel">
            <label>传感器类型：</label>
          </div>
          <el-select
            v-model="queryData.TargetTrackGetListReq.sensorType"
            placeholder="Please select"
            style="width: 120px"
            size="large"
            clearable
          >
            <el-option
              v-for="item in sensorTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="searchCom">
          <div class="inputLabel">
            <label>拍摄地点：</label>
          </div>
          <el-input
            v-model="queryData.TargetTrackGetListReq.shootPlace"
            placeholder="Please input"
            style="width: 120px"
            clearable
          />
        </div>

        <div class="searchCom">
          <div class="inputLabel">
            <label>拍摄时间：</label>
          </div>
          <el-date-picker
            v-model="selectShootTime"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYYMMDD"
          />
        </div>

        <div class="searchCom">
          <el-button @click="query" type="primary">查找</el-button>
        </div>
      </div>
      <div class="list">
        <el-table border :data="content" stripe height="750">
          <el-table-column
            prop="videoId"
            label="视频ID"
          ></el-table-column>
          <el-table-column
            prop="videoName"
            label="文件名"
          ></el-table-column>
          <el-table-column prop="sensorType" label="传感器" width="100">
            <template v-slot="scope">
              <div v-if="scope.row.sensorType === 'VIS'">可见光</div>
              <div v-else-if="scope.row.sensorType === 'IR'">红外光</div>
              <div v-else-if="scope.row.sensorType === 'SAR'">SAR图像</div>
              <div v-else-if="scope.row.sensorType === 'HSI'">高光谱</div>
              <div v-else-if="scope.row.sensorType === 'HRV'">高分辨率</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="shootTime"
            label="拍摄时间"
          >
            <template v-slot="scope">
              <span>{{handleTimestamp(scope.row.shootTime)}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="objectTypeList" label="所含类别" width="">
            <template v-slot="scope">
              <span
                v-for="item in scope.row.objectTypeList"
                style="margin: 0 3px 0 3px"
              >
                {{ item }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="targetList" label="目标" width="200">
            <template v-slot="scope">
              
              <el-select
                 v-model="scope.row.choose"
                placeholder="Select"
                size="small"
                @change="onSelectItem(scope.row)"
                clearable
              >
                <el-option
                  v-for="item in scope.row.targetList"
                  :key="item.track_id"
                  :label="item.object_type + item.track_id"
                  :value="item.track_id"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="preview">
      <div class="topbar">{{contentItem.objectType+"-"+contentItem.objectModel+"-"+contentItem.trackId}}</div>
      <div class="picshow">
        <!-- <div class="picitem">
          <markpic
            mapId="sadf"
            showWidth="300"
            picUrl="/rem.jpg"
            picWidth="960"
            picHeight="540"
            leftUpperCornerAbscissa="234"
            leftUpperCornerOrdinate="345"
            rightLowerQuarterAbscissa="579"
            rightLowerQuarterOrdinate="579"
            :trackNode="trackNodes"
          ></markpic>
        </div> -->
        <div v-for="(item,index) in contentItem.imageUrlList" class="picitem">
          
          <markpic
            :mapId="'map'+index"
            showWidth="245"
            showHeight="200"
            :picUrl="item"
            :picWidth="videoInfoContent.width"
            :picHeight="videoInfoContent.height"
            :leftUpperCornerAbscissa="contentItem.objectCoordinate[index][2]"
            :leftUpperCornerOrdinate="contentItem.objectCoordinate[index][3]"
            :rightLowerQuarterAbscissa="contentItem.objectCoordinate[index][4]"
            :rightLowerQuarterOrdinate="contentItem.objectCoordinate[index][5]"
            :trackNode="trackNodes"
          ></markpic>
        </div> 
      </div>

      <div class="info">
        <el-card class="infoItems" style="width:400px;" >
          <template #header>
            <div class="card-header">
              <span>相关信息</span>
            </div>
          </template>
          <div style="display:flex;width:320px;flex-wrap: wrap;margin-top: -15px">
            <div class="infoMinItem">
              <!-- 信息最小项 -->
              <div class="infoItemTitle">拍摄时间</div>
              <div>{{ handleTimestamp(contentItem.shootTime) }}</div>
            </div>
            <div class="infoMinItem">
              <!-- 信息最小项 -->
              <div class="infoItemTitle">拍摄地点</div>
              <div>{{ contentItem.shootPlace }}</div>
            </div>
            <br>
            <div class="infoMinItem">
              <!-- 信息最小项 -->
              <div class="infoItemTitle">传感器类别</div>
              <div>
                <span v-if="contentItem.sensorType === 'VIS'">可见光</span>
                <span v-else-if="contentItem.sensorType === 'IR'">红外光</span>
                <span v-else-if="contentItem.sensorType === 'SAR'">SAR图像</span>
                <span v-else-if="contentItem.sensorType === 'HSI'">高光谱</span>
                <span v-else-if="contentItem.sensorType === 'HRV'">高分辨率</span>
              </div>
            </div>
            <div class="infoMinItem">
              <!-- 信息最小项 -->
              <div class="infoItemTitle">目标信息</div>
              <div>
                <div>类别: {{ contentItem.objectType }}</div>
                <div>型号: {{ contentItem.objectModel }}</div>
                <div>轨迹编号: {{ contentItem.trackId }}</div>
                <div>关联ID: {{ contentItem.linkId }}</div>
              </div>
            </div>
          </div>
        </el-card>
        <el-card class="box-card" style="width:400px;">
        <template #header>
          <div class="card-header">
            <span>关联信息</span>
          </div>
        </template>
        <div >
          <el-table :data="contentItem.relatedInformationList" border style="width: 100%" height="145px">
            <el-table-column type="index" width="30" />
            <el-table-column prop="video_name" label="文件名" width="80" />
            <el-table-column prop="track_id" label="轨迹编号" width="80" />
            <el-table-column  label="操作" width="135" style="padding-left:0px">
              <el-button type="primary" style="width:50px">修改</el-button>
              <el-button type="danger" style="margin-left:5px;width:50px">删除</el-button>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
        
      </div>
    </div>
  </div>
</template>

<script>
import { request,MINIO,TOKEN } from "@/js/axiosResquest.js";
import MarkPic from "@/components/MarkPic.vue";
export default {
  components: {
    markpic: MarkPic,
  },
  data() {
    return {
      selectShootTime: "",
      //发送去请求列表数据content
      queryData: {
        TargetTrackGetListReq: {
          videoName: "",
          sensorType: "",
          objectType: "",
          shootTimeBegin: "",
          shootTimeEnd: "",
          shootPlace: "",
        },
        QueryPagingParamsReq: {
          offset: 0,
          queryCount: 10000,
        },
      },
      queryitemData: {
        TargetTrackGetTrackReq: {
          videoId: "",
          trackId: "",
        },
      },
      queryVideoInfoData: {
        VideoInformationQueryByIdReq: {
          videoId: "",
        },
      },

      content: [
        {
          videoId: "01",
          videoName: "test",
          sensorType: "VIS",
          shootTime: "1234",
          objectTypeList: ["meiyou", "shabi"],
          choose:"",  // 选择的目标
          targetList: [
            {
              object_type: "meiyou",
              track_id: "101",
            },
            {
              object_type: "shabi",
              track_id: "102",
            },
          ],
        },
      ],
      contentItem: {
        motImgUrl: "/rem.jpg",
        shootTime: "",
        shootPlace: "",
        // "飞行高度":"", 数据库暂时没有
        sensorType: "",
        objectType: "",    //
        objectModel: "",    //型号
        trackId: "",    //目标ID
        targetTypeId: "",   //
        linkID: "",   //关联ID
        imageUrlList: [], // 图片的路径，最多九张
        objectCoordinate: [
                [
                    "1",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
                [
                    "2",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
                [
                    "3",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
                [
                    "4",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
                [
                    "5",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
                [
                    "6",
                    "41",
                    "11",
                    "133",
                    "31",
                    "158"
                ],
                [
                    "18",
                    "41",
                    "11",
                    "134",
                    "31",
                    "159"
                ],
            ],  //测试坐标信息
        relatedInformationList: [
          {
            video_id: "",
            video_name: "",
            track_id: "",
          },
        ],
      },
      videoInfoContent: {
        videoId: "",
        videoName: "",
        videoFileUrl: "",
        shootTime: "",
        shootPlace: "",
        length: "",
        sensorType: "",
        height: "200",
        width: "300",
        tagUserId: "",
        motUserId: "",
        tagImgUrl: "",
        motImgUrl: "",
        tagTime: "",
        tagStatus: "",
        isTagged: "",
        isMoted: "",
      },
      select: "",
      sensorTypeOptions: [
        {
          label: "高光谱",
          value: "HSI",
        },
        {
          label: "可见光",
          value: "VIS",
        },
        {
          label: "红外光",
          value: "IR",
        },
        {
          label: "SAR图像",
          value: "SAR",
        },
        {
          label: "高分辨率",
          value: "HRV",
        },
      ],
      objectType: "",
      objectTypeOptions: [
        {
          label: "飞机",
          value: "飞机",
        },
        {
          label: "坦克",
          value: "坦克",
        },
        {
          label: "库房",
          value: "库房",
        },
      ],
      src: "https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg",
      trackNodes: [
        {
          x: 0,
          y: 0,
        },
        {
          x: 960,
          y: 540,
        },
      ],
    };
  },
  methods: {
    async query() {
      let that = this;
      if (this.selectShootTime === null || this.selectShootTime.length == 0) {
        // 空字符串加工
        // console.log("this.selectShootTimeYes",this.selectShootTime);
        this.queryData.TargetTrackGetListReq.shootTimeBegin = "";
        this.queryData.TargetTrackGetListReq.shootTimeEnd = "";
      } else {
        // console.log("this.selectShootTimeNo",this.selectShootTime);
        // console.log(this.selectShootTime.length);
        this.queryData.TargetTrackGetListReq.shootTimeBegin =
          this.selectShootTime[0] + "000000"; //完整日期需加上详细时间
        this.queryData.TargetTrackGetListReq.shootTimeEnd =
          this.selectShootTime[1] + "235959";
      }

      console.log("query");
      try {
        // console.log(that.queryData);
        const res = await request({
          method: "post",
          url: "TargetTrack/getList",
          data: that.queryData,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });
        // console.log("res", res);
        that.content = res.data.TargetTrackGetListRsp;
        console.log("query content",that.content);
        return "1";
      } catch (error) {
        console.log(error);
      }
    },
    async queryitem() {
      let that = this;
      console.log("queryitem");
      try {
        const res = await request({
          method: "post",
          url: "/TargetTrack/getTrack",
          data: that.queryitemData,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });
        // console.log("res", res);
        // 补全图片地址
        let tempContentItem = res.data.TargetTrackGetTrackRsp;
        let tempImageUrlList = tempContentItem.imageUrlList;
        tempImageUrlList.forEach(
          (item, index)=>{
            tempContentItem.imageUrlList[index] = MINIO+item;
            // console.log(tempContentItem.imageUrlList[index] );
          }
        );
        // 计算出trackNodes
        let tempTrackNodes = [];
        tempContentItem.objectCoordinate.forEach(
          (item, index) => {
            console.log("--objectCoordinate item , index",item ,index);
            tempTrackNodes.push({
              x:(Number(item[2])+Number(item[4]))/2,
              y:(Number(item[3])+Number(item[5]))/2
              })
          }
        );
        // console.log("---> TrackCanter tempTrackNodes",tempTrackNodes);
        that.trackNodes = tempTrackNodes;
        that.contentItem = tempContentItem;
        console.log("contentItem",that.contentItem);

        
        return "1";
      } catch (error) {
        console.log(error);
      }
    },
    async queryVideoInfo() {
      let that = this;
      console.log("queryVideoInfo");
      try {
        const res = await request({
          method: "post",
          url: "videoInformation/queryById",
          data: that.queryVideoInfoData,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });
        // console.log("queryVideoInfo res", res);
        that.videoInfoContent = res.data.VideoInformationQueryByIdRsp;
        console.log("queryVideoInfo",that.videoInfoContent);
        return "1";
      } catch (error) {
        console.log(error);
      }
    },
    async onSelectItem(data_pre) {
      // data_pre 是可以直接影响原数据的
      let data = data_pre;
      let dataChoose = data.choose;
      console.log("onSelectItem data",data);
      if(data.choose==""){
        return
      }
      // 先清一遍选择列表 targetList.choose
      const stepzero = await this.content.forEach(element => {
        element.choose = "";
        // console.log("element.targetList.choose",element.choose);
      });
      data_pre.choose=dataChoose; // data_pre 是可以直接影响原数据的， 这样如此赋值即可修改就可以再清空其他选项后选择出trackId
      // console.log(data_pre);
      // console.log("step zero success", stepzero);
      this.queryitemData.TargetTrackGetTrackReq.videoId = data.videoId;
      this.queryitemData.TargetTrackGetTrackReq.trackId =
        data.choose;
      this.queryVideoInfoData.VideoInformationQueryByIdReq.videoId =
        data.videoId;
      const stepone = await this.queryitem();
      // console.log("steponeSuccess",stepone);
      
      const steptwo = await this.queryVideoInfo();
      // console.log("steptwoSuccess", steptwo);
      
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
    linkInfoDeleteItem(videoId, track_id) {},
  },
  watch: {
    // selectShootTime() {
    //   console.log(this.selectShootTime);
    //   Date.prototype.Format = function (fmt) {
    //     let o = {
    //       "M+": this.getMonth() + 1, //月份
    //       "d+": this.getDate(), //日
    //       "h+": this.getHours(), //小时
    //       "m+": this.getMinutes(), //分
    //       "s+": this.getSeconds(), //秒
    //       "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    //       S: this.getMilliseconds(), //毫秒
    //     };
    //     if (/(y+)/.test(fmt))
    //       fmt = fmt.replace(
    //         RegExp.$1,
    //         (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    //       );
    //     for (let k in o)
    //       if (new RegExp("(" + k + ")").test(fmt))
    //         fmt = fmt.replace(
    //           RegExp.$1,
    //           RegExp.$1.length == 1
    //             ? o[k]
    //             : ("00" + o[k]).substr(("" + o[k]).length)
    //         );
    //     return fmt;
    //   }; // 从CSDN引入的获取将Date转化为特定格式的字符串
    //   var myselect = this.selectShootTime;
    //   this.queryData.TargetTrackGetListReq.shootTimeBegin =
    //     myselect[0].Format("yyyyMMdd");
    //   this.queryData.TargetTrackGetListReq.shootTimeEnd =
    //     myselect[1].Format("yyyyMMdd");
    //   //  console.log(this.queryData.TargetTrackGetListReq.shootTimeEnd);
    // },
  },
  mounted() {
    this.query();
  },
};
</script>

<style scoped>
.main {
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
  height: 882px;
}

.data {
  width: 60%;
  border: 1px solid #486586;
  border-radius: 5px;
  box-sizing: border-box;
  padding: 1px;
  height: 100%;
  margin-left:5px
}
.searchpart {
  display: flex;
}

.searchCom {
  position: relative;
  margin: 10px;
  display: inline-block;
  vertical-align: middle;
}
.inputLabel {
  display: inline-block;

  position: relative;
}

.preview {
  width: 39%;
  border: 1px solid #486586;
  border-radius: 5px;
  height: 100%;
  margin-left:5px;
}

.topbar {
  background-color: #ddd;
  width: 100%;
  box-sizing: border-box;
}

.picshow {
  width: 100%;
  display: grid;
  height: 606px;
  grid-template-columns: auto auto auto;
}
.picitem {
  border: 1px solid #223355;
  text-align: center;
  height: 200px;
  width: 245px;
  margin-left: 5px;
  display: flex;
}
.info {
  display: flex;
  height: 260px;
}
.info > div {
  margin: 10px;
  border: 1px slategray solid;
}
.infoItems > div {
  padding: 3px;
  column-count: 2;
}
.infoItemTitle {
  border-bottom: 1px gray dashed;
  width: 150px
}
.infoMinItem{
  /* margin-bottom: 15px; */
  width:150px;
  margin-left: 5px;
}
.littleTable table{
  border: 1px solid #bbb;
  border-collapse: collapse;
}
.littleTable tr{
  border: 1px solid #bbb;
  border-collapse: collapse;
}
.littleTable th{
  border: 1px solid #bbb;
  border-collapse: collapse;
  padding: 2px 3px 2px 3px;
}
.littleTable td{
  border: 1px solid #bbb;
  border-collapse: collapse;
  padding: 2px 3px 2px 3px;
}
</style>