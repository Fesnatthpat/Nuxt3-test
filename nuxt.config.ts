// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  
  // // ทุก route จะมีการ render จาก server
  // ssr: true,

  // // กำหนดบาง route ให้ render จาก client
  // routeRules: {
  //   '/backend/**': { ssr: false }
  // },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  },

  runtimeConfig: {
    public: {
      postsUrlAPI: 'http://localhost:3000/api'
    }
  },

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})
