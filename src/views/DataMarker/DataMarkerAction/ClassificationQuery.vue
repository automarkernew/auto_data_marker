<template>
  <div class="classificationQuery">
    <el-button
      class="classificationQueryBtn"
      v-for="item in objectTypeList"
      :key="item"
      @click="searchByType(item.objectType)"
    >
      {{ item.objectType }}
    </el-button>
  </div>
  <el-table
    :data="objectTrackList"
    class="classificationQueryTable"
    max-height="400px"
  >
    <el-table-column
      label="轨迹ID"
      min-width="20%"
      align="center"
      sortable
      prop="trackId"
    >
      <template #default="scope">
        {{ scope.row.trackId }}
      </template>
    </el-table-column>
    <el-table-column
      label="开始帧"
      min-width="20%"
      align="center"
      sortable
      prop="startFrame"
    >
      <template #default="scope">
        {{ scope.row.startFrame }}
      </template>
    </el-table-column>
    <el-table-column
      label="结束帧"
      min-width="20%"
      align="center"
      sortable
      prop="endFrame"
    >
      <template #default="scope">
        {{ scope.row.endFrame }}
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="20%" align="center">
      <template #default="scope">
        <el-button type="text" size="small" @click="openDialog(scope.row)"
          >查看</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <!-- 查看弹窗 -->
  <el-dialog v-model="dialogVisible" title="详细信息" width="40%">
    <TrackDetail ref="trackDetail" :mapId="mapId"></TrackDetail>
    <template #footer>
      <span class="dialog-footer">
        <span>当前帧数：</span>
        <el-select
          v-model="frame"
          placeholder="请选择帧数"
          @change="getImgByFrame"
        >
          <el-option
            v-for="item in frameList"
            :key="item"
            :value="item"
            :label="item"
          >
          </el-option>
        </el-select>
        <div class="footerBtn">
          <el-button @click="getBeforeFrame">上一帧</el-button>
          <el-button @click="getNextFrame">下一帧</el-button>
        </div>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
import { ElMessage } from "element-plus";
import TrackDetail from "./TrackDetail.vue";
import AILabel from "ailabel";

export default {
  name: "ClassificationQuery",
  components: {
    TrackDetail,
  },
  data() {
    return {
      videoInformation: {},
      option: "",
      dialogVisible: false,
      objectTypeList: [],
      objectTrackList: [],
      frame: "", // 当前帧数
      startFrame: "", // 起始帧数
      endFrame: "", // 结束帧数
      frameList: [],
      mapId: "trackDetail",
    };
  },
  methods: {
    // 初始化
    init(videoInformation) {
      this.videoInformation = videoInformation;
      this.option = "track";
      this.getObjectType();
      this.searchByType("")
    },
    // 获取类别下拉框
    async getObjectType() {
      try {
        const res = await request({
          url: "TargetTrack/queryType",
          method: "post",
          data: {
            QueryTypeByVideoIdReq: {
              videoId: this.videoInformation.videoId,
            },
          },
        });
        if (res && res.code === 2000) {
          this.objectTypeList = res.data.QueryTypeByVideoIdRsp;
          if(this.objectTypeList[0]!=null){
            this.searchByType(this.objectTypeList[0].objectType);
          }
          // this.searchByType(this.objectTypeList[0].objectType);
        } else {
          this.$message.error("获取类别失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    async searchByType(objectType) {
      try {
        const res = await request({
          url: "TargetTrack/queryTrack",
          method: "post",
          data: {
            QueryTrackReq: {
              videoId: this.videoInformation.videoId,
              objectType: objectType,
            },
          },
        });
        if (res && res.code === 2000) {
          console.log(".,========================================")
          const QueryTrackRsp = res.data.QueryTrackRsp;
          if(QueryTrackRsp.length==0){
            this.objectTrackList=[]
          }
          for (let i = 0; i < QueryTrackRsp.length; i++) {
            if (QueryTrackRsp[i].frameList) {
              const frameListItem = QueryTrackRsp[i].frameList.trim().split(" ");
              this.objectTrackList[i] = {
                objectModel: QueryTrackRsp[i].objectModel,
                trackId: QueryTrackRsp[i].trackId,
                frameList: frameListItem,
                endFrame: frameListItem[frameListItem.length - 1],
                startFrame: frameListItem[0],
              };
            } else {
              this.objectTrackList[i] = {
                objectModel: QueryTrackRsp[i].objectModel,
                trackId: QueryTrackRsp[i].trackId,
                frameList: "",
                startFrame: "",
                endFrame: "",
              };
            }
          }
        } else {
          this.$message.error("查询轨迹失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 打开查看弹窗
    openDialog(row) {
      if (!row.frameList) {
        ElMessage.warning("无视频帧包含该轨迹ID");
        return;
      }
      this.dialogVisible = true;
      this.trackId = row.trackId;
      this.startFrame = row.startFrame;
      this.endFrame = row.endFrame;
      this.frame = row.startFrame;
      this.frameList = row.frameList;
      this.$nextTick(() => {
        this.$refs.trackDetail.initMap(
          this.videoInformation,
          this.frame,
          this.option
        );
        if (this.videoInformation.isMoted == "1") {
          this.$refs.trackDetail.tracker(this.frame, this.trackId);
          return;
        }
        if (this.videoInformation.isTagged == "1") {
          this.$refs.trackDetail.marker(this.frame, this.trackId);
          return;
        }
      });
    },
    getImgByFrame() {
      this.$nextTick(() => {
        this.$refs.trackDetail.initMap(
          this.videoInformation,
          this.frame,
          this.option
        );
        if (this.videoInformation.isMoted == "1") {
          this.$refs.trackDetail.tracker(this.frame, this.trackId);
          return;
        }
        if (this.videoInformation.isTagged == "1") {
          this.$refs.trackDetail.marker(this.frame, this.trackId);
          return;
        }
      });
    },
    getBeforeFrame() {
      if (this.frame == this.startFrame) {
        ElMessage.warning("已经是起始帧了");
        return;
      }
      this.frame--;
      this.getImgByFrame();
    },
    getNextFrame() {
      if (this.frame == this.endFrame) {
        ElMessage.warning("已经是结束帧了");
        return;
      }
      this.frame++;
      this.getImgByFrame();
    },
  },
};
</script>

<style scoped>
.classificationQuery {
  position: absolute;
  top: 30px;
  width: 100%;
  height: 100px;
}
.classificationQueryBtn {
  font-size: 14px;
  margin: 5px;
}
.classificationQueryTable {
  position: absolute;
  display: flex;
  top: 120px;
  width: 100%;
  font-size: 12px;
}
.dialog-footer {
  position: relative;
  display: flex;
  align-items: center;
  margin: 10px;
}
.footerBtn {
  margin-left: 20px;
}
#trackDetail {
  position: relative;
  top: 0px;
  left: 0px;
  height: 440px;
  width: 100%;
}
</style>
