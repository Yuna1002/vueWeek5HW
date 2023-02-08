const url = "https://vue3-course-api.hexschool.io/v2";
const api_path = "yuna1002";

const productModal = {
  props: ["product", "add"],
  data() {
    return {
      modal: {},
      qty: 1,
    };
  },
  template: "#userProductModal",
  methods: {
    show() {
      this.modal.show();
    },
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
};

const { createApp } = Vue;
const app = createApp({
  data() {
    return {
      products: [],
      tempProduct: {},
      cart: {},
      loadingItem: "", //存id,當事件有此id時 disabled
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  components: {
    productModal,
  },
  methods: {
    getProducts() {
      let loader = this.$loading.show();
      axios
        .get(`${url}/api/${api_path}/products/all`)
        .then((res) => {
          this.products = res.data.products;
          loader.hide();
        })
        .catch((err) => {
          alert(err.data.message);
          loader.hide();
        });
    },
    openModal(id) {
      this.loadingItem = id;
      axios
        .get(`${url}/api/${api_path}/product/${id}`)
        .then((res) => {
          this.tempProduct = res.data.product;
          this.$refs.modal.show();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    addToCart(product_id, qty = 1) {
      this.loadingItem = product_id;
      const data = {
        product_id,
        qty,
      };
      axios
        .post(`${url}/api/${api_path}/cart`, { data })
        .then((res) => {
          alert(res.data.message);
          this.$refs.modal.hide();
          this.getCarts();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    getCarts() {
      let loader = this.$loading.show();
      axios
        .get(`${url}/api/${api_path}/cart`)
        .then((res) => {
          this.cart = res.data.data;
          loader.hide();
        })
        .catch((err) => {
          alert(err.data.message);
          loader.hide();
        });
    },
    updateQty(cartItem) {
      const data = {
        product_id: cartItem.product.id,
        qty: cartItem.qty,
      };
      this.loadingItem = cartItem.id;
      axios
        .put(`${url}/api/${api_path}/cart/${cartItem.id}`, { data })
        .then((res) => {
          alert(res.data.message);
          this.getCarts();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    delCart(id) {
      this.loadingItem = id;
      axios
        .delete(`${url}/api/${api_path}/cart/${id}`)
        .then((res) => {
          alert(res.data.message);
          this.getCarts();
          this.loadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    delAllCart() {
      axios
        .delete(`${url}/api/${api_path}/carts`)
        .then((res) => {
          alert(res.data.message);
          this.getCarts();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    submitOrder() {
      const data = this.form;
      axios
        .post(`${url}/api/${api_path}/order`, { data })
        .then((res) => {
          alert(res.data.message);
          this.$refs.form.resetForm();
          this.getCarts();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  },
});

//表單驗證
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});
app.use(VueLoading.LoadingPlugin);
app.mount("#app");
