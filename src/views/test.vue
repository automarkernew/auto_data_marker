<template>
  <div>
      test - 路由跳转测试
      {{routedata}}{{$route}}
  </div>
</template>

<script>
export default {
    data() {
        return {
            routedata: this.$route.params.data,
        }
    },
    mounted(){
        console.log(this.$route.params.data);
    }
}
</script>

<style>

</style>