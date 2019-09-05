//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

//cart
let cart = [];
let buttonsDOM = [];

//getting products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;

      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}
//display products
class UI {
  display(products) {
    let result = "";
    products.forEach(item => {
      let div = document.createElement("div");
      result += `<!-- single product -->
            <article class="product">
                <div class="img-container">
                  <img
                    src=${item.image}
                    alt="product"
                    class="product-img"
                  />
                  <button class="bag-btn" data-id=${item.id}>
                    <i class="fas fa-shopping-cart">add to order</i>
                  </button>
                </div>
                <h3>${item.title}</h3>
                <h4>$${item.price}</h4>
            </article>
            <!-- end of single product -->`;
    });
    productsDOM.innerHTML = result;
  }
  getBagBtn() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let InCart = cart.find(item => item.id === id);
      if (InCart) {
        button.innerText = "Already ordered";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        event.target.innerText = "Already ordered";
        event.target.disabled = true;
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.setChosenItems(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
      <div>
        <h4>${item.title}</h4>
        <h5>${item.price}</h5>
        <span class="remove-item" data-id="${item.id}">remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id="${item.id}"></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id="${item.id}"></i>
      </div>`;
    cartContent.append(div);
    //console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
    //console.log("Work?");
  }
  getApp() {
    let cart = Storage.getCart();
    //console.log(cart);
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
    //console.log("Work?");
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        console.log(removeItem);
        let id = removeItem.dataset.id;
        console.log(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.setChosenItems(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.setChosenItems(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    /*  let cart = Storage.getCart();
    console.log(cart); */
    let cartItems = cart.map(item => item.id);
    //console.log(cartItems);
    cartItems.forEach(id => {
      this.removeItem(id);
    });
    while (cartContent.childElementCount > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    //console.log(id);
    cart = cart.filter(item => item.id !== id);
    console.log(cart);
    this.setCartValues(cart);
    Storage.setChosenItems(cart);
    let button = this.getSingleButton(id);
    console.log(button.disabled);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart">add to order</i>`;
  }
  getSingleButton(id) {
    //console.log(id);
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}
//local storage
class Storage {
  static setProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static setChosenItems(cart) {
    localStorage.setItem("chosenItem", JSON.stringify(cart));
  }
  static getProduct(id) {
    let product = JSON.parse(localStorage.getItem("products"));
    return product.find(item => item.id === id);
  }
  static getCart() {
    return localStorage.getItem("chosenItem")
      ? JSON.parse(localStorage.getItem("chosenItem"))
      : [];
  }
}
//events
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.getApp();
  products
    .getProducts()
    .then(products => {
      ui.display(products);
      Storage.setProducts(products);
    })
    .then(() => {
      ui.getBagBtn();
      ui.cartLogic();
    });
});
