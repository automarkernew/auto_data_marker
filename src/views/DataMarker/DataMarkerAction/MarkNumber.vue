<template>
  <el-select v-model="frameType" class="selectFrameType" placeholder="请选择标注框类型" @change="getFrameNumber">
    <el-option
      v-for="item in frameTypeList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
  <v-chart id="Chart" class="chart" :option="chartOption" @click="onClick" />
</template>

<script>
import VChart from "vue-echarts";
import * as echarts from "echarts";
import { request } from "../../../js/axiosResquest.js";

export default {
  name: "MarkNumber",
  components: {
    VChart,
  },
  props: {},
  emits: ["chooseFrame"],
  data() {
    return {
      videoId: "808693343977472",
      frameType: 0,
      frameTypeList: [
        { value: 0, label: "目标跟踪标注框" },
        { value: 1, label: "轨迹跟踪标注框" },
      ],
      chartOption: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none",
          },
          formatter: function (params) {
            //格式化函数
            return (
              "第 " +
              params[0].name +
              " 帧" +
              "</br>" +
              "标注数量：" +
              params[0].data
            );
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
          show: false,
        },
        yAxis: {
          type: "value",
          show: false,
        },
        series: [
          {
            data: [],
            type: "bar",
            barCategoryGap: "0%",
            areaStyle: {},
          },
        ],
      },
    };
  },
  methods: {
    // 初始化
    init(videoId) {
      this.videoId = videoId;
      this.getFrameNumber();
    },
    onClick(params) {
      this.$emit("chooseFrame", params.name);
    },
    // 获取数据
    async getFrameNumber() {
      try {
        const res = await request({
          url: "visibleTagging/queryFrameNumber",
          method: "post",
          data: {
            VisibleTaggingQueryFrameNumberReq: {
              videoId: this.videoId,
              frameType: this.frameType,
            },
          },
        });
        if (res && res.code === 2000) {
          const frameNumberData = res.data.VisibleTaggingQueryFrameNumberRsp;
          this.chartOption.xAxis.data = frameNumberData.visibleTaggingObjectCountRsps.map(
            (item) => item.frame
          );
          this.chartOption.series[0].data = frameNumberData.visibleTaggingObjectCountRsps.map(
            (item) => item.count
          );
        } else {
          this.$message.error("查询标注框数量失败");
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
  mounted() {
    // echarts根据屏幕大小自适应
    let myChart = echarts.init(document.getElementById("Chart"));
    setTimeout(function () {
      window.onresize = function () {
        myChart.resize();
      };
    }, 200);
  },
};
</script>

<style scoped>
.selectFrameType{
  position: absolute;
  width: 150px;
  height: 100%;
  top: 30px;
  flex-wrap: nowrap;
  align-items: center;
  margin-top: 0;
}
.chart {
  position: absolute;
  width: 80%;
  height: 100%;
  top: 0;
  left:100px;
  flex-wrap: nowrap;
  align-items: center;
  margin-top: 0;
}
</style>
