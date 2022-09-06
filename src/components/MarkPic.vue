<template>
  <div class="markpicmain">
    <div class="mymap" :id="theMapId"></div>
  </div>
</template>

<script>
import AILabel from "ailabel";

export default {
  name: "MarkPic",
  data() {
    return {
      theMapId: "ave",  // 随意去的，后面会随$props.mapId
      isFirstDraw: true
    };
  },
  props: [
    "mapId",
    "showWidth",
    "picUrl", 
    "showWidth", // 实际展示时图片的宽度
    "showHeight", // 实际展示时图片的宽度
    "picWidth", // 视频的宽度
    "picHeight", // 视频的高度
    "leftUpperCornerAbscissa", // 左上角 横坐标
    "leftUpperCornerOrdinate", // 左上角 纵坐标
    "rightLowerQuarterAbscissa",
    "rightLowerQuarterOrdinate",
    "trackNode", // 轨迹
  ],
  updated() {
    console.log("MarkPic updated");
    this.theMapId = this.$props.mapId;
    // console.log("this.theMapId",this.theMapId);
    // this.gMap.removeAllLayers();
    // this.gMap.refresh(); // 放这里是没有用的
    this.startDraw();
  },
  methods: {
    startDraw() {
      if(!this.isFirstDraw){
        this.gMap.destroy();
      }else{
        // 第一次画
        this.isFirstDraw = false;
      }
      // console.log("this.$props.showWidth", this.$props.showWidth);
      // console.log("markPicTrackNode", this.$props.trackNode);
      const that = this;
      // that.$props.
      // 新建画布
      const zoomNum = that.$props.picWidth / 500;
      const gMap = new AILabel.Map(this.theMapId, {
        center: { x: that.$props.picWidth / 2, y: that.$props.picHeight / 2 }, // 坐标设定 （中心就是画布中心，但我们可以修改绝对中心点的坐标来反向修改计算坐标中心的位置）
        zoom: that.$props.picWidth,
        //   zoom: 500,
        mode: "PAN",
        size: { width: this.$props.showWidth, height: this.$props.showHeight },
      });
      this.gMap = gMap;
      // 添加layer
      const gFirstFeatureLayer = new AILabel.Layer.Feature(
        "first-layer-feature",
        { name: "第一个矢量图层" }, // props
        { zIndex: 10 }
      );
      gMap.addLayer(gFirstFeatureLayer);

      // 添加图片
      const gFirstImageLayer = new AILabel.Layer.Image(
        "first-layer-image", // id
        {
          src: that.$props.picUrl,
          width: that.$props.picWidth,
          height: that.$props.picHeight,
          crossOrigin: false, // 如果跨域图片，需要设置为true
          position: {
            // 左上角相对中心点偏移量
            x: 0,
            y: 0,
          },
          // grid: {
          //   // 3 * 3
          //   columns: [{ color: "#9370DB" }, { color: "#FF6347" }],
          //   rows: [{ color: "#9370DB" }, { color: "#FF6347" }],
          // },
        }, // imageInfo
        { name: "第一个图片图层" }, // props
        { zIndex: 5 } // style
      );
      gMap.addLayer(gFirstImageLayer);

      // 尝试画矩形
      const rectFeature = new AILabel.Feature.Rect(
        `${+new Date()}`, // id
        {
          x: that.$props.leftUpperCornerAbscissa, //左上角x
          y: that.$props.leftUpperCornerOrdinate, //左上角y
          width:
            that.$props.rightLowerQuarterAbscissa -
            that.$props.leftUpperCornerAbscissa,
          height:
            that.$props.rightLowerQuarterOrdinate -
            that.$props.leftUpperCornerOrdinate,
        }, // shape
        { name: "一个矩形" }, //   { name }, // props
        {
          strokeStyle: "#ff0000", // 边框颜色
          lineWidth: 2,
          fillStyle: "#808867",
        } //   drawingStyle // style
      );
      gFirstFeatureLayer.addFeature(rectFeature);

      //尝试画线条
      const polylineFeature = new AILabel.Feature.Polyline(
        `${+new Date()}`, // id
        { points: that.$props.trackNode, width: 3 }, // shape
        { name: "折线段" }, // props
        { strokeStyle: "#FFD500", lineWidth: 1 } // style
      );
      gFirstFeatureLayer.addFeature(polylineFeature);
    },
  },
  created() {
    this.theMapId = this.$props.mapId;
    // console.log("this.theMapId",this.theMapId);
  },
  mounted() {
    this.startDraw
    // mounted 结束
  },
};
</script>

<style>
.mymap {
  position: absolute;
  /* border: 6px solid rgb(71,142,199); */
  /* 定位可以把上面这行解除注释，就知道挂载在哪里了 */
}
</style>