import products from "./products.js";

// --- STATE MANAGEMENT ---
let inventory = JSON.parse(localStorage.getItem("marketmate_inventory")) || products;
let cart = [];
let activeCategory = null;

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80";


function saveToLocalStorage() {
  localStorage.setItem("marketmate_inventory", JSON.stringify(inventory));
}

// --- DOM ELEMENTS ---
const btnStorefront = document.querySelector("#btn-storefront");
const btnVendor = document.querySelector("#btn-vendor");
const viewStorefront = document.querySelector("#view-storefront");
const viewVendor = document.querySelector("#view-vendor");
const viewProfile = document.querySelector("#view-profile");

const navHome = document.querySelector("#nav-home");
const categoryAccordionBtn = document.querySelector("#category-accordion-btn");
const categoryDropdownList = document.querySelector("#category-dropdown-list");
const categoryChevron = document.querySelector("#category-chevron");
const navProfile = document.querySelector("#nav-profile");

// Mobile Menu Elements
const mobileMenuBtn = document.querySelector("#mobile-menu-btn");
const closeSidebarBtn = document.querySelector("#close-sidebar-btn");
const sidebar = document.querySelector("#sidebar");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");

const storefrontGrid = document.querySelector("#storefront-grid");
const storefrontHeading = document.querySelector("#storefront-heading");
const productCountBadge = document.querySelector("#product-count-badge");
const globalSearch = document.querySelector("#global-search");
const globalSearchMobile = document.querySelector("#global-search-mobile");

const tableBody = document.querySelector("#inventory-table-body");
const productForm = document.querySelector("#product-form");
const editIdInput = document.querySelector("#edit-id");
const imageInput = document.querySelector("#item-image");

// Cart DOM
const cartBtn = document.querySelector("#cart-btn");
const cartDrawer = document.querySelector("#cart-drawer");
const cartDrawerOverlay = document.querySelector("#cart-drawer-overlay");
const closeCartBtn = document.querySelector("#close-cart-btn");
const cartItemsList = document.querySelector("#cart-items-list");
const cartCountBadge = document.querySelector("#cart-count");
const cartTotalPrice = document.querySelector("#cart-total-price");
const checkoutBtn = document.querySelector("#checkout-btn");

// Profile DOM
const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name-input");
const profileEmailInput = document.querySelector("#profile-email-input");
const profileNameDisplay = document.querySelector("#profile-name-display");
const profileEmailDisplay = document.querySelector("#profile-email-display");
const userAvatar = document.querySelector("#user-avatar");

// --- MOBILE SIDEBAR TOGGLE ---
function toggleMobileSidebar(open) {
  if (open) {
    sidebar.classList.remove("-translate-x-full");
    sidebarBackdrop.classList.remove("hidden");
  } else {
    sidebar.classList.add("-translate-x-full");
    sidebarBackdrop.classList.add("hidden");
  }
}

mobileMenuBtn.addEventListener("click", () => toggleMobileSidebar(true));
closeSidebarBtn.addEventListener("click", () => toggleMobileSidebar(false));
sidebarBackdrop.addEventListener("click", () => toggleMobileSidebar(false));

// --- HELPER FUNCTIONS ---
function getStockBadge(stock) {
  if (stock === 0) {
    return `<span class="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full whitespace-nowrap">Out of Stock</span>`;
  } else if (stock <= 5) {
    return `<span class="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">${stock} pcs Low stock</span>`;
  } else {
    return `<span class="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full whitespace-nowrap">${stock} pcs in stock</span>`;
  }
}

// --- RENDER STOREFRONT GRID ---
function renderStorefront(items) {
  storefrontGrid.innerHTML = "";
  productCountBadge.innerText = `${items.length} Items`;

  if (items.length === 0) {
    storefrontGrid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400 italic">No products available.</div>`;
    return;
  }

  items.forEach(product => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden";

    const imgSrc = product.image && product.image.trim() !== "" ? product.image : DEFAULT_IMAGE;

    card.innerHTML = `
      <div>
        <div class="w-full h-40 md:h-44 bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
          <img src="${imgSrc}" alt="${product.title}" onerror="this.src='${DEFAULT_IMAGE}'" class="w-full h-full object-cover hover:scale-105 transition duration-300" />
          <div class="absolute top-2 right-2">
            ${getStockBadge(product.stock)}
          </div>
        </div>

        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">${product.category}</span>
        <h3 class="font-bold text-slate-900 text-base mb-1 line-clamp-1">${product.title}</h3>
        <p class="text-xs text-slate-500 line-clamp-2 mb-4">${product.description || "No description available."}</p>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="text-base md:text-lg font-extrabold text-slate-900">₦${parseFloat(product.price).toLocaleString()}</span>
        <button 
          onclick="window.addToCart(${product.id})" 
          ${product.stock === 0 ? "disabled" : ""} 
          class="px-3.5 py-2 rounded-lg font-medium text-xs transition ${product.stock === 0
        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
        : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
      }">
          ${product.stock === 0 ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    `;
    storefrontGrid.appendChild(card);
  });
}

