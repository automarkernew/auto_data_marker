<template>
  <el-dialog
    v-model="dialogVisible"
    width="40%"
    center
    modal
    :lock-scroll="true"
    title="目标信息"
  >
    <el-switch
      v-model="type"
      active-value="SEEN"
      inactive-value="EDIT"
      :disabled="disabledChangeInformation"
      active-text="查看"
      inactive-text="编辑"
    >
    </el-switch>
    <el-form :rules="rules" :model="updateForm" ref="updateForm">
      <el-form-item label="目标信息" prop="trackId" class="formInline">
      </el-form-item>
      <el-form-item
        label="目标编号:"
        prop="trackId"
        class="formInline"
        placeholder="请输入模板名称，不超过10个字符。"
      >
        <el-input
          v-model="updateForm.trackId"
          class="formInput"
          :disabled="type == 'SEEN'"
          style="width: 800px"
        />
      </el-form-item>
      <el-form-item
        label="左上角横坐标:"
        prop="leftUpperCornerAbscissa"
        class="formInline"
        
      >
        <el-input
          v-model="updateForm.leftUpperCornerAbscissa"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item
        label="左上角纵坐标:"
        prop="leftUpperCornerOrdinate"
        class="formInline"
      >
        <el-input
          v-model="updateForm.leftUpperCornerOrdinate"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item
        label="右上角横坐标:"
        prop="rightLowerQuarterAbscissa"
        class="formInline"
      >
        <el-input
          v-model="updateForm.rightLowerQuarterAbscissa"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item
        label="右上角纵坐标:"
        prop="rightLowerQuarterOrdinate"
        class="formInline"
      >
        <el-input
          v-model="updateForm.rightLowerQuarterOrdinate"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="标注信息" prop="trackId" class="formInline">
      </el-form-item>
      <el-form-item label="类型:" prop="objectType" class="formInline">
        <el-input
          v-model="updateForm.objectType"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="型号:" prop="objectModel" class="formInline">
        <el-input
          v-model="updateForm.objectModel"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="关联id:" prop="linkId" class="formInline">
        <el-input
          v-model="updateForm.linkId"
          class="formInput"
          style="width: 800px"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item class="submit-button">
        <el-button
          type="primary"
          :disabled="disabledChangeInformation"
          @click="modify"
          >确定修改</el-button
        >
        <div class="relation">
          <el-select
            v-model="relationTrackId"
            @click="getTrackIdList"
            :disabled="disabledRelation"
            multiple
            clearable
            placeholder="选择轨迹ID进行关联"
            style="width: 200px"
          >
            <el-option
              v-for="item in trackIdList"
              :key="item"
              :label="item.trackId"
              :value="item.trackId"
            />
          </el-select>
          <el-button
            type="primary"
            @click="handleRelation"
            :disabled="disabledRelation"
            style="margin-left: 10px"
            >关联</el-button
          >
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
import { ElMessage } from "element-plus";
export default {
  props: ["editMode", "showUpdateStatus", "showStatus"],
  emits: ["refreshClassificationQuery","modifyTrackId"],
  data() {
    return {
      dialogVisible: false,
      disabledChangeInformation: false,
      disabledRelation: true,
      type: "SEEN",
      videoId: "",
      frameInformationId: "",
      relationTrackId: [], // 左边标注区的关联轨迹Id
      trackIdList: [], // 左边标注区的轨迹Id列表
      relationVideoId: "", // 左边标注区videoId
      updateForm: {
        trackId: "", //目标id
        leftUpperCornerAbscissa: "",
        leftUpperCornerOrdinate: "",
        rightLowerQuarterAbscissa: "",
        rightLowerQuarterOrdinate: "",
        objectType: "",
        objectModel: "",
        linkId: "",
      },
    };
  },
  methods: {
    async openDialog(trackInfo) {
      this.dialogVisible = true;
      this.updateForm.trackId = trackInfo.trackId;
      this.videoId = trackInfo.videoId;
      this.frameInformationId = trackInfo.frameInformationId;
      this.disabledChangeInformation = trackInfo.disabledChangeInformation;
      this.disabledRelation = trackInfo.disabledRelation;
      this.relationVideoId = trackInfo.relationVideoId;
      const VisibleTaggingQueryTrackInformationReq = {
        videoId: this.videoId,
        trackId: this.updateForm.trackId,
        frameInformationId: this.frameInformationId,
      };
      try {
        const res = await request({
          url: "/visibleTagging/queryTrackInformation",
          method: "post",
          data: {
            VisibleTaggingQueryTrackInformationReq,
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        ElMessage.success("成功获取轨迹信息");
        var quaryRsp = res.data.VisibleTaggingQueryTrackInformationRsp[0];
        this.updateForm.leftUpperCornerAbscissa =
          quaryRsp.leftUpperCornerAbscissa;
        this.updateForm.leftUpperCornerOrdinate =
          quaryRsp.leftUpperCornerOrdinate;
        this.updateForm.rightLowerQuarterAbscissa =
          quaryRsp.rightLowerQuarterAbscissa;
        this.updateForm.rightLowerQuarterOrdinate =
          quaryRsp.rightLowerQuarterOrdinate;
        this.updateForm.objectType = quaryRsp.objectType;
        this.updateForm.objectModel = quaryRsp.objectModel;
        this.updateForm.linkId = quaryRsp.linkId;
      } catch (error) {
        console.log(error);
      }
    },
    // async modify() {
    //   const VisibleTaggingUpdateTrackInformationReq = {
    //     videoId: this.videoId,
    //     trackId: this.updateForm.trackId,
    //     frameInformationId: this.frameInformationId,
    //     leftUpperCornerAbscissa: this.updateForm.leftUpperCornerAbscissa,
    //     leftUpperCornerOrdinate: this.updateForm.leftUpperCornerOrdinate,
    //     rightLowerQuarterAbscissa: this.updateForm.rightLowerQuarterAbscissa,
    //     rightLowerQuarterOrdinate: this.updateForm.rightLowerQuarterOrdinate,
    //     objectType: this.updateForm.objectType,
    //     objectModel: this.updateForm.objectModel,
    //     trackTypeId: this.updateForm.trackTypeId,
    //   };
    //   try {
    //     const res = await request({
    //       url: "/visibleTagging/updateTrackInformation",
    //       method: "post",
    //       data: {
    //         VisibleTaggingUpdateTrackInformationReq,
    //       },
    //     });
    //     if (res.code != 2000) {
    //       console.log("服务器异常");
    //       return;
    //     }
    //     ElMessage.success("修改信息成功");
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   this.dialogVisible = false;
    // },
    //对于轨迹的基本信息，只能修改轨迹编号确认是不是属于同一轨迹
    async modify() {
      const VisibleTaggingUpdateTrackIdReq = {
        videoId: this.videoId,
        trackId: this.updateForm.trackId,
        frameInformationId: this.frameInformationId,
      };
      try {
        const res = await request({
          url: "/visibleTagging/updateTrackId",
          method: "post",
          data: {
            VisibleTaggingUpdateTrackIdReq
          }
        });
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        ElMessage.success("修改信息成功");
      } catch (error) {
        console.log(error);
      }
      this.dialogVisible = false;
    },
    // 获取轨迹ID下拉框
    async getTrackIdList() {
      if (this.disabledRelation) {
        return;
      }
      try {
        const res = await request({
          url: "visibleTagging/queryAllTrackId",
          method: "post",
          data: {
            VisibleTaggingMotQueryAllTrackIdReq: {
              videoId: this.relationVideoId,
            },
          },
        });
        if (res && res.code === 2000) {
          this.trackIdList = res.data.VisibleTaggingMotQueryAllTrackIdRsp;
        } else {
          this.$message.error("查询轨迹ID失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 提交关联
    async handleRelation() {
      if (this.relationTrackId.length === 0) {
        ElMessage.warning("请选择轨迹ID");
        return;
      }
      for (let i = 0; i < this.relationTrackId.length; i++) {
        const TargetTrackUpdateReq = {
          videoId: this.relationVideoId,
          trackId: this.relationTrackId[i],
          objectType: this.updateForm.objectType,
          objectModel: this.updateForm.objectModel,
        };
        try {
          const res = await request({
            url: "TargetTrack/updateTrack",
            method: "post",
            data: {
              TargetTrackUpdateReq,
            },
          });
          if (res.code != 2000) {
            this.$message.error("关联失败");
            break;
          }
        } catch (error) {
          console.log(error);
        }
        this.$emit("modifyTrackId");
        this.dialogVisible = false;
      }
      ElMessage.success("关联成功");
      // 关联成功后刷新分类查询初始化
      this.$emit("refreshClassificationQuery");
    },
  },
};
</script>
<style scoped>
.submit-button {
  text-align: center;
}

.relation {
  margin-left: 100px;
}

.formInline {
  display: flex;
}

.formInput {
  width: 800px;
}
</style>
