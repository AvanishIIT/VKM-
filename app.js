const supabaseClient = supabase.createClient(
  window.VKM_SUPABASE_URL,
  window.VKM_SUPABASE_PUBLISHABLE_KEY
);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setLogo(shop) {
  const badge = document.getElementById("logoBadge");
  if (shop.logo_image) {
    badge.innerHTML = `<img src="${escapeHtml(shop.logo_image)}" alt="${escapeHtml(shop.shop_name)} logo">`;
  } else {
    badge.textContent = (shop.shop_name || "VKM").slice(0, 3).toUpperCase();
  }
}

function renderCategories(categories) {
  const grid = document.getElementById("categoriesGrid");
  grid.innerHTML = "";
  categories.forEach((category) => {
    const card = document.createElement("article");
    card.className = "card category-card";
    card.innerHTML = `
      ${category.image_url
        ? `<div class="image-frame"><img src="${escapeHtml(category.image_url)}" alt="${escapeHtml(category.title)}"></div>`
        : `<div class="image-placeholder">No Image</div>`}
      <h3>${escapeHtml(category.title)}</h3>
      <p>${escapeHtml(category.description)}</p>
    `;
    grid.appendChild(card);
  });
}

function renderProducts(products, whatsappNumber, shopName) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((product) => {
    const productPageUrl = window.location.href;
    const message = encodeURIComponent(
      `Hello ${shopName || "VKM"},
I am interested in this product.

Product: ${product.name}
Tag: ${product.tag || "General"}
Price: ${product.price || "Ask for price"}
Page: ${productPageUrl}`
    );

    const productBuyLink = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${message}`
      : "#";

    const card = document.createElement("article");
    card.className = "card product-card";
    card.innerHTML = `
      <span class="tag">${escapeHtml(product.tag)}</span>
      ${product.image_url
        ? `<div class="image-frame"><img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}"></div>`
        : `<div class="image-placeholder">No Image</div>`}
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <div class="price-row">
        <span>${escapeHtml(product.price)}</span>
        <a class="mini-link" target="_blank" rel="noreferrer" href="${productBuyLink}">Buy Now</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderPhones(phones) {
  const list = document.getElementById("phoneList");
  list.innerHTML = "";
  phones.forEach((phone) => {
    const li = document.createElement("li");
    li.textContent = phone;
    list.appendChild(li);
  });
}

function applyStorefront(shop, categories, products) {
  document.getElementById("topbar").textContent = shop.top_notice || "";
  document.getElementById("logoText").textContent = shop.shop_name || "VKM Tools & Agri Mart";
  document.getElementById("aboutTitle").textContent = shop.about_title || "";
  document.getElementById("aboutDescription").textContent = shop.about_description || "";
  document.getElementById("heroTagline").textContent = shop.shop_tagline || "";
  document.getElementById("heroHeading").textContent = shop.hero_title || "";
  document.getElementById("heroText").textContent = shop.hero_description || "";
  document.getElementById("heroSideNote").textContent = shop.hero_side_note || "";
  document.getElementById("addressText").textContent = shop.address || "";
  document.getElementById("footerText").textContent = `Copyright ${new Date().getFullYear()} ${shop.shop_name || "VKM Tools & Agri Mart"}. All rights reserved.`;
  setLogo(shop);

  const phones = Array.isArray(shop.phones) ? shop.phones : [];
  renderPhones(phones);

  const firstPhone = phones[0] || "";
  const cleanPhone = firstPhone.replace(/\s+/g, "");
  if (cleanPhone) {
    document.getElementById("callButton").href = `tel:${cleanPhone}`;
  }

  const whatsappNumber = String(shop.whatsapp_number || cleanPhone).replace(/[^\d]/g, "");
  const whatsappMessage = encodeURIComponent(`Hello ${shop.shop_name || "VKM"}, I want to know more about your products.`);
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}` : "#";
  document.getElementById("whatsappButton").href = whatsappLink;

  renderCategories(categories);
  renderProducts(products, whatsappLink);
}

async function loadStorefront() {
  const loading = document.getElementById("pageStatus");
  try {
    const [{ data: shop, error: shopError }, { data: categories, error: categoriesError }, { data: products, error: productsError }] = await Promise.all([
      supabaseClient.from("shop_settings").select("*").limit(1).maybeSingle(),
      supabaseClient.from("categories").select("*").order("display_order", { ascending: true }),
      supabaseClient.from("products").select("*").order("display_order", { ascending: true })
    ]);

    if (shopError || categoriesError || productsError) {
      throw shopError || categoriesError || productsError;
    }

    applyStorefront(shop || {}, categories || [], products || []);
    loading.textContent = "";
  } catch (error) {
    loading.textContent = "Unable to load live store data. Run the Supabase SQL setup first, then refresh this page.";
  }
}

loadStorefront();
