<template>
    <!--配准对话框-->
    <el-dialog v-model="dialogVisible" :key = "id" width="1300px" title="红外图像配准" append-to-body>
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
                <el-button @click="refresh">重置</el-button>
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
            videoInformation:null,
            visibleVideoInfo:null,
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
           infrPointId : "1",
           activeInfrPointId: [],
           activeVisPointId: [],
           visPointId: "1",
           infrMap : null,
           visMap: null,
        }
    },
    methods:{
        openDialog(videoInformation,visibleVideoInfo){
            this.videoInformation = videoInformation
            this.visibleVideoInfo = visibleVideoInfo
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
            const gFirstTextLayer = new AILabel.Layer.Text(
                'first-layer-text', // id
                {name: '第一个文本图层'}, // props
                {zIndex: 12, opacity: 1} // style
                );
                initialMap.addLayer(gFirstTextLayer);
                if(domId=="infraredImageId"){
                    this.infrMap = initialMap
                }else{
                    this.visMap = initialMap
                }
        },
        addEvent(gMap){
            gMap.events.on('drawDone', (type,data) => {
                console.log("鼠标点击：", data)
                var pointId = ""
                if(gMap.id=="infraredImageId"){
                    if(this.activeInfrPointId.length==0){
                        pointId = this.infrPointId
                        this.infrPointId = parseInt(this.infrPointId) + 1
                    }else{
                        pointId = this.activeInfrPointId.pop()
                    }
                }
                if(gMap.id=="visibleImageId"){
                    if(this.activeVisPointId.length==0){
                        pointId = this.visPointId
                        this.visPointId = parseInt(this.visPointId) + 1
                    }else{
                        console.log("ssssssssssssss")
                        pointId = this.activeVisPointId.pop()
                    }
                }
                const gFirstFeaturePoint = new AILabel.Feature.Point(
                    pointId, // id
                    {x: data.x, y: data.y, sr: 3}, // shape
                    {name: pointId}, // props
                    {fillStyle: '#00f'} // style
                    )
                gMap.getLayers()[1].addFeature(gFirstFeaturePoint)
                // gMap.setActiveFeature(gFirstFeaturePoint)
                this.addPointTag(gMap, gFirstFeaturePoint)
                //红外图像配准点展示
                this.updatePoint(gMap,gFirstFeaturePoint)
               this.flashPointShow()
               
               
            })
            gMap.events.on('featureUpdated', (feature, shape) => {
                gMap.getLayers()[2].removeTextById(feature.id)
                feature.updateShape(shape)
                this.updatePoint(gMap, feature)
                this.addPointTag(gMap, feature)
            })
            gMap.events.on("featureUnselected", () => {
                gMap.setActiveFeature(null)
            })

            gMap.events.on('featureSelected', feature => {
                console.log('--map featureSelected--', feature)
                gMap.setActiveFeature(feature)
            })
            gMap.events.on("featureDeleted",  feature=> {
                console.log("--map  featureDelete--", feature)
                gMap.getLayers()[1].removeFeatureById(feature.id)
                gMap.getLayers()[2].removeTextById(feature.id)
                if(gMap.id == "infraredImageId"){
                    this.activeInfrPointId.push(feature.id) 
                    this.infraPoint[parseInt(feature.id) - 1] = {x:"",y:""}
                }
                if(gMap.id == "visibleImageId"){
                    this.activeVisPointId.push(feature.id)
                    this.visPoint[parseInt(feature.id) - 1] = {x:"",y:""}
                }
                this.flashPointShow()
            })
        },
        //更新配准点
        updatePoint(gMap, feature){
            if(gMap.id=="infraredImageId"){
                var pointX = this.getImgCoordinate(500, this.infrWidth, feature.shape.x).toFixed(2)
                var pointY = this.getImgCoordinate(500, this.infrHeight, feature.shape.y).toFixed(2)
                this.infraPoint[parseInt(feature.id) - 1] = {x: pointX, y: pointY}
            }
            if(gMap.id=="visibleImageId"){
                var pointX = this.getImgCoordinate(500, this.visWidth, feature.shape.x).toFixed(2)
                var pointY = this.getImgCoordinate(500, this.visHeight, feature.shape.y).toFixed(2)
                this.visPoint[parseInt(feature.id) - 1] = {x: pointX, y: pointY}
            }
            this.flashPointShow()
        },
        //更新展示的配准点
        flashPointShow(){
            this.formRef.visibleCoordinate = ""
            this.visPoint.forEach(element =>{
                this.formRef.visibleCoordinate = this.formRef.visibleCoordinate+"("+ element.x+ ","+ element.y +")   "
            })
            this.formRef.infraredCoordinate = ""
            this.infraPoint.forEach(element => {
                this.formRef.infraredCoordinate = this.formRef.infraredCoordinate + "("+ element.x+ ","+ element.y +")   "
            })
        },
        addPointTag(gMap, feature){
           var  id = feature.id
           console.log(feature)
            const gText = new AILabel.Text(
                id, // id
                {text: id, position: {x:feature.shape.x, y: feature.shape.y}, offset: {x: 0, y: -20}}, // shape
                {name: '第一个文本对象'}, // props
                {fillStyle: '#F4A460', strokeStyle: '#D2691E', background: true, globalAlpha: 1, fontColor: '#0f0',width: 10} // style
            )
            gMap.getLayers()[2].addText(gText);
        },
        // 画点发送配准请求
        async infraredRegister(){
            //检验配准点是否符合
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
        refresh(){
            var videoInformation = this.videoInformation
            var visibleVideoInfo = this.visibleVideoInfo
            Object.assign(this.$data, this.$options.data());
            this.dialogVisible = true
            this.initMap(videoInformation, visibleVideoInfo)
            
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