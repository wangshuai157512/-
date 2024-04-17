<template>
  <div class="login">
    <div class="home-title">{{ title }}</div>
    <div class="app-container">
      <div class="platform"></div>
      <div class="banner-center">
        <img :src="require('@/assets/sfz.png')" alt="" />
      </div>
      <div class="input-content">
        <el-form ref="form" :model="form" :inline="true" :rules="rules">
          <el-form-item prop="sfzmhm">
            <el-input
              v-model="form.sfzmhm"
              style="width: 300px"
              placeholder="请输入身份证明号码"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="search" size="small" type="primary"
              >查 询</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 收费详情弹窗 -->
    <el-dialog
      title="收费详情"
      :visible.sync="open"
      width="780px"
      append-to-body
      @close="handleClose"
    >
      <div class="info-box">
        <div v-if="info.name">
          姓名：<span>{{ info.name }}</span>
        </div>
        <div>
          身份证号码：<span>{{ info.sfzmhm }}</span>
        </div>
        <div>
          欠费次数：<span>{{
            info.qfcs > 0 ? info.qfcs + "次" : "无欠费"
          }}</span>
        </div>
      </div>
      <jaya-table :tableHeaderList="column" :tableList="tableData"></jaya-table>
      <div class="bottom-btn">
        <el-button @click="handleClose" type="primary">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import xml2js from "xml2js";
const column = function () {
  return [
    {
      title: "流水号",
      prop: "lsh",
    },
    {
      title: "缴费金额",
      prop: "je",
      with: "120",
    },
    {
      title: "收费日期",
      prop: "sfrq",
      width: "200",
    },
  ];
};
export default {
  name: "Home",
  data() {
    return {
      count: 0,
      timer: null,
      title: "驾驶人考试缴费核验系统",
      column: column.call(this),
      open: false,
      info: {
        sfzmhm: "",
        name: "",
        qfcs: 0,
      },
      tableData: [],
      form: {
        sfzmhm: "",
      },
      rules: {
        sfzmhm: [
          { required: true, message: "必填项", trigger: "change" },
          {
            pattern:
              /(^\d{8}(0\d|10|11|12)([0-2]\d|30|31)\d{3}$)|(^\d{6}(18|19|20)\d{2}(0\d|10|11|12)([0-2]\d|30|31)\d{3}(\d|X|x)$)/,
            message: "请输入正确的身份证号码",
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.readCard();
    addEventListener("keydown", this.keydown);
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
    this.count = 0;
    removeEventListener("keydown", this.keydown);
  },
  watch: {
    open(value) {
      if (!value) {
        this.$refs["form"].resetFields();
        // 关闭弹窗清除定时器
        clearInterval(this.timer);
        this.timer = null;
        this.count = 0;
        this.info = {
          sfzmhm: "",
          name: "",
          qfcs: 0,
        };
        this.form.sfzmhm = "";
        this.info.name = "";
        this.readCard();
      }
    },
  },
  methods: {
    search() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.$set(this.info, "sfzmhm", this.form.sfzmhm);
          axios({
            method: "get",
            url: `http://10.0.3.204:3000/queryKm3Info?sfzmhm=${this.form.sfzmhm}`,
          })
            .then((response) => {
              // 处理响应，这里的响应是一个包含 XML 数据的字符串
              let qfcsData = JSON.parse(response.data.return)
              this.info.qfcs = qfcsData.qfcs;
              this.open = true;
              // console.log(JSON.parse(response.data.return),999); //返回内容
            })
            .catch((err) => {
              // this.info.qfcs = 1;
            });
          axios({
            method:"get",
            url:`http://10.0.3.204:3000/getJfComInfo?sfzmhm=${this.form.sfzmhm}`,
          })
            .then((response) => {
              let tableData = JSON.parse(response.data.return)
              this.tableData = JSON.parse(tableData.data);
              this.open = true;
              // console.log(this.tableData,101010);
            })
            .catch((err) => {
            });
        }
      });
    },
    // 读卡
    readCard() {
      let isIE = !!window.ActiveXObject || "ActiveXObject" in window;
      if (isIE) {
        this.getIdCard();
      }
    },
    // 获取身份信息
    getIdCard() {
      var result;
      var cardtype;
      try {
        var ax = new ActiveXObject("IDRCONTROL.IdrControlCtrl.1");
        //  alert("已安装");
      } catch (e) {
        if (this.count === 1) return;
        this.msgError("控件未安装");
        this.count = 1;
      }
      //	result=IdrControl1.RepeatRead(1);   //设置是否重复读卡  0-不重复  1-重复
      //  result=IdrControl1.setMute(1);   //设置是否静音读卡  0-不静音  1-静音

      //注意：第一个参数为对应的设备端口，USB型为1001，串口型为1至16
      // result = IdrControl1.ReadCard("1001", "c:\\ocx\\test.jpg");
      result = IdrControl1.ReadCard("1001", "");
      cardtype = IdrControl1.DecideReadCardType(); //判断卡类型 1-身份证 2-外国居留证
      // console.log(result, cardtype, 99999);
      if (result == 1) {
        if (cardtype == 1) {
          if (this.form.sfzmhm == IdrControl1.GetCode()) return;
          let getName = IdrControl1.GetName();
          let cardsn = IdrControl1.GetCode();
          this.$set(this.info, "name", getName);
          this.$set(this.form, "sfzmhm", cardsn);
          this.search();
        }
      } else {
        localStorage.setItem("result", result);
      }
      if (!this.info.name) {
        this.timer = setTimeout(this.getIdCard, 1000);
      }
    },
    // 点击enter关闭弹窗
    keydown(event) {
      if (event.keyCode === 13) {
        //弹窗页关闭弹窗
        this.handleClose();
      }
    },
    // 关闭弹窗
    handleClose() {
      this.open = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.close-com {
  position: absolute;
  left: 20px;
  bottom: 20px;
}
.login {
  min-height: 100vh;
  background-image: url("../assets/homeblack.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
}
.home-title {
  color: white;
  font-size: 40px;
  float: left;
  margin-top: 60px;
  margin-left: 30px;
  white-space: nowrap;
}
.app-container {
  width: 600px;
  height: 53%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}
.banner-center {
  height: 300px;
  background-image: url("../assets/middlearea.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 240px;
    object-fit: contain;
  }
}
.platform {
  color: white;
  font-size: 50px;
  text-align: center;
  margin-bottom: 30px;
}
.sort-show {
  font-size: 25px;
}
.content-text {
  line-height: 32px;
  font-size: 15px;
  margin-top: 10px;
  //   margin-left: 20px;
}
.title-tip {
  font-size: 18px;
  font-weight: 700;
}
.bottom-tip {
  margin-top: 30px;
  color: red;
}
.input-content {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  .el-form {
    padding-right: 0;
  }
}
.surebtn {
  img {
    width: 280px;
    object-fit: contain;
    display: block;
    margin: auto;
    cursor: pointer;
  }
}
.clickbtn {
  display: flex;
  justify-content: center;
  // margin-top: 20px;
  img {
    width: 180px;
    object-fit: contain;
    display: block;
    margin: auto;
    cursor: pointer;
  }
}
.info-box {
  display: flex;
  div {
    margin-right: 20px;
    font-size: 16px;
    span {
      color: #515a6e;
      // font-weight: 700;
    }
  }
}
.bottom-btn {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  font-weight: 700;
}
.el-button--small {
  font-size: 16px !important;
  padding: 10px 20px;
}
</style>
