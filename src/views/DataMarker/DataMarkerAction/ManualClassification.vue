<template>
  <el-container class="classificationDialog">
    <el-main>
      <el-form
        :model="visibleTaggingObject"
        :rules="rules1"
        ref="visibleTaggingObject"
      >
        <el-form-item label="关联ID" prop="linkId">
          <el-select
            v-model="linkId"
            placeholder="请选择关联ID"
            @click="getAllLinkId"
            @change="getTypeAndModel"
          >
            <el-option
              v-for="item in objectLinkIdList"
              :key="item"
              :label="item.linkId"
              :value="item.linkId"
            ></el-option>
          </el-select>
          <el-button
            type="primary"
            @click="openLinkIdDialog"
            style="margin-left: 10px"
            >新建</el-button
          >
        </el-form-item>
        <span>
          <el-button
            type="text"
            @click="openThumbnail"
            style="margin-left: 250px; margin-top: -10px"
            >查看缩略图</el-button
          >
        </span>
        <el-form-item label="轨迹ID" prop="trackId">
          <el-select
            v-model="visibleTaggingObject.trackId"
            placeholder="请选择轨迹ID"
            @click="getTrackId"
            filterable
            clearable
          >
            <el-option
              v-for="item in trackIdList"
              :key="item"
              :label="item.trackId"
              :value="item.trackId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类别" prop="objectType">
          <el-select
            v-model="visibleTaggingObject.objectType"
            placeholder="请选择类别"
            :disabled="true"
          >
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="objectModel">
          <el-select
            v-model="visibleTaggingObject.objectModel"
            placeholder="请选择型号"
            :disabled="true"
          >
          </el-select>
        </el-form-item>
      </el-form>
    </el-main>
    <el-footer align="center">
      <el-button
        type="primary"
        @click="handleClassification('visibleTaggingObject')"
        >确定</el-button
      >
      <el-button @click="resetClassification('visibleTaggingObject')"
        >重置</el-button
      >
    </el-footer>
  </el-container>
  <!-- 新建关联ID弹窗 -->
  <el-dialog title="新建关联ID" v-model="dialogVisible" width="30%" center>
    <el-container class="classificationDialog">
      <el-main>
        <el-form :model="visibleTaggingObject" :rules="rules2" ref="dialog">
          <el-form-item label="类别" prop="objectType">
            <el-select
              v-model="visibleTaggingObject.objectType"
              placeholder="请选择类别"
              @click="getObjectType"
              @change="showObjectModel"
              allow-create
              filterable
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
          <el-form-item label="型号" prop="objectModel">
            <el-select
              v-model="visibleTaggingObject.objectModel"
              placeholder="请选择型号"
              :disabled="objectModelShow"
              @click="getObjectModel"
              allow-create
              filterable
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
        </el-form>
      </el-main>
      <el-footer align="center">
        <el-button type="primary" @click="createLinkId('dialog')"
          >创建</el-button
        >
        <el-button @click="closeDialog">取消</el-button>
      </el-footer>
    </el-container>
  </el-dialog>
  <!-- 展开缩略图 -->
  <el-dialog v-model="thumbnailVisible" title="缩略图" width="70%" center>
    <div class="dialogBody">
      <div class="dialogBodyItem" v-for="item in thumbnailList" :key="item">
        <TrackDetail
          :ref="'thumbnail' + item.index"
          :mapId="'thumbnail' + item.index"
        ></TrackDetail>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <span>缩略图数量：{{ this.thumbnailNumber }}</span>
        <!-- <div class="footerBtn">
          <el-button @click="getBeforeFrame">上一张</el-button>
          <label class="frameLabel">第{{ this.thumbnailPage }}张</label>
          <el-button @click="getNextFrame">下一张</el-button>
        </div> -->
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
import { ElMessage } from "element-plus";
import TrackDetail from "./TrackDetail.vue";

