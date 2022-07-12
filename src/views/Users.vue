<template>
  <div class="sidebar">
    <div class="item">
      <router-link to="/users" class="word">账户管理</router-link>
    </div>
  </div>

  <div class="mainbox">
    <div class="data">
      <div class="queryInput">
        <el-form :inline="true">
          <el-form-item label="账户名：">
            <el-input name="" id="userName" v-model="userName" />
          </el-form-item>
          <el-form-item label="手机号：">
            <el-input name="" id="userPhone" v-model="userPhone" />
          </el-form-item>
          <el-form-item label="邮箱：">
            <el-input name="" id="userEmail" v-model="userEmail" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="listUser(0,10)">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="userQueryClear">重置</el-button>
          </el-form-item>
        </el-form>

        <el-form :inline="true" style="margin-left: 5%">
        <!-- <el-form-item>
          <el-button type="primary" @click="openInsert">新增</el-button>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="userDeleteDench">批量删除</el-button>
        </el-form-item>
        </el-form>
        <el-dialog v-model="insertFormVisible" title="新增用户信息" width="40%">
          <el-form :inline="false" :model="updateInformation" label-width="80px">
            <el-form-item label="账户名" :label-width="formLabelWidth">
              <el-input v-model="updateInformation.userName" placeholder="Please input username" />
            </el-form-item>
            <el-form-item label="密码" :label-width="formLabelWidth">
              <el-input v-model="updateInformation.userPassword"
                        type="password" placeholder="Please input password" />
            </el-form-item>
            <el-form-item label="手机号" :label-width="formLabelWidth">
              <el-input v-model="updateInformation.userPhone" placeholder="Please input phone number"/>
            </el-form-item>
            <el-form-item label="邮箱" :label-width="formLabelWidth">
              <el-input v-model="updateInformation.userEmail" placeholder="Please input email address"/>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="insertFormVisible = false">取消</el-button>
              <el-button type="primary" @click="userInsert">新增</el-button>
            </span>
          </template>
        </el-dialog>
    </div>
      <div class="mainlist">
        <el-table
            ref="multipleTableRef"
            :data="contents"
            style="width: 100%;height: 530px"
            max-height="530"
            border
        >
          <el-table-column width="50">
            <template v-slot="sth">
              <input
                  name="check"
                  type="checkbox"
                  class="check"
                  :id="sth.row.userId"
                  @input="choose(sth.row.userId)"
              />
            </template>
          </el-table-column>
          <el-table-column property="userId" label="序号" >
          </el-table-column>
          <el-table-column property="userName" label="账户名"  />
          <el-table-column property="userPhone" label="手机号"  />
          <el-table-column property="userEmail" label="邮箱"  />
          <el-table-column label="操作" >
            <template v-slot="slotProps">
              <el-button type="text" @click="openUpdate(slotProps.row)">修改</el-button>
              <el-dialog v-model="dialogFormVisible" title="修改用户信息" width="40%" >
                <el-form :model="updateInformation" label-width="80px">
                  <el-form-item label="账户名" :label-width="formLabelWidth">
                    <el-input v-model="updateInformation.userName" />
                  </el-form-item>
                  <el-form-item label="手机号" :label-width="formLabelWidth">
                    <el-input v-model="updateInformation.userPhone" />
                  </el-form-item>
                  <el-form-item label="邮箱" :label-width="formLabelWidth">
                    <el-input v-model="updateInformation.userEmail" />
                  </el-form-item>
                  <el-form-item label="修改密码">
                    <el-switch v-model="updatePsd" />
                  </el-form-item>
                  <el-form-item  label="旧密码" :label-width="formLabelWidth">
                    <el-input :disabled="!updatePsd" v-model="updateInformation.userPassword"
                              type="password" placeholder="Please input old password" />
                  </el-form-item>
                  <el-form-item label="新密码" :label-width="formLabelWidth">
                    <el-input :disabled="!updatePsd" v-model="updateInformation.newPassword"
                              type="password" placeholder="Please input new password" />
                  </el-form-item>
                </el-form>
                <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogFormVisible = false">取消</el-button>
              <el-button type="primary" @click="userUpdate">修改</el-button>
            </span>
                </template>
              </el-dialog>
              <el-button type="text" @click="userDelete(slotProps.row.userId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
              small
              :current-page="currentPage"
              :page-size="queryCount"
              layout="prev, pager, next, jumper"
              :total="dataAmount"
              @current-change="current_change"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from "../js/axiosResquest.js";