// --- RENDER VENDOR TABLE ---
function renderVendorTable(items) {
  tableBody.innerHTML = "";
  if (items.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400 italic">No products found.</td></tr>`;
    return;
  }

  items.forEach(product => {
    const row = document.createElement("tr");
    row.className = "hover:bg-slate-50 transition";
    const imgSrc = product.image && product.image.trim() !== "" ? product.image : DEFAULT_IMAGE;

    row.innerHTML = `
      <td class="p-3.5 flex items-center space-x-3 min-w-[180px]">
        <img src="${imgSrc}" onerror="this.src='${DEFAULT_IMAGE}'" class="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
        <span class="font-medium text-slate-900 truncate">${product.title}</span>
      </td>
      <td class="p-3.5 text-slate-600 whitespace-nowrap">${product.category}</td>
      <td class="p-3.5 font-semibold text-emerald-700 whitespace-nowrap">₦${parseFloat(product.price).toLocaleString()}</td>
      <td class="p-3.5 whitespace-nowrap">${product.stock}</td>
      <td class="p-3.5 whitespace-nowrap">${getStockBadge(product.stock)}</td>
      <td class="p-3.5 text-right whitespace-nowrap shrink-0">
        <button onclick="window.startEdit(${product.id})" class="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 active:scale-95 transition inline-flex items-center space-x-1">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Edit</span>
        </button>
        <button onclick="window.deleteProduct(${product.id})" class="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 active:scale-95 transition inline-flex items-center space-x-1 ml-1">
          <i class="fa-solid fa-trash"></i>
          <span>Delete</span>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// --- CART DRAWER LOGIC ---
function toggleCart(open) {
  if (open) {
    cartDrawerOverlay.classList.remove("hidden");
    cartDrawer.classList.remove("translate-x-full");
  } else {
    cartDrawerOverlay.classList.add("hidden");
    cartDrawer.classList.add("translate-x-full");
  }
}

function updateCartUI() {
  cartItemsList.innerHTML = "";
  let total = 0;
  let totalItemsCount = 0;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<div class="py-12 text-center text-slate-400 italic">Your cart is empty.</div>`;
  } else {
    cart.forEach(item => {
      total += item.price * item.quantity;
      totalItemsCount += item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.className = "flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200";
      const imgSrc = item.image && item.image.trim() !== "" ? item.image : DEFAULT_IMAGE;

      itemDiv.innerHTML = `
        <div class="flex items-center space-x-3">
          <img src="${imgSrc}" onerror="this.src='${DEFAULT_IMAGE}'" class="w-12 h-12 object-cover rounded-lg border shrink-0" />
          <div>
            <h4 class="font-bold text-xs text-slate-800 line-clamp-1">${item.title}</h4>
            <p class="text-xs font-semibold text-emerald-700">₦${item.price.toLocaleString()}</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <button onclick="window.changeCartQty(${item.id}, -1)" class="w-6 h-6 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300 text-xs">-</button>
          <span class="text-xs font-bold">${item.quantity}</span>
          <button onclick="window.changeCartQty(${item.id}, 1)" class="w-6 h-6 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300 text-xs">+</button>
          <button onclick="window.removeFromCart(${item.id})" class="text-rose-500 hover:text-rose-700 text-xs pl-1">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      cartItemsList.appendChild(itemDiv);
    });
  }

  cartCountBadge.innerText = totalItemsCount;
  cartTotalPrice.innerText = `₦${total.toLocaleString()}`;
}

window.addToCart = function (productId) {
  const product = inventory.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++;
    } else {
      alert(`Maximum available stock (${product.stock} pcs) reached.`);
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  toggleCart(true);
};

window.changeCartQty = function (productId, delta) {
  const item = cart.find(i => i.id === productId);
  const product = inventory.find(p => p.id === productId);
  if (!item || !product) return;

  item.quantity += delta;
  if (item.quantity > product.stock) {
    item.quantity = product.stock;
    alert(`Only ${product.stock} pcs available.`);
  }

  if (item.quantity <= 0) {
    window.removeFromCart(productId);
  } else {
    updateCartUI();
  }
};

window.removeFromCart = function (productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
};

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  cart.forEach(cartItem => {
    const product = inventory.find(p => p.id === cartItem.id);
    if (product) {
      product.stock = Math.max(0, product.stock - cartItem.quantity);
    }
  });

  saveToLocalStorage();
  cart = [];
  updateCartUI();
  applyFilters();
  toggleCart(false);

  alert("Order placed successfully! Stock levels updated.");
});

// --- SIDEBAR & CATEGORIES ---
function updateCategories() {
  const categories = [...new Set(inventory.map(item => item.category))].sort();
  categoryDropdownList.innerHTML = "";

  categories.forEach(cat => {
    if (cat) {
      const btn = document.createElement("button");
      btn.className = "w-full text-left py-1.5 px-2 text-xs font-medium text-slate-600 hover:text-emerald-600 rounded transition";
      btn.innerText = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        storefrontHeading.innerText = `Category: ${cat}`;
        applyFilters();
        toggleMobileSidebar(false); // Close mobile sidebar on category click
      });
      categoryDropdownList.appendChild(btn);
    }
  });
}

function applyFilters() {
  const query = (globalSearch.value || globalSearchMobile.value || "").toLowerCase().trim();
  const filtered = inventory.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(query) || (product.description && product.description.toLowerCase().includes(query));
    const matchesCategory = !activeCategory || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  renderStorefront(filtered);
  renderVendorTable(filtered);
}

// Synchronize desktop and mobile search inputs
globalSearch.addEventListener("input", (e) => {
  globalSearchMobile.value = e.target.value;
  applyFilters();
});
globalSearchMobile.addEventListener("input", (e) => {
  globalSearch.value = e.target.value;
  applyFilters();
});

// --- VIEW NAVIGATION ---
function switchView(viewName) {
  viewStorefront.classList.add("hidden");
  viewVendor.classList.add("hidden");
  viewProfile.classList.add("hidden");

  btnStorefront.className = "px-3 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-200 text-slate-600 hover:text-slate-900 flex items-center space-x-2";
  btnVendor.className = "px-3 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-200 text-slate-600 hover:text-slate-900 flex items-center space-x-2";

  if (viewName === "storefront") {
    viewStorefront.classList.remove("hidden");
    btnStorefront.className = "px-3 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-200 bg-emerald-600 text-white shadow-sm flex items-center space-x-2";
  } else if (viewName === "vendor") {
    viewVendor.classList.remove("hidden");
    btnVendor.className = "px-3 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-200 bg-emerald-600 text-white shadow-sm flex items-center space-x-2";
  } else if (viewName === "profile") {
    viewProfile.classList.remove("hidden");
  }
  toggleMobileSidebar(false);
}

// --- VENDOR FORM HANDLERS (CRUD) ---
productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = editIdInput.value;
  const title = document.querySelector("#item-name").value.trim();
  const category = document.querySelector("#item-category").value.trim();
  const price = parseFloat(document.querySelector("#item-price").value);
  const stock = parseInt(document.querySelector("#item-quantity").value, 10);
  const image = imageInput.value.trim();
  const description = document.querySelector("#item-description").value.trim();

  if (id) {
    const index = inventory.findIndex(p => p.id == id);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], title, category, price, stock, image, description };
      alert("Product updated!");
    }
  } else {
    const newProd = { id: Date.now(), title, category, price, stock, image, description };
    inventory.push(newProd);
    alert("Product added!");
  }

  saveToLocalStorage();
  updateCategories();
  applyFilters();
  resetForm();
});

window.startEdit = function (id) {
  const product = inventory.find(p => p.id === id);
  if (!product) return;

  document.querySelector("#form-title").innerText = "Edit Product";
  editIdInput.value = product.id;
  document.querySelector("#item-name").value = product.title;
  document.querySelector("#item-category").value = product.category;
  document.querySelector("#item-price").value = product.price;
  document.querySelector("#item-quantity").value = product.stock;
  imageInput.value = product.image || "";
  document.querySelector("#item-description").value = product.description || "";

  document.querySelector("#save-btn").innerText = "Update Product";
  document.querySelector("#cancel-btn").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function resetForm() {
  document.querySelector("#form-title").innerText = "Add New Product";
  editIdInput.value = "";
  productForm.reset();
  document.querySelector("#save-btn").innerText = "Add Product";
  document.querySelector("#cancel-btn").classList.add("hidden");
}

document.querySelector("#cancel-btn").addEventListener("click", resetForm);

window.deleteProduct = function (id) {
  if (confirm("Delete this product?")) {
    inventory = inventory.filter(p => p.id !== id);
    saveToLocalStorage();
    updateCategories();
    applyFilters();
  }
};

// --- LISTENERS ---
btnStorefront.addEventListener("click", () => switchView("storefront"));
btnVendor.addEventListener("click", () => switchView("vendor"));
navProfile.addEventListener("click", () => switchView("profile"));

navHome.addEventListener("click", () => {
  activeCategory = null;
  storefrontHeading.innerText = "All Products";
  globalSearch.value = "";
  globalSearchMobile.value = "";
  switchView("storefront");
  applyFilters();
});

categoryAccordionBtn.addEventListener("click", () => {
  categoryDropdownList.classList.toggle("hidden");
  categoryChevron.classList.toggle("rotate-180");
});

cartBtn.addEventListener("click", () => toggleCart(true));
closeCartBtn.addEventListener("click", () => toggleCart(false));
cartDrawerOverlay.addEventListener("click", () => toggleCart(false));

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = profileNameInput.value.trim();
  const email = profileEmailInput.value.trim();

  profileNameDisplay.innerText = name;
  profileEmailDisplay.innerText = email;
  userAvatar.innerText = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "MM";

  alert("Profile saved!");
  switchView("storefront");
});

// App Startup
updateCategories();
applyFilters();
updateCartUI();