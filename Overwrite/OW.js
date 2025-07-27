// 全局开关，用于启用或禁用脚本
const enable = true;

// 日志记录函数，格式化输出带时间戳的日志信息
function log(message) {
  console.log(`[Clash Script] ${new Date().toISOString()}: ${message}`);
}

// 规则选项配置，控制各种规则的启用状态
const ruleOptions = {
  xiuzheng: true,                // 修正规则
  disconnet: true,               // 断开连接规则
  dns_reject: true,              // DNS 拒绝规则
  win_app_domain_reject: true,   // Windows 应用域名拒绝规则
  win_process_reject: true,      // Windows 进程拒绝规则
  ads: true,                     // 广告过滤规则
  google: true,                  // 谷歌相关规则
  chatgpt: true,                 // ChatGPT 相关规则
  microsoft: true,               // 微软相关规则
  telegram: true,                // Telegram 相关规则
  twitter: true,                 // Twitter 相关规则
  outside: true,                 // 境外规则
  apple: true,                   // 苹果相关规则
  win_process_conn: true,        // Windows 进程直连规则
  china: true,                   // 国内规则
};

// 地区选项配置，用于匹配代理节点的地区规则
const regionOptions = {
  excludeHighPercentage: true,   // 是否排除高倍率节点
  regions: [
    {
      name: "美日",              // 地区名称
      regex: /(美|🇺🇸|us|united states?|america|凤凰城|纽约|日本|🇯🇵|jp|japan)/i, // 匹配正则
      ratioLimit: 5,             // 最大倍率限制
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Proxy.png", // 图标 URL
    },
    {
      name: "HK香港",
      regex: /(港|🇭🇰|hk|hongkong|hong kong)/i,
      ratioLimit: 5,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Hong_Kong.png",
    },
    {
      name: "US美国",
      regex: /(美|🇺🇸|us|united states?|america|凤凰城|纽约)/i,
      ratioLimit: 5,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/United_States.png",
    },
    {
      name: "JP日本",
      regex: /(日本|🇯🇵|jp|japan)/i,
      ratioLimit: 5,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Japan.png",
    },
    {
      name: "SG新加坡",
      regex: /(新加坡|🇸🇬|sg|singapore)/i,
      ratioLimit: 5,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Singapore.png",
    },
    {
      name: "TW台湾",
      regex: /(台湾|🇹🇼|tw|taiwan|tai wan)/i,
      ratioLimit: 5,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Taiwan.png",
    },
  ],
};

// DNS 配置，包括默认、国内和国外 DNS 服务器
const defaultDNS = ["tls://1.12.12.12", "tls://223.5.5.5"]; // 默认 DNS
const chinaDNS = ["119.29.29.29", "223.5.5.5"];             // 国内 DNS
const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1"];      // 国外 DNS

// DNS 配置对象，定义 DNS 解析行为
const dnsConfig = {
  enable: true,                         // 启用 DNS
  listen: ":53",                       // 监听端口
  ipv6: false,                         // 禁用 IPv6
  "prefer-h3": true,                   // 优先使用 HTTP/3
  "use-hosts": true,                   // 使用 hosts 文件
  "use-system-hosts": true,            // 使用系统 hosts
  "respect-rules": true,               // 遵循规则
  "enhanced-mode": "fake-ip",          // 启用 fake-ip 模式
  "fake-ip-range": "198.18.0.1/16",   // fake-ip 地址范围
  "fake-ip-filter-mode": "blacklist",  // fake-ip 过滤模式
  "fake-ip-filter": [                  // fake-ip 过滤规则
    "+.lan",
    "+.local",
    "time.*.com",
    "ntp.*.com",
    "+.mi.com",
    "+.xiaomi.com",
    "+.xiaomi.cn",
    "+.xiaomi.net",
    "+.xiaomiyoupin.com",
    "+.mijia.tech",
    "+.miot-spec.org",
    "+.mi-img.com",
    "+.push.apple.com",
    "login.microsoftonline.com",
  ],
  "default-nameserver": [...defaultDNS], // 默认名称服务器
  "nameserver": [...foreignDNS],         // 名称服务器
  "proxy-server-nameserver": [...foreignDNS], // 代理服务器名称服务器
  "nameserver-policy": {                // 名称服务器策略
    "geosite:private,cn": [...chinaDNS],
  },
  "fallback": [...foreignDNS],          // 备用 DNS
  "fallback-filter": {                  // 备用过滤规则
    "geoip": true,
    "geoip-code": "CN",
  },
};

// 规则提供者的通用配置
const ruleProviderCommon = {
  type: "http",                        // 规则类型
  format: "yaml",                      // 规则格式
  interval: 86400,                     // 更新间隔（秒）
};

// 代理组基础配置
const groupBaseOption = {
  interval: 300,                       // 测试间隔（秒）
  timeout: 3000,                       // 超时时间（毫秒）
  url: "http://connectivitycheck.gstatic.com/generate_204", // 测试 URL
  lazy: true,                          // 延迟加载
  "max-failed-times": 3,              // 最大失败次数
  hidden: false,                       // 是否隐藏
};

