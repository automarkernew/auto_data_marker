<template>
  <div class="infobox">
    <div class="infotitle">用 户 登 录</div>
    <div class="inputbox">
      <img src="@/assets/login/userhead.png" />
      <input
        type="text"
        placeholder="请输入您的账户名，邮箱或手机号"
        v-model="userName"
      />
    </div>
    <div class="inputbox">
      <img src="@/assets/login/passwordlock.png" />
      <input
        type="password"
        placeholder="请输入您的密码"
        v-model="userPassword"
      />
    </div>
    <div class="login" @click="onClickLogin"><div>登&nbsp&nbsp录</div></div>
    <div class="register">
      <div class="assit"></div>
      <div @click="onClickRegister">&nbsp注&nbsp&nbsp册&nbsp</div>
      <div class="assit"></div>
    </div>
  </div>
</template>

<script>
import store from "@/store/index.js";
import { request } from "@/js/axiosResquest.js";
import { ElMessage, ElLoading } from "element-plus";
export default {
  name: "LoginInfo",
  data() {
    return {
      userName: "",
      userPassword: "",
      requestData: {
        UserLoginReq: {
          userName: "",
          userPassword: "",
        },
      },
    };
  },
  emits: ["changeToRegister"],
  methods: {
    onClickLogin() {
      // store.setAuthentication(true);
      // setTimeout(() => {
      // this.goToHome();
      // this.$router.push("/");
      // }, 3000);
      this.mylogin();
    },
    async mylogin() {
      let that = this;
      this.requestData.UserLoginReq.userName = this.userName;
      this.requestData.UserLoginReq.userPassword = this.userPassword;
			const loginLoading = ElLoading.service({
				lock: true,
				text: '正在登录',
				background: 'rgba(0, 0, 0, 0.7)',
			})
      const config = {
        url: "/login/login",
        method: "post",
        data: this.requestData,
        headers: { ContentType: "multipart/form-data" },
      };
      try {
        // ElMessage("正在登录...");	// 太丑了
				// loginLoading()	// 已经在const的时候启动了
				
        const res = await request(config);
        console.log("res.data:", res);

        if (res.code != 2000) {
          console.log("服务器异常");
						loginLoading.close();
          return;
        } else {
          console.log("发送成功");
          let rsp = res.data.UserLoginRsp;
          if (rsp == null) {
            console.log("验证失败");
						loginLoading.close();
            ElMessage({
              message: "账号或密码错误",
              type: "error",
            });
            store.setAuthentication(false);
          } else {
            console.log("验证成功");
						loginLoading.close();
            // 贮存关键信息
            store.setAuthentication(true);
						store.setUserNow(that.userName);
						store.setToken(rsp.token);
						store.setRefreshToken(rsp.refreshToken);
						console.log("state信息监测", store.state);
            // 跳转到主页
            that.$router.push("/");
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    goToHome() {
      // this.$router.push("/");
    },
    onClickRegister() {
      this.$emit("changeToRegister");
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