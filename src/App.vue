<template>
  <div class="container">
    <div class="header"><Header></Header></div>
    <div class="down">
      
      <router-view/>
    </div>
  </div>
</template>
<script>
import Header from "@/views/Header.vue";
import { ElMessage } from "element-plus";
import  store from "@/store"
export default {
  data() {
    return {
     
    };
  },
  mounted(){
    this.saveState();
  },
  methods:{
    saveState(){
      sessionStorage.setItem('state',JSON.stringify(store.state));
    }
  },
  components: {
    Header,
  },
};
</script>
<style scoped>
body {
  margin: 0;
  padding: 0;
}
.container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.header {
  flex-grow: 0;
}
.down {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  /* border: 1px red solid; */
  align-items: stretch;
}

</style>
