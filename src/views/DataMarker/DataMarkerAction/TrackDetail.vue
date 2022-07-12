<template>
  <div class="trackDetail" :id="mapId">
    <!--标注区-->
    <TrackInfo ref="trackInfo"></TrackInfo>
  </div>
</template>
<script>
import AILabel from "ailabel";
import { ElMessage } from "element-plus";
import { request } from "../../../js/axiosResquest.js";
// import TargetTrackDialog from "./TargetTrackDialog.vue"
import infoImg from "../../../assets/tools/info.png";
import TrackInfo from "./TrackInfo.vue";
export default {
  name: "MarkerFileArea",
  components: {
    TrackInfo,
  },
  props: {
    mapId: String,
  },
  data() {
    return {
      imageUrl: "", //标注区的图片地址
      videoId: "",
      imgWidth: "",
      imgHeight: "",
      frame: "",
      markStatus: "",
      option: "",
      videoInformation: {},
    };
  },

  methods: {
    destroyMap() {
      if (this.gMap != null) {
        this.gMap.destroy();
      }
    },
    initMap(videoInformation, frame, option) {
      this.videoInformation = videoInformation;
      this.option = option;
      this.videoId = videoInformation.videoId;
      this.imgHeight = videoInformation.height;
      this.imgWidth = videoInformation.width;
      this.frame = frame;
      if (option == "mark") {
        this.imageUrl =
          "http://localhost:9000/img/" + this.videoId + "/" + frame + ".jpg";
      } else if (option == "track") {
        this.imageUrl =
          "http://localhost:9000/motimg/" + this.videoId + "/" + frame + ".jpg";
      }
      console.log(this.imageUrl);
      this.destroyMap();
      // 发送请求，得到新的帧的画面
      this.gMap = new AILabel.Map(this.mapId, {
        width: 721,
        center: { x: 360.5, y: 220 }, // 为了让图片居中
        zoom: 721,
        mode: "PAN", // 绘制矩形
      });
      const gFirstImageLayer = new AILabel.Layer.Image(
        "first-layer-image", // id
        {
          src: this.imageUrl,
          width: 721,
          height: 440,
          crossOrigin: false, // 如果跨域图片，需要设置为true
          position: {
            // 左上角相对中心点偏移量
            x: 0,
            y: 0,
          },
        }, // imageInfo
        { name: "第一个图片图层" }, // props
        { zIndex: 5 } // style
      );
      // 添加到gMap对象
      this.gMap.addLayer(gFirstImageLayer);
      const gFirstFeatureLayer = new AILabel.Layer.Feature(
        "first-layer-feature", // id
        { name: "第一个矢量图层" }, // props
        { zIndex: 10 } // style
      );
      this.gMap.addLayer(gFirstFeatureLayer);
      if (option == "track") {
        const gFirstTextLayer = new AILabel.Layer.Text(
          "first-layer-text", // id
          { name: "第一个文本图层" }, // props
          { zIndex: 12, opacity: 1 } // style
        );
        this.gMap.addLayer(gFirstTextLayer);
      }
    },
    async addFeature(data, id, index) {
      let that = this;
      let drawingStyle = { strokeStyle: "red", lineWidth: 2 };

      const rectFeature = new AILabel.Feature.Rect(
        id, // id
        data, // shape
        { name: index }, // props
        drawingStyle // style
      );
      that.gMap.getLayers()[1].addFeature(rectFeature);
      if (this.markStatus == "track") {
        this.addInfoIcon(rectFeature, index);
      }
    },
    //增加轨迹信息图标
    addInfoIcon(feature, index) {
      let gMap = this.gMap;
      let that = this;
      // 添加delete-icon
      let points = feature.getPoints();
      let infoMarkerId = feature.id + ":" + index;
      const gInfoMarker = new AILabel.Marker(
        infoMarkerId, // id
        {
          src: infoImg,
          position: points[1], // 矩形右上角
          offset: {
            x: 0,
            y: 0,
          },
        }, // markerInfo
        { name: "Info" } // props
      );
      gInfoMarker.events.on("mouseOver", (marker) => {
        this.addTextLayer(points, infoMarkerId);
      });
      gInfoMarker.events.on("mouseOut", (marker) => {
        gMap.getLayers()[2].removeTextById(infoMarkerId);
      });
      gInfoMarker.events.on("click", (marker) => {
        //展示详细信息
        this.$refs.trackInfo.openDialog({
          videoId: this.videoId,
          trackId: index,
          frameInformationId: feature.id,
          disabledChangeInformation: true,
          disabledRelation: true,
        });
      });
      gMap.markerLayer.addMarker(gInfoMarker);
    },
    addTextLayer(points, id) {
      let gMap = this.gMap;
      let that = this;
      //发送请求，查询轨迹信息

      var textContent = id.split(":")[1];
      const gText = new AILabel.Text(
        id, // id
        { text: textContent, position: points[1], offset: { x: 0, y: 0 } }, // shape
        { name: "第一个文本对象" }, // props
        {
          fillStyle: "#F4A460",
          strokeStyle: "#D2691E",
          background: true,
          globalAlpha: 1,
          fontColor: "#0f0",
          width: 10,
        } // style
      );
      gMap.getLayers()[2].addText(gText);
    },
    async marker(frame, trackId) {
      this.markStatus = "mark";
      let that = this;
      console.log("frameid", frame);
      //依据标注区内的画面的帧数，发送请求，得到该帧所有标注框
      const YoloTaggingGetCoordinateReq = {
        videoId: this.videoId,
        frameType: "0",
        frame: frame,
        trackId: trackId,
      };
      try {
        const res = await request({
          url: "/yoloTagging/getCoordinate",
          method: "post",
          data: {
            YoloTaggingGetCoordinateReq,
          },
        });
        this.YoloTaggingGetCoordinateRsp = res.data.YoloTaggingGetCoordinateRsp;
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        ElMessage.success("成功获取标注框");
      } catch (error) {
        console.log(error);
      }
      this.gMap.setMode("RECT");
      this.YoloTaggingGetCoordinateRsp.forEach((rec) => {
        let x1 = this.getWebCoordinate(
          721,
          this.imgWidth,
          rec.leftUpperCornerAbscissa
        );
        let y1 = this.getWebCoordinate(
          440,
          this.imgHeight,
          rec.leftUpperCornerOrdinate
        );
        let x2 = this.getWebCoordinate(
          721,
          this.imgWidth,
          rec.rightLowerQuarterAbscissa
        );
        let y2 = this.getWebCoordinate(
          440,
          this.imgHeight,
          rec.rightLowerQuarterOrdinate
        );
        let width = x2 - x1;
        let height = y2 - y1;
        const data = {
          x: x1,
          y: y1,
          width: width,
          height: height,
        };
        this.addFeature(data, rec.frameInformationId);
        // console.log("js绘制：",rectFeature)
      });
      this.gMap.setMode("PAN");
    },
    async tracker(frame, trackId) {
      this.markStatus = "track";
      const gFirstTextLayer = new AILabel.Layer.Text(
        "first-layer-text", // id
        { name: "第一个文本图层" }, // props
        { zIndex: 12, opacity: 1 } // style
      );
      this.gMap.addLayer(gFirstTextLayer);
      let that = this;
      //依据标注区内的画面的帧数，发送请求，得到该帧所有标注框
      const YoloTaggingGetCoordinateReq = {
        videoId: this.videoId,
        frameType: "1",
        frame: frame,
        trackId: trackId,
      };
      try {
        const res = await request({
          url: "/yoloTagging/getCoordinate",
          method: "post",
          data: {
            YoloTaggingGetCoordinateReq,
          },
        });
        this.VisibleTaggingMotCoordinateRsp =
          res.data.YoloTaggingGetCoordinateRsp;
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        // ElMessage.success("成功获取标注框");
      } catch (error) {
        console.log(error);
      }
      this.gMap.setMode("RECT");
      this.VisibleTaggingMotCoordinateRsp.forEach((rec) => {
        let x1 = this.getWebCoordinate(
          721,
          this.imgWidth,
          rec.leftUpperCornerAbscissa
        );
        let y1 = this.getWebCoordinate(
          440,
          this.imgHeight,
          rec.leftUpperCornerOrdinate
        );
        let x2 = this.getWebCoordinate(
          721,
          this.imgWidth,
          rec.rightLowerQuarterAbscissa
        );
        let y2 = this.getWebCoordinate(
          440,
          this.imgHeight,
          rec.rightLowerQuarterOrdinate
        );
        let width = x2 - x1;
        let height = y2 - y1;
        const data = {
          x: x1,
          y: y1,
          width: width,
          height: height,
        };
        //需要后台返回轨迹id
        // console.log("trackid:------",rec.trackId)
        this.addFeature(data, rec.frameInformationId, rec.trackId);

        // console.log("js绘制：",rectFeature)
      });

      this.gMap.setMode("PAN");
    },
    getWebCoordinate(webLength, imgLength, x) {
      x = parseInt(x);
      return (x / imgLength) * webLength;
    },
  },
};
</script>