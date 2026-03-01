# 🎨 Doubao Skill for Openclaw - 完整指南

**Doubao Skill** 是一个为 Openclaw AI 框架定制的技能扩展，允许通过 Doubao API 进行文本生图和文本生视频的操作。

## 📋 快速导航

| 文件 | 用途 |
|------|------|
| **doubao_skill.py** | ⭐ Openclaw Python Skill 实现 |
| **doubao-skill.json** | Skill 清单和元数据 |
| **doubao_skill_examples.py** | 使用示例代码 |
| **README.md** | 本文件 - 快速开始指南 |
| **DOUBAO_SKILLREADME.md** | 完整 API 文档（如有） |

## 🚀 5分钟快速开始

### 步骤 1: 设置环境

```bash
# 设置 API Key
export ARK_API_KEY="your_api_key_here"

# 验证
echo $ARK_API_KEY
```

### 步骤 2: 安装依赖

```bash
pip install requests aiohttp
```

### 步骤 3: 在 Python 中使用

```python
import asyncio
from doubao_skill import handler

async def main():
    # 文生图
    result = await handler({
        "action": "img",
        "prompt": "一只可爱的小猫"
    })
    print(result)

asyncio.run(main())
```

### 步骤 4: 查看示例

```bash
python doubao_skill_examples.py
```

## 📖 API 使用指南

### 文生图（Image Generation）

```python
result = await handler({
    "action": "img",
    "prompt": "一只可爱的小猫在海边"
})

# 返回示例:
# {
#   "status": "success",
#   "image_url": "https://...",
#   "prompt": "一只可爱的小猫在海边"
# }
```

### 文生视频 - 异步模式

```python
result = await handler({
    "action": "vid",
    "prompt": "一个人在跳舞",
    "sync_mode": "async"
})

# 返回示例:
# {
#   "status": "success",
#   "task_id": "task_xxxxx",
#   "prompt": "一个人在跳舞"
# }
```

### 文生视频 - 同步模式

```python
result = await handler({
    "action": "vid",
    "prompt": "一个人在跳舞",
    "sync_mode": "sync"  # 等待完成
})

# 返回示例:
# {
#   "status": "success",
#   "result_url": "https://...",
#   "prompt": "一个人在跳舞"
# }
```

### 检查任务状态

```python
result = await handler({
    "action": "status",
    "task_id": "task_xxxxx"
})

# 返回示例:
# {
#   "status": "running",
#   "progress": 50,
#   "task_id": "task_xxxxx"
# }
```

## 🎯 参数速查表

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| action | string | ✅ | 操作: "img" / "vid" / "status" |
| prompt | string | ✅* | 生成提示词 |
| sync_mode | string | ❌ | "sync" 或 "async"（仅vid） |
| image_url | string | ❌ | 参考图片URL（仅vid） |
| task_id | string | ✅** | 任务ID（仅status） |

*: 当 action 为 "img" 或 "vid" 时必需
**: 当 action 为 "status" 时必需

## 💡 常见场景

### 场景 1: 在 Openclaw 对话中生成图片

```python
async def handle_image_request(user_message):
    if "生成图片" in user_message:
        result = await handler({
            "action": "img",
            "prompt": extract_prompt(user_message)
        })
        if result["status"] == "success":
            return f"图片已生成: {result['image_url']}"
```

### 场景 2: 批量生成图片

```python
import asyncio

prompts = [
    "一只可爱的小猫",
    "一个美丽的日落",
    "一座寒冷的山峰"
]

async def batch_generate():
    tasks = [
        handler({"action": "img", "prompt": p})
        for p in prompts
    ]
    results = await asyncio.gather(*tasks)
    return results
```

### 场景 3: 生成视频并监控进度

```python
async def generate_and_monitor(prompt):
    # 1. 启动视频生成
    response = await handler({
        "action": "vid",
        "prompt": prompt,
        "sync_mode": "async"
    })
    
    task_id = response["task_id"]
    
    # 2. 轮询检查状态
    for i in range(30):  # 最多等待 5 分钟
        await asyncio.sleep(10)
        
        status = await handler({
            "action": "status",
            "task_id": task_id
        })
        
        print(f"进度: {status.get('progress')}%")
        
        if status["status"] == "succeeded":
            return status["result_url"]
```

## 🐛 故障排除

### 问题 1: "401 Unauthorized"

```bash
# 检查 API Key
echo $ARK_API_KEY

# 重新设置
export ARK_API_KEY="your_correct_key"
```

### 问题 2: "400 Bad Request"

```bash
# 检查网络连接
curl -I https://ark.cn-beijing.volces.com/

# 试试简单的提示词
python -c "
import asyncio
from doubao_skill import handler
asyncio.run(handler({'action': 'img', 'prompt': 'test'}))
"
```

### 问题 3: 视频一直处于 "running" 状态

```bash
# 这是正常的，视频生成通常需要 1-3 分钟
# 使用 sync_mode='sync' 让 skill 自动等待

python -c "
import asyncio
from doubao_skill import handler
result = asyncio.run(handler({
    'action': 'vid',
    'prompt': '测试',
    'sync_mode': 'sync'
}))
print(result)
"
```

## 📚 详细文档

- 查看 `doubao_skill_examples.py` 了解完整的代码示例
- 查看 `doubao-skill.json` 了解 Skill 元数据配置
- 关于 ARK API 的更多信息，访问 volcengine.com

## 🔐 安全性提示

1. ✅ **不要硬编码 API Key**
   ```python
   # ❌ 错误
   ARK_API_KEY = "sk-xxxx"
   
   # ✅ 正确
   import os
   ARK_API_KEY = os.getenv("ARK_API_KEY")
   ```

2. ✅ **使用环境变量**
   ```bash
   export ARK_API_KEY="your_key"
   ```

## 📊 性能指标

- **文生图**: 通常 10-30 秒
- **文生视频**: 通常 1-3 分钟
- **状态查询**: 即时
- **并发支持**: 支持多个并发请求
- **超时设置**: 视频默认 10 分钟超时

## 🆘 获取帮助

- 查看示例代码: `python doubao_skill_examples.py`
- 检查错误日志: 查看返回的 error 字段
- 验证 API Key: `echo $ARK_API_KEY`

---

**版本**: 1.0.0  
**最后更新**: 2024年  
**作者**: Doubao Skill Team
