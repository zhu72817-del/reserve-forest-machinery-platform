const state = {
  user: null,
  items: [],
  demands: [],
  orders: [],
  quotes: [],
  audit_logs: [],
  contracts: [],
  public: null,
  view: "home",
};
let pendingDemandIntent = null;
let sharingProvince = "全部";
let sharingStatus = "全部";
let selectedSharingId = "SH-001";
let sharingLeaseLogs = [];
const sharingMaps = {};

const sharingDevices = [
  {
    id: "SH-001",
    name: "履带式挖掘机",
    model: "PC200",
    company: "重庆公司",
    gps: "CQ-GPS-001",
    originalValue: "680,000元",
    status: "出租中",
    province: "重庆",
    city: "重庆",
    address: "重庆市储备林山地机械调度点",
    contact: "重庆公司 13800000001",
    renter: "岑溪公司",
    position: [38, 55],
    coords: [29.5630, 106.5516],
    lastUpdate: "10分钟前",
    fence: "重庆储备林项目作业半径 5 公里",
    note: "该设备属于重庆公司，当前正租赁给岑溪公司，出租期间双方均可查看实时位置。",
  },
  {
    id: "SH-002",
    name: "汽车起重机",
    model: "QY25K",
    company: "岑溪公司",
    gps: "CX-GPS-002",
    originalValue: "880,000元",
    status: "空闲中",
    province: "广西",
    city: "岑溪",
    address: "广西壮族自治区岑溪市储备林项目部",
    contact: "岑溪公司 13800000002",
    renter: "",
    position: [56, 62],
    coords: [22.9184, 110.9949],
    lastUpdate: "18分钟前",
    fence: "岑溪储备林项目部方圆 5 公里",
    note: "该设备属于岑溪公司，当前空闲，可供集团内部单位申请内供租赁。",
  },
  {
    id: "SH-003",
    name: "装载机",
    model: "ZL50",
    company: "重庆公司",
    gps: "CQ-GPS-003",
    originalValue: "420,000元",
    status: "使用中",
    province: "重庆",
    city: "重庆",
    address: "重庆市储备林林区道路整备工地",
    contact: "重庆公司 13800000003",
    renter: "",
    position: [43, 68],
    coords: [29.4316, 106.9123],
    lastUpdate: "22分钟前",
    fence: "重庆公司作业区",
    note: "该设备属于重庆公司，当前本单位自用，暂不可跨单位租赁。",
  },
  {
    id: "SH-004",
    name: "山地履带运输车",
    model: "2吨手扶式",
    company: "岑溪公司",
    gps: "CX-GPS-004",
    originalValue: "15,000元",
    status: "维护中",
    province: "广西",
    city: "岑溪",
    address: "广西壮族自治区岑溪市机械维修保养点",
    contact: "岑溪公司 13800000004",
    renter: "",
    position: [62, 48],
    coords: [22.9284, 111.0050],
    lastUpdate: "30分钟前",
    fence: "岑溪维修基地",
    note: "该设备属于岑溪公司，正在维保，完成保养后可重新进入共享池。",
  },
  {
    id: "SH-005",
    name: "轨道式集材系统",
    model: "山地集材成套",
    company: "雷州林业局 北坡林场",
    gps: "LZ-GPS-005",
    originalValue: "1,260,000元",
    status: "空闲中",
    province: "广东",
    city: "湛江",
    address: "广东省湛江市雷州北坡林场储备林设备仓",
    contact: "北坡林场 13800000005",
    renter: "",
    position: [34, 42],
    coords: [20.9144, 110.0967],
    lastUpdate: "12分钟前",
    fence: "雷州北坡林场设备仓",
    note: "该设备属于雷州林业局北坡林场，适用于山地木材集材和短驳，可申请跨区域租赁。",
  },
];

const views = ["home", "mall", "equipment", "serviceDesk", "sharing", "demand", "quote", "order", "admin", "log"];
const roleTitle = {
  buyer: ["需求方工作台", "提需求、选服务、下订单、做验收"],
  supplier: ["供应商工作台", "上架资源、响应报价、推进履约"],
  admin: ["物资公司管理后台", "审核准入、监管需求、统筹目录"],
};
const roleMenus = {
  buyer: [
    ["工作台", [["home", "首页"], ["log", "操作记录"]]],
    ["采购业务", [["mall", "内采商城"], ["equipment", "机械设备"], ["serviceDesk", "机械服务"], ["sharing", "机械共享"], ["demand", "我的项目"], ["order", "订单与验收"]]],
  ],
  supplier: [
    ["工作台", [["home", "首页"], ["log", "操作记录"]]],
    ["供应商业务", [["mall", "我的资源上架"], ["quote", "可响应需求"], ["order", "履约订单"]]],
  ],
  admin: [
    ["工作台", [["home", "首页"], ["admin", "待办审核"], ["log", "操作日志"]]],
    ["资源管理", [["mall", "资源目录管理"], ["sharing", "机械共享"]]],
    ["采购监管", [["demand", "需求监管"], ["quote", "询价报价监管"], ["order", "订单监管"]]],
  ],
};
const roleGuide = {
  buyer: [
    ["进入内采商城", "查看宣传册产品，选择商品后发起购买申请。"],
    ["查看设备服务", "按设备库和服务库选择采购、租赁或服务方向。"],
    ["发布项目需求", "设备和服务不直接成交，提交需求后组织库内供应商报价。"],
    ["比选生成合同", "在我的项目查看报价，确定供应商后生成合同并履约。"],
  ],
  supplier: [
    ["资源上架", "提交设备、商品或作业服务，等待管理员审核。"],
    ["响应报价", "查看需求大厅，对符合能力范围的项目报价。"],
    ["履约管理", "订单生成后推进合同确认、进场和交付。"],
    ["记录留痕", "报价、履约等关键动作进入日志。"],
  ],
  admin: [
    ["资源准入", "审核供应商提交的商品和服务。"],
    ["需求监管", "处理未匹配或待审核采购需求。"],
    ["目录统筹", "维护机械设备、无人机、防火装备资源目录。"],
    ["全程留痕", "跟踪需求、报价、订单和履约操作。"],
  ],
};
const roleProcess = {
  buyer: ["选择资源", "提交申请", "项目批复", "订单执行", "验收评价"],
  supplier: ["维护资源", "等待审核", "响应报价", "合同履约", "售后服务"],
  admin: ["供应商准入", "目录审核", "需求监管", "订单监管", "归档留痕"],
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data;
}

async function loadState() {
  const data = await api("/api/state");
  Object.assign(state, data);
  render();
}

async function loadPublic() {
  const data = await api("/api/public");
  state.public = data;
  renderPublic();
}

