<!-- 废弃使用 -->
<template>
  <div class="createContainer">
    <div class="topBorder">
      新增
      <div class="closebutton" @click="closeButton()">X</div>
    </div>
    <div v-if="nowmode === 'dataSource'" class="inputbox">
      <div v-for="(item, index) in datasourceList">
        {{ item.string }} <br />
        <input type="text" v-model="this.dataSource[item.name]" class="" />
      </div>
      <div><br /></div>
      <button @click="submitButton">提交</button>
    </div>
    <div v-else-if="nowmode === 'markInfomation'"  class="inputbox">
      <div v-for="(item, index) in markInfomationList">
        {{ item.string }} <br />
        <input type="text" v-model="this.markInfomation[item.name]" class="" />
      </div>
      <div><br /></div>
      <button @click="submitButton">提交</button>
    </div>
    <div v-else></div>
    <!-- <button @click="showdata()">showdata</button> -->
  </div>
</template>

<script>
import { Request } from "@/js/Request.js";
export default {
  name: "Create",

  data() {
    return {
      nowmode: this.$props.mode, // dataSource ,markInfomation,  传入时记得带引号以传字符串
      dataSource: {
        // 发送给后台的数据
        // | dataSourceName     | 数据集名字     | 是   |                                                |
        // | ------------------ | --------------| ---- | ---------------------------------------------- |
        // | dataSourceType     | 数据集类型     | 是   | VIS-可见光; IR-红外光；SAR-SAR图像；HIS-高光谱 |
        // | dataSourceFileUri  | 数据集地址     | 是   |                                                |
        // | dataSourceFileName | 数据集文件名字 | 是   | 后台自动生成                                   |
        // | createTime         | 储存时间       | 是   |                                                |
        // | dataSourceStatus   | 数据集状态     | 是   | Y-已标注；N-未标注                             |
        // | markInfomationId   | 标注信息编号   | 否   | 只有已标注的数据要填写                         |

        dataSourceName: undefined,
        dataSourceType: undefined,
        dataSourceFileUri: undefined,
        dataSourceFileName: undefined,
        createTime: undefined,
        dataSourceStatus: undefined,
        markInfomationId: undefined,
      },
      datasourceList: [
        { string: "数据集名字", required: true, name: "dataSourceName" },
        { string: "数据集类型", required: true, name: "dataSourceType" },
        { string: "数据集地址", required: true, name: "dataSourceFileUri" },
        {
          string: "数据集文件名字",
          required: true,
          name: "dataSourceFileName",
        },
        { string: "储存时间", required: true, name: "createTime" },
        { string: "数据集状态", required: true, name: "dataSourceStatus" },
        { string: "标注信息编号", required: false, name: "markInfomationId" },
      ],

      markInfomation: {
        // | markInfomationName     | 标注信息名字     | 是   |                                                |
        // | ---------------------- | ---------------- | ---- | ---------------------------------------------- |
        // | markInfomationType     | 标注信息类型     | 是   | VIS-可见光; IR-红外光；SAR-SAR图像；HIS-高光谱 |
        // | markInfomationFileUri  | 标注信息地址     | 是   |                                                |
        // | markInfomationFileName | 标注信息文件名字 | 是   |                                                |
        // | createTime             | 储存时间         | 是   |                                                |
        // | dataSourceId           | 数据集编号       | 是   |                                                |
        // | dataSourceFileUrl      | 数据集地址       | 是   |                                                |

        markInfomationName: undefined,
        markInfomationType: undefined,
        markInfomationFileUri: undefined,
        markInfomationFileName: undefined,
        createTime: undefined,
        dataSourceId: undefined,
        dataSourceFileUrl: undefined,
      },
      markInfomationList: [
        { string: "标注信息名字", required: true, name: "markInfomationName" },
        { string: "标注信息类型", required: true, name: "markInfomationType" },
        {
          string: "标注信息地址",
          required: true,
          name: "markInfomationFileUri",
        },
        {
          string: "标注信息文件名字",
          required: true,
          name: "markInfomationFileName",
        },
        { string: "储存时间", required: true, name: "createTime" },
        { string: "数据集编号", required: true, name: "dataSourceId" },
        { string: "数据集地址", required: true, name: "dataSourceFileUrl" },
      ],
    };
  },
  props: ["mode"],
  emits: ["close", "submit"],
  methods: {
    showdata() {
      // console.log(this.dataSource);
    },

    submitButton() {
      console.log("submit");
      let sendData;
      if(this.nowmode == "dataSource"){
        sendData = this.dataSource
      }else if(this.nowmode == "markInfomation"){
        sendData = this.markInfomation
      }else if(this.nowmode == "modelCanter"){
        // sendData = this.modelCanter
      }

      Request("dataSource/create", JSON.stringify(sendData)).then(
        (value) => {}
      );

      this.$emit("submit");
    },

    closeButton() {
      this.$emit("close");
    },
  },
  created() {
    console.log("Create.vue created");
    console.log(this.nowmode); // 此处可获取 props 值了
  },
  mounted() {
    console.log("Create.vue updated");
  },
  updated() {
    console.log("Create.vue updated");
  },
};
</script>

<style scoped>
.createContainer {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 450px;
  transform: translateX(-50%) translateY(-50%);
  border: #eee 1px solid;
  background-color: #fff;
}
.topBorder {
  padding: 1px;
  height: 20px;
  width: 400px;
  color: #eee;
  background-color: rgb(72, 101, 134);
  position: relative;
}
.closebutton {
  position: absolute;
  right: 2px;
  top: 0px;
  cursor: pointer;
}
.inputbox {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-around;
}
.inputbox input {
  margin: 0;
  width: 300px;
}
.inputbox button {
  color: #eee;
  align-self: center;
  height: 40px;
  width: 100px;
  background-color: rgb(64, 158, 250);
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
</style>