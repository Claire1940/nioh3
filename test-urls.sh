#!/bin/bash

# URL测试脚本 - 测试所有主要页面（不包括文章详情页）
BASE_URL="http://localhost:3001"
LANGUAGES=("en" "th" "ko" "ja" "fr")
PAGES=("guides" "codes" "platforms" "community" "building" "content" "release" "support")
TOOL_PAGES=("tools" "tools/code-finder" "tools/update-radar")
OTHER_PAGES=("privacy" "terms")

TOTAL=0
SUCCESS=0
FAILED=0

echo "================================================"
echo "  URL 测试开始 - Heartopia Game Site"
echo "  服务器: $BASE_URL"
echo "================================================"
echo ""

# 测试函数
test_url() {
    local url=$1
    local name=$2
    TOTAL=$((TOTAL + 1))

    # 使用curl测试，只获取HTTP状态码
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "✓ [${status}] ${name}"
        SUCCESS=$((SUCCESS + 1))
        return 0
    else
        echo "✗ [${status}] ${name} - URL: ${url}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. 测试主页
echo "=== 测试主页 ==="
for lang in "${LANGUAGES[@]}"; do
    if [ "$lang" = "en" ]; then
        test_url "${BASE_URL}/" "Homepage (English)"
    else
        test_url "${BASE_URL}/${lang}" "Homepage (${lang})"
    fi
done
echo ""

# 2. 测试列表页
echo "=== 测试列表页 ==="
for page in "${PAGES[@]}"; do
    for lang in "${LANGUAGES[@]}"; do
        if [ "$lang" = "en" ]; then
            test_url "${BASE_URL}/${page}" "${page} (English)"
        else
            test_url "${BASE_URL}/${lang}/${page}" "${page} (${lang})"
        fi
    done
done
echo ""

# 3. 测试工具页
echo "=== 测试工具页 ==="
for page in "${TOOL_PAGES[@]}"; do
    for lang in "${LANGUAGES[@]}"; do
        if [ "$lang" = "en" ]; then
            test_url "${BASE_URL}/${page}" "${page} (English)"
        else
            test_url "${BASE_URL}/${lang}/${page}" "${page} (${lang})"
        fi
    done
done
echo ""

# 4. 测试其他页面
echo "=== 测试其他页面 ==="
for page in "${OTHER_PAGES[@]}"; do
    for lang in "${LANGUAGES[@]}"; do
        if [ "$lang" = "en" ]; then
            test_url "${BASE_URL}/${page}" "${page} (English)"
        else
            test_url "${BASE_URL}/${lang}/${page}" "${page} (${lang})"
        fi
    done
done
echo ""

# 5. 测试特殊页面（sitemap, robots等）
echo "=== 测试特殊页面 ==="
test_url "${BASE_URL}/sitemap.xml" "Sitemap"
test_url "${BASE_URL}/robots.txt" "Robots.txt"
test_url "${BASE_URL}/video-sitemap.xml" "Video Sitemap"
echo ""

# 输出统计
echo "================================================"
echo "  测试完成"
echo "================================================"
echo "总计: ${TOTAL}"
echo "成功: ${SUCCESS} ✓"
echo "失败: ${FAILED} ✗"
echo "成功率: $(awk "BEGIN {printf \"%.1f\", ($SUCCESS/$TOTAL)*100}")%"
echo "================================================"

# 如果有失败，返回错误码
if [ $FAILED -gt 0 ]; then
    exit 1
fi

exit 0
