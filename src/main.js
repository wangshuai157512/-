
import "babel-polyfill"
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Element from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import jayaComponents from "./components"; //全局组件

Vue.prototype.msgSuccess = function (msg) {
  this.$message({ showClose: true, message: msg, type: "success" });
};

Vue.prototype.msgError = function (msg) {
  this.$message({ showClose: true, message: msg, type: "error" });
};

Vue.prototype.msgWarn = function (msg) {
  this.$message({ showClose: true, message: msg, type: "warning" });
};

Vue.prototype.msgInfo = function (msg) {
  this.$message.info(msg);
};

Vue.use(Element);
Vue.use(jayaComponents);

Vue.config.productionTip = false
Vue.use(jayaComponents);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
