const supabaseAdmin = supabase.createClient(
  window.VKM_SUPABASE_URL,
  window.VKM_SUPABASE_PUBLISHABLE_KEY
);

const loginPanel = document.getElementById("loginPanel");
const editorPanel = document.getElementById("editorPanel");
const editorWorkspace = document.getElementById("editorWorkspace");
const lockedWorkspace = document.getElementById("lockedWorkspace");
const loginStatus = document.getElementById("loginStatus");
const saveStatus = document.getElementById("saveStatus");
const categoryEditors = document.getElementById("categoryEditors");
const productEditors = document.getElementById("productEditors");
const logoPreview = document.getElementById("logoPreview");

let storeData = null;
let categoryItems = [];
let productItems = [];
let removedCategoryIds = [];
let removedProductIds = [];

const fields = {
  logoImage: document.getElementById("logoImage"),
  shopName: document.getElementById("shopName"),
  shopTagline: document.getElementById("shopTagline"),
  heroTitle: document.getElementById("heroTitle"),
  heroDescription: document.getElementById("heroDescription"),
  aboutTitle: document.getElementById("aboutTitle"),
  aboutDescription: document.getElementById("aboutDescription"),
  heroSideNote: document.getElementById("heroSideNote"),
  topNotice: document.getElementById("topNotice"),
  phone1: document.getElementById("phone1"),
  phone2: document.getElementById("phone2"),
  phone3: document.getElementById("phone3"),
  whatsappNumber: document.getElementById("whatsappNumber"),
  address: document.getElementById("address")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function defaultStore() {
  return {
    id: null,
    shop_name: "VKM Tools & Agri Mart",
    logo_image: "",
    shop_tagline: "Mechanical tools and agri machinery shop",
    hero_title: "Powering your workshop, farm, and business.",
    hero_description: "VKM is your one-stop shop for mechanical tools, agricultural machinery, spare parts, pumps, and workshop essentials.",
    about_title: "Built for Working Customers",
    about_description: "VKM serves farmers, workshops, small industries, mechanics, and field workers who need durable tools and machinery.",
    hero_side_note: "Seller updates are stored online and shown to buyers automatically.",
    top_notice: "Trusted machinery, tools, and farm equipment for local customers.",
    phones: ["+91 9442140823", "+91 9842742606", "+91 9442150380"],
    whatsapp_number: "+919442140823",
    address: "VKM TRADERS, ULAVARSANTHI, ATTUR, SALEM"
  };
}

function showEditor() {
  loginPanel.classList.add("hidden");
  editorPanel.classList.remove("hidden");
  editorWorkspace.classList.remove("hidden");
  lockedWorkspace.classList.add("hidden");
}

function showLocked() {
  loginPanel.classList.remove("hidden");
  editorPanel.classList.add("hidden");
  editorWorkspace.classList.add("hidden");
  lockedWorkspace.classList.remove("hidden");
}

function fillForm() {
  const shop = storeData || defaultStore();
  fields.logoImage.value = shop.logo_image || "";
  fields.shopName.value = shop.shop_name || "";
  fields.shopTagline.value = shop.shop_tagline || "";
  fields.heroTitle.value = shop.hero_title || "";
  fields.heroDescription.value = shop.hero_description || "";
  fields.aboutTitle.value = shop.about_title || "";
  fields.aboutDescription.value = shop.about_description || "";
  fields.heroSideNote.value = shop.hero_side_note || "";
  fields.topNotice.value = shop.top_notice || "";
  fields.phone1.value = shop.phones?.[0] || "";
  fields.phone2.value = shop.phones?.[1] || "";
  fields.phone3.value = shop.phones?.[2] || "";
  fields.whatsappNumber.value = shop.whatsapp_number || "";
  fields.address.value = shop.address || "";
  updateLogoPreview();
}

function updateLogoPreview() {
  const image = fields.logoImage.value.trim();
  if (image) {
    logoPreview.src = image;
    logoPreview.classList.remove("hidden");
  } else {
    logoPreview.classList.add("hidden");
    logoPreview.removeAttribute("src");
  }
}

function refreshShopPreviewFields() {
  updateLogoPreview();

  if (!fields.shopName.value.trim() && storeData?.shop_name) {
    fields.shopName.value = storeData.shop_name;
  }
}

function syncForm() {
  const base = storeData || defaultStore();
  storeData = {
    ...base,
    logo_image: fields.logoImage.value.trim(),
    shop_name: fields.shopName.value.trim(),
    shop_tagline: fields.shopTagline.value.trim(),
    hero_title: fields.heroTitle.value.trim(),
    hero_description: fields.heroDescription.value.trim(),
    about_title: fields.aboutTitle.value.trim(),
    about_description: fields.aboutDescription.value.trim(),
    hero_side_note: fields.heroSideNote.value.trim(),
    top_notice: fields.topNotice.value.trim(),
    phones: [fields.phone1.value.trim(), fields.phone2.value.trim(), fields.phone3.value.trim()].filter(Boolean),
    whatsapp_number: fields.whatsappNumber.value.trim(),
    address: fields.address.value.trim()
  };
}

function renderCategoryEditors() {
  categoryEditors.innerHTML = "";
  categoryItems.forEach((category, index) => {
    const block = document.createElement("div");
    block.className = "item-editor";
    block.innerHTML = `
      <h3>Category ${index + 1}</h3>
      ${category.image_url ? `<img class="thumb-preview" src="${escapeHtml(category.image_url)}" alt="${escapeHtml(category.title)}">` : ""}
      <div class="field">
        <label>Image URL</label>
        <input type="text" data-type="category-image" data-index="${index}" value="${escapeHtml(category.image_url || "")}">
      </div>
      <div class="field">
        <label>Upload image</label>
        <input type="file" accept="image/*" data-type="category-file" data-index="${index}">
      </div>
      <div class="field">
        <label>Title</label>
        <input type="text" data-type="category-title" data-index="${index}" value="${escapeHtml(category.title || "")}">
      </div>
      <div class="field">
        <label>Description</label>
        <textarea data-type="category-description" data-index="${index}">${escapeHtml(category.description || "")}</textarea>
      </div>
      <button class="remove-btn" type="button" data-action="remove-category" data-index="${index}">Remove Category</button>
    `;
    categoryEditors.appendChild(block);
  });
}

function renderProductEditors() {
  productEditors.innerHTML = "";
  productItems.forEach((product, index) => {
    const block = document.createElement("div");
    block.className = "item-editor";
    block.innerHTML = `
      <h3>Product ${index + 1}</h3>
      ${product.image_url ? `<img class="thumb-preview" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">` : ""}
      <div class="mini-grid">
        <div class="field">
          <label>Tag</label>
          <input type="text" data-type="product-tag" data-index="${index}" value="${escapeHtml(product.tag || "")}">
        </div>
        <div class="field">
          <label>Image URL</label>
          <input type="text" data-type="product-image" data-index="${index}" value="${escapeHtml(product.image_url || "")}">
        </div>
      </div>
      <div class="field">
        <label>Upload image</label>
        <input type="file" accept="image/*" data-type="product-file" data-index="${index}">
      </div>
      <div class="field">
        <label>Name</label>
        <input type="text" data-type="product-name" data-index="${index}" value="${escapeHtml(product.name || "")}">
      </div>
      <div class="field">
        <label>Description</label>
        <textarea data-type="product-description" data-index="${index}">${escapeHtml(product.description || "")}</textarea>
      </div>
      <div class="field">
        <label>Price</label>
        <input type="text" data-type="product-price" data-index="${index}" value="${escapeHtml(product.price || "")}">
      </div>
      <button class="remove-btn" type="button" data-action="remove-product" data-index="${index}">Remove Product</button>
    `;
    productEditors.appendChild(block);
  });
}

async function uploadImage(file, folder) {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const path = `${folder}/${fileName}`;
  const { error } = await supabaseAdmin.storage.from("shop-media").upload(path, file, {
    upsert: true
  });

  if (error) {
    throw error;
  }

  const { data } = supabaseAdmin.storage.from("shop-media").getPublicUrl(path);
  return data.publicUrl;
}

async function loadData() {
  const [{ data: shop }, { data: categories }, { data: products }] = await Promise.all([
    supabaseAdmin.from("shop_settings").select("*").limit(1).maybeSingle(),
    supabaseAdmin.from("categories").select("*").order("display_order", { ascending: true }),
    supabaseAdmin.from("products").select("*").order("display_order", { ascending: true })
  ]);

  storeData = shop || defaultStore();
  categoryItems = categories || [];
  productItems = products || [];
  removedCategoryIds = [];
  removedProductIds = [];
  fillForm();
  renderCategoryEditors();
  renderProductEditors();
}

async function ensureSession() {
  const { data } = await supabaseAdmin.auth.getSession();
  if (data.session) {
    showEditor();
    await loadData();
  } else {
    showLocked();
  }
}

async function saveStore() {
  syncForm();
  saveStatus.textContent = "Saving...";

  const shopPayload = {
    shop_name: storeData.shop_name,
    logo_image: storeData.logo_image,
    shop_tagline: storeData.shop_tagline,
    hero_title: storeData.hero_title,
    hero_description: storeData.hero_description,
    about_title: storeData.about_title,
    about_description: storeData.about_description,
    hero_side_note: storeData.hero_side_note,
    top_notice: storeData.top_notice,
    phones: storeData.phones,
    whatsapp_number: storeData.whatsapp_number,
    address: storeData.address
  };

  const shopQuery = storeData.id
    ? supabaseAdmin.from("shop_settings").update(shopPayload).eq("id", storeData.id).select().single()
    : supabaseAdmin.from("shop_settings").insert(shopPayload).select().single();

  const { data: savedShop, error: shopError } = await shopQuery;

  if (shopError) {
    saveStatus.textContent = `Save failed: ${shopError.message}`;
    return;
  }

  storeData.id = savedShop.id;

  for (let index = 0; index < categoryItems.length; index += 1) {
    const category = categoryItems[index];
    const payload = {
      id: category.id || undefined,
      title: category.title,
      description: category.description,
      image_url: category.image_url,
      display_order: index + 1
    };

    const { error } = category.id
      ? await supabaseAdmin.from("categories").update(payload).eq("id", category.id)
      : await supabaseAdmin.from("categories").insert(payload);

    if (error) {
      saveStatus.textContent = `Category save failed: ${error.message}`;
      return;
    }
  }

  for (let index = 0; index < productItems.length; index += 1) {
    const product = productItems[index];
    const payload = {
      id: product.id || undefined,
      tag: product.tag,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      display_order: index + 1
    };

    const { error } = product.id
      ? await supabaseAdmin.from("products").update(payload).eq("id", product.id)
      : await supabaseAdmin.from("products").insert(payload);

    if (error) {
      saveStatus.textContent = `Product save failed: ${error.message}`;
      return;
    }
  }

  if (removedCategoryIds.length > 0) {
    const { error } = await supabaseAdmin.from("categories").delete().in("id", removedCategoryIds);
    if (error) {
      saveStatus.textContent = `Category delete failed: ${error.message}`;
      return;
    }
    removedCategoryIds = [];
  }

  if (removedProductIds.length > 0) {
    const { error } = await supabaseAdmin.from("products").delete().in("id", removedProductIds);
    if (error) {
      saveStatus.textContent = `Product delete failed: ${error.message}`;
      return;
    }
    removedProductIds = [];
  }

  await loadData();
  saveStatus.textContent = "Saved successfully to Supabase.";
  setTimeout(() => {
    saveStatus.textContent = "";
  }, 3000);
}

function updateDynamicField(event) {
  const { type, index } = event.target.dataset;
  if (!type) return;
  const i = Number(index);

  if (type === "category-image") categoryItems[i].image_url = event.target.value;
  if (type === "category-title") categoryItems[i].title = event.target.value;
  if (type === "category-description") categoryItems[i].description = event.target.value;
  if (type === "product-tag") productItems[i].tag = event.target.value;
  if (type === "product-image") productItems[i].image_url = event.target.value;
  if (type === "product-name") productItems[i].name = event.target.value;
  if (type === "product-description") productItems[i].description = event.target.value;
  if (type === "product-price") productItems[i].price = event.target.value;
}

function handleDynamicClick(event) {
  const action = event.target.dataset.action;
  const index = Number(event.target.dataset.index);

  if (action === "remove-category") {
    if (categoryItems[index].id) removedCategoryIds.push(categoryItems[index].id);
    categoryItems.splice(index, 1);
    renderCategoryEditors();
  }

  if (action === "remove-product") {
    if (productItems[index].id) removedProductIds.push(productItems[index].id);
    productItems.splice(index, 1);
    renderProductEditors();
  }
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  loginStatus.textContent = error ? error.message : "";
  if (!error) {
    showEditor();
    await loadData();
  }
});

document.getElementById("saveBtn").addEventListener("click", saveStore);

document.getElementById("logoFile").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  fields.logoImage.value = await uploadImage(file, "logos");
  syncForm();
  fillForm();
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  const { error } = await supabaseAdmin.rpc("seed_vkm_demo_data");
  saveStatus.textContent = error ? error.message : "Demo data restored from Supabase.";
  await loadData();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseAdmin.auth.signOut();
  showLocked();
});

document.querySelectorAll("#editorPanel input, #editorPanel textarea").forEach((field) => {
  field.addEventListener("input", () => {
    syncForm();
    refreshShopPreviewFields();
  });
});

categoryEditors.addEventListener("input", updateDynamicField);
productEditors.addEventListener("input", updateDynamicField);
categoryEditors.addEventListener("click", handleDynamicClick);
productEditors.addEventListener("click", handleDynamicClick);

categoryEditors.addEventListener("change", async (event) => {
  if (event.target.dataset.type !== "category-file") return;
  const index = Number(event.target.dataset.index);
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  categoryItems[index].image_url = await uploadImage(file, "categories");
  renderCategoryEditors();
});

productEditors.addEventListener("change", async (event) => {
  if (event.target.dataset.type !== "product-file") return;
  const index = Number(event.target.dataset.index);
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  productItems[index].image_url = await uploadImage(file, "products");
  renderProductEditors();
});

document.getElementById("addCategory").addEventListener("click", () => {
  categoryItems.push({
    title: "New Category",
    description: "Add category details here.",
    image_url: ""
  });
  renderCategoryEditors();
});

document.getElementById("addProduct").addEventListener("click", () => {
  productItems.push({
    tag: "New",
    name: "New Product",
    description: "Add product details here.",
    price: "Rs. 0",
    image_url: ""
  });
  renderProductEditors();
});

ensureSession();