export default {
  name: "ManualClassification",
  components: {
    TrackDetail,
  },
  emits: ["refreshClassificationQuery"],
  data() {
    return {
      objectModelShow: true, // 分类型号禁用
      trackIdList: [], // 轨迹ID列表
      objectTypeList: [], // 类别列表
      objectModelList: [], // 型号列表
      objectLinkIdList: [], // 关联ID列表
      dialogVisible: false, // 新建关联ID弹窗
      thumbnailVisible: false, // 缩略图弹窗
      MorT: null, //标记符
      linkId: "", // 关联ID
      visibleTaggingObject: {
        videoId: "",
        trackId: "",
        objectType: "",
        objectModel: "",
      },
      thumbnailNumber: "", // 缩略图总数
      thumbnailPage: "", // 当前缩略图张数
      thumbnailList: [],
      rules1: {
        trackId: [
          { required: true, message: "轨迹ID不能为空", trigger: "blur" },
        ],
        objectType: [
          { required: true, message: "类别不能为空", trigger: "blur" },
        ],
        objectModel: [
          { required: true, message: "型号不能为空", trigger: "blur" },
        ],
      },
      rules2: {
        objectType: [
          { required: true, message: "类别不能为空", trigger: "blur" },
        ],
        objectModel: [
          { required: true, message: "型号不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 初始化
    init(videoId) {
      this.visibleTaggingObject.videoId = videoId;
    },
    // 获取轨迹ID下拉框
    async getTrackId() {
      try {
        const res = await request({
          url: "visibleTagging/queryAllTrackId",
          method: "post",
          data: {
            VisibleTaggingMotQueryAllTrackIdReq: {
              videoid: this.visibleTaggingObject.videoId,
            },
          },
        });
        if (res && res.code === 2000) {
          this.trackIdList = res.data.VisibleTaggingMotQueryAllTrackIdRsp;
        } else {
          this.$message.error("请求轨迹ID下拉列表失败");
        }
      } catch (error) {
        console.log(error);
      }
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
          this.$message.error("请求类别下拉列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 获取型号下拉框
    async getObjectModel() {
      if (this.objectModelShow) {
        return;
      }
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
          this.$message.error("请求型号下拉列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 查询所有关联ID
    async getAllLinkId() {
      try {
        const res = await request({
          url: "ObjectType/queryAllLinkId",
          method: "get",
        });
        if (res && res.code === 2000) {
          this.objectLinkIdList = res.data.QueryLinkIdRsp;
        } else {
          this.$message.error("请求关联ID下拉列表失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 根据关联ID查询对应类别型号
    async getTypeAndModel() {
      try {
        const res = await request({
          url: "ObjectType/queryByLinkId",
          method: "post",
          data: {
            LinkIdReq: {
              linkId: this.linkId,
            },
          },
        });
        if (res && res.code === 2000) {
          this.visibleTaggingObject.objectType = res.data.LinkIdRsp.objectType;
          this.visibleTaggingObject.objectModel =
            res.data.LinkIdRsp.objectModel;
        } else {
          this.$message.error("获取对应类别型号失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 打开新建关联ID弹窗
    openLinkIdDialog() {
      this.visibleTaggingObject.objectType = "";
      this.visibleTaggingObject.objectModel = "";
      this.dialogVisible = true;
    },
    // 关闭新建关联ID弹窗
    closeDialog() {
      this.visibleTaggingObject.objectType = "";
      this.visibleTaggingObject.objectModel = "";
      this.dialogVisible = false;
    },
    // 型号显示或禁用
    showObjectModel() {
      this.visibleTaggingObject.objectModel = "";
      this.objectModelShow = !this.visibleTaggingObject.objectType;
    },
    // 新建关联ID
    async createLinkId(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 判断MorT的值
          var newType = true;
          var newModel = true;
          for (let i = 0; i < this.objectTypeList.length; i++) {
            if (
              this.visibleTaggingObject.objectType ===
              this.objectTypeList[i].objectType
            ) {
              newType = false;
              break;
            }
          }
          for (let i = 0; i < this.objectModelList.length; i++) {
            if (
              this.visibleTaggingObject.objectModel ===
              this.objectModelList[i].objectModel
            ) {
              newModel = false;
              break;
            }
          }
          console.log("newType, newModel", newType, newModel);
          // 新类别新型号
          if (newType && newModel) {
            this.MorT = 0;
          }
          // 旧类别新型号
          else if (!newType && newModel) {
            this.MorT = 1;
          }
          console.log("MorT", this.MorT);
          try {
            const res = request({
              url: "ObjectType/creat",
              method: "post",
              data: {
                ObjectTypeReq: {
                  videoId: this.visibleTaggingObject.videoId,
                  objectType: this.visibleTaggingObject.objectType,
                  objectModel: this.visibleTaggingObject.objectModel,
                  MorT: this.MorT,
                },
              },
            }).then((res) => {
              if (res && res.code === 2000) {
                this.linkId = res.data.ObjectTypRsp.linkId;
                ElMessage.success("新建关联ID成功");
                this.dialogVisible = false;
              } else {
                this.$message.error("新建关联ID失败");
              }
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          ElMessage.warning("请补全必填信息");
        }
      });
    },
    // 提交分类
    async handleClassification(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          try {
            const res = request({
              url: "TargetTrack/updateTrack",
              method: "post",
              data: {
                TargetTrackUpdateReq: this.visibleTaggingObject,
              },
            }).then((res) => {
              if (res && res.code === 2000) {
                ElMessage.success("手动分类成功");
                // 分类成功后刷新分类查询初始化
                this.$emit("refreshClassificationQuery");
              } else {
                this.$message.error("保存分类失败");
              }
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          ElMessage.warning("请补全必填信息");
        }
      });
    },
    // 重置分类
    resetClassification(formName) {
      this.$refs[formName].resetFields();
    },
    // 打开缩略图
    async openThumbnail() {
      if (!this.linkId) {
        ElMessage.warning("请先选择关联Id");
        return;
      }
      try {
        const res = await request({
          url: "yoloTagging/getThumbnail",
          method: "post",
          data: {
            YoloTaggingGetThumbnailReq: {
              linkId: this.linkId,
            },
          },
        });
        if (res && res.code === 2000) {
          this.thumbnailList = res.data.YoloTaggingGetThumbnailRsp;
        } else {
          this.$message.error("获取缩略图失败");
        }
      } catch (error) {
        console.log(error);
      }
      if (this.thumbnailList.length === 0) {
        ElMessage.warning("该关联Id无对应缩略图");
        return;
      }
      var index = 0;
      this.thumbnailList.forEach((rec) => {
        index++;
        rec.index = index;
      });
      console.log("this.thumbnailList", this.thumbnailList);
      this.thumbnailVisible = true;
      this.thumbnailNumber = this.thumbnailList.length;
      for (let i = 0; i < this.thumbnailNumber; i++) {
        const thumbnailData = this.thumbnailList[i];
        const videoInformation = {
          videoId: thumbnailData.videoId,
          height: thumbnailData.height,
          width: thumbnailData.width,
        };
        const frame = thumbnailData.frame;
        const option = "track";
        const trackId = thumbnailData.trackId;
        this.$nextTick(() => {
          this.$refs[`thumbnail${i + 1}`][0].initMap(
            videoInformation,
            frame,
            option
          );
          this.$refs[`thumbnail${i + 1}`][0].tracker(frame, trackId);
        });
      }
    },
  },
};
</script>

<style scoped>
.classificationDialog {
  align-items: center;
}
.dialogBody {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.dialogBodyItem {
  position: relative;
  display: flex;
  float: left;
  margin: 5px auto;
  width: 30%;
  height: 240px;
}
.dialog-footer {
  position: relative;
  display: flex;
  align-items: center;
  margin: 10px;
}
.trackDetail {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
}
</style>
