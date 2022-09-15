<template>
<div>
    <div class="cursorPosition">({{x}},{{y}})</div>
    <div :id="mapId">
                    <!--标注区-->
            <TargetTrackDialog ref="targetTrackDialog" v-on:addTrack="addTrack" :frameNumber="frameNumber"></TargetTrackDialog>
            <TrackInfo ref="trackInfo" @modifyTrackId="modifyTrackId"></TrackInfo>     
            <WaitForRespond ref="WaitForRespond"></WaitForRespond>
            
    </div>
</div>
</template>
<script>
import AILabel from 'ailabel'
import { ElMessage } from "element-plus";
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
import okImg from "../../../assets/tools/ok.png"
import infoImg from "../../../assets/tools/info.png"
import targetTrackImg from "../../../assets/tools/targetTrack.png"
import TrackInfo from './TrackInfo.vue'
import TargetTrackDialog from './TargetTrackDialog.vue'
import WaitForRespond from './WaitForRespond.vue'
export default {
    name:'MarkerArea',
    components:{
        TrackInfo,
        TargetTrackDialog,
        WaitForRespond
    },
    props:{
        mapId: String,
        isSingleImg:Boolean
    },
    emits:["addTrack"],
    data () {
        return{    
            imageUrl:"",//标注区的图片地址
            editId:"",//正在编辑的id
            markMode:"",
            videoId:"",
            imgWidth:"",
            imgHeight:"",
            frame:"",
            OkitemId:"",
            markStatus:"",
            option:"",
            videoInformation:{},
            x:"0",
            y:"0",
            frameNumber:"",
        }
    },

    methods:{
        destroyMap(){
            if(this.gMap!=null){
                this.gMap.destroy();
            }
        },
        async initMap(videoInformation,frame,option){
            
            this.videoInformation=videoInformation
            this.option=option
            this.videoId=videoInformation.videoId
            this.frameNumber=  this.getFrameNumber(this.videoId)
            this.imgHeight=videoInformation.height
            this.imgWidth=videoInformation.width
            this.frame=frame
            
            if(option=="mark"){
                this.imageUrl=MINIO+"img/"+this.videoId+"/"+frame+".jpg"
            }
            else if(option=="track"){
                // console.log("initmap================",frame)
                this.imageUrl=MINIO+"motimg/"+this.videoId+"/"+frame+".jpg"
            }
            console.log("imgheight:",this.imgHeight,"imgwidth:",this.imgWidth,"imageUrl",this.imageUrl)
            this.destroyMap()
           
            // 发送请求，得到新的帧的画面
            this.gMap = new AILabel.Map(this.mapId, {
                width: 655,
                center: {x: 327.5, y: 260}, // 为了让图片居中
                zoom: 655,
                mode: "PAN" // 绘制矩形
            })
             console.log(this.gMap)
            this.addEvent()
            const gFirstImageLayer = new AILabel.Layer.Image(
                'first-layer-image', // id
                {
                    src: this.imageUrl,
                    width: 655,
                    height: 520,
                    crossOrigin: false, // 如果跨域图片，需要设置为true
                    position: { // 左上角相对中心点偏移量
                    x: 0,
                    y: 0
                    }
                }, // imageInfo
                {name: '第一个图片图层'}, // props
                {zIndex: 5} // style
            )
            // 添加到gMap对象
            this.gMap.addLayer(gFirstImageLayer)
            const gFirstFeatureLayer = new AILabel.Layer.Feature(
                'first-layer-feature', // id
                {name: '第一个矢量图层'}, // props
                {zIndex: 10} // style
            )
            this.gMap.addLayer(gFirstFeatureLayer)
            if(option=="track"||this.isSingleImg){
                const gFirstTextLayer = new AILabel.Layer.Text(
                'first-layer-text', // id
                {name: '第一个文本图层'}, // props
                {zIndex: 12, opacity: 1} // style
                );
                this.gMap.addLayer(gFirstTextLayer);
            }
        },  
        addEvent () {
            // console.log("..................")
            let that = this
            let gMap = this.gMap
            gMap.events.on('drawDone', (type, data) => {
                console.log('--type, data--', type, data)
                let id =`${+new Date()}`
                const rectFeature=new AILabel.Feature.Rect(
                    id, // id
                    data, // shape
                    {name}, // props
                    {strokeStyle: 'red', lineWidth: 2}   // style
                )
                that.addOKIcon(rectFeature)
                that.addFeature(data, id)
                gMap.setActiveFeature(rectFeature)
                
                console.log("鼠标点击：",data)
            })
            // 双击编辑
            gMap.events.on('featureSelected', feature => {
                that.editId = feature.id
                console.log('--map featureSelected--', feature)
                // console.log(feature.shape){x: 10, y: 10, width: 90, height: 90}height: 90width: 90x: 10y: 10[[Prototype]]: Object
                gMap.setActiveFeature(feature)
                that.addOKIcon(feature)
            })
            // 单机空白取消编辑
            gMap.events.on('featureUnselected', () => {
                // 取消featureSelected
                that.editId = ''
                that.deIcon()
                gMap.setActiveFeature(null)
            })
            // 更新完
            gMap.events.on('featureUpdated', (feature, shape) => {
                
                // 更新或者移动需要重新设置删除图标
                that.deIcon()
                feature.updateShape(shape)
                console.log("更新完",shape)
                //更新标注框请求 activeRec  shape
                that.addOKIcon(feature)
            })
            // 删除
            gMap.events.on('FeatureDeleted', () => {
                that.gFirstFeatureLayer.removeFeatureById(that.editId);
            })
            gMap.events.on('mouseOver', (point) => {
                this.x=point.global.x
                this.x=this.getImgCoordinate(655,this.imgWidth,this.x).toFixed(2)
                this.y=point.global.y
                this.y=this.getImgCoordinate(520,this.imgHeight,this.y).toFixed(2)
                // that.gFirstFeatureLayer.removeFeatureById(that.editId);
            });
            gMap.events.on('mouseMove', (point) => {
                this.x=point.global.x
                this.x=this.getImgCoordinate(655,this.imgWidth,this.x).toFixed(2)
                this.y=point.global.y
                this.y=this.getImgCoordinate(520,this.imgHeight,this.y).toFixed(2)
                // that.gFirstFeatureLayer.removeFeatureById(that.editId);
            });
        },
        addFeature (data, id, index) {
            let that = this
            let drawingStyle = {strokeStyle: 'red', lineWidth: 2}
            
            const rectFeature = new AILabel.Feature.Rect(
                id, // id
                data, // shape
                {name:index}, // props
                drawingStyle // style
            )
            that.gMap.getLayers()[1].addFeature(rectFeature)
            if(this.markStatus=="track"||this.isSingleImg){
                this.addInfoIcon(rectFeature,index)
            }
        },
        // 增加确定图标
        addOKIcon (feature) {
            let gMap = this.gMap
            let that = this
            // 添加delete-icon
            let points = feature.getPoints()
            // console.log(points)
            const gFirstMarker = new AILabel.Marker(
                `${+new Date()}`, // id
                {
                src: okImg,
                position: points[1], // 矩形右上角
                offset: {
                    x: -20,
                    y: -4
                }
                }, // markerInfo
                {name: 'ok'} // props
            )
            gFirstMarker.events.on('click', marker => {
                this.OkitemId=marker.id
                let shape=this.gMap.getActiveFeature().shape
                const rect={
                    x1:this.getImgCoordinate(655,this.imgWidth,shape.x),
                    y1:this.getImgCoordinate(520,this.imgHeight,shape.y),
                    x2:this.getImgCoordinate(655,this.imgWidth,shape.x+shape.width),
                    y2:this.getImgCoordinate(520,this.imgHeight,shape.y+shape.height)
                }
                // console.log("leftUpperCornerAbscissa:",rect.x1,
                // "leftUpperCornerOrdinate:",rect.y1,
                // "rightUpperQuarterAbscissa:",rect.x2,
                // "rightUpperQuarterOrdinate:",rect.y2)
                //点击ok按钮有三种情形：删除，新增，修改
                switch(this.markMode){
                    case "rect":{
                        //调新增接口
                        ElMessage.success("进入新增模式，请新增一个标注框") 
                        if(this.option=="track"&&!this.isSingleImg) {
                            this.addTargetTrackIcon(feature,rect)
                        }
                        else{
                            this.addNewRect(rect)  
                        }  
                        break;
                    }
                    case "edit":{
                        ElMessage.success("进入编辑模式，请选择一个标注框进行修改")    
                        this.updateRect(rect)
                        break;
                    }
                    case "delete":{
                        //调删除接口
                        ElMessage.success("进入删除模式，请删除一个标注框")    
                        this.deleteRect()
                        break;
                    }
                }   
            })
            gMap.markerLayer.addMarker(gFirstMarker)
        },
        //新增目标框或轨迹标注框后，增加目标跟踪图标
        addTargetTrackIcon(feature,rect){
            let gMap = this.gMap
            let that = this
            // 添加delete-icon
            let points = feature.getPoints()
            // console.log(points)
            const gTrackMarker = new AILabel.Marker(
                `${+new Date()}`, // id
                {
                src: targetTrackImg,
                position: points[0], // 矩形右上角
                offset: {
                    x: 0,
                    y: 0
                }
                }, // markerInfo
                {name: 'targetTrack'} // props
            )
            gTrackMarker.events.on('click', marker => {
                //弹出目标跟踪
                this.$refs.targetTrackDialog.openTargetTrackDialog(rect)
            })
            gMap.markerLayer.addMarker(gTrackMarker)
        },
        //增加轨迹信息图标
        addInfoIcon(feature,index){
            let gMap = this.gMap
            let that = this
            // 添加delete-icon
            let points = feature.getPoints()
            // console.log(points)
            let infoMarkerId=feature.id+":"+index
            // console.log(infoMarkerId)
            const gInfoMarker = new AILabel.Marker(
                infoMarkerId, // id
                {
                src: infoImg,
                position: points[1], // 矩形右上角
                offset: {
                    x: 0,
                    y: 0
                }
                }, // markerInfo
                {name: 'Info'} // props
            )
            if(index){
                this.addTextLayer(points,infoMarkerId)
            }
            
            // gInfoMarker.events.on('mouseOver', marker => {
            //     this.addTextLayer(points,infoMarkerId)
            // })
            // gInfoMarker.events.on('mouseOut', marker => {
            //     gMap.getLayers()[2].removeTextById(infoMarkerId);
                  
            // })
            gInfoMarker.events.on('click', marker => {
                //展示详细信息
                this.$refs.trackInfo.openDialog({
                    videoId:this.videoId,
                    trackId:index,
                    frameInformationId:feature.id,
                    disabledChangeInformation: false,
                    disabledRelation: true
                })
            })
            gMap.markerLayer.addMarker(gInfoMarker)
        },
        addTextLayer (points,id) {
            let gMap = this.gMap
            let that = this
            //发送请求，查询轨迹信息

            var textContent=id.split(":")[1]
            const gText = new AILabel.Text(
                id, // id
                {text: textContent, position: points[0], offset: {x: 0, y: -20}}, // shape
                {name: '第一个文本对象'}, // props
                {fillStyle: '#F4A460', strokeStyle: '#D2691E', background: true, globalAlpha: 1, fontColor: '#0f0',width: 10} // style
            )
            gMap.getLayers()[2].addText(gText);
        },

        // 删除 删除按钮
        deIcon () {
            this.gMap.markerLayer.removeAllMarkers()
        },
        async marker (frame) {
            this.markStatus="mark"
            let that = this;
            console.log("frameid",frame)
            //依据标注区内的画面的帧数，发送请求，得到该帧所有标注框
            const YoloTaggingGetCoordinateReq={
                videoId:this.videoId,
                frameType:"0",
                frame:frame
            }
            try{
            const res = await request({
                url: "/yoloTagging/getCoordinate",
                method: "post",
                data: {
                YoloTaggingGetCoordinateReq
                }
            });
            //    console.log("res.data:",res)
            this.YoloTaggingGetCoordinateRsp=res.data.YoloTaggingGetCoordinateRsp
            if(res.code!=2000){
                console.log("服务器异常")
                return;
            }
            } catch(error){
            console.log(error)
            }
            this.gMap.setMode("RECT")
            this.YoloTaggingGetCoordinateRsp.forEach((rec)=>{
                let x1 = this.getWebCoordinate(655,this.imgWidth,rec.leftUpperCornerAbscissa)
                let y1 = this.getWebCoordinate(520,this.imgHeight,rec.leftUpperCornerOrdinate)
                let x2 = this.getWebCoordinate(655,this.imgWidth,rec.rightLowerQuarterAbscissa)
                let y2 = this.getWebCoordinate(520,this.imgHeight,rec.rightLowerQuarterOrdinate)
                let width = x2-x1
                let height = y2-y1
                const data={
                    x:x1, 
                    y:y1, 
                    width:width,
                    height:height
                }
                this.addFeature(data,rec.frameInformationId)
                // console.log("js绘制：",rectFeature)
            })
            this.gMap.setMode("PAN")
        },
        async tracker (frame){
            this.markStatus="track"
            const gFirstTextLayer = new AILabel.Layer.Text(
                'first-layer-text', // id
                {name: '第一个文本图层'}, // props
                {zIndex: 12, opacity: 1} // style
            );
            this.gMap.addLayer(gFirstTextLayer);
            let that = this;
            //依据标注区内的画面的帧数，发送请求，得到该帧所有标注框
            const YoloTaggingGetCoordinateReq={
                videoId:this.videoId,
                frameType:"1",
                frame:frame
            }
            try{
            const res = await request({
                url: "/yoloTagging/getCoordinate",
                method: "post",
                data: {
                    YoloTaggingGetCoordinateReq
                }
            });
            //    console.log("res.data:",res)
            this.YoloTaggingGetCoordinateRsp=res.data.YoloTaggingGetCoordinateRsp
            if(res.code!=2000){
                console.log("服务器异常")
                return;
            }
            } catch(error){
            console.log(error)
            }
            this.gMap.setMode("RECT")
            this.YoloTaggingGetCoordinateRsp.forEach((rec)=>{
                let x1 = this.getWebCoordinate(655,this.imgWidth,rec.leftUpperCornerAbscissa)
                let y1 = this.getWebCoordinate(520,this.imgHeight,rec.leftUpperCornerOrdinate)
                let x2 = this.getWebCoordinate(655,this.imgWidth,rec.rightLowerQuarterAbscissa)
                let y2 = this.getWebCoordinate(520,this.imgHeight,rec.rightLowerQuarterOrdinate)
                let width = x2-x1
                let height = y2-y1
                const data={
                    x:x1, 
                    y:y1, 
                    width:width,
                    height:height
                }
                this.addFeature(data,rec.frameInformationId,rec.trackId)
            })
           
            this.gMap.setMode("PAN")
        },
        getWebCoordinate(webLength,imgLength,x){
            x = parseInt(x)
           return x/imgLength*webLength
        },
        getImgCoordinate(webLength,imgLength,x){
            return x/webLength*imgLength
        },
        //工具栏点击矩形，修改，删除按钮后将gmap的mode改为“RECT”
        changeMapMode(markMode){
            if(this.gMap==null){
                return
            }
            this.gMap.setMode("RECT")
            this.markMode=markMode
        },
        //新增
        async addNewRect(rect){
            const YoloTaggingCreateReq={
                videoId:this.videoId,
                frame:this.frame,
                leftUpperCornerAbscissa:rect.x1,
                leftUpperCornerOrdinate:rect.y1,
                rightLowerQuarterAbscissa:rect.x2,
                rightLowerQuarterOrdinate:rect.y2
                } 
            if(this.option=="mark"||this.isSingleImg){   //如果是单张图片进行标注，则新增，删除，修改还是标注模式新增
                try{
                    const res = await request({
                        url: "/yoloTagging/create",
                        method: "post",
                        data: {
                            YoloTaggingCreateReq
                        }
                        });
                    console.log("res.data:",res)
                    let id=this.gMap.getActiveFeature().id
                    this.gMap.getLayers()[1].getFeatureById(id).id=res.data.YoloTaggingCreateRsp.frameInformationId
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    if(res.code!=2000){
                        console.log("服务器异常")
                        this.gMap.getLayers()[1].removeFeatureById(id)
                        return;
                    }
                    this.gMap.setActiveFeature(null)
                } catch(error){
                    console.log(error)
                } 
                if(this.isSingleImg){
                    this.initMap(this.videoInformation,1,"track")
                    this.tracker(this.frame)
                }
            }
            else if(this.option=="track"){
               const VisibleTaggingMotCreateReq=YoloTaggingCreateReq
               VisibleTaggingMotCreateReq.startFrame=rect.startFrame
               VisibleTaggingMotCreateReq.endFrame=rect.endFrame
               VisibleTaggingMotCreateReq.frame=this.frame
               this.$refs.WaitForRespond.openDialog()
               try{
                    const res = await request({
                        url: "/visibleTagging/motCreate",
                        method: "post",
                        data: {
                            VisibleTaggingMotCreateReq
                        }
                        });
                    console.log("res.data:",res)
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    this.gMap.setActiveFeature(null)
                    if(res.code!=2000){
                        console.log("服务器异常")
                        let id=this.gMap.getActiveFeature().id
                        this.gMap.getLayers()[1].removeFeatureById(id)
                        return;
                    }
                    ElMessage.success("新增成功");
                    this.$refs.WaitForRespond.closeDialog()
                    
                    
                } catch(error){
                    console.log(error)
                } 
                this.initMap(this.videoInformation,this.frame,this.option) 
                this.tracker(this.frame)
            }
            

        },
        //修改
        async updateRect(rect){
            if(this.option=="mark"||this.isSingleImg){  
                const YoloTaggingUpdateReq={
                    frameInformationId:this.gMap.getActiveFeature().id,
                    videoId:this.videoId,
                    frame:this.frame,
                    leftUpperCornerAbscissa:rect.x1,
                    leftUpperCornerOrdinate:rect.y1,
                    rightLowerQuarterAbscissa:rect.x2,
                    rightLowerQuarterOrdinate:rect.y2
                }       
                try{
                    const res = await request({
                        url: "/yoloTagging/update",
                        method: "post",
                        data: {
                            YoloTaggingUpdateReq
                        }
                        });
                    console.log("res.data:",res)
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    this.gMap.setActiveFeature(null)
                    if(res.code!=2000){
                        ElMessage.error("此模式为编辑模式")
                        console.log("服务器异常")
                        return;
                    }
                    
                } catch(error){
                    console.log(error)
                } 
                if(this.isSingleImg){
                    this.initMap(this.videoInformation,this.frame,this.option) 
                    this.tracker(this.frame)
                }   
            }
            else {
                const VisibleTaggingMotUpdateReq={
                    frameInformationId:this.gMap.getActiveFeature().id,
                    trackId:this.gMap.getActiveFeature().props.name,
                    videoId:this.videoId,
                    frame:this.frame,
                    leftUpperCornerAbscissa:rect.x1,
                    leftUpperCornerOrdinate:rect.y1,
                    rightLowerQuarterAbscissa:rect.x2,
                    rightLowerQuarterOrdinate:rect.y2
                } 
                this.$refs.WaitForRespond.openDialog()
                try{
                    const res = await request({
                        url: "/visibleTagging/motUpdate",
                        method: "post",
                        data: {
                            VisibleTaggingMotUpdateReq
                        }
                        });
                    console.log("res.data:",res)
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    this.gMap.setActiveFeature(null)
                    this.VisibleTaggingMotRsp=res.data.VisibleTaggingMotRsp
                    if(res.code!=2000){
                        ElMessage.error("此模式为编辑模式")
                        console.log("服务器异常")
                        return;
                    }
                    ElMessage.success("修改成功");
                    this.$refs.WaitForRespond.closeDialog()
                } catch(error){
                    console.log(error)
                }   
                this.initMap(this.videoInformation,this.frame,this.option) 
                this.tracker(this.frame)
            }
        },
        async deleteRect(){
            if(this.option=="mark"||this.isSingleImg){  
                const YoloTaggingDeleteReq={
                    frameInformationId: this.gMap.getActiveFeature().id
                }
                try{
                    const res = await request({
                        url: "/yoloTagging/delete",
                        method: "post",
                        data: {
                            YoloTaggingDeleteReq
                        }
                        });
                    console.log("res.data:",res)
                    if(res.code!=2000){
                        console.log("服务器异常")
                        return;
                    }
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    let id=this.gMap.getActiveFeature().id
                    this.gMap.getLayers()[1].removeFeatureById(id)
                } catch(error){
                    console.log(error)
                }
                if(this.isSingleImg){
                    this.initMap(this.videoInformation,this.frame,this.option) 
                    this.tracker(this.frame)
                }
            }
            else {
                const VisibleTaggingMotDeleteReq={
                    frameInformationId: this.gMap.getActiveFeature().id,
                    videoId: this.videoId
                }
                this.$refs.WaitForRespond.openDialog()
                try{
                    const res = await request({
                        url: "/visibleTagging/motDelete",
                        method: "post",
                        data: {
                            VisibleTaggingMotDeleteReq
                        }
                        });
                    console.log("res.data:",res)
                    this.VisibleTaggingMotRsp=res.data.VisibleTaggingMotRsp
                    if(res.code!=2000){
                        console.log("服务器异常")
                        return;
                    }
                    this.$refs.WaitForRespond.closeDialog()
                    this.gMap.markerLayer.removeMarkerById(this.OkitemId)
                    let id=this.gMap.getActiveFeature().id
                    // this.gMap.getLayers()[1].removeFeatureById(id)
                    
                } catch(error){
                    console.log(error)
                }
                this.initMap(this.videoInformation,this.frame,this.option) 
                this.tracker(this.frame)
            }
        },
        addTrack(rect){
            this.addNewRect(rect)
        },
        modifyTrackId(){
            this.initMap(this.videoInformation,this.frame,this.option) 
            this.tracker(this.frame)
        },
       async  getFrameNumber(videoId) {
       try {
        const res = await request({
          url: "/videoInformation/queryVideoLength",
          method: "post",
          data: {
            VideoLengthReq :  {
              videoId
            },
          },
        });
        console.log("res.data:", res);
        if (res.code != 2000) {
          console.log("服务器异常");
          return;
        }
        this.frameNumber = res.data.VideoLengthRsp.length
      } catch (error) {
        console.log(error);
      }
    },
    }
}

</script>

<style scoped>
.cursorPosition{
    position: absolute;
    display: flex;
    font-size: 13px;
    text-align: center;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin: 0;
    top: 0;
    left: 40px;
    z-index: 15;
    font-weight: bold;
    color: red;
}
</style>