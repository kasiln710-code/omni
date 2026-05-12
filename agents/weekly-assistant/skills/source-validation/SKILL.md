---
name: source-validation
description: 只认原文、官网、公告、可追溯链接。负责证据链检查，验证引用的真实性和权威性。
---

# Source Validation

对已采集信息进行证据链检查，提取原文链接和原文关键句。

## 何时触发

- **按需** — 由 `weekly-summarizer` 在生成周报前调用
- 也可手动对特定 URL/断言进行验证

## 工作流程

### 1. 提取所有超链接
从原始数据中提取所有 URL 引用：
- 包括文章中的引用链接、脚注链接
- 同时提取原文关键句（直接引用）

### 2. HTTP 状态验证
对所有 URL 发起 HTTP 请求：
- 检查 HTTP 状态码（200 / 404 / 301 重定向）
- 记录最终有效 URL（处理跳转链）
- 标记失效链接

### 3. 权威等级评定
基于域名判断信息来源权威等级：
- **Tier 1**: 官网/官方公告/政府域名 (.gov, 公司官网)
- **Tier 2**: 主流权威媒体 (Reuters, Bloomberg, 财新, 36氪)
- **Tier 3**: 行业垂直媒体/论坛
- **Tier 4**: 个人博客/自媒体/需交叉验证

### 4. Wayback Machine 佐证
对关键 URL 检查 Internet Archive：
- 确认原文是否曾被修改或删除
- 若原始页面已不可用但 Wayback 有存档 → 使用存档并标注
- 记录首次快照和最近快照的时间戳

### 5. 产生证据链
每个结论输出：
- 直接引用原文句子
- 源 URL
- 抓取时间戳
- 权威等级（Tier 1-4）
- 是否经 Wayback 佐证
- 验证状态（valid / redirected / dead / archived）

## 输入参数

- `urls` (array of strings): 待验证的 URL 列表
- `statements` (array of strings): 待验证的断言/声明

## 输出

写入 `../data/raw/validation_{batch_id}.json`：
```json
[
  {
    "original_url": "https://example.com/news/article",
    "resolved_url": "https://example.com/news/article",
    "status": "valid",
    "http_code": 200,
    "authority_tier": 2,
    "tier_label": "主流权威媒体",
    "capture_timestamp": "2026-05-12T14:00:00Z",
    "wayback": {
      "available": true,
      "first_capture": "2026-05-10T08:00:00Z",
      "last_capture": "2026-05-12T12:00:00Z",
      "modified": false
    },
    "quoted_snippet": "宁德时代宣布第三代CTP电池包能量密度突破250Wh/kg"
  }
]
```

## 原则

- 层层溯源，不允许只输出"可信"结论
- 每个结论必须带有 URL + 原文关键句 + 权威等级
- 原文不可用但有存档 → 使用存档并标注
- Tier 4 来源须额外标注"需交叉验证"
