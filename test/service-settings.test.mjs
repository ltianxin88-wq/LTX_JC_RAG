import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { loadServiceSettings, serviceSettingsPath, storeServiceSettings } from '../lib/service-settings.js'

test('client-local service and write-back model settings persist in a private atomic file', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ltx-jc-rag-service-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const path = serviceSettingsPath(join(root, 'connection.json'))
  assert.equal(loadServiceSettings(path), undefined)
  await storeServiceSettings(path, {
    publicApiEnabled: true,
    autoMountDefaultKnowledgeBase: false,
    writebackProvider: 'cli',
    writebackModel: 'gpt-5.6-luna',
  })
  assert.deepEqual(loadServiceSettings(path), {
    publicApiEnabled: true,
    autoMountDefaultKnowledgeBase: false,
    writebackProvider: 'cli',
    writebackModel: 'gpt-5.6-luna',
  })
  if (process.platform !== 'win32') assert.equal((await stat(path)).mode & 0o777, 0o600)
})

test('client-local service settings default the auto-mount toggle when the stored file predates it', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'ltx-jc-rag-service-legacy-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const path = serviceSettingsPath(join(root, 'connection.json'))
  await writeFile(path, `${JSON.stringify({ publicApiEnabled: false }, null, 2)}\n`)
  const raw = JSON.parse(await readFile(path, 'utf8'))
  delete raw.autoMountDefaultKnowledgeBase
  await writeFile(path, `${JSON.stringify(raw, null, 2)}\n`)
  assert.deepEqual(loadServiceSettings(path), {
    publicApiEnabled: false,
    autoMountDefaultKnowledgeBase: true,
  })
})
