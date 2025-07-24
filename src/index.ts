// 导入SDK中必要的模块和类型
import { basekit, field, FieldComponent, FieldType, FieldCode } from '@lark-opdev/block-basekit-server-api';

// --- 1. 声明域名白名单 ---
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

  // --- 2. 配置用户输入表单 (安全且UI正确版) ---
  formItems: [
    {
      key: 'userPromptTemplate',
      label: '用户提示词',
      component: FieldComponent.Input,
      props: { placeholder: '写下你的指令，并通过【⊕引用字段】来使用表格数据' },
      validator: { required: true }
    },
    {
      key: 'systemPrompt',
      label: '系统提示词 (选填)',
      component: FieldComponent.Input,
      props: { placeholder: '设定AI角色，如“你是一个专业的翻译家”' }
    },
    {
      key: 'modelId',
      label: '模型 ID (选填)',
      component: FieldComponent.Input,
      // 移除 defaultValue，让输入框默认为空
      props: { placeholder: '默认: THUDM/GLM-4-9B-0414' }, 
    },
    {
      key: 'apiUrl',
      label: 'API URL (选填)',
      component: FieldComponent.Input,
      props: { placeholder: '默认: https://api.siliconflow.cn/v1/chat/completions' }
    },
    {
      key: 'apiKey',
      label: 'API Key',
      component: FieldComponent.Input,
      // 移除 defaultValue，保证安全
      props: { placeholder: '请输入你的 sk-xxxx 密钥' }, 
      validator: { required: true }
    },
    {
      key: 'temperature',
      label: '温度 (选填)',
      component: FieldComponent.Input,
      // 移除 defaultValue
      props: { placeholder: '0到2之间，默认1.0' }, 
    },
    {
      key: 'maxTokens',
      label: '最大Token (选填)',
      component: FieldComponent.Input,
      props: { placeholder: '默认不限制' },
    },
  ],

  // --- 3. 定义返回结果的字段类型 ---
  resultType: {
    type: FieldType.Text,
  },

  // --- 4. 核心执行逻辑 (安全兜底版) ---
  execute: async (formItemParams, context) => {
    const { apiKey, modelId, apiUrl, systemPrompt, userPromptTemplate, temperature, maxTokens } = formItemParams;
    const { fetch, logID } = context;

    if (!apiKey || !userPromptTemplate) {
      return { code: FieldCode.ConfigError, msg: 'API Key and User Prompt are required.' };
    }
    
    // --- 在后端进行默认值兜底 ---
    const finalModelId = modelId && modelId.trim() !== '' ? modelId : 'THUDM/GLM-4-9B-0414';
    const API_URL = apiUrl && apiUrl.trim() !== '' ? apiUrl : 'https://api.siliconflow.cn/v1/chat/completions';
    const finalTemperature = temperature && temperature.trim() !== '' ? parseFloat(temperature) : 1.0;

    const inputText = userPromptTemplate;

    const messages: any[] = [];
    if (systemPrompt && systemPrompt.trim() !== '') {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: inputText });

    const requestBody: any = {
      model: finalModelId,
      messages: messages,
    };
    
    if (!isNaN(finalTemperature)) {
      requestBody.temperature = finalTemperature;
    }
    const maxTokensValue = parseInt(maxTokens, 10);
    if (!isNaN(maxTokensValue)) {
      requestBody.max_tokens = maxTokensValue;
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
      
      try {
        const trimmedResponse = aiResponseText.trim();
        if ((trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) || (trimmedResponse.startsWith('[') && trimmedResponse.endsWith(']'))) {
          const jsonObj = JSON.parse(trimmedResponse);
          aiResponseText = JSON.stringify(jsonObj, null, 2);
        }
      } catch (jsonError) {
        console.warn(`[LogID: ${logID}] Response content is not a valid JSON, returning raw text.`);
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