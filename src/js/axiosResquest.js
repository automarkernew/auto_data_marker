import axios from "axios";
import router from "@/router";
import { ElMessage } from "element-plus";
import store from "@/store"
export const HTTP_REG = /^https?:/;

export async function request(config) {
  console.log("准备发送的数据",config.data);
  // var x = {
  //   "Content-Type": "application/json;charset=utf-8",
  //   // "Content-Type": config.headers.ContentType,
  // };
  // console.log("x",x);
  config.headers = {
    "Content-Type": "application/json;charset=utf-8",
    "mark-Token": store.state.token.token,
    ...config.headers
  };
  config.url = HTTP_REG.test(config.url) ? config.url : `http://localhost:8081/${config.url}`;
  // config.timeout = config.timeout || 10000;
  console.log("request config", config);
  try {
    const response = await axios(config);
    console.log("response", response);
    const res = response.data;
    if (res.code === 2000) {
      return res;
    }
    ElMessage({
      message: res.message || "Error",
      type: "error",
      duration: 3 * 1000,
      grouping: true,
    });
    return res
  } catch (err) {
    console.error("request error", err.message);
  }
}