export default {
  name: "Users",
  components: {
  },
  data() {
    return {
      dataAmount: "",
      offset: "0",
      queryCount: "10",
      userName: "",
      userPhone: "",
      userEmail: "",
      contents: [],
      chosen:[],
      insertFormVisible: false,
      dialogFormVisible: false,
      currentPage: 1,
      checked: true,
      updatePsd: false,
      updateInformation: {
        userId: "",
        userName: "",
        userPhone: "",
        userEmail: "",
        userPassword: "",
        newPassword: "",
      },

    }
  },
  mounted() {
      this.listUser(0,10)
  },
  updated(){
    this.$nextTick(() => {
      function fun(list){
        let obj = document.getElementsByName("check");
        console.log("check",obj)
        for(let i=0; i<obj.length; i++){
          obj[i].checked = list.indexOf(obj[i].id) != -1;
        }
        console.log("check",obj)
      }
      fun(this.chosen)
    })
  },
  methods: {
    // 列表展示用户信息
    listUser(offset, count){
      this.offset=offset
      this.queryCount=count
      this.currentPage=offset/count+1
      this.userQuery()
    },
    // 查询用户信息
    async userQuery(){
        const QueryPagingParamsReq = {
          offset: this.offset,
          queryCount: this.queryCount,
        };
        const UserQueryReq = {
          userName: this.userName,
          userPhone: this.userPhone,
          userEmail: this.userEmail
        };
        try{
          const res=await request({
            url: "user/query",
            method: "post",
            data: {
              UserQueryReq,
              QueryPagingParamsReq,
            },
          });
          console.log("res.data:",res);
          this.dataAmount=res.data.QuerySummaryRsp.dataAmount
          console.log(this.dataAmount)
          this.contents=res.data.UserQueryRsp
          if(res.code != 2000){
            console.log("服务器异常");
            return;
          }
        }catch (error){
          console.log(error);
        }
      },
    // 重置查询信息
    userQueryClear(){
      this.userName=""
      this.userPhone=""
      this.userEmail=""
      this.listUser(0,10)
    },
    // 批量删除
    userDeleteDench(){
      this.chosen.forEach((deleteId)=>{
        this.userDelete(deleteId)
      })
      this.chosen=[]
      console.log(this.chosen)
    },
    // 选择删除用户id
    choose(value){
        console.log("choose");
        console.log(value);
        if(this.chosen.indexOf(value) == -1){
          this.chosen.push(value)
        }
        else {
          console.log(this.chosen.indexOf(value))
          this.chosen.splice(this.chosen.indexOf(value),1)
        }
        console.log(this.chosen)

      },
    // 打开新增用户信息
    openInsert(){
      this.insertFormVisible = true
      this.updateInformation.userId=""
      this.updateInformation.userName=""
      this.updateInformation.userPhone=""
      this.updateInformation.userEmail=""
      this.updateInformation.userPassword=""
      this.updateInformation.newPassword=""
    },
    // 新增用户信息
    async userInsert(){
      const UserInsertReq = this.updateInformation
      try{
        const res = await request({
          url: "user/insert",
          method: "post",
          data: {
            UserInsertReq,
          },
        });
        console.log("res.data:",res);
        if(res.code != 2000){
          console.log("服务器异常");
          return;
        }
      }catch (error){
        console.log(error);
      }
      this.insertFormVisible = false
      this.userQuery()
    },
    // 打开修改用户信息
    openUpdate(value){
      this.dialogFormVisible = true
      this.updateInformation.userId=value.userId
      this.updateInformation.userName=value.userName
      this.updateInformation.userPhone=value.userPhone
      this.updateInformation.userEmail=value.userEmail
      this.updateInformation.userPassword=""
      this.updateInformation.newPassword=""
      this.updatePsd=false
    },
    // 修改用户信息
    async userUpdate(){
      console.log("edit");
      const UserUpdateReq = this.updateInformation
      try{
        const res = await request({
          url: "user/update",
          method: "post",
          data: {
            UserUpdateReq,
          },
        });
        console.log("res.data:",res);
        if(res.code != 2000){
          console.log("服务器异常");
          return;
        }
      }catch (error){
        console.log(error);
      }
      if(this.updatePsd){
        this.updatePassword()
      }
      this.userQuery()
      this.dialogFormVisible = false
    },
    //修改用户密码
    async updatePassword(){
      const UserUpdatePasswordReq = {
        userId: this.updateInformation.userId,
        userPassword: this.updateInformation.userPassword,
        newPassword: this.updateInformation.newPassword,
      }
      try{
        const res = await request({
          url: "user/updatePassword",
          method: "post",
          data: {
            UserUpdatePasswordReq,
          },
        });
        console.log("res.data:",res);
        if(res.code != 2000){
          console.log("服务器异常");
          return;
        }
      }catch (error){
        console.log(error);
      }
    },
    // 删除用户信息
    async userDelete(value){
        console.log("delete");
        console.log(value);
        const UserDeleteReq = {
          userId: value
        }
        try{
          const res = await request({
            url: "user/delete",
            method: "post",
            data: {
              UserDeleteReq,
            },
          });
          console.log("res.data:",res);
          if(res.code != 2000){
            console.log("服务器异常");
            return;
          }
        }catch (error){
          console.log(error);
        }
        this.userQuery()
      },
    // 翻页
    current_change:function(currentPage){
      this.currentPage = currentPage;
      console.log(this.currentPage,currentPage)
      this.listUser((this.currentPage-1)*this.queryCount,this.queryCount)
    },
    },
}
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
.mainbox {
  position: absolute;
  left: 130px;
  right: 0;
  height: 700px;
}
.data {
  position: relative;
  left: 10px;
  top: 5px;
  height: 700px;
  width: 98%;
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: #486586;
  border-radius: 5px;
}
.queryInput{
  margin-top: 25px;
  position:relative;
  margin-left: 15px;
  display: flex;
}
.mainlist{
  width: 98%;
  position:relative;
  margin-left: 15px;
  display: block;
}
.pagination{
  margin-top: 15px;
}

</style>