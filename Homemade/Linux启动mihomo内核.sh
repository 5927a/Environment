# 文件名必须是config.yaml,改成其他找不到，mmdb和geosite提前下载放到配置文件目录(平级)
# /opt/clash/{app,config,logs} 必须执行权限
# ./mihomo-v1-1918 -d /opt/clash/config > /opt/clash/logs/mihomo.log 2>&1
# 启动方式
root@OpenCAT:~# more /etc/systemd/system/mihomo.service
[Unit]
Description=Mihomo Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
# 指定执行命令
ExecStart=/opt/clash/app/mihomo -d /opt/clash/config
# 指定工作目录
WorkingDirectory=/opt/clash
# 自动重启
Restart=always
RestartSec=5
# 最大打开文件数
LimitNOFILE=1048576

# 日志重定向到你指定的日志文件
StandardOutput=append:/opt/clash/logs/mihomo.log
StandardError=append:/opt/clash/logs/mihomo.log

# 避免权限问题
User=root

[Install]
WantedBy=multi-user.target
##########################################
  切割日志
##########################################
root@OpenCAT:~# more /etc/logrotate.d/mihomo
/opt/clash/logs/mihomo.log {
    daily                 # 每天切割
    rotate 7              # 保留最近 7 个日志
    missingok
    notifempty
    compress
    delaycompress
    copytruncate          # 关键：对正在写入的日志切割
}
###########################################