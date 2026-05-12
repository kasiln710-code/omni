---
name: risk-scorer
description: 对捕捉到的动态进行风险/机会/关注度打分，附带可追溯评分依据。
---

# Risk Scorer

对捕捉到的动态进行风险/机会/影响力打分。

## 何时触发

- **按需** — 在 `weekly-summarizer` 生成周报前调用
- 依赖 `source-validation` 优先执行

## 评分维度

| 维度 | 权重 | 等级 |
|------|------|------|
| market_impact (市场影响) | 0.4 | 负面冲击(-2) / 竞争扰动(-1) / 中性(0) / 利好消息(1) / 重大利好(2) |
| urgency (紧迫度) | 0.3 | 长期趋势6月+ / 中期季度内 / 短期本月 / 紧急本周 |
| credibility (可信度) | 0.2 | 未验证猜测 / 单一第三方 / 多方交叉验证 / 官方确认 |
| relevance (相关度) | 0.1 | 弱相关 / 一般相关 / 强相关 |

## 工作流程

### 1. 提取事件信号
使用 LLM 将原始动态映射到评分维度：
- 每条动态独立评分
- 输出每个维度的分值依据（引用哪条原始信息）

### 2. 计算动态分数
- **风险分** = Σ(负向分值 × 权重)，取绝对值
- **机会分** = Σ(正向分值 × 权重)，取绝对值
- **综合分** = 风险分 + 机会分（两者非互斥，同一事件可能有风险也有机会）
- **置信度** = credibility 映射值

### 3. 评分解释
对每个风险/机会分，输出：
- 依据哪条原始信息
- 引用交叉验证结果
- 若存在不同信源的评分分歧，取低分且注明分歧

### 4. 矛盾检测
同一事件在两个不同维度得分矛盾：
- 例："机会分极高但可信度极低" → 调低最终置信度并标记"待复核"

### 5. 排序与排名
按综合分倒序排列，输出前 10 条最值得关注的事件。

## 输入参数

- `source_path` (string, default: "../data/raw/"): 源数据路径
- `min_score` (number, default: 0): 最低分筛选阈值
- `max_items` (integer, default: 10): 输出最大条数

## 输出

写入 `../data/risks.json`：
```json
[
  {
    "event": "某国拟对锂电池加征25%关税",
    "source": "news_20260512.json",
    "validated": true,
    "validation_ref": "validation_batch_001.json",
    "scores": {
      "market_impact": { "value": -2, "basis": "直接影响出口成本，引用某国贸易代表办公室公告" },
      "urgency": { "value": "短期本月", "basis": "提案已提交议会，预计6月表决" },
      "credibility": { "value": "官方确认", "basis": "tier1来源，wayback佐证" },
      "relevance": { "value": "强相关", "basis": "直接针对该行业主要出口市场" }
    },
    "risk_score": 1.7,
    "opportunity_score": 0.0,
    "confidence": 0.9,
    "contradiction": false,
    "interpretation_discrepancy": null,
    "followup_needed": true
  }
]
```

## 原则

- 每个维度评分必须有可追溯的依据
- 不同信源有评分分歧 → 取低分且注明分歧
- 同一事件矛盾评分（高分低可信） → 调低置信度并标记待复核
