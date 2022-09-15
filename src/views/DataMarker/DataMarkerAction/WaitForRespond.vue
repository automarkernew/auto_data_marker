<template>
  <el-dialog
    v-model="dialogVisible"
    width="40%"
    center
    modal
    :show-close="showClose"
    before-close="beforeClose"
    title="等待中，请稍后..."
  >
    <!-- <el-progress :percentage="100"  :indeterminate="true" width="100%" /> -->
  </el-dialog>
</template>

<script>
import { ElMessageBox } from 'element-plus';
import { request , MINIO, TOKEN} from "../../../js/axiosResquest.js";
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
        },
        beforeClose(done){
          // this.$confirm('如果关闭弹框，程序将在后台运行，确定关闭吗')
          // .then(()=>{
          //   done()
          //   })
          // .catch((error)=>{
          //   console.log(error)
          // })
        }
    }

}
</script>
<style scoped>

</style>
