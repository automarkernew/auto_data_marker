<template>
  <el-dialog
    v-model="dialogVisible"
    width="40%"
    center
    modal
    :show-close="showClose"
    title="等待中，请稍后..."
  >
    <el-progress :percentage="100"  :indeterminate="true" />
  </el-dialog>
</template>

<script>
import { request } from "../../../js/axiosResquest.js";
export default {
    data() {
        return {
            dialogVisible:false,
            showClose:false
        }
    },
    methods: {
        openDialog(){
            this.dialogVisible=true
        },
        closeDialog(){
            this.dialogVisible=false
        }
    }
}
</script>
<style scoped>

</style>
