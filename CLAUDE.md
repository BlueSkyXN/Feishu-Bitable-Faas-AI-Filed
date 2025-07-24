# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Feishu (Lark) Bitable custom field extension that adds AI functionality. It's built using the Lark OpenDev Block BaseKit framework and creates a custom field that can process text through various AI models.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Test the field execution locally
npm run dev

# Build the extension
npm run build

# Package for distribution
npm run pack
```

The `npm run pack` command creates `output/output.zip` which is the deployable package.

## Architecture

### Core Structure
- **Single entry point**: `src/index.ts` - Contains the complete field implementation
- **Block BaseKit SDK**: Uses `@lark-opdev/block-basekit-server-api` for field creation and framework integration
- **Node SDK**: Uses `@lark-base-open/node-sdk` for Lark platform integration

### Key Components

**Field Configuration (`formItems`)**:
- API authentication (API Key, Model ID, API URL)
- Prompt configuration (System prompt, User prompt template)
- Model parameters (Temperature, Max Tokens)

**Field Execution Logic**:
- Dynamic prompt template replacement using `{field_name}` syntax
- Support for multiple AI providers via configurable API URLs
- Built-in JSON response formatting
- Comprehensive error handling and logging

**Domain Whitelist**:
The extension pre-configures access to major AI providers:
- SiliconFlow, OpenAI, Anthropic, Google
- Mistral, Groq, Perplexity, Replicate
- Chinese providers: GLM, Baidu, Moonshot, MiniMax, iFlytek, Volcengine, 01.AI, StepFun, Alibaba

### Template System
The user prompt template supports field references using `{field_name}` syntax. The framework automatically replaces these with actual field values during execution.

## Development Notes

- Uses TypeScript with CommonJS module system
- Target: ES2020 with Node.js module resolution
- The CLI tool `block-basekit-cli` handles all build, dev, and packaging operations
- Extension runs in Lark's sandboxed environment with network access limited to whitelisted domains

## Error Handling
The extension returns structured responses with `FieldCode` status:
- `FieldCode.Success`: Successful execution
- `FieldCode.ConfigError`: Missing required configuration
- `FieldCode.Error`: Runtime or API errors