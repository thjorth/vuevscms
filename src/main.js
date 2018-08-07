// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import LinkList from './components/LinkList';
import HowTo from './components/HowTo';
import App from './App';

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { 
    'app': App,
    'link-list': LinkList,
    'how-to': HowTo
  }
})
