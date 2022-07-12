<template>
  <table data-pagination="true" data-side-pagination="client"  data-page-size="3" >
    <tr>
      <th></th>
      <th v-for="item in tablehead">{{ item }}</th>
    </tr>
    <tr v-for="item in content">
      <td><input type="checkbox" name="" id="" /></td>
      <td>{{ item.modelType }}</td>
      <td>{{ item.modelName }}</td>
      <td>{{ item.createTime }}</td>
      <td>
        <span @click="check(item)">查看 </span>
        <span>删除 </span>
        <span>下载</span>
      </td>
    </tr>
  </table>
</template>
<script>

</script>
<script>
export default {
  data() {
    return {
      tablehead: ["传感器类型", "模板名", "存储时间", "操作"],
      content: this.$props.modelcanter
    }
  },
  props:['modelcanter'],
  updated(){
    this.content = this.$props.modelcanter
  }
  
};
</script>
<style scoped>
table{
    border: 1px solid #428;
    border-collapse: collapse;
    text-align: center;
}
th{
    background: #ccc;
    border: #555 1px solid;
    padding: 5px;
}
td{
    border: #555 1px solid;
    padding: 5px;
}
</style>