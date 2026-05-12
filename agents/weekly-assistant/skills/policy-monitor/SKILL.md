---
name: policy-monitor
description: 监控政府、监管、地方政策动态，区分征求意见稿与正式发布，提取适用行业标签。
---

# Policy Monitor

监控指定国家和地区的政府、监管政策动态。

## 何时触发

- **自动**：每天 09:00（结合缓存增量扫描）
- **手动**：通过 `policy-monitor --origin gov.cn` 触发

## 工作流程

### 1. 扫描信源
请求以下政府/监管官网的最新政策页面：
- https://www.gov.cn/zhengce/
- https://www.ndrc.gov.cn/
- (其他依赖配置 `policy_origins` 参数)

请求头设置 `User-Agent: OpenClaw PolicyBot/1.0`。

### 2. 下载并提取原文
- 优先下载官方 PDF/HTML 原文
- 提取完整政策文本
- 记录原文的 发布日期、文号、发布机构

### 3. 分类与标签提取
使用 LLM 将文档归类：
- **类别**: 征求意见稿 | 正式发布 | 废止 | 修订
- **提取**: `policy_id`, `effective_date`, `affected_industries`

### 4. 交叉验证解读
搜索至少2家主流财经媒体对该政策的解读。若媒体解读与你直接提取的文本存在明显分歧：
→ 标记 `interpretation_gap` 并 **保留双方原话**，不由模型定夺。

### 5. 影响分析
对政策进行定性分析：
- 影响等级: `high` / `medium` / `low`
- 任何"影响分析"都必须引用具体条款编号，禁止胡诌

### 6. 缓存
写入 `../data/policy/{doc_id}.json`：
```json
{
  "doc_id": "国发〔2026〕12号",
  "title": "关于支持新能源产业发展的若干意见",
  "category": "正式发布",
  "publish_date": "2026-05-10",
  "effective_date": "2026-06-01",
  "issuer": "国务院",
  "full_text_url": "https://www.gov.cn/...",
  "affected_industries": ["新能源", "储能"],
  "impact_level": "high",
  "interpretation_gap": false,
  "media_interpretations": [
    { "source": "财新网", "url": "...", "summary": "..." },
    { "source": "经济日报", "url": "...", "summary": "..." }
  ],
  "cited_articles": ["第三条", "第七条"]
}
```

## 输入参数

- `policy_origins` (array of strings): 要监控的政策来源 URL 列表
- `effective_after` (date string): 仅关注该日期之后生效的政策
- `industry_focus` (string, optional): 限定关注的行业

## 原则

- 区分征求意见稿与正式发布，不能混为一谈
- 影响分析必须引用具体条款编号，不得凭空论断
- 有解读分歧 → 保留双方原话
