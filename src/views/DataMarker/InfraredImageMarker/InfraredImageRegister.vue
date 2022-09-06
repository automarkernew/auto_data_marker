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
                        <el-input :value="formRef.infraredCoordinate"></el-input>
                    </el-form-item>
                    <el-form-item label="可见光图像配准点坐标" prop="visibleCoordinate">
                        <el-input :value="formRef.visibleCoordinate"></el-input>
                        </el-form-item>
                </el-form>
            </div>
            <div class="row"> 
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="infraredRegister">确 定</el-button>
            </div>
        </div>
        
    </el-dialog>
</template>
<script>
import AILabel from 'ailabel'
import { ElMessage } from "element-plus";
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";

export default{
    name: "InfraredImageRegister",
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
        //    infraredGmap:null,
           visibleGmap:null,
           infraredCoordinate:"",
           visibleCoordinate:"",
           infraredCoordinateX:"",
           infraredCoordinateY:"",
           visibleCoordinateX:"",
           visibleCoordinateY:"",
           formRef: {
            infraredCoordinate:"",
            visibleCoordinate:""
           },
           editId:"",
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
                mode: "POINT"
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
            gMap.events.on('drawDone', (type,data) => {
                const point=new AILabel.Feature.Point(
                    'first-feature-point', // id
                    {
                        x:data.x,
                        y:data.y,
                        sr:3
                    }, // shape
                    {name: '第一个点'}, // props
                    {fillStyle: '#00f'} // style
                )
                gMap.getLayers()[1].addFeature(point)
                gMap.setActiveFeature(point)
                if(gMap.id=="infraredImageId"){
                    this.infraredCoordinateX = data.x
                    this.infraredCoordinateX=this.getImgCoordinate(500, this.infrWidth, data.x).toFixed(2)
                    this.infraredCoordinateY = data.y
                    this.infraredCoordinateY=this.getImgCoordinate(500, this.infrHeight, data.y).toFixed(2)
                    this.formRef.infraredCoordinate="("+ this.infraredCoordinateX+","+this.infraredCoordinateY+")"
                    
                }
                if(gMap.id=="visibleImageId"){
                   this. visibleCoordinateX = data.x
                   this. visibleCoordinateX = this.getImgCoordinate(500, this.visWidth, data.x).toFixed(2)
                   this.visibleCoordinateY = data.y
                   this.visibleCoordinateY =this.getImgCoordinate(500, this.visHeight, data.y).toFixed(2)
                   this.formRef.visibleCoordinate="("+this. visibleCoordinateX+","+this.visibleCoordinateY+")"
                }
                console.log("鼠标点击：",data)
            })
            gMap.events.on('featureSelected', feature => {
                // this.editId = feature.id
                console.log('--map featureSelected--', feature)
                // console.log(feature.shape){x: 10, y: 10, width: 90, height: 90}height: 90width: 90x: 10y: 10[[Prototype]]: Object
                gMap.setActiveFeature(feature)
            })
            gMap.events.on("featureDeleted",feature=>{
                gMap.getLayers()[1].removeFeatureById(feature.id)
                if(gMap.id=="infraredImageId"){
                    this.formRef.infraredCoordinate=""
                }
                if(gMap=="visibleImageId"){
                   this.formRef.visibleCoordinate=""
                }
            })
        },
        // 画点发送配准请求
        async infraredRegister(){
            try {
                const res = await request({
                url: "InfraredImageTagging/imageRegister",
                method: "post",
                data: {
                    ImageRegisterReq:{
                        videoId: this.infraredVideoId,
                        linkedVideoId: this.visibleVideoId,
                        InfraredImageX: this.infraredCoordinateX,
                        InfraredImageY: this.infraredCoordinateY,
                        VisibleImageX: this.visibleCoordinateX,
                        VisibleImageY: this.visibleCoordinateY
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