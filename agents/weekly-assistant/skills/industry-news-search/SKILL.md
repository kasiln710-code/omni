---
name: industry-news-search
description: 按行业关键词抓取新闻、公告和快讯，缓存至本地JSON，支持时间范围过滤和交叉验证。
---

# Industry News Search

按行业关键词抓取新闻、公告、专栏和快讯。

## 何时触发

- **自动**：每天 08:00（配合 cron 定时执行）
- **手动**：通过 `industry-news-search --keyword "<行业关键词>" --days-back <N>` 触发增量抓取

## 工作流程

### 1. 获取关键词
从 `../config/industry_keywords.json` 读取行业关键词列表。文件格式：
```json
{
  "industries": [
    { "name": "新能源电池", "keywords": ["固态电池", "钠离子电池", "宁德时代", "CATL", "比亚迪电池"], "focus": ["技术突破", "产能扩张", "供应链"] }
  ]
}
```

### 2. 抓取新闻
使用以下工具按关键词搜索：
- **web_search**（或 Brave Search API）— 搜索新闻
- **rss_reader (MCP)** — 解析RSS源

搜索要求：
- 优先当天/近期的内容
- 每条新闻保留标题、摘要、URL、发布时间、来源
- 支持 `days_back` 参数控制时间范围（默认1天）
- `max_items_per_source` 控制每源最大条数（默认20）

### 3. 交叉验证（内置，非独立skill）
对重大事件（股价波动、产品发布、高管变动），必须：
- 再搜索至少2个不同信源确认
- 若无法找到交叉验证 → 标记 `未交叉验证，待人工`
- 检查与已缓存事实 `../data/facts/settled_facts.json` 是否存在矛盾

### 4. 缓存原始数据
写入 `../data/raw/news_{source}_{date}.json`，格式为 JSON 数组：
```json
[
  {
    "id": "uuid",
    "title": "标题",
    "summary": "摘要",
    "url": "原文链接",
    "source": "来源名称",
    "published_at": "2026-05-12T08:00:00Z",
    "fetched_at": "2026-05-12T08:01:00Z",
    "keywords_matched": ["固态电池"],
    "cross_validated": true,
    "cross_validation_sources": ["url2", "url3"],
    "contradiction_with_cache": false
  }
]
```

## 输入参数

- `industry_focus` (string): 要搜索的行业/关键词
- `days_back` (integer, default: 1): 回溯天数
- `max_items_per_source` (integer, default: 20): 每源最大条数

## 输出

本 skill **不以自然语言返回结果**。所有搜索结果写入 `../data/raw/` 路径，供下游 skills 消费。

## 原则

- **no_fabrication**: 每条新闻必须对应一个可访问的原始链接
- **cross_validation**: 重大事件至少2个不同信源
- **sensitivity**: 识别词频突变、报道情绪转折（如从"看好"变"担忧"）
