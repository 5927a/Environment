// 全局开关，用于启用或禁用脚本
const enable = true;

// 日志记录函数，格式化输出带时间戳的日志信息
function log(message) {
  console.log(`[Clash Script] ${new Date().toISOString()}: ${message}`);
}

// 规则选项配置，控制各种规则的启用状态
const ruleOptions = {
  china_direct: true,                // 修正规则
};

// 地区选项配置，用于匹配代理节点的地区规则
const regionOptions = {
  excludeHighPercentage: true,
  regions: [
    {
      name: "所有",
      regex: /(.*)/i,
      ratioLimit: 10,
      icon: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/icon/color/wifi.png",
    },
  ],
};

const defaultDNS = ["tls://1.12.12.12", "tls://223.5.5.5"];
const chinaDNS = ["119.29.29.29", "223.5.5.5"];
const foreignDNS = ["tls://8.8.8.8", "tls://1.1.1.1"];


const dnsConfig = {
  enable: true,
  listen: ":53",
  ipv6: false,
  "prefer-h3": true,
  "use-hosts": true,
  "use-system-hosts": true,
  "respect-rules": true,
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter-mode": "blacklist",
  "fake-ip-filter": [
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
  "default-nameserver": [...defaultDNS],
  "nameserver": [...foreignDNS],
  "proxy-server-nameserver": [...foreignDNS],
  "nameserver-policy": {
    "geosite:private,cn": [...chinaDNS],
  },
  "fallback": [...foreignDNS],
  "fallback-filter": {
    "geoip": true,
    "geoip-code": "CN",
  },
};

const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 3600,
};

// 代理组基础配置
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: "http://connectivitycheck.gstatic.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false,
};
//广告规则
const ruleProviders = new Map();

ruleProviders.set("reject_rules", {
  ...ruleProviderCommon,
  behavior: "domain",
  format: "text",
  url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/Advertising/Advertising_Domain.txt",
  path: "./ruleset/Advertising_Domain.txt",
});
//如果这个不需要，把下面REJECT改成DIRECT
const rules = ["RULE-SET,reject_rules,REJECT"];

function main(config) {

  if (!config || !config.proxies || config.proxies.length === 0) {
    log("错误：未找到代理节点");
    throw new Error("配置文件中未找到任何代理");
  }

  log(`找到 ${config.proxies.length} 个代理节点`);


  let regionProxyGroups = [];
  let otherProxyGroups = config.proxies.map((p) => p.name);

  config["allow-lan"] = true;
  config["bind-address"] = "*";
  config["mode"] = "rule";
  config["dns"] = dnsConfig;
  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true,
  };
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
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

  // 初始化默认代理组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      name: "默认节点",
      type: "select",              // 使用 select 类型
      proxies: [...proxyGroupsRegionNames],
      icon: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/icon/color/urltest.png",
    },
  ];

  // 添加直连节点
  config.proxies.push(
    { name: "直连", type: "direct", udp: true, url: "http://www.qualcomm.cn/generate_204"},
  );

  // 根据规则选项添加规则和代理组
  if (ruleOptions.china_direct) {
    ruleProviders.set("china_direct", {
      ...ruleProviderCommon,
      behavior: "domain",
      format: "text",
      url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/rule/Clash/China/China_Domain.txt",
      path: "./ruleset/china_direct.yaml",
    });
    config["proxy-groups"].push({
      ...groupBaseOption,
      name: "拒绝",
      type: "select",
      proxies: ["REJECT", "DIRECT"],
      icon: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/refs/heads/master/icon/color/adblock.png",
    });
  }

  // 将地区代理组追加到总代理组列表
  config["proxy-groups"] = config["proxy-groups"].concat(regionProxyGroups);

  // 添加规则到规则列表
  rules.push(
    "RULE-SET,china_direct,DIRECT",
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