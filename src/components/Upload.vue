<!-- 废弃使用 -->

<template>
  <div class="uploadContainer">
    <div class="topBorder">上传 <div class="closebutton" @click="close()">X</div></div>
    <input type="radio" v-model="isSingle" value="single" id="" />单个上传
    <input type="radio" v-model="isSingle" value="batch" id="" />批量上传

    <div v-if="isSingle == 'single'">
      传感器类型
      <input list="inputModelType" v-model="uploadData.modelType"/><br>
      <datalist id="inputModelType">
        <option value="VIS-可见光"></option>
        <option value="IR-红外光"></option>
        <option value="SAR-SAR图像"></option>
        <option value="HIS-高光谱"></option>
      </datalist>

      模板名
      <input type="text" v-model="uploadData.modelName"><br>

      上传图片 <input type="file" name="" id="pic"  @change="selectPic">
    </div>
    <div v-else>批量</div>
    <button @click="submit()" >确定</button>
    <button @test="test()">test</button>
  </div>
</template>

<script>
/**
 * 必要：
 * 外部调用该组件
 * v-on:close="父方法" 再在父方法来手动关闭该组件，建议用v-show决定是否展示
 */
// import path from ''
// const path = require('path');
import {Request} from '@/js/Request.js'
export default {
  name: "Upload",
  data() {
    return {
      isSingle: "single",
      picInfo: null,
      uploadData:{
        modelName:"",
        modelType:"",
        modelFileUri:"",
        // modelFileName:"", //后台自动生成
        createTime:"",
      }
    };
  },
  emits:["close"],
  methods: {
    submit() {
      // 判断一下有没有填好三个选项

      Request("modelCanter/create", JSON.stringify(this.uploadData)).then(
        
      )
      this.close()
    },
    selectPic() {
        let pic = document.getElementById("pic")
        // console.log(pic);
        console.log('获取到图片路径'+pic.value);
        this.uploadData.modelFileUri = pic.value
        // console.log(pic.files);
    },
    close(){
      this.$emit('close')
    },
    // test(){
    //   const path = require("path")
    //   const htmlFile = path.resolve(__dirname,"Preview.vue")
    //   console.log(htmlFile);
    // },
  },
};
</script>

<style scoped>
.uploadContainer {
  margin: 0;
  padding: 0;
  background-color: #fff;
  z-index: 2;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 400px;
  height: 340px;
  border: 1px solid #aaf;
  transform: translateX(-50%) translateY(-50%);
}
.topBorder {
  padding: 0;
  background-color: #aaf;
}
.closebutton{
  padding: 0;
  position: absolute;
  right: 3px;
  top: 0;
  cursor: pointer;
  
}
</style>