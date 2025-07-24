// 导入SDK中必要的模块和类型
import { basekit, field, FieldComponent, FieldType, FieldCode } from '@lark-opdev/block-basekit-server-api';

// --- 1. 声明需要请求的外部API域名白名单 ---
basekit.addDomainList([

  // 作者
  'blueskyxn.com', // 项目作者的自己API域名

  // 国外AI
  'api.openai.com', // OpenAI
  'api.anthropic.com',  // Anthropic
  'generativelanguage.googleapis.com', // Gemini
  'mistral.ai', // Mistral AI
  'api.groq.com', // Groq
  'api.perplexity.ai', // Perplexity AI
  'replicate.com', // Replicate
  'gateway.ai.cloudflare.com', // Cloudflare AI Gateway
  'worker.dev', // Cloudflare Worker
  'cohere.ai', // Cohere
  'openrouter.ai', // OpenRouter
  'hf.spaces', // Hugging Face Spaces
  'api.huggingface.co', // Hugging Face API
  'integrate.api.nvidia.com', // NVIDIA AI

  // 国内AI
  'api.siliconflow.cn', // 硅基流动
  'open.bigmodel.cn',    // 智谱AI
  'qianfan.baidubce.com',   // 百度智能云 (文心千帆)
  'api.moonshot.cn',    // 月之暗面 (Kimi)
  'api.minimax.chat',   // MiniMax
  'xf-yun.cn',      // 讯飞星火
  'api.baichuan-ai.com', // 百川智云
  'ark.cn-beijing.volces.com',     // 火山引擎 (豆包)
  'api.lingyiwanwu.com',          // 零一万物
  'dashscope.aliyuncs.com',   // 阿里云
  'api.deepseek.com',   // DeepSeek AI
  'api.lkeap.cloud.tencent.com',   // 腾讯云
  'api.hunyuan.cloud.tencent.com',   // 腾讯云
  'api.stepfun.com', // 阶跃星辰

]);

basekit.addField({

  // --- 2. 配置用户输入表单 (带高级配置) ---
  formItems: [
    {
      key: 'apiKey',
      label: 'API Key', // 标签改为更通用
      component: FieldComponent.Input,
      props: { placeholder: '请输入你的 API 密钥' },
      validator: { required: true }
    },
    {
      key: 'modelId',
      label: '模型 ID',
      component: FieldComponent.Input,
      props: { placeholder: '例如：THUDM/GLM-4-9B-0414' },
      defaultValue: 'THUDM/GLM-4-9B-0414',
      validator: { required: true }
    },
    {
      key: 'prompt',
      label: '输入内容',
      component: FieldComponent.FieldSelect,
      props: { supportType: [FieldType.Text] },
      validator: { required: true }
    },
    // --- 【新增】允许用户自定义API URL ---
    {
      key: 'apiUrl',
      label: 'API URL (可选)',
      component: FieldComponent.Input,
      props: { placeholder: '默认：https://api.siliconflow.cn/v1/chat/completions' }
    },
    
    // --- 高级配置 ---
    {
      key: 'temperature',
      label: '温度 (Temperature)',
      component: FieldComponent.Input,
      props: { placeholder: '0 到 2 之间，默认 1.0' },
      defaultValue: '1.0'
    },
    {
      key: 'maxTokens',
      label: '最大 Token (Max Tokens)',
      component: FieldComponent.Input,
      props: { placeholder: '默认不限制' },
    },
    {
      key: 'advancedOptions',
      label: '其他选项',
      component: FieldComponent.MultipleSelect,
      props: {
        options: [
          { label: '启用 JSON 模式', value: 'json_mode' }
        ]
      }
    }
  ],

  // --- 3. 定义返回结果的字段类型 ---
  resultType: {
    type: FieldType.Text,
  },

  // --- 4. 核心执行逻辑 (最终版) ---
  execute: async (formItemParams, context) => {
    // 【新增】解构出 apiUrl
    const { apiKey, modelId, prompt, apiUrl, temperature, maxTokens, advancedOptions } = formItemParams;
    const { fetch, logID } = context;

    if (!apiKey || !modelId || !prompt || prompt.length === 0) {
      return { code: FieldCode.ConfigError, msg: 'API Key, Model ID, and Prompt are required.' };
    }
    
    const inputText = prompt.map(p => p.text).join('\n');
    // 【修改】如果用户没有提供 API URL，则使用默认的 SiliconFlow 地址
    const API_URL = apiUrl && apiUrl.trim() !== '' ? apiUrl : 'https://api.siliconflow.cn/v1/chat/completions';

    const requestBody: any = {
      model: modelId,
      messages: [
        { role: "user", content: inputText },
      ],
    };

    const tempValue = parseFloat(temperature);
    if (!isNaN(tempValue) && temperature.trim() !== '') {
      requestBody.temperature = tempValue;
    }

    const maxTokensValue = parseInt(maxTokens, 10);
    if (!isNaN(maxTokensValue) && maxTokens.trim() !== '') {
      requestBody.max_tokens = maxTokensValue;
    }

    const useJsonMode = advancedOptions && advancedOptions.some(option => option.value === 'json_mode');
    if (useJsonMode) {
      requestBody.response_format = { type: "json_object" };
    }

    console.log(`[LogID: ${logID}] Sending request to ${API_URL} with body:`, JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LogID: ${logID}] API request failed. Status: ${response.status}. Response: ${errorText}`);
        return { code: FieldCode.Error, msg: `API Error (${response.status}): ${errorText}` };
      }

      const result = await response.json();
      console.log(`[LogID: ${logID}] Received full response from API:`, JSON.stringify(result, null, 2));
      
      let aiResponseText = result.choices[0]?.message?.content ?? 'No content received from AI.';
      
      if (useJsonMode) {
        try {
          const jsonObj = JSON.parse(aiResponseText);
          aiResponseText = JSON.stringify(jsonObj, null, 2);
        } catch (jsonError) {
          console.warn(`[LogID: ${logID}] Failed to parse JSON response, returning raw text.`);
        }
      }

      return {
        code: FieldCode.Success,
        data: aiResponseText,
      };

    } catch (e) {
      console.error(`[LogID: ${logID}] An unexpected error occurred:`, e);
      return { code: FieldCode.Error, msg: `Execution failed: ${e.message}` };
    }
  },
});

export default basekit;