#!/bin/bash
# geosite.dat 和 Country.mmdb 下载脚本（带失败重试 + /tmp 临时文件机制）
# 自动设置定时任务. 0 0 1 * * /opt/download.sh 下载文件，取消了自带多个定时任务问题。
# 此脚本会重启路由器或者操作系统。如果不需要请禁用 /sbin/reboot改成重启openclash

# 文件 URL
URL1="https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat"
URL2="https://raw.githubusercontent.com/alecthw/mmdb_china_ip_list/release/lite/Country.mmdb"

# 最终保存路径
DEST_DIR="/etc/openclash"
DEST1="${DEST_DIR}/GeoSite.dat"
DEST2="${DEST_DIR}/Country.mmdb"

# 临时目录
TMP_DIR="/tmp"
TMP1="${TMP_DIR}/GeoSite.dat.tmp"
TMP2="${TMP_DIR}/Country.mmdb.tmp"

# 最大重试次数
MAX_RETRY=5
# 重试间隔（秒）
RETRY_INTERVAL=30

# 下载函数（带重试 + /tmp 临时文件）
download_file() {
    local url=$1
    local tmp=$2
    local dest=$3
    local attempt=1

    while [ $attempt -le $MAX_RETRY ]; do
        curl -L --fail -s "$url" -o "$tmp" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            # 成功才替换原文件
            mv -f "$tmp" "$dest"
            return 0
        else
            echo "⚠️ 下载失败: $url (第 $attempt 次)，$RETRY_INTERVAL 秒后重试..." >&2
            attempt=$((attempt + 1))
            sleep $RETRY_INTERVAL
        fi
    done

    # 超过重试次数仍失败，清理临时文件
    [ -f "$tmp" ] && rm -f "$tmp"
    return 1
}

# 执行下载
download_file "$URL1" "$TMP1" "$DEST1"
RESULT1=$?

download_file "$URL2" "$TMP2" "$DEST2"
RESULT2=$?

# 判断是否全部成功
if [ $RESULT1 -eq 0 ] && [ $RESULT2 -eq 0 ]; then
    echo "✅ 两个文件均下载成功，5 秒后重启..."
    sleep 5
    /sbin/reboot
else
    echo "❌ 下载失败，超过最大重试次数，系统不会重启。" >&2
    exit 1
fi
