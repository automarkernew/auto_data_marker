<template>
  <el-dialog v-model="chooseServerFile" title="选择服务器文件">
      <el-form :model="formRef" ref="formRef" label-width="120px"  >
        <el-form-item label="数据集目录" prop="dataset">
           <el-select v-model="formRef.dataset" @change="showSensorAndFile" clearable>
             <el-option 
             v-for="item,index in datasetList "
             :key="index"
             :value="item"
             >

             </el-option>
           </el-select>
        </el-form-item>
        <el-form-item label="传感器类型目录" prop="sensorType">
          <el-select v-model="formRef.sensorType" :disabled="placeNotSet" @change="showSensorAndFile" clearable>
            <el-option 
             v-for="item,index in sensorTypeList "
             :key="index"
             :value="item"
             >
             </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标注文件" prop="filename">
          <el-select v-model="formRef.filename"  :disabled="sensorNotSet" @change="showSensorAndFile" clearable>
            <el-option 
             v-for="item,index in filenameList "
             :key="index"
             :value="item"
             >
             </el-option>
          </el-select>
       </el-form-item>
        <el-form-item class="submit-button">
            <el-button  type="primary" @click="submit">确定</el-button>
        </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { request , MINIO, TOKEN} from "@/js/axiosResquest.js";
export default {
  name: "chooseServerFile",
  data(){
    return{
      chooseServerFile:false,
      placeNotSet:true,
      sensorNotSet:true,
      datasetList:[],
      sensorTypeList:[],
      filenameList:[],
      fileUrl:"",
      formRef:{
        dataset:"",
        sensorType:"",
        filename:""
      }
    }
  },
  emits:["setServerFileUrl"],
  methods:{
    async openChooseServerFile(){
      this.chooseServerFile = true
      try {
        const res = await request({
          url: "videoInformation/getDataListFromServer",
          method: "post",
          data: {
            GetDataListFromServerReq: {
              filePathNow: "",
              type: "0",
            },
          },
        });
        console.log("dataset", res);
        this.datasetList=[]
        res.data.GetDataListFromServerRsp.forEach((element) => {
         if(element.type=="0"){
          this.datasetList.push(element.dataListName)
         }
        });
        console.log("datasetList",this.datasetList);
      } catch (error) {
        console.log(error);
      }
    },
    showSensorAndFile(){
      this.sensorNotSet = !this.formRef.sensorType
      this.placeNotSet =  !this.formRef.dataset
      console.log("senserNotset",this.sensorNotSet)
      console.log("placeNotSet",this.placeNotSet)
      this.getSenserType()
      this.getFileName()
    },
    async getSenserType(){
      if(this.placeNotSet){
        return
      }
      try {
        const res = await request({
          url: "videoInformation/getDataListFromServer",
          method: "post",
          data: {
            GetDataListFromServerReq: {
              filePathNow: this.formRef.dataset,
              type: "0",
            },
          },
        });
        console.log("dataset", res);
        this.sensorTypeList=[]
        res.data.GetDataListFromServerRsp.forEach((element) => {
          console.log(element)
         if(element.type=="0"){
          this.sensorTypeList.push(element.dataListName)
         }
         
        });
        console.log("sensorTypeList",this.sensorTypeList);
      } catch (error) {
        console.log(error);
      }
    },
    async getFileName(){
      if(this.sensorNotSet){
        return
      }
      try {
        const res = await request({
          url: "videoInformation/getDataListFromServer",
          method: "post",
          data: {
            GetDataListFromServerReq: {
              filePathNow: this.formRef.dataset+','+this.formRef.sensorType,
              type: "1",
            },
          },
        });
        this.filenameList=[]
        res.data.GetDataListFromServerRsp.forEach((element) => {
         if(element.type=="1"){
          this.filenameList.push(element.dataListName)
         }
        });
        console.log("filenameList",this.filenameList);
      } catch (error) {
        console.log(error);
      }
    },
    submit(){
    this.fileUrl=this.formRef.dataset+"/"+this.formRef.sensorType+"/"+this.formRef.filename
      this.$emit("setServerFileUrl",this.fileUrl)
      this.chooseServerFile=false
  }
  },
  
}

</script>