function renderPublic() {
  const data = state.public;
  if (!data) return;
  const stats = [
    ["入驻供应商", data.stats.suppliers],
    ["内采商品", data.stats.items],
    ["项目需求", data.stats.demands],
    ["完成/在办订单", data.stats.orders],
    ["覆盖区域", data.stats.regions],
    ["无人机资源", data.stats.drones],
    ["防火装备", data.stats.fire],
    ["服务项目", data.stats.services],
  ];
  document.querySelector("#portalStats").innerHTML = stats.map(([label, value]) => `<div class="portal-stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  const recommended = ["油锯 XGJ-66", "风力灭火机 XG25-F", "2吨手扶履带运输车", "坦克300森林防火指挥车基型车"]
    .map((name) => data.items.find((item) => item.name === name))
    .filter(Boolean);
  document.querySelector("#portalItems").innerHTML = recommended.map((item) => `
    <article class="portal-card">
      ${productImage(item)}
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.channel}</span><span class="tag">${item.category}</span><span class="tag">${item.region}</span></div>
      <p>${item.description}</p>
      ${item.model ? `<span class="spec-line">型号：${item.model}</span>` : ""}
      <b class="price">${item.price}</b>
      <div class="card-actions"><button class="mini-button" data-mall-focus="${item.id}">查看详情</button><button class="mini-button" data-open-login="buyer">立即购买</button></div>
    </article>
  `).join("");
  document.querySelector("#portalEquipment").innerHTML = data.equipment.map((item) => `
    <article class="portal-card">
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.channel}</span><span class="tag">${item.category}</span><span class="tag">${item.region}</span></div>
      <p>${item.description}</p>
      ${item.model ? `<span class="spec-line">型号：${item.model}</span>` : ""}
      <b class="price">${item.price}</b>
      <div class="card-actions"><button class="mini-button" data-public-view="equipment">查看详情</button><button class="mini-button" data-open-login="buyer">租赁</button></div>
    </article>
  `).join("");
  document.querySelector("#portalServices").innerHTML = data.services.map((item) => `
    <article class="portal-card">
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.channel}</span><span class="tag">${item.category}</span><span class="tag">${item.region}</span></div>
      <p>${item.description}</p>
      ${item.scenario ? `<span class="spec-line">场景：${item.scenario}</span>` : ""}
      <b class="price">${item.price}</b>
      <div class="card-actions"><button class="mini-button" data-public-view="service">查看详情</button><button class="mini-button" data-open-login="buyer">预约</button></div>
    </article>
  `).join("");
  document.querySelector("#portalDemandsList").innerHTML = data.demands.map((item) => `
    <article>
      <h3>${item.title}</h3>
      <p>${item.region} · ${item.method} · ${money(item.budget)} · ${item.status}</p>
    </article>
  `).join("");
  document.querySelector("#portalSuppliersList").innerHTML = data.suppliers.map((item) => `
    <article class="portal-card">
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.type}</span><span class="tag">${item.region}</span><span class="tag">评分 ${item.score}</span></div>
      <p>${item.business}</p>
      <span>${item.tags}</span>
    </article>
  `).join("");
  document.querySelector("#portalAnnouncements").innerHTML = data.announcements.map((item) => `
    <article>
      <h3>${item.title}</h3>
      <p>${item.type} · ${item.content}</p>
    </article>
  `).join("");
  renderPublicModules(data);
  renderSharingPlatform("public");
}

function renderPublicModules(data) {
  renderMallCategory(currentMallCategory, data.items);
  renderEquipmentCategory(currentEquipmentCategory, data.equipment);
  renderServiceCategory(currentServiceCategory, data.services);
  document.querySelector("#demandModuleList").innerHTML = data.demands.map((item) => `
    <article>
      <h3>${item.title}</h3>
      <p>${item.region} · ${item.category || "项目需求"} · ${item.method} · 预算 ${money(item.budget)} · ${item.status}</p>
      <div class="card-actions"><button class="mini-button" data-open-login="buyer">查看详情</button><button class="mini-button" data-open-login="supplier">供应商报价</button></div>
    </article>
  `).join("");
  document.querySelector("#supplierModuleList").innerHTML = data.suppliers.map((item) => `
    <article class="portal-card">
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.type}</span><span class="tag">${item.region}</span><span class="tag">评分 ${item.score}</span></div>
      <p>${item.business}</p>
      <span>${item.tags}</span>
      <div class="card-actions"><button class="mini-button" data-open-login="buyer">查看企业</button><button class="mini-button" data-open-login="buyer">发起询价</button></div>
    </article>
  `).join("");
  renderSharingPlatform("public");
}

let currentMallCategory = "森林防火装备";
let currentEquipmentCategory = "全部";
let currentServiceCategory = "全部";

function renderMallCategory(category = "森林防火装备", sourceItems = state.public?.items || []) {
  currentMallCategory = category;
  document.querySelectorAll("[data-mall-filter]").forEach((button) => button.classList.toggle("active", button.dataset.mallFilter === category));
  const groupItems = sourceItems.filter((item) => item.category === category);
  const desc = category === "森林防火装备" ? "宣传册防火设备 9 款" : "宣传册车辆产品 7 款";
  document.querySelector("#mallModuleList").innerHTML = `
    <section class="mall-group">
      <div class="mall-group-head">
        <div>
          <h2>${category}</h2>
          <p>${desc}</p>
        </div>
        <span>${groupItems.length} 个产品</span>
      </div>
      <div class="module-grid">${groupItems.map((item) => renderModuleCard(item, "mall")).join("")}</div>
    </section>
  `;
}

function renderEquipmentCategory(category = "全部", sourceItems = state.public?.equipment || []) {
  currentEquipmentCategory = category;
  document.querySelectorAll("[data-equipment-filter]").forEach((button) => button.classList.toggle("active", button.dataset.equipmentFilter === category));
  const items = category === "全部" ? sourceItems : sourceItems.filter((item) => item.category === category);
  document.querySelector("#equipmentModuleList").innerHTML = items.map((item) => renderModuleCard(item, "equipment")).join("") || "<div class='empty-state'>该分类暂无设备</div>";
}

function renderServiceCategory(category = "全部", sourceItems = state.public?.services || []) {
  currentServiceCategory = category;
  document.querySelectorAll("[data-service-filter]").forEach((button) => button.classList.toggle("active", button.dataset.serviceFilter === category));
  const items = category === "全部" ? sourceItems : sourceItems.filter((item) => serviceCategoryMatches(item, category));
  document.querySelector("#serviceModuleList").innerHTML = items.map((item) => renderModuleCard(item, "service")).join("") || "<div class='empty-state'>该分类暂无服务</div>";
}

function serviceCategoryMatches(item, category) {
  const text = `${item.name}${item.category}${item.scenario || ""}${item.description || ""}`;
  if (category === "林木抚育服务") return text.includes("抚育") || text.includes("割灌");
  if (category === "轨道式集材服务") return text.includes("集材") || text.includes("轨道");
  if (category === "无人机作业服务") return text.includes("无人机");
  if (category === "设备带人作业服务") return text.includes("设备租赁") || text.includes("带人");
  return text.includes(category.replace("服务", ""));
}

function productImage(item) {
  if (!item.image) return `<div class="product-image placeholder">${item.category?.slice(0, 2) || "产品"}</div>`;
  return `<div class="product-image"><img src="${item.image}" alt="${item.name}" loading="lazy" /></div>`;
}

function renderModuleCard(item, type) {
  const actionText = type === "service" ? "预约服务" : "立即购买";
  const rentText = type === "service" ? "关联设备租赁" : "立即租赁";
  const priceNote = type === "service" ? "含每小时工程价格/台班价/项目报价" : type === "mall" ? "仅开放立即购买入口" : "支持购买价、小时租赁价、台班租赁价";
  const actions = type === "mall"
    ? `<button class="primary-button" data-open-login="buyer">立即购买</button>`
    : type === "equipment"
      ? `<button class="primary-button" data-public-demand-item="${item.id}" data-demand-method="设备采购需求">发布设备采购需求</button><button class="mini-button" data-public-demand-item="${item.id}" data-demand-method="设备租赁需求">发布设备租赁需求</button><button class="mini-button" data-public-demand-item="${item.id}" data-demand-method="设备采购需求">发起询价</button><button class="mini-button" data-public-demand-item="${item.id}" data-demand-method="设备租赁需求">加入需求清单</button>`
      : `<button class="primary-button" data-public-demand-item="${item.id}" data-demand-method="机械服务需求">发布服务采购需求</button><button class="mini-button" data-public-demand-item="${item.id}" data-demand-method="机械服务需求">发起询价</button><button class="mini-button" data-public-demand-item="${item.id}" data-demand-method="机械服务需求">加入需求清单</button>`;
  return `
    <article class="module-card">
      <span id="product-${item.id}" class="anchor-target"></span>
      ${productImage(item)}
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.channel}</span><span class="tag">${item.category}</span><span class="tag">${item.region}</span></div>
      <p>${item.description}</p>
      <div class="detail-grid">
        <span>供货/服务商</span><strong>${item.supplier}</strong>
        <span>型号/规格</span><strong>${item.model || "按项目配置"}</strong>
        <span>参考价格</span><strong>${item.price}</strong>
        <span>适用场景</span><strong>${item.scenario || item.category}</strong>
        <span>核心参数</span><strong>${item.specs || item.description}</strong>
        <span>业务逻辑</span><strong>${type === "mall" ? priceNote : "资源展示，发布需求后组织库内供应商报价"}</strong>
        <span>资料来源</span><strong>${item.tags || "平台数据"}</strong>
      </div>
      <div class="card-actions">
        ${actions}
      </div>
    </article>
  `;
}

function focusMallProduct(itemId) {
  const item = itemById(itemId);
  if (!item) return;
  renderMallCategory(item.category);
  showPublicView("mall");
  requestAnimationFrame(() => {
    const anchor = document.querySelector(`#product-${CSS.escape(itemId)}`);
    const card = anchor?.closest(".module-card");
    if (!card) return;
    card.classList.add("focus-card");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => card.classList.remove("focus-card"), 1800);
  });
}

