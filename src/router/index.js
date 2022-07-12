import { createRouter, createWebHistory } from 'vue-router'
import Header from '../views/Header.vue'
import Sidebar from '../views/DataStorage/Sidebar.vue'
import Login from '@/views/Login.vue'
import DataStorage from '@/views/DataStorage.vue'
import store from "../store/index.js"

const routes = [
  {
    path: '/',
    name: 'home',
    props: true,
    components: {
      Header,
      Sidebar,
      DataStorage,
    }
  },
  
  {
    path: '/dataMarkerInformation',
    name: "DataMarkerInformation",
    component: () => import ('../views/DataMarker/DataMarkerInformation.vue'),
  },
  {
    path: '/dataMarkerInformation/dataMarker',
    name: "DataMarker",
    component: () => import ('../views/DataMarker/VisibleLightImageMarker/VisibleDataMarker.vue'),
  },
  {
    path: '/dataMarkerInformation/HyperspectralImageMarker',
    name: "HyperspectralImageMarker",
    component: () => import ('../views/DataMarker/HyperspectralImageMarker/HyperspectralImageMarker.vue'),
  },
  {
    path: '/dataMarkerInformation/HighResolutionImageMarker',
    name: "HighResolutionImageMarker",
    component: () => import ('../views/DataMarker/HighResolutionImageMarker/HighResolutionImageMarker.vue'),
  },
  {
    path: '/dataMarkerInformation/InfraredImageMarker',
    name: "InfraredImageMarker",
    component: () => import ('../views/DataMarker/InfraredImageMarker/InfraredImageMarker.vue'),
  },
  {
    path: '/dataMarkerInformation/SARImageMarker',
    name: "SARImageMarker",
    component: () => import ('../views/DataMarker/SARImageMarker/SARImageMarker.vue'),
  },
  {
    path: '/test',
    name:"Test",
    component:()=> import('@/views/test.vue')
  },
  {
    path: '/datastorage/',
    name: "DataStorage",
    component: () => import('../views/DataStorage.vue'),
    children: [
      {
        path: 'dataSource2',
        name: "dataSource2",
        component: () => import('../views/DataStorage/DataSource2.vue')
      },
      {
        path: 'trackcanter',
        name: "TrackCanter",
        component: () => import('../views/DataStorage/TrackCanter.vue')
      },
    ]
  },

  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  // {
  //   path: '/testmarker',
  //   name: 'TestMarker',
  //   component: () => import('@/views/TestMarker.vue')
  // },
  {
    path: '/:all+',
    component: () => import('../views/Error404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, from, next) => {
  let myflag = store.state.isAuthenticated;
  let fromName = from.name;
  if(to.name!=="Login" && !myflag){
    console.log("store.state.isAuthenticated one",store.state.isAuthenticated, myflag);
    next({name:"Login"});
  }else if(to.name === "Login" && myflag){
    console.log("store.state.isAuthenticated two",store.state.isAuthenticated, myflag);
    next("/dataMarkerInformation");
  }
  else{
    console.log("store.state.isAuthenticated three",store.state.isAuthenticated, myflag);
    next()
  }
})

export default router
