const file = require.context("./", true, /\.vue$/);

const install = Vue => {
  file.keys().forEach(path => {
    const component = file(path).default;
    Vue.component(component.name || path.match(/\/(\S*)\//)[1], component);
  });
};

export default install;