function showPublicView(view = "home") {
  document.querySelector("#loginPage").classList.add("hidden");
  document.querySelector("#appPage").classList.add("hidden");
  document.querySelector("#portalPage").classList.remove("hidden");
  document.querySelectorAll(".public-view").forEach((section) => {
    section.classList.toggle("hidden", section.dataset.publicView !== view);
  });
  document.querySelectorAll(".portal-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.publicView === view);
  });
  if (view === "sharing") renderSharingPlatform("public");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showApp(user) {
  state.user = user;
  document.querySelector("#portalPage").classList.add("hidden");
  document.querySelector("#loginPage").classList.add("hidden");
  document.querySelector("#appPage").classList.remove("hidden");
  document.querySelector("#userMeta").textContent = `${user.org} · ${user.role_name}`;
  renderMenu();
  const [label, title] = roleTitle[user.role] || roleTitle.buyer;
  document.querySelector("#roleLabel").textContent = label;
  document.querySelector("#workspaceTitle").textContent = title;
  applyRole();
  setView("home");
}

function applyRole() {
  const role = state.user?.role;
  document.querySelector("#newDemandButton").style.display = role === "supplier" ? "none" : "inline-flex";
  document.querySelector("#newItemButton").style.display = role === "buyer" ? "none" : "inline-flex";
  document.querySelector("#resetButton").style.display = role === "admin" ? "inline-flex" : "none";
  document.querySelector("#mallTitle").textContent = role === "buyer" ? "内采商城" : role === "supplier" ? "我的资源上架" : "三大模块资源管理";
  document.querySelector("#quoteTitle").textContent = role === "buyer" ? "我的项目" : role === "supplier" ? "可响应需求" : "询价竞价监管";
  document.querySelector("#quoteDesc").textContent = role === "buyer" ? "查看已申请项目的报价和成交信息" : role === "supplier" ? "选择项目并提交响应报价" : "查看需求响应和报价情况";
  document.querySelector("#demandTitle").textContent = role === "buyer" ? "我的项目" : role === "supplier" ? "市场需求" : "需求监管";
  document.querySelector("#demandDesc").textContent = role === "buyer" ? "查看本单位申请项目的批复、匹配和执行状态" : role === "supplier" ? "查看市场需求，判断是否参与响应" : "监管采购需求审核、匹配和采购路径";
  document.querySelector("#orderDesc").textContent = role === "buyer" ? "跟踪本单位订单合同、履约和验收" : role === "supplier" ? "跟踪中标订单、合同确认和交付状态" : "监管全平台订单履约状态";
}

function setView(view) {
  state.view = view;
  views.forEach((name) => document.querySelector(`#${name}View`).classList.toggle("hidden", name !== view));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
}

function renderMenu() {
  const menus = roleMenus[state.user.role] || roleMenus.buyer;
  document.querySelector("#sidebar").innerHTML = menus.map(([group, children]) => `
    <div class="menu-group">
      <div class="menu-title">${group}</div>
      ${children.map(([view, label]) => `<button class="nav-item" data-view="${view}">${label}</button>`).join("")}
    </div>
  `).join("");
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
}

function render() {
  renderMetrics();
  renderHome();
  renderRoleGuide();
  renderItems();
  renderResourceViews();
  renderDemands();
  renderQuotes();
  renderOrders();
  renderAdmin();
  renderLogs();
  renderSharingPlatform("app");
  applyRole();
}

