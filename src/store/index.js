const store = {
  state: sessionStorage.getItem('state')?JSON.parse(sessionStorage.getItem('state')):
  {
    token: {
      token: "",
      refresh: "",
      expires: ""
    },
    refreshToken: {
      token: "",
      refresh: "",
      expires: ""
    },
    isAuthenticated: false,
    userNow: "",
  },
  setToken(value){
    this.state.token = value;
  },
  setRefreshToken(value){
    this.state.refreshToken = value;
  },
  setAuthentication(value) {
    // console.log(typeof(value),typeof(this.state.isAuthenticated));
    this.state.isAuthenticated = value;
  },
  setUserNow(value){
    this.state.userNow = value;
  },
  setDataClear(){
    this.state = {
      token: {
        token: "",
        refresh: "",
        expires: ""
      },
      refreshToken: {
        token: "",
        refresh: "",
        expires: ""
      },
      isAuthenticated: false,
      userNow: "",
    }
  }

}

export default store