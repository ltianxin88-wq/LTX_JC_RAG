import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('browser integration is type-checked against the official DSH client contract', async () => {
  const [source, css, tsconfigText] = await Promise.all([
    readFile(new URL('../src/client.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/client.css', import.meta.url), 'utf8'),
    readFile(new URL('../tsconfig.json', import.meta.url), 'utf8'),
  ])
  const tsconfig = JSON.parse(tsconfigText)

  assert.ok(tsconfig.include.includes('src/**/*.tsx'))
  assert.equal(tsconfig.compilerOptions.jsx, 'react-jsx')
  assert.match(source, /ClientContext.*@deepseek-ai\/cordis/)
  assert.match(source, /PropsRuntime.*@deepseek-ai\/dsh-client-ui-slots/)
  assert.match(source, /type ConversationSlotProps = PropsRuntime<'main\.conversation'>/)
  assert.match(source, /sidebar\.new-session\.action/)
  assert.match(source, /KnowledgeSessionLauncher/)
  assert.match(source, /KnowledgeAnswerSource/)
  assert.match(source, /已进入 Ltx JC RAG 知识库会话/)
  assert.match(source, /已退出 Ltx JC RAG 知识库会话/)
  assert.match(source, /mounts\/\$\{encodeURIComponent\(mount\.id\)\}/)
  assert.match(source, /根据 Ltx JC RAG 知识库回答/)
  assert.match(source, /KNOWLEDGE_SESSION_STRICT_MARKER/)
  assert.doesNotMatch(source, /ltx-jc-rag-workspace-close/)
  assert.match(css, /\.ltx-jc-rag-workspace-header \[data-xiaohei-workspace-close\]/)
  assert.match(css, /\.ltx-jc-rag-frame \{[\s\S]*?width: 100%;[\s\S]*?border: 0;[\s\S]*?box-shadow: none;/)
  assert.match(css, /\.ltx-jc-rag-trigger \{[\s\S]*?position: relative;[\s\S]*?max-width: 100%;[\s\S]*?width: 100%;/)
  assert.doesNotMatch(css, /width: calc\(100% \+ 8px\)|margin: 4px -4px/)
  assert.match(css, /\.ltx-jc-rag-trigger::before \{[\s\S]*?transform 720ms cubic-bezier\(\.2, \.72, \.2, 1\);/)
  assert.match(css, /\.ltx-jc-rag-trigger:hover::before \{[\s\S]*?translate3d\(320%, 0, 0\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.ltx-jc-rag-trigger::before \{ display: none; \}/)
  assert.match(css, /--knowledge-pane: rgb\(242 243 247 \/ 78%\)/)
  assert.match(css, /body\[data-ds-dark-theme\][\s\S]*--knowledge-pane: rgb\(8 10 12 \/ 19%\)/)
  assert.match(css, /\.ltx-jc-rag-answer-source \{[\s\S]*?var\(--knowledge-success\)/)
  assert.match(css, /\.ltx-jc-rag-session-notice button \{/)
  assert.doesNotMatch(source, /interface\s+(?:ClientContext|SlotService)\b/)
})
