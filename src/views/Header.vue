<template>
    <div>
        <div class="head">
            <div class="head_left">
                <img id="head_logo" src="./../../pictures/logosmall.png">
                <span><b>异构多平台协同探测数据标注软件</b></span>
            </div>
            <div class="head_toolBar">
                <el-button
                    v-for="header in headers"
                    :key="header.index"
                    @click="handleMenuClick(header)"
                    :class="
                        (currentMenuIndex === header.index && 'menu-header-item-focused') || 'menu-header-item'
                    "
                >
                {{ header.title }}
                </el-button>
            </div>
            <div class="head_right">
                <span class="dateTime">{{dateTime}}</span>
                <div v-if="isAuthen">
                    账户: {{user.username}}
                    <!-- ({{user.usertype}}) -->
                    <img v-on:click="logOut()" src="../assets/icons/exit.png" alt="">
                </div>
                <div v-else>
                    <div v-on:click="logIn()">登录/注册</div>
                    
                </div>
            </div>
        </div>
        <div style="margin-left:10px">
            <el-tabs
            v-model="editableTabsValue"
            closable
            @tab-remove="removeTabs"
            @tab-click="tabClick"
            class="tabs"
            >
                <el-tab-pane
                    :key="item.name"
                    v-for="item in editableTabs"
                    :label="item.title"
                    :name="item.name"
                >
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
        
</template>

<script>
import store from "@/store"
export default {
    name: "Header",
    data() {
        return {
            isAuthen: store.state.isAuthenticated,
            dateTime: "",
            user: {
                username: "",
                usertype: ""
            },
            editableTabsValue:"数据标注列表",
            editableTabs: [
                {
                title: "数据标注列表",
                name: "数据标注列表",
                index: "/dataMarkerInformation"
                }
            ],
            currentMenuIndex:"",
            headers: [
            //普通的导航头
                {
                    index: "/dataMarkerInformation",
                    title: "数据标注",
                },
                {
                    index: "/datastorage",
                    title: "数据存储",
                },
                {
                    index: "/algorithm",
                    title: "算法管理",
                },
                {
                    index: "/users",
                    title: "用户管理",
                },

            ]
        }
    },
    updated(){
        this.user.username = store.state.userNow;
        this.isAuthen = store.state.isAuthenticated;
    },
    props:[],
    methods: {
        logOut(){
            store.setToken({});
            store.setRefreshToken({});
            store.setAuthentication(false);
            store.setUserNow("");
            store.setDataClear();
            sessionStorage.setItem('state',JSON.stringify(store.state));
            this.$router.replace("/login");
        },
        logIn(){
            this.$router.replace('/login')
        },
        handleMenuClick(header){
            this.$router.push({ path: header.index });
            this.createTabs(header.title,header.index)
        },
        //标签前往对应的路由
        tabClick(tab) {
            // ss.save("TAB", this.editableTabs[tab.index]);
            const router = this.editableTabs[tab.index].index;
            this.$router.push({ path: router });
        },
        //增加顶部标签
        createTabs(title, index) {
            for (var i in this.editableTabs) {
                if (this.editableTabs[i].index === index) {
                this.editableTabsValue = this.editableTabs[i].name;
                return;
                }
            }

            let newTabName = title;
            const newTab = {
                title: title,
                name: newTabName,
                index: index
            };
            this.editableTabs.push(newTab);
            // ss.save("TAB", newTab);
            this.editableTabsValue = newTabName;
        },
        //删除顶部标签
        removeTabs(targetName) {
            let tabs = this.editableTabs;
            let activeName = this.editableTabsValue;
            if (activeName === targetName) {
                tabs.forEach((tab, index) => {
                if (tab.name === targetName) {
                    let nextTab = tabs[index + 1] || tabs[index - 1];
                    if (nextTab) {
                    activeName = nextTab.name;
                    this.$router.push({
                        path: nextTab.index
                    });
                    // ss.save("TAB", nextTab);
                    }
                }
                });
            }

            this.editableTabsValue = activeName;
            this.editableTabs = tabs.filter(tab => tab.name !== targetName);
            if (this.editableTabs.length === 0) {
                //关掉了所有标签，退回到首页
                this.createTabs(this.home.title, this.home.index);
                this.$router.push({
                path: this.home.index
                });
            }
        },
    },
    created() {
        setInterval(
            ()=>{
                let dateTimeGet = Date().toLocaleString();
                let a = dateTimeGet.split(' ');
                this.dateTime = a[3]+' '+a[1]+' '+a[2]+' '+a[4];
            },
            1000
        )
    },
}
</script>

<style scoped>
.head{
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100px;
    background-color: #486586;
    color: whitesmoke;

    display: flex;
    justify-content: space-between;
} 

.head .head_left{
    display: flex;
    align-items: center;
    font-size: 30px;
    padding: 0 20px 0 20px;
}

.head #head_logo{
    padding: 10px;
    height: 66px;
    width: 66px;
}

.head .head_toolBar{
    align-self: center;
    min-width: 360px;
    bottom: 0;
    width: auto;
    padding: 0;
    font-size: 18px;
}

.head .head_toolBar .toolBarItem{
    color: seashell;
    text-decoration: none;
    margin: 0 3px 0 3px;
    font-size: 20px;
    border: #aaaaaa solid 1px;
    border-radius: 10px;
    padding: 5px;
}

/* .toolBarItem:nth-child(4){
    border-right: #aaaaaa solid 1px;
} */

.head_right{
    width: 18%;
    color: #aaa;
    right: 0;
    padding: 20px;

    
}
.head_right img{
    transform: translateY(3px);
    height: 1em;
}
</style>