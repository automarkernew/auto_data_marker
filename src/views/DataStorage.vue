<template>
  <div class="sidebar"><Sidebar></Sidebar></div>
  <div class="mainbox">
    <router-view></router-view>
  </div>
</template>

<script>
import Sidebar from "@/views/DataStorage/Sidebar.vue";
// import DataSource2 from "./DataStorage/DataSource2.vue";
export default {
  name: "DataStorage",
  components: {
    Sidebar,
    // DataSource2,
  },
};
</script>

<style>
.sidebar {
  background-color: #235;
}
.mainbox {
  position: absolute;
  left: 130px;
  right: 0;
}


</style>