---
name: talent-watch
description: 监控关键高管、技术负责人、核心研究员的人事动态，追踪职责变化和时间线。
---

# Talent Watch

监控指定企业的高管、技术负责人、核心研究员等人事动态。

## 何时触发

- **自动**：每天 10:00
- **手动**：通过 `talent-watch --person "Elon Musk"` 触发

## 工作流程

### 1. 加载关注名单
从 `../config/talent_watchlist.json` 读取：
```json
[
  {
    "name": "Elon Musk",
    "companies": ["Tesla", "SpaceX", "xAI"],
    "roles": ["CEO", "CTO"],
    "watch_type": "executive"
  },
  {
    "name": "Sam Altman",
    "companies": ["OpenAI"],
    "roles": ["CEO"],
    "watch_type": "executive"
  }
]
```

### 2. 搜索人事动态
用 web_search 搜索每位关注人物的最新动态：
- 关键词模式: `"{person.name}" joined OR leaving OR promoted OR appointed OR 离职 OR 加入 OR 任命`
- 限定近期（`recency: "d"`）
- 不仅记录离职/入职，还要捕捉：
  - 职责范围变化
  - 汇报线调整
  - 职级微妙变动（如"升任"vs"调任"vs"兼任"）

### 3. 时间线对比
对比该人过去12个月的职位变动频率：
- 若频率 > 2次/年 → 标记 `unstable`
- 记录每次变动的时间线，形成连贯的人物动态图谱

### 4. 矛盾检测
若A媒体说"离职创业"，B媒体说"内部调动"：
→ 两条都保留并标注矛盾，不由模型自决

### 5. 实体验证
使用实体解析确认人物身份（处理重名/歧义）：
- 结合公司名、职位、时间线等信息交叉确认
- 无法确定的 → 标记 `ambiguous` 待人工

## 输入参数

- `person_name` (string, optional): 指定关注某个人物，为空则扫描 watchlist 全部
- `companies` (array of strings, optional): 限定关注的公司范围

## 输出

写入 `../data/raw/talent_{date}.json`，格式：
```json
{
  "person": "Elon Musk",
  "event_type": "role_change",
  "from": "CEO, Tesla",
  "to": "CEO, Tesla + xAI",
  "date": "2026-05-11",
  "sources": [
    { "url": "...", "claim": "..." },
    { "url": "...", "claim": "..." }
  ],
  "contradiction": false,
  "stability_flag": "stable",
  "ambiguous": false
}
```

## 原则

- 不仅记录离职/入职，还要捕捉职责范围变化、汇报线调整
- 有报道矛盾 → 保留双方原话，不由模型自决
- 重名需人工确认 → 标记 `ambiguous`