function renderHome() {
  const role = state.user.role;
  const todoList = getTodos(role);
  document.querySelector("#homeMainTitle").textContent = role === "admin" ? "监管待办" : role === "supplier" ? "供应商待办" : "需求方待办";
  document.querySelector("#homeMainDesc").textContent = role === "admin" ? "优先处理审核和异常匹配事项" : role === "supplier" ? "优先处理报价、上架和履约事项" : "优先处理需求、比选和验收事项";
  document.querySelector("#todoList").innerHTML = todoList.length
    ? todoList.map(renderTodo).join("")
    : "<div class='empty-state'>当前暂无待办事项</div>";
  document.querySelector("#shortcutList").innerHTML = getShortcuts(role).map(([label, view, tone]) => `
    <button class="shortcut ${tone || ""}" data-shortcut-view="${view}">${label}</button>
  `).join("");
  document.querySelector("#processLine").innerHTML = roleProcess[role].map((label, index) => `<div><b>${index + 1}</b><span>${label}</span></div>`).join("");
}

function getTodos(role) {
  if (role === "admin") {
    return [
      ...state.items.filter((item) => item.status === "待审核").map((item) => ({
        type: "资源审核",
        title: item.name,
        meta: `${item.supplier} · ${item.category}`,
        action: "审核上架",
        view: "admin",
      })),
      ...state.demands.filter((item) => item.status === "待审核").map((item) => ({
        type: "需求审核",
        title: item.title,
        meta: `${item.region} · ${item.method} · ${money(item.budget)}`,
        action: "审核匹配",
        view: "admin",
      })),
    ];
  }
  if (role === "supplier") {
    return state.demands
      .filter((item) => item.status !== "已下单")
      .slice(0, 5)
      .map((item) => ({
        type: "可响应需求",
        title: item.title,
        meta: `${item.region} · ${item.category} · ${money(item.budget)}`,
        action: "去报价",
        view: "quote",
      }));
  }
  return [
    ...state.demands.filter((item) => item.status === "待审核").map((item) => ({
      type: "待匹配需求",
      title: item.title,
      meta: `${item.region} · ${item.method} · ${money(item.budget)}`,
      action: "查看进度",
      view: "demand",
    })),
    ...state.orders.filter((item) => item.status !== "已完成").map((item) => ({
      type: "订单跟进",
      title: item.title,
      meta: `${item.supplier} · ${item.status}`,
      action: "查看订单",
      view: "order",
    })),
  ].slice(0, 6);
}

function renderTodo(item) {
  return `
    <article class="todo-card">
      <span class="todo-type">${item.type}</span>
      <strong>${item.title}</strong>
      <p>${item.meta}</p>
      <button class="mini-button" data-shortcut-view="${item.view}">${item.action}</button>
    </article>
  `;
}

function getShortcuts(role) {
  if (role === "admin") {
    return [["处理待办审核", "admin", "primary"], ["查看目录管理", "mall"], ["查看需求监管", "demand"], ["查看操作日志", "log"]];
  }
  if (role === "supplier") {
    return [["新增资源上架", "mall", "primary"], ["查看可响应需求", "quote"], ["查看履约订单", "order"], ["查看操作记录", "log"]];
  }
  return [["进入内采商城", "mall", "primary"], ["查看机械设备", "equipment"], ["查看机械服务", "serviceDesk"], ["打开共享地图", "sharing"], ["查看我的项目", "demand"]];
}

function renderRoleGuide() {
  const items = roleGuide[state.user.role] || roleGuide.buyer;
  document.querySelector("#roleGuide").innerHTML = items.map(([title, desc]) => `
    <article>
      <strong>${title}</strong>
      <span>${desc}</span>
    </article>
  `).join("");
}

function renderMetrics() {
  const metrics = [
    ["上架目录", state.items.filter((item) => item.status === "上架").length],
    ["待审事项", state.items.filter((item) => item.status === "待审核").length + state.demands.filter((item) => item.status === "待审核").length],
    ["采购需求", state.demands.length],
    ["响应报价", state.quotes.length],
  ];
  document.querySelector("#metrics").innerHTML = metrics.map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
}

function renderItems() {
  const term = document.querySelector("#itemSearch")?.value?.trim() || "";
  const items = state.items
    .filter((item) => [item.name, item.supplier, item.category, item.region].join("").includes(term))
    .filter((item) => state.user.role !== "buyer" || item.channel === "内采商城")
    .filter((item) => state.user.role !== "buyer" || item.status === "上架")
    .filter((item) => state.user.role !== "supplier" || item.supplier === state.user.org || item.status === "上架");
  document.querySelector("#itemCards").innerHTML = items.map((item) => `
    <article class="card">
      ${item.channel === "内采商城" ? productImage(item) : ""}
      <h3>${item.name}</h3>
      <div class="tags">
        <span class="tag">${item.channel}</span>
        <span class="tag">${item.category}</span>
        <span class="tag">${item.region}</span>
        <span class="status ${item.status === "待审核" ? "warn" : ""}">${item.status}</span>
      </div>
      <p>${item.description}</p>
      <span>${item.supplier}</span>
      <b class="price">${item.price}</b>
      ${state.user.role === "buyer" && item.channel === "内采商城" ? `<button class="primary-button" data-procure-item="${item.id}" data-procure-type="内采商品采购">立即购买</button>` : ""}
    </article>
  `).join("");
}

function renderResourceViews() {
  const equipment = state.items.filter((item) => item.status === "上架" && item.channel === "机械设备");
  const services = state.items.filter((item) => item.status === "上架" && (item.channel.includes("服务") || item.category.includes("服务")));
  document.querySelector("#equipmentCards").innerHTML = equipment.map((item) => renderInternalCard(item, "设备")).join("");
  document.querySelector("#serviceDeskCards").innerHTML = services.map((item) => renderInternalCard(item, "服务")).join("");
}

