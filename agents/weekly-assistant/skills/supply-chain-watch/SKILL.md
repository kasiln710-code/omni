---
name: supply-chain-watch
description: 关注原材料供需、价格、产能、物流、进出口限制等供应链动态。
---

# Supply Chain Watch

关注原材料供需、价格、产能、物流、出口/进口限制。

## 何时触发

- **自动**：每周一 11:00（整合上周数据）
- **手动**：通过 `supply-chain-watch --commodity "碳酸锂"` 触发

## 工作流程

### 1. 获取大宗商品价格
从公开 API 获取价格序列（如 EIA / World Bank / 上海有色网）：
- 优先专用 API
- 备选：web_search 搜索最新报价

### 2. 异常波动检测
使用统计方法检测价格异常：
- 方法: **3-sigma vs 90日移动平均**
- 若价格偏离超过阈值 → 标记异常

### 3. 外部归因验证
如果价格异常 > 10%，必须找到至少一个外部归因才可输出：
- 天气事件（洪水/台风影响矿区）
- 罢工/停产事件
- 政策调整（关税/出口禁令）
- 物流瓶颈（港口拥堵/运价飙升）

**禁止无依据归因** — 找不到外部原因则输出"价格异常波动，原因待查明"。

### 4. 出口/进口限制扫描
搜索近期关于目标原材料的：
- 出口禁令/许可制度变化
- 关税调整
- 港口拥堵/运价变化
- 地缘政治影响

### 5. 产能与供需动态
关注：
- 新建/停产产能
- 主要厂商库存变化
- 下游需求变化信号

## 输入参数

- `commodities` (array of strings): 关注的商品列表
- `price_lookback_days` (integer, default: 90): 价格回溯天数

## 输出

写入 `../data/raw/supply_chain_{date}.json`：
```json
{
  "commodity": "碳酸锂",
  "current_price": 85000,
  "unit": "元/吨",
  "change_7d": "+3.2%",
  "change_30d": "-5.1%",
  "abnormal_flag": false,
  "external_causes": [],
  "restrictions": [
    { "type": "export_ban", "country": "智利", "detail": "...", "url": "..." }
  ],
  "capacity_news": [
    { "event": "新增产能", "company": "赣锋锂业", "detail": "...", "url": "..." }
  ]
}
```

## 原则

- 价格异常 > 10% 必须找到外部归因才可输出
- 禁止无依据归因（block_unattributed_cause）
- 关注供需基本面的真实变化，而非市场情绪
