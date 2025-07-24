# 飞书多维表格 AI 自定义字段

一个为飞书多维表格创建的AI自定义字段扩展，支持多种AI模型提供商，让你的表格数据处理更智能。

## 功能特性

✨ **多AI供应商支持**：集成国内外主流AI服务商  
🔧 **灵活配置**：可自定义API、模型、提示词等参数  
📝 **模板系统**：支持字段引用的动态提示词模板  
🛡️ **安全稳定**：内置错误处理和域名白名单机制  
📦 **开箱即用**：基于飞书框架开发  

## 支持的AI服务商

目前只兼容标准OpenAI API的服务商，白名单包括下面这些

### 国外服务商
- OpenAI (GPT系列)
- Anthropic (Claude系列)
- Google (Gemini系列)
- Mistral AI
- Groq
- Perplexity AI
- Replicate
- Cohere
- OpenRouter
- Hugging Face

### 国内服务商
- 硅基流动 (SiliconFlow)
- 智谱AI (GLM)
- 百度智能云 (文心千帆)
- 月之暗面 (Kimi)
- MiniMax
- 讯飞星火
- 百川智云
- 火山引擎 (豆包)
- 零一万物 (01.AI)
- 阿里云 (通义千问)
- DeepSeek AI
- 腾讯云 (混元)
- 阶跃星辰 (StepFun)

## 快速开始

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发调试

```bash
# 启动开发服务器
npm start

# 本地测试字段执行
npm run dev
```

### 构建部署

```bash
# 构建项目
npm run build

# 打包扩展
npm run pack
```

打包完成后，在 `output/output.zip` 找到可部署的扩展包。

## 使用说明

### 配置参数

创建自定义字段时，需要配置以下参数：

- **API Key**：AI服务商的API密钥
- **模型ID**：要使用的具体模型名称
- **API URL**：AI服务的API端点地址
- **系统提示词**：定义AI的角色和行为
- **用户提示词模板**：支持 `{字段名}` 语法引用其他字段
- **温度值**：控制生成文本的随机性 (0-1)
- **最大令牌数**：限制生成文本的长度


## 项目结构

```
├── src/
│   └── index.ts          # 主要字段实现
├── output/               # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
└── CLAUDE.md            # 开发指南
```