function renderSharingPlatform(scope = "public") {
  const root = document.querySelector(scope === "app" ? "#sharingAppRoot" : "#sharingPublicRoot");
  if (!root) return;
  const devices = filteredSharingDevices();
  const selected = sharingDevices.find((item) => item.id === selectedSharingId) || devices[0] || sharingDevices[0];
  if (selected) selectedSharingId = selected.id;
  root.innerHTML = `
    <div class="sharing-shell">
      <aside class="sharing-sidebar">
        <div class="sharing-search">
          <label>省份/城市
            <select data-sharing-province>
              ${["全部", "重庆", "广西", "广东"].map((name) => `<option ${sharingProvince === name ? "selected" : ""}>${name}</option>`).join("")}
            </select>
          </label>
          <label>设备状态
            <select data-sharing-status>
              ${["全部", "空闲中", "使用中", "维护中", "出租中"].map((name) => `<option ${sharingStatus === name ? "selected" : ""}>${name}</option>`).join("")}
            </select>
          </label>
          <div class="sharing-legend">
            <span><i class="dot idle"></i>空闲中</span>
            <span><i class="dot using"></i>使用中</span>
            <span><i class="dot maintenance"></i>维护中</span>
            <span><i class="dot rented"></i>出租中</span>
          </div>
        </div>
        <div class="sharing-list">
          ${devices.map((item) => `
            <button class="sharing-list-item ${statusClass(item.status)} ${item.id === selectedSharingId ? "active" : ""}" data-share-device="${item.id}">
              <strong>${item.name}</strong>
              <span>${item.company} · ${item.city}</span>
              <em class="share-status ${statusClass(item.status)}">${item.status}</em>
            </button>
          `).join("") || "<div class='empty-state'>当前筛选条件下暂无设备</div>"}
        </div>
      </aside>
      <main class="sharing-map">
        <div class="map-toolbar">
          <div>
            <strong>设备共享地图</strong>
            <span>装备可视化地图</span>
          </div>
          <button class="mini-button" data-sharing-province-jump="广西">定位广西</button>
          <button class="mini-button" data-sharing-province-jump="重庆">定位重庆</button>
          <button class="mini-button" data-sharing-province-jump="广东">定位广东</button>
        </div>
        <div class="real-map-wrap">
          <div class="real-map" id="sharingMap-${scope}"></div>
          <div class="map-fallback">真实地图加载中。如现场网络限制导致底图不可用，设备点位和详情仍可通过左侧列表查看。</div>
        </div>
      </main>
      <aside class="sharing-detail">
        ${renderSharingDetail(selected, scope)}
      </aside>
    </div>
  `;
  window.setTimeout(() => initSharingMap(scope, devices), 0);
}

function initSharingMap(scope, devices) {
  const container = document.querySelector(`#sharingMap-${scope}`);
  if (!container) return;
  if (!window.L) {
    container.classList.add("map-unavailable");
    return;
  }
  if (sharingMaps[scope]) {
    sharingMaps[scope].remove();
    sharingMaps[scope] = null;
  }
  const center = sharingProvince === "广东" ? [21.2, 110.2] : sharingProvince === "广西" ? [22.95, 111.0] : sharingProvince === "重庆" ? [29.56, 106.55] : [25.9, 108.8];
  const zoom = sharingProvince === "全部" ? 7 : 8;
  const map = L.map(container, { zoomControl: true, attributionControl: false }).setView(center, zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
  }).addTo(map);
  L.control.attribution({ prefix: "" }).addAttribution("© OpenStreetMap").addTo(map);
  devices.forEach((item) => {
    const marker = L.circleMarker(item.coords, {
      radius: item.id === selectedSharingId ? 11 : 9,
      color: "#fff",
      weight: 3,
      fillColor: statusColor(item.status),
      fillOpacity: 0.96,
    }).addTo(map);
    marker.bindTooltip(`${item.name}｜${item.status}`, { direction: "top", offset: [0, -8] });
    marker.bindPopup(`
      <strong>${item.name}</strong><br>
      ${item.company} · ${item.city}<br>
      状态：${item.status}<br>
      负责人：${item.contact}
    `);
    marker.on("click", () => {
      selectedSharingId = item.id;
      renderSharingPlatform(scope);
    });
  });
  if (devices.length > 1 && sharingProvince === "全部") {
    const bounds = L.latLngBounds(devices.map((item) => item.coords));
    map.fitBounds(bounds.pad(0.24));
  }
  sharingMaps[scope] = map;
  window.setTimeout(() => map.invalidateSize(), 80);
}

function renderSharingDetail(item, scope) {
  if (!item) return "<div class='empty-state'>请选择设备</div>";
  const canLease = item.status === "空闲中";
  const leaseButton = scope === "public"
    ? `<button class="primary-button" data-open-login="buyer">登录后申请租赁</button>`
    : `<button class="primary-button" data-share-lease="${item.id}" ${canLease ? "" : "disabled"}>${canLease ? "申请内供租赁" : "当前不可租赁"}</button>`;
  return `
    <div class="detail-card">
      <p class="eyebrow">设备详情</p>
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${item.model}</span><span class="tag">${item.company}</span><span class="share-status ${statusClass(item.status)}">${item.status}</span></div>
      <div class="detail-grid">
        <span>实时位置</span><strong>${item.address}</strong>
        <span>GPS 编号</span><strong>${item.gps}</strong>
        <span>设备原值</span><strong>${item.originalValue}</strong>
        <span>负责人</span><strong>${item.contact}</strong>
        <span>更新时间</span><strong>${item.lastUpdate}</strong>
        <span>电子围栏</span><strong>${item.fence}</strong>
        <span>承租单位</span><strong>${item.renter || "暂无"}</strong>
      </div>
      <p class="sharing-note">${item.note}</p>
      ${leaseButton}
      <div class="sharing-flow">
        <strong>内供租赁闭环</strong>
        <span>申请租赁</span><span>权属公司审批</span><span>状态变更出租中</span><span>双方地图可见</span><span>履约归还归档</span>
      </div>
      ${renderSharingLeaseLogs()}
    </div>
  `;
}

function renderSharingLeaseLogs() {
  if (!sharingLeaseLogs.length) return "";
  return `
    <div class="lease-log">
      <strong>最近租赁单</strong>
      ${sharingLeaseLogs.map((item) => `<p>${item}</p>`).join("")}
    </div>
  `;
}

function filteredSharingDevices() {
  return sharingDevices.filter((item) => {
    const provinceOK = sharingProvince === "全部" || item.province === sharingProvince;
    const statusOK = sharingStatus === "全部" || item.status === sharingStatus;
    return provinceOK && statusOK;
  });
}

function statusClass(status) {
  return {
    空闲中: "idle",
    使用中: "using",
    维护中: "maintenance",
    出租中: "rented",
  }[status] || "idle";
}

function statusColor(status) {
  return {
    空闲中: "#16a34a",
    使用中: "#2563eb",
    维护中: "#f59e0b",
    出租中: "#dc2626",
  }[status] || "#16a34a";
}

function applySharingLease(deviceId) {
  const item = sharingDevices.find((device) => device.id === deviceId);
  if (!item || item.status !== "空闲中") return;
  item.status = "出租中";
  item.renter = state.user?.org || "当前采购单位";
  item.note = `已生成内部租赁单，${item.company}审批通过后出租给${item.renter}，双方拥有地图实时查看权限。`;
  item.lastUpdate = "刚刚";
  sharingLeaseLogs.unshift(`${item.name}｜${item.renter} 已提交内供租赁申请，状态变更为出租中`);
  sharingLeaseLogs = sharingLeaseLogs.slice(0, 3);
  selectedSharingId = item.id;
  renderSharingPlatform("app");
}

