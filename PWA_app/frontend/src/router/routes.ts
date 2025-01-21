import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue') }, 
      { path: 'login', component: () => import('pages/MainLogin.vue') }, 
      { path: 'register', component: () => import('pages/MainRegister.vue') },
      { path: 'chatapp', component: () => import('pages/ChatApp.vue') }
    ],
  },

  // Always leave this as last one, 
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];


export default routes;
