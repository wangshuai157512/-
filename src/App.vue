<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  min-height: 100vh;
}
html {

}
body {
    height: 100%;
    margin: 0;
    padding: 0;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}
.el-table__body-wrapper {
    min-height: 400px;
}
.el-table {
  table tr:nth-child(2n) {
    background-color: #dbe1ef;
  }
  table td,
  table th {
    border: 1px solid #c6ddef;
    padding: 2px 0;
  }
  table th {
    background-color: #dbe1ef !important;
  }
}
.el-table {
     .el-table__header-wrapper,
     .el-table__fixed-header-wrapper {
         th {
             word-break: break-word;
             background-color: #f8f8f9;
             color: #515a6e;
             height: 40px;
             font-size: 13px;
         }
     }
     .el-table__body-wrapper {
         .el-button [class*="el-icon-"]+span {
             margin-left: 1px;
         }
     }
 }



</style>
