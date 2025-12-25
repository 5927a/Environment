#!/bin/bash
# 完整性 = 下载成功就必须替换
# md5 仅用于判断是否重启
# 1号：无条件重启系统
# 周六：文件变动才重启 openclash

# ======================
# 时间判断
# ======================

DAY_OF_WEEK=$(date +%u)   # 1-7（6=周六）
DAY_OF_MONTH=$(date +%d) # 01-31

IS_FIRST_DAY=0
IS_SATURDAY=0

[ "$DAY_OF_MONTH" -eq 1 ] && IS_FIRST_DAY=1
[ "$DAY_OF_WEEK" -eq 6 ] && IS_SATURDAY=1

if [ "$IS_FIRST_DAY" -eq 0 ] && [ "$IS_SATURDAY" -eq 0 ]; then
    echo "ℹ️ 非 1 号也非周六，退出"
    exit 0
fi

# ======================
# 文件配置
# ======================

URL1="https://raw.githubusercontent.com/5927a/Environment/refs/heads/config/Download/geosite.dat"
URL2="https://raw.githubusercontent.com/alecthw/mmdb_china_ip_list/release/lite/Country.mmdb"

DEST_DIR="/etc/openclash"
DEST1="${DEST_DIR}/GeoSite.dat"
DEST2="${DEST_DIR}/Country.mmdb"

TMP_DIR="/tmp"
TMP1="${TMP_DIR}/GeoSite.dat.tmp"
TMP2="${TMP_DIR}/Country.mmdb.tmp"

MAX_RETRY=5
RETRY_INTERVAL=30

DOWNLOAD_OK=1
FILE_CHANGED=0

# ======================
# 下载 + 强制替换函数
# ======================

download_and_replace() {
    local url=$1
    local tmp=$2
    local dest=$3
    local attempt=1

    local old_md5=""
    [ -f "$dest" ] && old_md5=$(md5sum "$dest" | awk '{print $1}')

    while [ $attempt -le $MAX_RETRY ]; do
        if curl -L --fail -s "$url" -o "$tmp"; then
            local new_md5
            new_md5=$(md5sum "$tmp" | awk '{print $1}')

            # md5 是否变化（仅用于重启判断）
            [ "$old_md5" != "$new_md5" ] && FILE_CHANGED=1

            # 强制、原子替换
            mv -f "$tmp" "$dest"
            echo "✔ $(basename "$dest") 已替换"
            return 0
        fi

        echo "⚠️ 下载失败: $url（第 $attempt 次），$RETRY_INTERVAL 秒后重试" >&2
        attempt=$((attempt + 1))
        sleep $RETRY_INTERVAL
    done

    rm -f "$tmp"
    return 1
}

# ======================
# 执行下载
# ======================

download_and_replace "$URL1" "$TMP1" "$DEST1" || DOWNLOAD_OK=0
download_and_replace "$URL2" "$TMP2" "$DEST2" || DOWNLOAD_OK=0

# ======================
# 重启策略
# ======================

if [ "$IS_FIRST_DAY" -eq 1 ]; then
    echo "🔴 今天是 1 号，无条件重启系统"
    sleep 5
    /sbin/reboot
    exit 0
fi

# 周六逻辑
if [ "$IS_SATURDAY" -eq 1 ]; then
    if [ "$DOWNLOAD_OK" -eq 1 ] && [ "$FILE_CHANGED" -eq 1 ]; then
        echo "♻️ 周六文件有变动，重启 OpenClash"
        /etc/init.d/openclash restart
    else
        echo "ℹ️ 周六无变动或下载失败，不重启"
    fi
fi