// 规则提供者集合
const ruleProviders = new Map();
ruleProviders.set("applications", {
  ...ruleProviderCommon,
  behavior: "classical",
  format: "text",
  url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Homemade/p2p.list",
  path: "./ruleset/p2p.list",
});

// 初始规则列表
const rules = ["RULE-SET,applications,DIRECT"];

// 主函数，处理 Clash 配置文件
function main(config) {
  // 检查代理节点是否有效
  if (!config || !config.proxies || config.proxies.length === 0) {
    log("错误：未找到代理节点");
    throw new Error("配置文件中未找到任何代理");
  }

  log(`找到 ${config.proxies.length} 个代理节点`);

  // 初始化代理组
  let regionProxyGroups = [];
  let otherProxyGroups = config.proxies.map((p) => p.name);

  // 设置全局配置
  config["allow-lan"] = true;           // 允许局域网访问
  config["bind-address"] = "*";         // 绑定所有地址
  config["mode"] = "rule";             // 使用规则模式
  config["dns"] = dnsConfig;           // 应用 DNS 配置
  config["profile"] = {
    "store-selected": true,             // 存储选择的代理
    "store-fake-ip": true,             // 存储 fake-ip
  };
  config["unified-delay"] = true;      // 统一延迟
  config["tcp-concurrent"] = true;     // 启用 TCP 并发
  config["keep-alive-interval"] = 15;  // 保持连接间隔
  config["find-process-mode"] = "strict"; // 严格进程查找模式
  config["geodata-mode"] = false;      // 禁用 geodata 模式
  config["geodata-loader"] = "memconservative"; // 内存保守加载
  config["geo-auto-update"] = true;    // 自动更新 geodata
  config["geo-update-interval"] = 72;  // geodata 更新间隔（小时）

  // 配置嗅探器
  config["sniffer"] = {
    enable: true,                      // 启用嗅探
    "force-dns-mapping": true,         // 强制 DNS 映射
    "parse-pure-ip": true,             // 解析纯 IP
    "override-destination": false,     // 不覆盖目标
    sniff: {
      TLS: { ports: [443, 8443] },     // TLS 嗅探端口
      HTTP: { ports: [80, "8080-8880"] }, // HTTP 嗅探端口
      QUIC: { ports: [443, 8443] },    // QUIC 嗅探端口
    },
    "force-domain": [],                // 强制域名
    "skip-domain": ["Mijia Cloud"],   // 跳过域名
  };

  // 配置 NTP
  config["ntp"] = {
    enable: true,                      // 启用 NTP
    "write-to-system": false,          // 不写入系统时间
    server: "pool.ntp.org",           // NTP 服务器
  };

  // 如果脚本被禁用，直接返回配置
  if (!enable) {
    log("脚本已禁用，直接返回配置");
    return config;
  }

  // 处理地区代理组
  regionOptions.regions.forEach((region) => {
    let proxies = config.proxies
      .filter((p) => {
        // 提取节点名称中的倍率
        const multiplierMatch = p.name.match(/([0-9]+(\.\d+)?)(?=[xX✕✖⨉倍率])/i);
        const multiplier = multiplierMatch ? parseFloat(multiplierMatch[1]) : 0;
        return p.name.match(region.regex) && multiplier <= region.ratioLimit;
      })
      .map((p) => p.name);

    if (proxies.length > 0) {
      regionProxyGroups.push({
        ...groupBaseOption,
        name: region.name,
        type: "url-test",             // 使用 url-test 类型
        tolerance: 50,                // 延迟容差
        icon: region.icon,
        proxies,
      });
      log(`地区 ${region.name} 匹配到 ${proxies.length} 个节点`);
    }

    // 从其他代理组中移除已分配的节点
    otherProxyGroups = otherProxyGroups.filter((x) => !proxies.includes(x));
  });

  // 收集地区代理组名称
  const proxyGroupsRegionNames = regionProxyGroups.map((g) => g.name);

  // 处理剩余的未分配节点
  if (otherProxyGroups.length > 0) {
    proxyGroupsRegionNames.push("其他节点");
    regionProxyGroups.push({
      ...groupBaseOption,
      name: "其他节点",
      type: "url-test",
      proxies: otherProxyGroups,
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/World_Map.png",
    });
  }

  // 初始化默认代理组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      name: "默认节点",
      type: "select",              // 使用 select 类型
      proxies: [...proxyGroupsRegionNames, "直连"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Proxy.png",
    },
  ];

  // 添加直连节点
  config.proxies.push(
    { name: "直连", type: "direct", udp: true, url: "http://www.qualcomm.cn/generate_204"},
  );

  // 根据规则选项添加规则和代理组
  if (ruleOptions.xiuzheng) {
    ruleProviders.set("xiuzheng", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Homemade/xiuzhengguize.list",
      path: "./ruleset/xiuzheng.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "修正",
      type: "select",
      proxies: ["直连", "REJECT"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Direct.png",
    });
  }

  if (ruleOptions.disconnet) {
    ruleProviders.set("disconnet", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/config/Homemade/disconnet.list",
      path: "./ruleset/disconnet.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "disconnet",
      type: "select",
      proxies: ["REJECT", "直连"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Reject.png",
    });
  }

  if (ruleOptions.dns_reject) {
    ruleProviders.set("dns_reject", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/HTTPDNS.Block.list",
      path: "./ruleset/HTTPDNS.Block.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "拒绝dns",
      type: "select",
      proxies: ["REJECT", "直连"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Reject.png",
    });
  }

  if (ruleOptions.win_app_domain_reject) {
    ruleProviders.set("win_app_domain_reject", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/config/Homemade/win_app_domain_reject.list",
      path: "./ruleset/win_app_domain_reject.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "拒绝Win软件域名",
      type: "select",
      proxies: ["REJECT", "直连"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Reject.png",
    });
  }

  if (ruleOptions.win_process_reject) {
    ruleProviders.set("win_process_reject", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/config/Homemade/win_process_reject.list",
      path: "./ruleset/win_process_reject.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "拒绝进程",
      type: "select",
      proxies: ["REJECT", "直连"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Reject.png",
    });
  }

  if (ruleOptions.ads) {
    ruleProviders.set("ads", {
      ...ruleProviderCommon,
      behavior: "domain",
      format: "yaml",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Maomi/list/anti-ad-surge2.yaml",
      path: "./ruleset/ads.yaml",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "广告过滤",
      type: "select",
      proxies: ["REJECT"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Reject.png",
    });
  }

  if (ruleOptions.google) {
    ruleProviders.set("google", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Sugre/list/Google.list",
      path: "./ruleset/Google.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "谷歌",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Google.png",
    });
  }

  if (ruleOptions.chatgpt) {
    ruleProviders.set("chatgpt", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/OpenAI.list",
      path: "./ruleset/OpenAI.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "ChatGPT",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/ChatGPT.png",
    });
  }

  if (ruleOptions.microsoft) {
    ruleProviders.set("microsoft", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/Microsoft.list",
      path: "./ruleset/Microsoft.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "微软",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Microsoft.png",
    });
  }

  if (ruleOptions.telegram) {
    ruleProviders.set("telegram", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/Telegram.list",
      path: "./ruleset/Telegram.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "飞机",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Telegram.png",
    });
  }

  if (ruleOptions.twitter) {
    ruleProviders.set("twitter", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/Twitter.list",
      path: "./ruleset/Twitter.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "蓝鸟",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Twitter.png",
    });
  }

  if (ruleOptions.outside) {
    ruleProviders.set("outside", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Homemade/Outside.list",
      path: "./ruleset/Outside.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "境外",
      type: "select",
      proxies: ["默认节点", ...proxyGroupsRegionNames, "直连", "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Proxy.png",
    });
  }

  if (ruleOptions.apple) {
    ruleProviders.set("apple", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/Apple_All.list",
      path: "./ruleset/Apple.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "苹果",
      type: "select",
      proxies: ["直连", "默认节点", ...proxyGroupsRegionNames, "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/Apple.png",
    });
  }

  if (ruleOptions.win_process_conn) {
    ruleProviders.set("win_process_conn", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Homemade/win_process_conn.list",
      path: "./ruleset/win_process_conn.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "进程直连",
      type: "select",
      proxies: ["直连", "默认节点", ...proxyGroupsRegionNames, "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/China.png",
    });
  }

  if (ruleOptions.china) {
    ruleProviders.set("china", {
      ...ruleProviderCommon,
      behavior: "classical",
      format: "text",
      url: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Homemade/China.list",
      path: "./ruleset/China.list",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "国内",
      type: "select",
      proxies: ["直连", "默认节点", ...proxyGroupsRegionNames, "REJECT"],
      url: "http://www.google.com/generate_204",
      icon: "https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Colors/China.png",
    });
  }

  // 将地区代理组追加到总代理组列表
  config["proxy-groups"] = config["proxy-groups"].concat(regionProxyGroups);

  // 添加规则到规则列表
  rules.push(
    "RULE-SET,xiuzheng,修正",
    "RULE-SET,disconnet,disconnet",
    "RULE-SET,dns_reject,拒绝dns",
    "RULE-SET,win_app_domain_reject,拒绝Win软件域名",
    "RULE-SET,win_process_reject,拒绝进程",
    "RULE-SET,ads,广告过滤",
    "RULE-SET,google,谷歌",
    "RULE-SET,chatgpt,ChatGPT",
    "RULE-SET,microsoft,微软",
    "RULE-SET,telegram,飞机",
    "RULE-SET,twitter,蓝鸟",
    "RULE-SET,outside,境外",
    "RULE-SET,apple,苹果",
    "RULE-SET,win_process_conn,进程直连",
    "RULE-SET,china,国内",
    "GEOIP,LAN,DIRECT",
    "GEOIP,CN,DIRECT",
    "MATCH,默认节点"
  );

  // 应用规则和规则提供者
  config["rules"] = rules;
  config["rule-providers"] = Object.fromEntries(ruleProviders);

  log("脚本执行完成");

  return config;
}