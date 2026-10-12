import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { LOCAL_MANAGEMENT_API_PREFIX, registerKnowledgeApi } from '../lib/api.js'
import { LocalKnowledgeProvider } from '../lib/local-provider.js'

test('same-origin management API controls public access and deletes revoked tokens', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ltx-jc-rag-management-'))
  const provider = new LocalKnowledgeProvider(join(root, 'knowledge.sqlite'))
  let enabled = false
  let handler
  const ctx = {
    webServer: { register(route) { handler = route.handler; return () => {} } },
    get() { return undefined },
  }
  registerKnowledgeApi(ctx, provider, LOCAL_MANAGEMENT_API_PREFIX, {
    authMode: 'same-origin',
    service: {
      current: () => ({ publicApiEnabled: enabled, publicApiPrefix: '/knowledge-api/v1' }),
      async update(patch) {
        enabled = patch.publicApiEnabled ?? enabled
        return { publicApiEnabled: enabled, publicApiPrefix: '/knowledge-api/v1', ...(patch.writebackProvider && patch.writebackModel ? { writebackProvider: patch.writebackProvider, writebackModel: patch.writebackModel } : {}) }
      },
    },
  })
  const server = createServer((req, res) => void handler(req, res))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const base = `http://127.0.0.1:${address.port}${LOCAL_MANAGEMENT_API_PREFIX}`
  t.after(async () => {
    await new Promise(resolve => server.close(resolve))
    await provider.close()
    await rm(root, { recursive: true, force: true })
  })

  assert.equal((await fetch(`${base}/service`)).status, 401)
  assert.equal((await fetch(`${base}/service`, {
    headers: { 'x-ltx-jc-rag-client': 'management-web', 'sec-fetch-site': 'cross-site' },
  })).status, 403)

  const headers = { 'x-ltx-jc-rag-client': 'management-web' }
  const folderResponse = await fetch(`${base}/notes/folders`, {
    method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ name: '项目资料', parentId: null }),
  })
  assert.equal(folderResponse.status, 201)
  const folder = await folderResponse.json()
  const noteContent = Buffer.from('# 原始部署笔记\n\n内容默认不参与知识索引。')
  const uploadedResponse = await fetch(`${base}/notes/files?name=${encodeURIComponent('部署笔记.md')}&parentId=${folder.id}`, {
    method: 'POST', headers: { ...headers, 'content-type': 'text/markdown' }, body: noteContent,
  })
  assert.equal(uploadedResponse.status, 201)
  const note = await uploadedResponse.json()
  assert.match(note.id, /^note_[a-f0-9]{32}$/)
  assert.equal(note.name, '部署笔记.md')
  assert.equal((await (await fetch(`${base}/notes?parentId=${folder.id}&limit=20`, { headers })).json())[0].id, note.id)
  const downloaded = await fetch(`${base}/notes/${note.id}/content`, { headers })
  assert.equal(downloaded.headers.get('content-type'), 'text/markdown')
  assert.match(downloaded.headers.get('content-disposition'), /inline/)
  assert.equal(downloaded.headers.get('content-security-policy'), "sandbox; default-src 'none'")
  assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), noteContent)
  const revisedNoteContent = Buffer.from('# 更新后的部署笔记\n\n现在可以在笔记工作区直接编辑。')
  const updatedNoteResponse = await fetch(`${base}/notes/${note.id}/content`, {
    method: 'PUT', headers: { ...headers, 'content-type': 'text/markdown' }, body: revisedNoteContent,
  })
  assert.equal(updatedNoteResponse.status, 200)
  assert.equal((await updatedNoteResponse.json()).size, revisedNoteContent.byteLength)
  assert.deepEqual(Buffer.from(await (await fetch(`${base}/notes/${note.id}/content`, { headers })).arrayBuffer()), revisedNoteContent)

  const entry = await (await fetch(`${base}/entries`, {
    method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ draft: {
      knowledgeBaseId: 'default', title: '笔记引用测试',
      body: '依据独立关联的原始部署资料。',
      type: 'fact', tags: ['note'], scope: { kind: 'global' }, confidence: 0.9,
    } }),
  })).json()
  const linkedResponse = await fetch(`${base}/entries/${entry.id}/note-references`, {
    method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ noteId: note.id }),
  })
  assert.equal(linkedResponse.status, 201)
  const linked = await linkedResponse.json()
  assert.equal(linked.note.id, note.id)
  assert.equal(linked.source, 'user')
  assert.equal((await (await fetch(`${base}/entries/${entry.id}/note-references`, { headers })).json())[0].note.id, note.id)
  assert.doesNotMatch((await (await fetch(`${base}/entries/${entry.id}`, { headers })).json()).body, /note:\/\//)
  const documentIndex = await (await fetch(`${base}/document-index?knowledgeBaseId=default&limit=1`, { headers })).json()
  assert.equal(documentIndex.total, 1)
  assert.equal(documentIndex.items[0].id, entry.id)
  assert.equal(Object.hasOwn(documentIndex.items[0], 'content'), false)
  const references = await (await fetch(`${base}/notes/${folder.id}/references`, { headers })).json()
  assert.deepEqual(references.map(item => item.documentId), [entry.id])
  assert.equal((await fetch(`${base}/notes/${folder.id}`, { method: 'DELETE', headers })).status, 409)
  assert.equal((await fetch(`${base}/entries/${entry.id}/note-references/${note.id}`, { method: 'DELETE', headers })).status, 204)
  assert.deepEqual(await (await fetch(`${base}/entries/${entry.id}/note-references`, { headers })).json(), [])
  assert.equal((await fetch(`${base}/notes/${folder.id}`, { method: 'DELETE', headers })).status, 204)

  assert.equal((await (await fetch(`${base}/settings`, { headers })).json()).writebackPolicy, 'conservative')
  const policy = await (await fetch(`${base}/settings`, {
    method: 'PUT', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ patch: { writebackPolicy: 'proactive' } }),
  })).json()
  assert.equal(policy.writebackPolicy, 'proactive')
  const initial = await (await fetch(`${base}/service`, { headers })).json()
  assert.deepEqual(initial, { publicApiEnabled: false, publicApiPrefix: '/knowledge-api/v1' })
  const updated = await (await fetch(`${base}/service`, {
    method: 'PUT', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ publicApiEnabled: true }),
  })).json()
  assert.equal(updated.publicApiEnabled, true)

  const created = await (await fetch(`${base}/tokens`, {
    method: 'POST', headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'test client', permissions: ['read'] }),
  })).json()
  const tokenId = created.record.id
  assert.equal((await fetch(`${base}/tokens/${tokenId}`, { method: 'DELETE', headers })).status, 204)
  assert.ok(provider.listApiTokens().find(token => token.id === tokenId)?.revokedAt)
  assert.equal((await fetch(`${base}/tokens/${tokenId}`, { method: 'DELETE', headers })).status, 204)
  assert.equal(provider.listApiTokens().some(token => token.id === tokenId), false)
})

