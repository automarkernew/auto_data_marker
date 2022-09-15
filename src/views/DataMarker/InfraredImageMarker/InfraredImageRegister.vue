<template>
    <!--配准对话框-->
    <el-dialog v-model="dialogVisible" width="1300px" title="红外图像配准" append-to-body>
        <div style="width: 1100px;">
            <div class="row">
                <div class="map">
                    <div class="markTitle">红外图像</div>
                    <div id="infraredImageId" class="mapArea">
                        <!--红外图像配准区-->
            
                    </div >
                </div>
                <div class="map">
                    <div class="markTitle">可见光图像</div>
                    <div id="visibleImageId" class="mapArea">
                        <!--对应的可见光图像-->
                    </div>
                </div>
                
            </div>
            <div class="row">
                <el-form :model="formRef" ref="formRef"  >
                    <el-form-item label="红外图像配准点坐标" prop="infraredCoordinate">
                        <el-input :value="formRef.infraredCoordinate" style="width: 800px;" readonly ></el-input>
                    </el-form-item>
                    <el-form-item label="可见光图像配准点坐标" prop="visibleCoordinate">
                        <el-input :value="formRef.visibleCoordinate" style="width: 800px;" readonly></el-input>
                        </el-form-item>
                </el-form>
            </div>
            <div class="row"> 
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="infraredRegister">确 定</el-button>
            </div>
        </div>
        <WaitForRespond ref="WaitForRespond"></WaitForRespond>
    </el-dialog>
