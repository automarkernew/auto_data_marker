<template>
<div class="modelcanter">
    模板库新增<br>
    模板名字<input type="text" placeholder="modelName" name="modelName" required><br>
    模板/传感器类型<input type="text" placeholder="modelType" name="modelType" required><br>
    模板文件地址<input type="text" placeholder="modelFileUri" name="modelFileUri" required><br>
    <!-- 模板文件地址的值是怎样的？ -->
    <!-- modelFileName和createTime由后台处理 -->
    
</div>
  
</template>

<script>
export default {
    name: "ModelCanterCreate",
    data() {
        return {
            modeltype:["VIS-可见光","IR-红外光","SAR-SAR图像","HIS-高光谱"],
        }
    },
    methods:{

    }
}
</script>

<style>
.modelcanter {
    margin: 10px;
    padding: 20px;
    background-color: rgb(160, 214, 160);
}
</style>