---
name: entity-dedup
description: 公司、人名、机构、产品、政策文件的标准化和去重，避免重复入库。
---

# Entity Dedup

对公司、人名、机构、产品、政策文件统一实体化，消除重复。

## 何时触发

- **按需** — 由 `weekly-summarizer` 或手动调用
- 自动在 `risk-scorer` 之前执行

## 工作流程

### 1. 收集候选实体
扫描 `../data/raw/` 下所有 `*.json` 文件，提取其中的实体引用：
- 公司名（如"宁德时代"、"CATL"）
- 人名（如"Elon Musk"、"埃隆·马斯克"）
- 机构名（如"国家发改委"、"NDRC"）
- 产品名（如"刀片电池"、"Blade Battery"）
- 政策文件（如"国发〔2026〕12号"）

### 2. 名称归一化
使用 LLM 将同义/异名的实体映射为标准名称：
- 中英文映射: "CATL" → "宁德时代"
- 全称/简称映射: "国家发改委" → "国家发展和改革委员会"
- 不同翻译映射: "Elon Musk" ↔ "埃隆·马斯克"

### 3. 模糊匹配去重
使用 RapidFuzz（或类似算法）与历史实体库比对：
- 相似度阈值: 85%
- 若两个实体名相似度 > 90% 但属不同行业 → 拆分保留，不合并
- 无法判定时 → 创建 `ambiguous_entity` 并交由人工

### 4. 冲突解决规则
基于规则处理实体冲突：
```
- 相似度 > 90% 且同行业 → 合并为标准名称
- 相似度 > 90% 但不同行业 → 拆分保留，不合并
- 无法判定 → 标记 ambiguous，交人工
```

### 5. 索引更新
输出带有证据链的实体索引：
- 每个归一化后的实体附带一个来源示例（原文片段）
- 更新实体索引 `../data/entities_index.json`

## 输入参数

- `source_path` (string, default: "../data/raw/"): 源数据路径
- `entity_types` (array, optional): 限定实体类型 [company, person, organization, product, policy]

## 输出

写入 `../data/entities_index.json`：
```json
[
  {
    "standard_name": "宁德时代新能源科技股份有限公司",
    "aliases": ["宁德时代", "CATL", "Contemporary Amperex Technology"],
    "type": "company",
    "industry": "新能源电池",
    "source_examples": [
      { "file": "news_20260512.json", "snippet": "宁德时代发布第三代CTP技术" }
    ],
    "confidence": 1.0,
    "ambiguous": false
  }
]
```

## 原则

- 中英文同名映射到标准中文名
- 跨行业同名 → 拆分保留，不强行合并
- 无法判定 → 标记 ambiguous 交由人工
- 每个归一化后的实体必须有来源证据