function resetSharingDemo() {
  sharingDevices.forEach((item) => {
    if (item.id === "SH-001") {
      item.status = "出租中";
      item.renter = "岑溪公司";
      item.note = "该设备属于重庆公司，当前正租赁给岑溪公司，出租期间双方均可查看实时位置。";
      item.lastUpdate = "10分钟前";
    }
    if (item.id === "SH-002" || item.id === "SH-005") {
      item.status = "空闲中";
      item.renter = "";
      item.lastUpdate = item.id === "SH-002" ? "18分钟前" : "12分钟前";
    }
    if (item.id === "SH-003") item.status = "使用中";
    if (item.id === "SH-004") item.status = "维护中";
  });
  sharingLeaseLogs = [];
  selectedSharingId = "SH-001";
  renderSharingPlatform("app");
}

function renderInternalCard(item, label) {
  const isEquipment = label === "设备";
  return `
    <article class="card">
      ${productImage(item)}
      <h3>${item.name}</h3>
      <div class="tags"><span class="tag">${label}</span><span class="tag">${item.category}</span><span class="tag">${item.region}</span></div>
      <p>${item.description}</p>
      <span>${item.supplier}</span>
      <b class="price">${item.price}</b>
      <div class="card-actions">
        ${isEquipment ? `<button class="primary-button" data-demand-item="${item.id}" data-demand-method="设备采购需求">发布设备采购需求</button><button class="mini-button" data-demand-item="${item.id}" data-demand-method="设备租赁需求">发布设备租赁需求</button>` : `<button class="primary-button" data-demand-item="${item.id}" data-demand-method="机械服务需求">发布服务采购需求</button>`}
        <button class="mini-button" data-demand-item="${item.id}" data-demand-method="${isEquipment ? "设备采购需求" : "机械服务需求"}">发起询价</button>
        <button class="mini-button" data-demand-item="${item.id}" data-demand-method="${isEquipment ? "设备租赁需求" : "机械服务需求"}">加入需求清单</button>
      </div>
    </article>
  `;
}

function renderDemands() {
  document.querySelector("#demandRows").innerHTML = state.demands.map((item) => `
    <tr>
      <td><strong>${item.title}</strong><br>${item.description}</td>
      <td>${item.region}</td>
      <td>${item.method}</td>
      <td>${money(item.budget)}</td>
      <td>${quoteSummary(item.id)}</td>
      <td><span class="status ${item.status === "待审核" ? "warn" : ""}">${executionText(item)}</span></td>
      <td>${demandActions(item)}</td>
    </tr>
  `).join("");
}

function approvalText(item) {
  if (item.status === "待审核") return "待批复";
  return item.matched === "待管理员确认采购路径" ? "待匹配" : `已批复 / ${item.matched}`;
}

function executionText(item) {
  if (item.status === "已下单") return "已生成订单";
  if (item.status === "报价中") return "库内供应商报价中";
  if (item.status === "已匹配") return "已批复，待下单";
  return item.status;
}

function renderQuotes() {
  const demands = state.user.role === "supplier"
    ? state.demands.filter((item) => item.status !== "已下单")
    : state.demands;
  document.querySelector("#quoteCards").innerHTML = demands.map((item) => `
    <article class="card">
      <h3>${item.title}</h3>
      <div class="tags"><span class="tag">${item.region}</span><span class="tag">${item.category}</span><span class="tag">${item.method}</span></div>
      <p>${item.description}</p>
      ${quoteSummary(item.id)}
      <b class="price">${money(item.budget)}</b>
      ${state.user.role === "supplier" || state.user.role === "admin" ? `<button class="mini-button" data-quote-demand="${item.id}">提交响应报价</button>` : `<span class="tag">供应商可报价</span>`}
    </article>
  `).join("");
}

function quoteSummary(demandId) {
  const quotes = state.quotes.filter((quote) => quote.demand_id === demandId);
  if (!quotes.length) return "<span class='tag'>暂无报价</span>";
  const lowest = quotes.reduce((best, quote) => Number(quote.amount) < Number(best.amount) ? quote : best, quotes[0]);
  return `<span class="tag">已报价 ${quotes.length} 家</span><span class="tag">最低 ${money(lowest.amount)}</span>`;
}

function renderOrders() {
  document.querySelector("#orderRows").innerHTML = state.orders.map((item) => `
    <tr>
      <td><strong>${item.title}</strong><br>${item.id}</td>
      <td>${item.supplier}</td>
      <td>${money(item.amount)}</td>
      <td><span class="status">${item.status}</span></td>
      <td><button class="mini-button" data-order-next="${item.id}">推进流程</button><button class="mini-button" data-contract-order="${item.id}">查看合同</button></td>
    </tr>
  `).join("");
}

function renderAdmin() {
  const itemRows = state.items.filter((item) => item.status === "待审核").map((item) => `
    <tr><td>商品服务审核</td><td>${item.name}</td><td>${item.supplier}</td><td><span class="status warn">${item.status}</span></td><td><button class="mini-button" data-item-approve="${item.id}">审核上架</button></td></tr>
  `);
  const demandRows = state.demands.filter((item) => item.status === "待审核").map((item) => `
    <tr><td>采购需求审核</td><td>${item.title}</td><td>${item.region}</td><td><span class="status warn">${item.status}</span></td><td><button class="mini-button" data-demand-approve="${item.id}">审核匹配</button></td></tr>
  `);
  document.querySelector("#adminRows").innerHTML = [...itemRows, ...demandRows].join("") || "<tr><td colspan='5'>暂无待办</td></tr>";
}

function renderLogs() {
  document.querySelector("#logRows").innerHTML = state.audit_logs.map((item) => `
    <tr>
      <td>${item.created_at}</td>
      <td>${item.actor}</td>
      <td>${item.action}</td>
      <td>${item.target}</td>
    </tr>
  `).join("") || "<tr><td colspan='4'>暂无日志</td></tr>";
}

function demandActions(item) {
  if (state.user.role === "admin") {
    return `<button class="mini-button" data-demand-approve="${item.id}">审核匹配</button>`;
  }
  if (state.user.role === "buyer" && item.status !== "已下单") {
    const count = state.quotes.filter((quote) => quote.demand_id === item.id).length;
    if (count > 0) return `<button class="mini-button" data-order-from="${item.id}">比选确认供应商</button>`;
    if (item.status === "报价中") return "<span class='tag'>等待供应商报价</span>";
    if (item.matched !== "待管理员确认采购路径") return `<button class="mini-button" data-order-from="${item.id}">生成订单</button>`;
  }
  return "<span class='tag'>查看</span>";
}

function money(value) {
  return `${Number(value || 0).toLocaleString("zh-CN")}元`;
}

