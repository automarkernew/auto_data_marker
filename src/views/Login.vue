<template>
  login
  <div class="loginMain">
    <div class="bg">
      <img src="@/../pictures/bg.png" alt="" srcset="" />
    </div>
    <div class="info">
      <!-- <div class="banner"></div> -->
      <img class="logo" src="@/../pictures/logosmall.png" alt="" />
      <br />
      <img class="banner" src="@/../pictures/banner.png" alt="" />
      <br />
      <div class="myinfobox">
        <logininfo v-if="isLoginInfo" @changeToRegister = "changeToRegister"></logininfo>
        <registerinfo v-else @changeToLogin="changeToLogin"></registerinfo>
      </div>
    </div>
  </div>
</template>

<script>
import LoginInfo from "@/components/login/LoginInfo";
import RegisterInfo from "@/components/login/RegisterInfo";
export default {
  name: "Login",
  components: {
    logininfo: LoginInfo,
    registerinfo: RegisterInfo,
  },
  data() {
    return {
      isLoginInfo : true
    };
  },
  methods:{
    changeToRegister(){
      this.isLoginInfo = false;
    },
    changeToLogin(){
      this.isLoginInfo = true;
    }
  }
};
</script>

<style scoped>
.loginMain{
  background-color: #346;
  z-index: 100;
  
}
.bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 0;
  height: 100%;
  /* width: 100%; */
  overflow: hidden;
  z-index: -1;
}
.bg img {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  /* z-index: 10; */
}
.info {
  position: absolute;
  /* border: 1px solid plum; */

  top: 15%;
  left: 0;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.info .banner {
  width: 77%;
}
.info .logo {
  width: 9%;
}
.myinfobox {
  /* border: 1px solid white; */
  width: 80%;
  max-width: 600px;
}
</style>