test('same-origin management API imports local knowledge files', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ltx-jc-rag-import-'))
  const provider = new LocalKnowledgeProvider(join(root, 'knowledge.sqlite'))
  let handler
  const ctx = {
    webServer: { register(route) { handler = route.handler; return () => {} } },
    get() { return undefined },
  }
  registerKnowledgeApi(ctx, provider, LOCAL_MANAGEMENT_API_PREFIX, { authMode: 'same-origin' })
  const server = createServer((req, res) => void handler(req, res))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const base = `http://127.0.0.1:${address.port}${LOCAL_MANAGEMENT_API_PREFIX}`
  const headers = { 'x-ltx-jc-rag-client': 'management-web', 'content-type': 'application/json' }
  t.after(async () => {
    await new Promise(resolve => server.close(resolve))
    await provider.close()
    await rm(root, { recursive: true, force: true })
  })

  const auditResponse = await fetch(`${base}/import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mode: 'audit',
      knowledgeBaseId: 'default',
      type: 'fact',
      tags: ['ltx-jc-rag'],
      files: [
        { name: 'vpn.md', mediaType: 'text/markdown', content: '# VPN\n\n内网访问需要使用指定 VPN。' },
        { name: 'rows.jsonl', content: '{"title":"堡垒机","body":"生产环境登录需要经过堡垒机。"}\n{"title":"坏记录"}\n' },
      ],
    }),
  })
  assert.equal(auditResponse.status, 200)
  const audit = await auditResponse.json()
  assert.equal(audit.mode, 'audit')
  assert.equal(audit.imported, 2)
  assert.equal(audit.candidates, 2)
  assert.equal(audit.failed, 1)
  assert.deepEqual(audit.items.map(item => item.status), ['candidate', 'candidate', 'failed'])

  const candidates = await (await fetch(`${base}/candidates?status=pending`, {
    headers: { 'x-ltx-jc-rag-client': 'management-web' },
  })).json()
  assert.equal(candidates.length, 2)
  assert.ok(candidates.some(candidate => candidate.draft.title === 'vpn' && candidate.draft.tags.includes('ltx-jc-rag')))
  assert.ok(candidates.some(candidate => candidate.draft.title === '堡垒机'))

  const directResponse = await fetch(`${base}/import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mode: 'direct',
      knowledgeBaseId: 'default',
      type: 'procedure',
      tags: 'Ltx JC RAG,导入',
      files: [
        { name: 'rules.json', mediaType: 'application/json', content: JSON.stringify([{ title: '直接写入规范', content: '导入模式为 direct 时立即进入正式知识库。', type: 'procedure' }]) },
        { name: 'table.csv', content: 'title,body,tags\nCSV 规范,CSV 会按表头识别字段,csv' },
      ],
    }),
  })
  assert.equal(directResponse.status, 200)
  const direct = await directResponse.json()
  assert.equal(direct.mode, 'direct')
  assert.equal(direct.entries, 2)
  assert.equal(direct.failed, 0)

  const documentIndex = await (await fetch(`${base}/document-index?knowledgeBaseId=default&limit=10`, {
    headers: { 'x-ltx-jc-rag-client': 'management-web' },
  })).json()
  assert.ok(documentIndex.items.some(item => item.title === '直接写入规范'))
  assert.ok(documentIndex.items.some(item => item.title === 'CSV 规范'))

  const largeImportResponse = await fetch(`${base}/import`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      mode: 'direct',
      knowledgeBaseId: 'default',
      type: 'fact',
      files: [{ name: '核心网IMS题库_内部学习.md', content: `# 核心网 IMS 题库\n\n${'题目内容\n'.repeat(20_000)}` }],
    }),
  })
  assert.equal(largeImportResponse.status, 200)
  const largeImport = await largeImportResponse.json()
  assert.ok(largeImport.entries > 1)
  assert.equal(largeImport.failed, 0)
  assert.ok(largeImport.items.every(item => /^核心网IMS题库_内部学习 \(\d+\/\d+\)$/u.test(item.title)))
})
