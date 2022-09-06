<template>
  <div class="sidebar">
    <div class="item">
      <router-link to="/datastorage/trackcanter" class="word">轨迹库</router-link>
    </div>
    <div class="item">
      <router-link to="/datastorage/datasource2" class="word">原始数据</router-link>
    </div>

  </div>
</template>

<script>
export default {
  name: "Sidebar",
  data() {
    return {

    }
  },
  methods: {
  }

};
</script>

<style scoped>
.sidebar {
    width: 130px;
    padding: 3px;
    top:0;
    bottom: 0;
    background-color: #235;
    color: seashell;
    text-align: center;

    box-sizing: border-box;
}

.sidebar .item{
    margin: 1px;
    padding: 5px;
    height: 26px;
    background-color: #346;
    cursor: pointer;
    border-radius: 10px;
}

.word{
  color: seashell;
  text-decoration: none;
}

</style>