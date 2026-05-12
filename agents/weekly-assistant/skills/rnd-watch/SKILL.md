---
name: rnd-watch
description: 关注专利、论文、产品发布、实验室动态和技术路线变化。
---

# R&D Watch

关注专利、论文、产品发布、实验室动态和技术路线变化。

## 何时触发

- **自动**：每天 12:00
- **手动**：通过 `rnd-watch --technology "固态电池"` 触发

## 工作流程

### 1. 搜索专利
使用专利 API（如 PatentsView）或 web_search 搜索最近 7 天的专利公开：
- 关键词聚焦 `industry_focus`
- 记录专利号、申请人、摘要、申请日期

### 2. 搜索论文
使用 aMCP/SerpAPI 或 web_search 搜索学术论文：
- 来源：arXiv、Semantic Scholar、Google Scholar
- 关注`预印本` vs `正式发表`，区分标注
- 记录论文标题、作者、机构、摘要、DOI/URL

### 3. 技术路线变化检测
对比过去6个月该技术方向的关键词共现网络：
- 若"固态电解质" vs "液态电解质"的论文比例倒转 → 输出 `route_shift` 并附上置信度
- 关注新兴技术方向的萌芽信号

### 4. 产品发布追踪
搜索行业内新产品/新服务发布：
- 来源：官方公告、Crunchbase、行业媒体
- 区分 `正式发布` vs `概念验证` vs `beta测试`

### 5. 矛盾检测
同一实验室前后论文结论矛盾 → 输出"待验证"而非强行解释。

### 6. 去重
调用 entity-dedup 技能对专利/论文中的实体（公司、机构、人名）进行归一化。

## 输入参数

- `technology_focus` (string): 关注的技术方向
- `date_range_days` (integer, default: 7): 搜索窗口天数

## 输出

写入 `../data/raw/rnd_{date}.json`：
```json
{
  "patents": [
    {
      "patent_id": "CN2026XXXXXX",
      "title": "一种固态电解质及其制备方法",
      "assignee": "宁德时代",
      "filing_date": "2026-05-01",
      "abstract": "...",
      "url": "https://patents.google.com/patent/..."
    }
  ],
  "papers": [
    {
      "title": "Advances in Solid-State Battery Electrolytes",
      "authors": ["Zhang, W.", "Li, X."],
      "journal": "Nature Energy",
      "type": "published",
      "doi": "10.1038/...",
      "abstract_cn": "..."
    }
  ],
  "route_shift": {
    "detected": true,
    "from": "液态电解质",
    "to": "固态电解质",
    "confidence": 0.85,
    "evidence": "过去6个月固态电解质论文占比从32%升至58%"
  },
  "product_launches": [
    {
      "company": "比亚迪",
      "product": "刀片电池2.0",
      "type": "正式发布",
      "date": "2026-05-10",
      "url": "..."
    }
  ]
}
```

## 原则

- 区分预印本与正式发表的论文
- 区分正式发布、概念验证、beta测试
- 结论矛盾 → 输出"待验证"而非强行解释
- 关注技术路线的拐点信号
