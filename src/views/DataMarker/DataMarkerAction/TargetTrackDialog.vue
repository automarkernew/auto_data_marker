<template>
    <el-dialog
        v-model="dialogVisible"
        title="新目标跟踪"
    >
        <el-form :model="formRef" :rules="rules" ref="formRef" label-width="120px"  >
            <el-form-item label="跟踪开始帧号" prop="startFrame">
               <el-input v-model.number="formRef.startFrame"/>
            </el-form-item>
            <el-form-item label="跟踪结束帧号" prop="endFrame">
               <el-input v-model.number="formRef.endFrame"/>
            </el-form-item>
            <el-form-item class="submit-button">
                <el-button  type="primary" @click="track('formRef')">跟踪</el-button>
            </el-form-item>
        </el-form>
        
    </el-dialog>
</template>
<script>

export default {
    name: "TargetTrackDialog",
    props:{
        targetTrackDialogVisible:Boolean,
        frameNumber:String
    },
    emits:['addTrack'],
    data(){
        const isStartFrameValid = (rule, value, callback) => {
            if (!value) {
            return callback(new Error('请输入目标出现帧'))
            }
            
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入整数'))
                } else {
                    if(value>Number(this.frameNumber)){
                        callback(new Error('请输入合理的帧号'))
                    }
                }
            },1000)
            callback()
        }
        const isEndFrameValid = (rule, value, callback) => {
            if (!value) {
            return callback(new Error('请输入目标出现帧'))
            }
            
            setTimeout(() => {
                if (!Number.isInteger(value)) {
                    callback(new Error('请输入整数'))
                } else {
                    if(value>Number(this.frameNumber)){
                        callback(new Error('请输入合理的帧号'))
                    }
                    if(value<this.formRef.startFrame){
                        callback(new Error('目标结束帧需比开始帧大'))
                    }
                }
            },1000)
            callback()
        }
        return{
            formRef:{
                startFrame:"",
                endFrame:"",
            },
            dialogVisible:false,
            rect:{},
            rules: {
                startFrame: [
                    { required: true, validator: isStartFrameValid, trigger: 'change'},
                ],
                endFrame: [
                    { required: true, validator:  isEndFrameValid, trigger: 'change'},
                ]
            },
        }

    },
    methods:{
        openTargetTrackDialog(rect){
            this.rect=rect
            this.dialogVisible=true
        },
        track(formName){
            this.$refs[formName].validate((valid) => {
                console.log(valid)
                if(valid){
                    this.rect.startFrame=this.formRef.startFrame.toString()
                    this.rect.endFrame=this.formRef.endFrame.toString()
                    this.$emit("addTrack",this.rect)
                    this.dialogVisible=false
                }

                
            })
        }

    },

}

</script>
<style scoped>

</style>