function itemById(id) {
  return state.items.find((item) => item.id === id) || state.public?.items?.find((item) => item.id === id) || state.public?.equipment?.find((item) => item.id === id) || state.public?.services?.find((item) => item.id === id);
}

function contractTypeFor(item, type) {
  if (type.includes("服务") || item.channel.includes("服务")) return "储备林机械服务合同";
  if (type.includes("设备")) return "机械设备采购/租赁合同";
  return "内采商品采购合同";
}

function openProcurement(itemId, type) {
  const item = itemById(itemId);
  if (!item) {
    alert("未找到采购资源，请刷新页面后重试。");
    return;
  }
  const form = document.querySelector("#procurementForm");
  form.reset();
  form.item_id.value = item.id;
  form.procurement_type.value = type;
  document.querySelector("#procurementTitle").textContent = `${item.name}｜${type}`;
  document.querySelector("#contractTemplateTitle").textContent = contractTypeFor(item, type);
  document.querySelector("#contractNo").textContent = `合同编号：HT-${new Date().getFullYear()}-${item.id}`;
  document.querySelector("#contractBuyer").textContent = state.user?.org || "采购单位";
  document.querySelector("#contractSupplier").textContent = item.supplier;
  document.querySelector("#contractSubject").textContent = item.name;
  document.querySelector("#contractSpecs").textContent = item.specs || item.description;
  form.contact.value = "";
  form.address.value = item.region === "集团统筹" ? "" : `${item.region}项目现场`;
  form.delivery_time.value = type.includes("服务") ? "按项目进场计划执行" : "合同签订后 15 日内";
  form.amount.value = item.price;
  form.payment_terms.value = "验收合格后按集团内采结算流程支付";
  form.remark.value = item.scenario ? `适用场景：${item.scenario}` : "";
  document.querySelector("#procurementDialog").showModal();
}

function showContract(orderId) {
  const contract = state.contracts.find((item) => item.order_id === orderId);
  const order = state.orders.find((item) => item.id === orderId);
  if (!contract || !order) {
    alert("该订单暂无合同模板。");
    return;
  }
  const pseudoItem = {
    id: orderId,
    name: contract.title,
    supplier: contract.supplier || order.supplier,
    specs: contract.content || "根据订单内容执行",
    description: contract.content || "根据订单内容执行",
    channel: contract.type || "合同",
    price: contract.amount_text || order.amount,
    region: "",
  };
  document.querySelector("#procurementTitle").textContent = `${contract.title}｜合同查看`;
  document.querySelector("#contractTemplateTitle").textContent = contract.type || "采购合同";
  document.querySelector("#contractNo").textContent = `合同编号：${contract.id}`;
  document.querySelector("#contractBuyer").textContent = contract.buyer_org || state.user?.org || "采购单位";
  document.querySelector("#contractSupplier").textContent = pseudoItem.supplier;
  document.querySelector("#contractSubject").textContent = contract.title;
  document.querySelector("#contractSpecs").textContent = pseudoItem.specs;
  const form = document.querySelector("#procurementForm");
  form.item_id.value = pseudoItem.id;
  form.procurement_type.value = "合同查看";
  form.contact.value = contract.contact || "";
  form.address.value = contract.address || "";
  form.delivery_time.value = contract.delivery_time || "";
  form.amount.value = contract.amount_text || money(order.amount);
  form.payment_terms.value = contract.payment_terms || "";
  form.remark.value = contract.remark || "";
  const flowNode = contract.flow_node || "4. 合同生成";
  document.querySelectorAll("#procurementFlow input").forEach((input) => {
    input.checked = input.value === flowNode;
  });
  document.querySelector("#procurementDialog").showModal();
}

function openDemandFromResource(itemId, method) {
  const item = itemById(itemId);
  if (!item) {
    alert("未找到设备或服务，请刷新页面后重试。");
    return;
  }
  const form = document.querySelector("#demandForm");
  form.reset();
  form.source_item_id.value = item.id;
  form.title.value = `${item.name}${method.replace("需求", "")}`;
  form.region.value = item.region || "集团统筹";
  form.category.value = [...form.category.options].some((option) => option.value === item.category) ? item.category : "生产经营机械";
  form.method.value = method;
  form.budget.value = amountNumber(item.price);
  form.quantity.value = method === "机械服务需求" ? "按实际作业面积填写" : "1";
  form.delivery_time.value = method === "机械服务需求" ? "计划开工时间待填" : "计划交付/进场时间待填";
  form.work_condition.value = item.scenario || item.description;
  form.hourly_price_ref.value = method === "机械服务需求" ? item.price : "";
  form.need_operator.value = method === "设备租赁需求" ? "需要操作人员" : "";
  form.need_transport.value = method === "设备采购需求" || method === "设备租赁需求" ? "需要运输/安装调试" : "";
  form.description.value = `已选择资源：${item.name}\n供应商能力参考：${item.supplier}\n参数/服务说明：${item.specs || item.description}\n请补充项目地点、技术要求、服务周期、验收标准和附件资料。`;
  document.querySelector("#demandDialog h2").textContent = method;
  document.querySelector("#demandDialog").showModal();
}

function amountNumber(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits || "0";
}

document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  document.querySelector("#loginError").textContent = "";
  try {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const result = await api("/api/login", { method: "POST", body: JSON.stringify(data) });
    showApp(result.user);
    await loadState();
    if (pendingDemandIntent && result.user.role === "buyer") {
      openDemandFromResource(pendingDemandIntent.itemId, pendingDemandIntent.method);
      pendingDemandIntent = null;
    }
  } catch (error) {
    document.querySelector("#loginError").textContent = error.message;
  }
});

function showLogin(role = "buyer") {
  document.querySelector("#portalPage").classList.add("hidden");
  document.querySelector("#loginPage").classList.remove("hidden");
  document.querySelector("[name=username]").value = role;
  document.querySelector("[name=password]").value = "123456";
}

document.querySelector("#showLoginButton").addEventListener("click", () => showLogin("buyer"));
document.querySelectorAll("[data-open-login]").forEach((button) => button.addEventListener("click", () => showLogin(button.dataset.openLogin)));
document.querySelector("#backPortalButton").addEventListener("click", () => {
  document.querySelector("#loginPage").classList.add("hidden");
  document.querySelector("#portalPage").classList.remove("hidden");
  showPublicView("home");
});
document.querySelector("#showRegisterButton")?.addEventListener("click", () => document.querySelector("#registerDialog").showModal());
document.querySelector("#moduleRegisterButton")?.addEventListener("click", () => document.querySelector("#registerDialog").showModal());

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-login]");
  if (!trigger) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  showLogin(trigger.dataset.openLogin || "buyer");
}, true);

