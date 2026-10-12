# Ltx JC RAG 知识库插件

`ltx-jc-rag` 是基于 `dsh-knowledge` 改造的 DeepSeek Harness / DSH 本地优先 RAG 插件。数据写入当前 DSH profile 的 SQLite，管理台从左侧“Ltx JC RAG 知识库”入口打开；远程 Provider 保留为显式配置的可选能力。

## 当前改造

- 包名：`ltx-jc-rag`
- Cordis 插件 id：`ltx-jc-rag`
- 默认管理页：`/ltx-jc-rag`
- 默认本地管理 API：`/ltx-jc-rag-local/v1`
- 默认公开 API 前缀：`/ltx-jc-rag-api/v1`
- 控制接口：`/ltx-jc-rag-control/v1/connection`
- 默认数据目录：`dshHomePath('ltx-jc-rag/knowledge.sqlite')`
- 默认连接配置：`dshHomePath('ltx-jc-rag/connection.json')`
- 浏览器端入口和设置卡片显示为 `Ltx JC RAG 知识库`

## 功能概览

- 多知识库管理，支持名称、描述、默认标签和提取要求。
- 项目和会话挂载，支持召回、审核写入、直接写入和标签过滤。
- 支持会话级知识库挂载、召回、审核写入、直接写入和标签过滤。
- 回答结束后独立提取可沉淀知识，不把回写过程混入主模型上下文。
- 自动召回挂载知识库中的相关摘要，完整内容可通过工具读取。
- Markdown 文档管理、候选审核、版本历史、归档、封存和重新打开。
- 独立笔记工作区，支持目录、Markdown/文本编辑、文件上传和知识文档关联。
- 可选认证 HTTP API 和远程 Provider，供后续中央知识库模式使用。

## 本地安装

在本目录构建并安装到 DSH profile：

```bash
npm install
npm test
npm run pack:check
dsh plugin --profile web add ./ltx-jc-rag-0.2.0.tgz
```

如果只想从源码目录安装，可在 DSH 支持本地目录安装时使用：

```powershell
dsh plugin --profile web add D:\work\dpseekdesok\ltx-jc-rag
```

安装或更新后重启对应 profile。Web profile 常见启动命令：

```bash
pnpm dsh web
```

卸载：

```bash
dsh plugin --profile web remove ltx-jc-rag
```

## 默认配置

`cordis.patch.yml` 会以本地模式插入插件：

```yaml
- insert:
    - id: ltx-jc-rag
      name: 'ltx-jc-rag'
      config:
        backend: local
        databasePath: !!js dshHomePath('ltx-jc-rag/knowledge.sqlite')
        connectionPath: !!js dshHomePath('ltx-jc-rag/connection.json')
        exposeApi: false
        exposeWeb: true
        webPath: /ltx-jc-rag
        apiPrefix: /ltx-jc-rag-api/v1
        extractionEnabled: true
```

## 开发

要求 Node.js `^22.19.0 || >=24.0.0`。

```bash
npm install
npm run build
npm test
npm run pack:check
```

当前 Windows 环境下测试已经对 SQLite 临时文件释放做了 teardown 重试处理，避免 `EBUSY` 造成误报。

开发范围和验收标准见 [开发任务计划](./DEVELOPMENT_PLAN.md)。提交规范见 [贡献说明](./CONTRIBUTING.md)。

## 数据、隐私与迁移

- 默认数据仅保存在当前 DSH profile 的 `ltx-jc-rag/` 目录中。
- `Ltx_JC_RAG` 不会自动读取、移动或删除旧 `jczte-dsh-knowledge/` 目录的数据。
- 如需继续使用旧知识库，请按照 [迁移说明](./docs/MIGRATION_FROM_JCZTE.md) 显式导入或备份；卸载插件前请先导出需要保留的数据。
- 当前版本不会把远程服务、对话内容或令牌发送到外部，除非用户明确配置远程 Provider 或启用模型回写。

## 来源

本插件从 `https://github.com/lemoncat7/dsh-knowledge` 改造而来，保留 MIT License。Ltx JC RAG 分支优先服务本地知识库和后续企业内网中央化改造。
