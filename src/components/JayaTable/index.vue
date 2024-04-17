<template>
  <div class="jaya-table">
    <div class="table-top">
      <div>
        <el-button
          v-for="(item, index) in functionalityBtn"
          :key="index"
          :type="item.type || 'primary'"
          :disabled="
            typeof item.disabled === 'function'
              ? item.disabled()
              : item.disabled
          "
          :plain="item.plain || true"
          :size="item.size || 'mini'"
          :round="item.round || false"
          @click="item.funClick && item.funClick(item)"
          >{{ typeof item.title === "function" ? item.title() : item.title }}
        </el-button>
      </div>
    </div>
    <el-table
      v-if="showChart"
      v-bind="$attrs"
      highlight-current-row
      :data="tableList"
      :empty-text="'暂无数据'"
      style="width: 100%"
      ref="jayaTable"
      border
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
        v-if="option.ismultiple"
      />
      <template v-for="(item, index) in tableHeaderList">
        <template>
          <el-table-column
            v-if="!item.type && !item.show"
            v-bind="setAttribute(item)"
            :key="index"
          >
            <template slot-scope="scope">
              <span v-if="item.status" class="table-text">
                {{ getStatus(scope.row[item.prop], item.status()) }}
              </span>
              <span
                v-else-if="item.slotFn"
                v-html="item.slotFn(scope.row, scope.$index)"
                class="table-text"
              ></span>
              <span
                v-else
                class="table-text"
                @click="
                  item.htmlClick ? item.htmlClick(scope.row) : ''
                "
                v-html="getTableText(item, scope)"
              ></span>
            </template>
          </el-table-column>
          <el-table-column
            v-bind="setAttribute(item)"
            v-else-if="item.type === 'switch'"
            align="center"
            :key="index"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row[item.prop]"
                :active-value="item.switchShow"
                :inactive-value="item.switchHide"
                :disabled="item.isDisabled"
                @change="item.change(scope.row)"
                active-color="#13ce66"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column
            v-bind="setAttribute(item)"
            v-else-if="item.type === 'button'"
            :key="index"
          >
            <template slot-scope="scope">
              <el-button
                @click="item.onClick && item.onClick(scope.row)"
                :type="item.btnType || 'text'"
                :size="item.size || 'mini'"
                >{{ getBtnText(item, scope) }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            v-bind="setAttribute(item)"
            v-else-if="item.type === 'tag'"
            :key="index"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.color" :color="scope.row.color">{{
                scope.row[item.prop]
              }}</el-tag>
              <el-tag v-else-if="scope.row.tagType" :type="scope.row.tagType">{{
                scope.row[item.prop]
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-bind="setAttribute(item)"
            align="center"
            headerAlign="center"
            fixed="right"
            v-else-if="item.type === 'buttons'"
            :key="index"
          >
            <template slot-scope="scope">
              <template>
                <el-button
                  v-show="
                    !itemBtn.hide || (itemBtn.hide && !itemBtn.hide(scope.row))
                  "
                  v-for="(itemBtn, index) in scope.row.butList
                    ? scope.row.butList
                    : item.butList"
                  :key="index"
                  v-hasPermi="itemBtn.auth"
                  @click="itemBtn.onClick(scope.row, itemBtn)"
                  :type="itemBtn.type || 'text'"
                  :size="itemBtn.size || 'mini'"
                  :disabled="btnIsDisabled(itemBtn, scope)"
                  >{{
                    typeof itemBtn.title === "function"
                      ? itemBtn.title(scope.row)
                      : itemBtn.title
                  }}
                </el-button>
              </template>
            </template>
          </el-table-column>
        </template>
      </template>
    </el-table>
    <div v-else>
      <slot name="chart"></slot>
    </div>
  </div>
</template>

<script>
const cacheTypeOptions = {};
export default {
  name: "JayaTable",
  props: {
    title: {
      type: String,
      default: "",
    },
    functionalityBtn: {
      type: Array,
      default: () => [],
    },
    option: {
      type: Object,
      default: () => ({}),
    },
    tableHeaderList: {
      type: Array,
      default: () => [],
    },
    tableList: {
      type: Array,
      default: () => [],
    },
    showChart: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      checkAll: true,
      checkNoAll: false,
      isIndeterminate: false,
      checkedColumn: [],
      allColumn: [],
      objOption: {},
    };
  },
  created() {
  },

  methods: {
    getStatus(prop, statusOption) {
      var label;
      if (!statusOption) return;
      if (Array.isArray(statusOption)) {
        label = statusOption.find((status) => status.value == prop)?.label;
      }
      if (typeof statusOption == "string") {
        if (statusOption && this.objOption[statusOption]) {
          label = this.objOption[statusOption][prop];
        }
      }
      return label;
    },
    getBtnText(item, scope) {
      return item.formatter ? item.formatter(scope) : item.label;
    },
    btnIsDisabled(itemBtn, scope) {
      return itemBtn.formatter ? itemBtn.formatter(scope) : itemBtn.disabled;
    },
    setAttribute(item) {
      return {
        headerAlign: "center",
        prop: item.prop,
        fixed: item.fixed,
        label: item.title,
        width: item.width || "auto",
        align: item.align || "center",
        minWidth: item.minWidth ? item.minWidth : "150",
        // sortable : item.sortable,
        showOverflowTooltip: true,
      };
    },
    getTableText(item, scope) {
      let text = item.formatter ? item.formatter(scope) : scope.row[item.prop];
      return text || text == "0" ? text : "-";
    },
    isAllSelect(val) {
      this.checkAll = val.length === this.allColumn.length;
    },
    handleCheckedCitiesChange(value) {
      this.checkedColumn = value;
      let checkedCount = value.length;
      let len = this.allColumn.length;
      this.checkAll = checkedCount === len;
      this.isIndeterminate = checkedCount > 0 && checkedCount < len;
    },
    // 多选
    handleSelectionChange(val) {
      this.$emit("handleSelectionChange", val);
    },
    //单选
    handleCurrentChange(val) {
      this.$emit("handleCurrentChange", val);
    },
    //取消单选
    setCurrent(row = "") {
      this.$refs.jayaTable.setCurrentRow(row);
    },
    // 设置特殊行颜色
    tableRowClassName({ row }) {
      if (row.hfx === false) {
        return "danger-row";
      }
    },
  },
  watch: {
    checkedColumn: {
      handler: "isAllSelect",
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.table-top {
  margin-bottom: 10px;
}
.el-table {
  /deep/ .danger-row {
    background: red;
  }
  /deep/ a {
    color: #46a6ff;
  }
}
</style>