document.querySelector("#registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/api/register_supplier", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
  event.currentTarget.reset();
  document.querySelector("#registerDialog").close();
  await loadPublic();
  alert("入驻申请已提交，请等待管理员审核。");
});

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("[name=username]").value = button.dataset.demo;
    document.querySelector("[name=password]").value = "123456";
  });
});

document.querySelector("#itemSearch").addEventListener("input", renderItems);
document.querySelector("#newDemandButton").addEventListener("click", () => document.querySelector("#demandDialog").showModal());
document.querySelector("#newItemButton").addEventListener("click", () => document.querySelector("#itemDialog").showModal());
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));

document.querySelector("#demandForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/api/demands", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
  event.currentTarget.reset();
  document.querySelector("#demandDialog").close();
  document.querySelector("#demandDialog h2").textContent = "发布采购需求";
  await loadState();
  setView("demand");
});

document.querySelector("#itemForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/api/items", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
  event.currentTarget.reset();
  document.querySelector("#itemDialog").close();
  await loadState();
  setView("mall");
});

document.querySelector("#quoteForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await api("/api/quotes", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
  event.currentTarget.reset();
  document.querySelector("#quoteDialog").close();
  await loadState();
  setView("quote");
});

document.querySelector("#procurementForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  if (data.procurement_type === "合同查看") {
    document.querySelector("#procurementDialog").close();
    return;
  }
  await api("/api/procurements", { method: "POST", body: JSON.stringify(data) });
  form.reset();
  document.querySelector("#procurementDialog").close();
  await loadState();
  setView("order");
});

document.addEventListener("change", (event) => {
  const provinceSelect = event.target.closest("[data-sharing-province]");
  const statusSelect = event.target.closest("[data-sharing-status]");
  if (provinceSelect) {
    sharingProvince = provinceSelect.value;
    selectedSharingId = filteredSharingDevices()[0]?.id || selectedSharingId;
    renderSharingPlatform(state.view === "sharing" && state.user ? "app" : "public");
  }
  if (statusSelect) {
    sharingStatus = statusSelect.value;
    selectedSharingId = filteredSharingDevices()[0]?.id || selectedSharingId;
    renderSharingPlatform(state.view === "sharing" && state.user ? "app" : "public");
  }
});

document.addEventListener("click", async (event) => {
  const mallFilter = event.target.closest("[data-mall-filter]")?.dataset?.mallFilter;
  const mallFocus = event.target.closest("[data-mall-focus]")?.dataset?.mallFocus;
  const equipmentFilter = event.target.closest("[data-equipment-filter]")?.dataset?.equipmentFilter;
  const serviceFilter = event.target.closest("[data-service-filter]")?.dataset?.serviceFilter;
  const shareDevice = event.target.closest("[data-share-device]")?.dataset?.shareDevice;
  const shareLease = event.target.closest("[data-share-lease]")?.dataset?.shareLease;
  const shareProvinceJump = event.target.closest("[data-sharing-province-jump]")?.dataset?.sharingProvinceJump;
  const shareReset = event.target.closest("[data-sharing-reset]");
  const publicDemandItem = event.target.closest("[data-public-demand-item]")?.dataset?.publicDemandItem;
  const publicView = event.target.closest("[data-public-view]")?.dataset?.publicView;
  const openLogin = event.target.closest("[data-open-login]")?.dataset?.openLogin;
  if (mallFilter) {
    event.preventDefault();
    renderMallCategory(mallFilter);
    return;
  }
  if (mallFocus) {
    event.preventDefault();
    focusMallProduct(mallFocus);
    return;
  }
  if (equipmentFilter) {
    event.preventDefault();
    renderEquipmentCategory(equipmentFilter);
    return;
  }
  if (serviceFilter) {
    event.preventDefault();
    renderServiceCategory(serviceFilter);
    return;
  }
  if (shareDevice) {
    event.preventDefault();
    selectedSharingId = shareDevice;
    renderSharingPlatform(state.view === "sharing" && state.user ? "app" : "public");
    return;
  }
  if (shareLease) {
    event.preventDefault();
    applySharingLease(shareLease);
    return;
  }
  if (shareProvinceJump) {
    event.preventDefault();
    sharingProvince = shareProvinceJump;
    selectedSharingId = filteredSharingDevices()[0]?.id || selectedSharingId;
    renderSharingPlatform(state.view === "sharing" && state.user ? "app" : "public");
    return;
  }
  if (shareReset) {
    event.preventDefault();
    resetSharingDemo();
    return;
  }
  if (publicDemandItem) {
    event.preventDefault();
    pendingDemandIntent = { itemId: publicDemandItem, method: event.target.closest("[data-public-demand-item]")?.dataset?.demandMethod || "设备采购需求" };
    showLogin("buyer");
    return;
  }
  if (publicView) {
    event.preventDefault();
    showPublicView(publicView);
    return;
  }
  if (openLogin) {
    event.preventDefault();
    showLogin(openLogin);
    return;
  }
  const itemId = event.target.dataset?.itemApprove;
  const demandId = event.target.dataset?.demandApprove;
  const orderId = event.target.dataset?.orderNext;
  const orderFrom = event.target.dataset?.orderFrom;
  const quoteDemand = event.target.dataset?.quoteDemand;
  const shortcutView = event.target.dataset?.shortcutView;
  const procureItem = event.target.dataset?.procureItem;
  const demandItem = event.target.dataset?.demandItem;
  const contractOrder = event.target.dataset?.contractOrder;
  if (shortcutView) {
    setView(shortcutView);
    return;
  }
  if (procureItem) {
    openProcurement(procureItem, event.target.dataset?.procureType || "内部采购");
    return;
  }
  if (demandItem) {
    openDemandFromResource(demandItem, event.target.dataset?.demandMethod || "设备采购需求");
    return;
  }
  if (contractOrder) {
    showContract(contractOrder);
    return;
  }
  if (itemId) await api(`/api/items/${itemId}/approve`, { method: "PATCH" });
  if (demandId) await api(`/api/demands/${demandId}/approve`, { method: "PATCH" });
  if (orderId) await api(`/api/orders/${orderId}/next`, { method: "PATCH" });
  if (orderFrom) {
    await api("/api/orders", { method: "POST", body: JSON.stringify({ demand_id: orderFrom }) });
    setView("order");
  }
  if (quoteDemand) {
    document.querySelector("#quoteForm [name=demand_id]").value = quoteDemand;
    document.querySelector("#quoteDialog").showModal();
  }
  if (itemId || demandId || orderId || orderFrom) await loadState();
});

document.querySelector("#resetButton").addEventListener("click", async () => {
  await api("/api/reset", { method: "POST" });
  await loadState();
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  location.reload();
});

api("/api/me").then((result) => {
  if (result.user) {
    showApp(result.user);
    loadState();
  }
});

loadPublic();
