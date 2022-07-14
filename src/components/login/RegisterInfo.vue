<template>
  <div class="infobox">
    <div class="infotitle">用 户 注 册</div>
    <div class="inputbox">
      <img src="@/assets/login/userhead.png" />
      <input type="text" placeholder="请输入您的账户名" v-model="userName" 
        @keyup.enter.native="onClickRegister"
      />
    </div>
    <div class="inputbox">
      <img src="@/assets/login/userhead.png" />
      <input type="text" placeholder="请输入您的手机号" v-model="userTele"
        @keyup.enter.native="onClickRegister" />
    </div>
    <div class="inputbox">
      <img src="@/assets/login/userhead.png" />
      <input type="text" placeholder="请输入您的邮箱" v-model="userEmail" 
        @keyup.enter.native="onClickRegister"/>
    </div>
    <div class="inputbox">
      <img src="@/assets/login/passwordlock.png" />
      <input
        type="password"
        placeholder="请输入您的密码"
        v-model="userPassword"
        @keyup.enter.native="onClickRegister"
      />
    </div>
    <div class="inputbox">
      <img src="@/assets/login/passwordlock.png" />
      <input
        type="password"
        placeholder="请再次输入您的密码"
        v-model.lazy="userPasswordAgain"
        @keyup.enter.native="onClickRegister"
      />
    </div>
    <button class="login" @click="onClickRegister"  @keyup.enter.native="onClickRegister"><div>注&nbsp&nbsp册</div></button>
    <div class="register">
      <div class="assit"></div>
      <div @click="onClickLogin">&nbsp登&nbsp&nbsp录&nbsp</div>
      <div class="assit"></div>
    </div>
  </div>
</template>

<script>
import store from "@/store/index.js";
import {request} from "@/js/axiosResquest"
import { ElMessage } from "element-plus";
export default {
  name: "RegisterInfo",
  data() {
    return {
      userName: "",
      userTele: "",
      userEmail: "",
      userPassword: "",
      userPasswordAgain: "",

      isPasswordCorrect: false,
      requestData: {
        RegisterReq: {
          userName: "",
          userPassword: "",
          userPhone: "",
          userEmail: "",
        },
      },
    };
  },
  watch: {
    userPassword() {
      if(this.userPassword !== this.userPasswordAgain || this.userPassword ==null || this.userPassword ==""){
        console.log("wrong password");
        this.isPasswordCorrect = false;
      }else{
        this.isPasswordCorrect = true;
      }
    },
    userPasswordAgain() {
      if (this.userPassword !== this.userPasswordAgain) {
        console.log("wrong password");
        this.isPasswordCorrect = false;
      }else{
        this.isPasswordCorrect = true;
      }
    },
  },
  emits: ["changeToLogin"],
  methods: {
    onClickRegister() {
      // store.setAuthentication(true);
      // this.$router.push("/")
      this.register();
    },
    async register() {
      let that = this;
      if(this.userName == "" || this.userName == null){
        ElMessage({
          type:"error",
          message:"请输入用户名"
        });
        return;
      }
      if (!this.isPasswordCorrect) {
        ElMessage({
          type:"error",
          message:"未输入密码或两次输入密码不一致"
        })
        return;
      }
      this.requestData.RegisterReq.userName = this.userName;
      this.requestData.RegisterReq.userPassword = this.userPassword;
      this.requestData.RegisterReq.userPhone = this.userTele;
      this.requestData.RegisterReq.userEmail = this.userEmail;
      const config = {
        url: "/login/register",
        method: "post",
        data: this.requestData,
        headers: { ContentType: "multipart/form-data" },
      };
      const res = await request(config);
      console.log("res.data:", res);

      if (res.code != 2000) {
        console.log("服务器异常");
        return;
      } else {
        console.log("注册成功");
        this.$emit("changeToLogin",{userName:that.userName});
      }
    },
    onClickLogin() {
      this.$emit("changeToLogin");
    },
  },
};
</script>

<style scoped>
.infobox {
  background: rgba(0, 190, 246, 0.3);
  width: 100%;
  height: 100%;
  padding: 0 0 10% 0;
  z-index: 101;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.infotitle {
  margin-top: 20px;
  margin-bottom: 20px;
  /* font-size: larger; */
  color: rgb(0, 190, 246);
  font-size: 20px;
}
.inputbox {
  border: 2px solid rgb(0, 190, 246);
  margin: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  width: 80%;
  box-sizing: border-box;
}
.inputbox input {
  background-color: rgba(250, 250, 250, 0.3);
  border: 1px solid rgb(0, 190, 246);
  color: seashell;
  /* height: 20px; */
  padding: 5px;
  flex-grow: 1;
}
.inputbox input:focus {
  border: 1px solid white;

  /* width: 500px; */
}
.inputbox input::placeholder {
  color: seashell;
}
.inputbox img {
  padding: 2px 6px 2px 6px;
}
.login {
  /* border: 2px solid rgb(0,190,246); */
  border:none;
  background-color: rgb(11, 161, 248);
  margin: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  width: 80%;
  box-sizing: border-box;
  text-align: center;
  color: seashell;
  justify-content: center;
}
.login:hover {
  cursor: pointer;
}
.register {
  /* border: 2px solid rgb(11, 161, 248); */
  margin: 5px 10px 10px 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  width: 80%;
  box-sizing: border-box;
  text-align: center;
  color: rgb(11, 161, 248);
  justify-content: center;
}
.register .assit {
  height: 50%;
  flex-grow: 1;
  border-bottom: 1px solid rgb(11, 161, 248);
}
.register div:nth-child(2):hover {
  cursor: pointer;
}
</style>