</template>
<script>
import AILabel from 'ailabel'
import { ElMessage } from "element-plus";
import { request , MINIO, TOKEN} from "@/js/axiosResquest.js";
import deleteicon from "@/assets/tools/delete.png"
import WaitForRespond from  "../DataMarkerAction/WaitForRespond.vue";
export default{
    name: "InfraredImageRegister",
    components: {
        WaitForRespond
    },
    data(){
        return{
            dialogVisible:false,
           infraredImage:"", //红外图像
           infrWidth:"",
           infrHeight:"",
           visibleImage:"", //可见光图像
           visWidth:"",
           visHeight:"",
           infraredVideoId:"", //红外视频id
           visibleVideoId:"",//可见光视频id
           frameNumber:"1",
           formRef: {
            infraredCoordinate:"",
            visibleCoordinate:""
           },
           editId:"",
           infraPoint: [],
           visPoint: [],
        }
    },
    methods:{
        openDialog(videoInformation,visibleVideoInfo){
            this.dialogVisible=true
            this.$nextTick(()=>{
                this.initMap(videoInformation,visibleVideoInfo)
            })
        },
        initMap(videoInformation,visibleVideoInfo){
            // this.dialogVisible=true
            // 初始化红外图像与可见光图像标注区
            this.infraredVideoId = videoInformation.videoId
            this.infrWidth = videoInformation.width
            this.infrHeight = videoInformation.height
            this.infraredImage = MINIO+"img/"+this.infraredVideoId+"/"+this.frameNumber+".jpg"
            this.visibleVideoId = visibleVideoInfo.videoId
            this.visWidth = visibleVideoInfo.width
            this.visHeight = visibleVideoInfo.height
            this.visibleImage = MINIO+"img/"+this.visibleVideoId+"/"+this.frameNumber+".jpg"
            this.setMap(this.infraredImage,"infraredImageId")
            this.setMap(this.visibleImage,"visibleImageId")
        },
        setMap(image,domId){
           const initialMap = new AILabel.Map(domId,{
                size:{
                    width:500,
                    height:500
                },
                center: {x:250 ,y: 250},
                zoom:500,
                mode: "RECT"
            })
            initialMap.id=domId
            this.addEvent(initialMap)
            const initialImaggeLayer = new AILabel.Layer.Image(
                domId,
                {
                    src: image,
                    width: 500,
                    height: 500,
                    position: {
                        x: 0,
                        y: 0
                    },
                    grid: {
                        columns: [{color: '#9370DB'}, {color: '#FF6347'}],
                        rows: [{color: '#9370DB'}, {color: '#FF6347'}]
                    }
                },
                {name: domId},
                {zIndex: 5}
            )
            initialMap.addLayer(initialImaggeLayer)
            const initialFeatureLayer = new AILabel.Layer.Feature(
                'first-layer-feature',
                {name:domId},
                {zIndex:10}
            )
            initialMap.addLayer(initialFeatureLayer)
        },
        addEvent(gMap){
            // gMap.events.on('drawDone', (type,data) => {
            //     console.log("画完",data)
            //     const polylineFeature = new AILabel.Feature.Polyline(
            //         'first-feature-polyline', // id
            //         {points: data}, // shape
            //         {name: '第一个矢量图层'}, // props
            //         {strokeStyle: 'red', lineWidth: 3} // style
            //     )
            //     gMap.getLayers()[1].addFeature(polylineFeature)
            //     gMap.setActiveFeature(polylineFeature)
            //     if(gMap.id=="infraredImageId"){
            //         data.forEach(element => {
            //                 element.x = this.getImgCoordinate(500, this.infrWidth, element.x).toFixed(2)
            //                 element.y = this.getImgCoordinate(500, this.infrHeight, element.y).toFixed(2)
            //                 this.formRef.infraredCoordinate = this.formRef.infraredCoordinate+ "("+ element.x+ ","+ element.y +")   "
            //         });
            //     }
            //     if(gMap.id=="visibleImageId"){
            //         data.forEach(element => {
            //             element.x = this.getImgCoordinate(500, this.visWidth, element.x).toFixed(2)
            //             element.y = this.getImgCoordinate(500, this.visHeight, element.y).toFixed(2)
            //             this.formRef.visibleCoordinate = this.formRef.visibleCoordinate+ "("+ element.x+ ","+ element.y +")   "
            //         })
            //     }
            //     //  console.log( "配准点",this.formRef.infraredCoordinate)
            // })

            gMap.events.on('drawDone', (type,data) => {
                const rect = new AILabel.Feature.Rect(
                    'first-feature-rect', // id
                    data, // shape
                    {name: '第一个矢量图层'}, // props
                    {strokeStyle: '#808080', lineWidth: 1} // style
                )
                gMap.getLayers()[1].addFeature(rect)
                gMap.setActiveFeature(rect)

                var point1 = { x: data.x, y: data.y }
                var point2 = { x: data.x+data.width, y: data.y}
                var point3 = { x: data.x, y: data.y + data.height}
                var point4 ={  x: data.x + data.width, y:data.y + data.height}
                if(gMap.id=="infraredImageId"){
                    this.infraPoint = []
                    this.infraPoint.push(point1)
                    this.infraPoint.push(point2)
                    this.infraPoint.push(point3)
                    this.infraPoint.push(point4)
                    this.infraPoint.forEach(element => {
                        element.x = this.getImgCoordinate(500, this.infrWidth, element.x).toFixed(2)
                        element.y = this.getImgCoordinate(500, this.infrHeight, element.y).toFixed(2)
                        this.formRef.infraredCoordinate = this.formRef.infraredCoordinate+ "("+ element.x+ ","+ element.y +")   "
                    });
                    
                }
                if(gMap.id=="visibleImageId"){
                    this.visPoint = []
                    this.visPoint.push(point1)
                    this.visPoint.push(point2)
                    this.visPoint.push(point3)
                    this.visPoint.push(point4)
                    this.visPoint.forEach(element => {
                        element.x = this.getImgCoordinate(500, this.visWidth, element.x).toFixed(2)
                        element.y = this.getImgCoordinate(500, this.visHeight, element.y).toFixed(2)
                        this.formRef.visibleCoordinate = this.formRef.visibleCoordinate+ "("+ element.x+ ","+ element.y +")   "
                    })
                }
                console.log("鼠标点击：",data)
                this.addDeleteIcon(gMap, rect)
            })
            gMap.events.on('featureSelected', feature => {
                console.log('--map featureSelected--', feature)
                gMap.setActiveFeature(feature)
            })
        },
        addDeleteIcon(gmap, feature){
            let points = feature.getPoints()
            console.log(points)
            // console.log(points)
            const gFirstMarker = new AILabel.Marker(
                `${+new Date()}`, // id
                {
                src: deleteicon,
                position: points[1], // 矩形右上角
                offset: {
                    x: -20,
                    y: -4
                }
                }, // markerInfo
                {name: 'delete'} // props
            )
            gFirstMarker.events.on('click', marker => {
                gmap.getLayers()[1].removeFeatureById(feature.id)
                if(gmap.id=="infraredImageId"){
                    this.formRef.infraredCoordinate=""
                }
                if(gmap.id=="visibleImageId"){
                   this.formRef.visibleCoordinate=""
                }
                gmap.markerLayer.removeAllMarkers()
            })
            gmap.markerLayer.addMarker(gFirstMarker)
        },
        // 画点发送配准请求
        async infraredRegister(){
            try {
                this.$refs.WaitForRespond.openDialog();
                const res = await request({
                url: "InfraredImageTagging/imageRegister",
                method: "post",
                data: {
                    ImageRegisterReq:{
                        videoId: this.infraredVideoId,
                        linkedVideoId: this.visibleVideoId,
                        InfraredImagePoints:  this.infraPoint,
                        VisibleImagePoints: this.visPoint
                    }
                }
                });
                console.log("res.data:", res);
                if (res.code != 2000) {
                console.log("服务器异常");
                return;
                } else {
                ElMessage({
                    message: "配准成功",
                    type: "success",
                });
                this.dialogVisible=false
                }
            } catch (error) {
                console.log(error);
            }
            this.$refs.WaitForRespond.closeDialog();
        },
        cancel(){
            this.dialogVisible=false
        },
        getWebCoordinate(webLength,imgLength,x){
            x = parseInt(x)
           return x/imgLength*webLength
        },
        getImgCoordinate(webLength,imgLength,x){
            return x/webLength*imgLength
        },
    }
}

</script>
<style>
    .el-dialog .el-dialog__body{
      display: flex;
      justify-content: center;
      align-items: center;
}
    .row{
        width: 1100px;
        height: auto;
        display: flex;
        /* border:1px solid red */
    }
    .markTitle{
        height:30px;
        display: block;
    }
    .map{
        width:500px;
        height:550px;
        /* border:1px solid rebeccapurple; */
        flex:1;
        display: block;
        position: relative;
    }
    .mapArea{
        position: relative;
        margin-left: 25px;
        width: 500px;
        height: 500px;
    }
    #infraredImageId{
        width:500px;
        height:500px;
    }

   
</style>