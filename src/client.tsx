import { useCallback, useEffect, useRef, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { activatePluginWorkspace, observePluginWorkspace } from './workspace-ownership.js'
import {
  IconChevronLeftOutlineRegular as IconChevronLeftOutline14,
  IconDataOutlineRegular as IconDataOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import cssText from './client.css'
import { KNOWLEDGE_SETTINGS_NAMESPACE } from './constants.js'
import {
  createKnowledgeHostTheme,
  KNOWLEDGE_THEME_PROTOCOL_VERSION,
  KNOWLEDGE_THEME_READY_MESSAGE,
  type ThemeSnapshotLike,
} from './theme-bridge.js'
import { KNOWLEDGE_SESSION_DISABLE_DEFAULT_MARKER, KNOWLEDGE_SESSION_STRICT_MARKER } from './constants.js'

const PLUGIN_ID = 'ltx-jc-rag'
const STYLE_ID = `${PLUGIN_ID}/client`
const DEFAULT_KNOWLEDGE_BASE_ID = 'default'
const DEFAULT_KNOWLEDGE_WRITE_MODE: KnowledgeMount['writeMode'] = 'audit'

type SidebarActionProps = PropsRuntime<'sidebar.footer.action'>
type ConversationSlotProps = PropsRuntime<'main.conversation'>
type ComposerDockProps = PropsRuntime<'conversation.input.dock'>
type HeroKnowledgeActionProps = { sessionId?: string; projectId?: string }

interface SidebarNewSessionActionProps {
  wide: boolean
  expandSidebar?: () => void
}

interface KnowledgeBaseSummary {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived'
}

interface KnowledgeMount {
  id: string
  targetKind: 'project' | 'session'
  targetId: string
  knowledgeBaseId: string
  enabled: boolean
  recallEnabled: boolean
  writeMode: 'none' | 'audit' | 'direct'
  includeTags: string[]
  excludeTags: string[]
  extractionInstructions: string
  base?: KnowledgeBaseSummary
}

interface SessionSummaryLike {
  id: string
  cwd?: string
}

interface SessionsLike {
  list: { getSnapshot(): { current?: string; byId: Record<string, SessionSummaryLike | undefined> } }
  create(opts?: { workspaceId?: string; cwd?: string }): Promise<string>
  open(id: string): void
}

interface WorkspacesLike {
  list: { getSnapshot(): { items: Array<{ workspaceId: string; path: string; sessionIds: readonly string[] }> } }
}

interface KnowledgeConnectionView {
  backend: 'local' | 'remote'
  remoteUrl?: string
  remoteTimeoutMs: number
  tokenConfigured: boolean
  autoMountDefaultKnowledgeBase: boolean
  canSwitchRemote: boolean
  writable: boolean
  managementAvailable: boolean
  managementPath?: string
}

interface KnowledgeWorkspaceController {
  isOpen(): boolean
  toggle(): void
  close(): void
  subscribe(listener: () => void): () => void
}

const CONNECTION_CONTROL_PATH = '/ltx-jc-rag-control/v1/connection'
const LOCAL_MANAGEMENT_PATH = '/ltx-jc-rag-local/v1'
let cachedConnectionView: KnowledgeConnectionView | undefined

/** Cordis services needed by the browser half. */
export const inject = ['slots', 'theme', 'sessions', 'workspaces']

/** Register the knowledge launcher in the sidebar's official extension slot. */
export function apply(ctx: ClientContext): void {
  ctx.effect(installStyles, 'ltx-jc-rag: client styles')
  const workspace = createKnowledgeWorkspaceController(ctx)
  ctx.effect(() => observePluginWorkspace(PLUGIN_ID, workspace.close), 'ltx-jc-rag: exclusive workspace')
  ctx.effect(() => () => { workspace.close() }, 'ltx-jc-rag: workspace lifecycle')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'knowledge',
    order: -10,
  }, props => <KnowledgeLauncher {...props} workspace={workspace} />))

  ctx.slots.inject('sidebar.new-session.action' as never, () => ctx.slots.register({
    name: 'sidebar.new-session.action' as never,
    id: 'ltx-jc-rag-session',
    order: -100,
  } as never, (props: SidebarNewSessionActionProps) => (
    <KnowledgeSessionLauncher {...props} client={ctx} />
  )))

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: KNOWLEDGE_SETTINGS_NAMESPACE,
    order: 20,
    label: () => '知识库',
  }, KnowledgeConnectionCard))

  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    id: 'ltx-jc-rag-writeback-status',
  }, props => <>
    <KnowledgeAnswerSource sessionId={String(props.sessionId)} />
    <KnowledgeWritebackStatus sessionId={String(props.sessionId)} turn={props.turn.turn} />
  </>))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'ltx-jc-rag-session',
    order: -20,
  }, props => <KnowledgeSessionNotice {...props} />))

  ctx.slots.inject('conversation.hero.actions' as never, () => ctx.slots.register({
    name: 'conversation.hero.actions' as never,
    id: 'ltx-jc-rag-current-session',
    order: -20,
  } as never, props => <KnowledgeHeroSessionToggle {...props as HeroKnowledgeActionProps} />))
}

function KnowledgeHeroSessionToggle({ sessionId, projectId }: HeroKnowledgeActionProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'saving' | 'error'>('loading')
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    if (!sessionId) {
      setState('idle')
      setEnabled(false)
      setError('')
      return
    }
    setState('loading')
    setError('')
    try {
      let view = await currentDefaultMountState(sessionId, projectId, signal)
      if (signal?.aborted) return
      setEnabled(view.recordingEnabled)
      setState('idle')
    } catch (error) {
      if (signal?.aborted) return
      setError(knowledgeSessionError(error))
      setState('error')
    }
  }, [projectId, sessionId])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => { controller.abort() }
  }, [load])

  const toggle = async (): Promise<void> => {
    if (!sessionId || state === 'loading' || state === 'saving') return
    if (state === 'error') {
      await load()
      return
    }
    const next = !enabled
    setState('saving')
    setError('')
    setEnabled(next)
    try {
      await setCurrentSessionRecording(sessionId, projectId, next)
      const view = await currentDefaultMountState(sessionId, projectId)
      setEnabled(view.recordingEnabled)
      setState('idle')
    } catch (error) {
      setEnabled(!next)
      setError(knowledgeSessionError(error))
      setState('error')
    }
  }

  const disabled = !sessionId || state === 'loading' || state === 'saving'
  const label = state === 'loading' ? '对话记录读取中' : state === 'saving' ? '对话记录保存中' : enabled ? '正在记录本次对话' : '本次对话不记录'
  return (
    <button
      type="button"
      className="ltx-jc-rag-hero-toggle"
      role="switch"
      aria-checked={enabled}
      aria-busy={state === 'loading' || state === 'saving'}
      aria-label={label}
      title={error || (sessionId ? '控制当前会话是否记录到知识库；不会影响知识库检索' : '进入会话后可控制是否记录')}
      disabled={disabled}
      onClick={() => { void toggle() }}
    >
      <IconDataOutline16 size={14} />
      <span>记录对话</span>
      <i aria-hidden="true" />
    </button>
  )
}

function KnowledgeSessionLauncher({ wide, expandSidebar, client }: SidebarNewSessionActionProps & { client: ClientContext }) {
  const [open, setOpen] = useState(false)
  const [bases, setBases] = useState<KnowledgeBaseSummary[]>([])
  const [selected, setSelected] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'creating'>('idle')
  const [message, setMessage] = useState('')

  const load = async (): Promise<void> => {
    setState('loading')
    setMessage('')
    try {
      const items = (await requestManagement<KnowledgeBaseSummary[]>('knowledge-bases'))
        .filter(base => base.status === 'active')
      setBases(items)
      setSelected(current => current || items[0]?.id || '')
      setState('idle')
    } catch (error) {
      setState('idle')
      setMessage(knowledgeSessionError(error))
    }
  }

  const toggle = (): void => {
    if (!wide) {
      expandSidebar?.()
      setOpen(true)
      if (bases.length === 0 && state !== 'loading') void load()
      return
    }
    setOpen(value => {
      const next = !value
      if (next && bases.length === 0 && state !== 'loading') void load()
      return next
    })
  }

  const create = async (): Promise<void> => {
    if (!selected || state === 'creating') return
    setState('creating')
    setMessage('')
    try {
      const sessionId = await createKnowledgeSession(client)
      const base = bases.find(item => item.id === selected)
      await requestManagement<KnowledgeMount>('mounts', {
        method: 'POST',
        body: {
          draft: {
            targetKind: 'session',
            targetId: sessionId,
            knowledgeBaseId: selected,
            enabled: true,
            recallEnabled: true,
            writeMode: DEFAULT_KNOWLEDGE_WRITE_MODE,
            includeTags: [],
            excludeTags: [],
            extractionInstructions: `${KNOWLEDGE_SESSION_STRICT_MARKER}\nStrict Ltx JC RAG knowledge session. Answer only from the selected knowledge base.`,
          },
        },
      })
      ;(client.get('sessions') as unknown as SessionsLike).open(sessionId)
      setOpen(false)
      setMessage(`已进入 Ltx JC RAG 知识库会话：${base?.name ?? selected}`)
    } catch (error) {
      setMessage(knowledgeSessionError(error))
    } finally {
      setState('idle')
    }
  }

  return (
    <div className={`ltx-jc-rag-session${wide ? '' : ' ltx-jc-rag-session--rail'}`}>
      <button
        type="button"
        className={`ltx-jc-rag-trigger ltx-jc-rag-session-button${wide ? '' : ' ltx-jc-rag-trigger--rail'}`}
        aria-label="Ltx JC RAG 知识库会话"
        aria-expanded={open}
        title={wide ? undefined : 'Ltx JC RAG 知识库会话'}
        onClick={toggle}
      >
        <IconDataOutline16 size={wide ? 16 : 18} />
        {wide && <span>知识库会话</span>}
      </button>
      {wide && open && <div className="ltx-jc-rag-session-panel">
        <label>
          <span>选择知识库</span>
          <select value={selected} disabled={state !== 'idle' || bases.length === 0} onChange={event => { setSelected(event.target.value) }}>
            {bases.map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
          </select>
        </label>
        {message && <p role={message.startsWith('已进入') ? 'status' : 'alert'}>{message}</p>}
        <div>
          <button type="button" onClick={() => { void load() }} disabled={state === 'loading' || state === 'creating'}>{state === 'loading' ? '读取中…' : '刷新'}</button>
          <button type="button" className="is-primary" onClick={() => { void create() }} disabled={!selected || state !== 'idle'}>{state === 'creating' ? '创建中…' : '进入'}</button>
        </div>
      </div>}
    </div>
  )
}

function KnowledgeSessionNotice({ sessionId }: ComposerDockProps) {
  const mount = useStrictKnowledgeSessionMount(sessionId)
  const [exited, setExited] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    setExited(false)
    setLeaving(false)
    setError('')
  }, [sessionId])
  const leave = async (): Promise<void> => {
    if (mount === undefined || leaving) return
    setLeaving(true)
    setError('')
    try {
      await requestManagement<void>(`mounts/${encodeURIComponent(mount.id)}`, { method: 'DELETE' })
      setExited(true)
    } catch (error) {
      setError(knowledgeSessionError(error))
    } finally {
      setLeaving(false)
    }
  }
  if (exited) return <div className="ltx-jc-rag-session-notice is-exited" role="status">
    <span>已退出 Ltx JC RAG 知识库会话，当前为普通回答</span>
  </div>
  if (mount === undefined) return null
  return <div className="ltx-jc-rag-session-notice" role="status">
    <IconDataOutline16 size={14} />
    <span>已进入 Ltx JC RAG 知识库会话</span>
    <strong>{mount.base?.name ?? mount.knowledgeBaseId}</strong>
    <button type="button" onClick={() => { void leave() }} disabled={leaving}>{leaving ? '退出中…' : '退出'}</button>
    {error && <em role="alert">{error}</em>}
  </div>
}

function KnowledgeAnswerSource({ sessionId }: { sessionId: string }) {
  const mount = useStrictKnowledgeSessionMount(sessionId)
  if (mount === undefined) return null
  return <div className="ltx-jc-rag-answer-source" role="note" aria-label="Ltx JC RAG 知识库回答">
    <IconDataOutline16 size={14} />
    <span>根据 Ltx JC RAG 知识库回答</span>
    <strong>{mount.base?.name ?? mount.knowledgeBaseId}</strong>
  </div>
}

function useStrictKnowledgeSessionMount(sessionId: string | number | undefined): KnowledgeMount | undefined {
  const [mount, setMount] = useState<KnowledgeMount>()
  useEffect(() => {
    if (sessionId === undefined) {
      setMount(undefined)
      return
    }
    const controller = new AbortController()
    void requestManagement<KnowledgeMount[]>(`mounts/resolve?sessionId=${encodeURIComponent(String(sessionId))}`, { signal: controller.signal })
      .then(items => {
        if (controller.signal.aborted) return
        setMount(items.find(item => item.targetKind === 'session'
          && item.extractionInstructions.includes(KNOWLEDGE_SESSION_STRICT_MARKER)))
      })
      .catch(() => {
        if (!controller.signal.aborted) setMount(undefined)
      })
    return () => { controller.abort() }
  }, [sessionId])
  return mount
}

async function currentDefaultMountState(
  sessionId: string,
  projectId?: string,
  signal?: AbortSignal,
): Promise<{ recordingEnabled: boolean; explicit?: KnowledgeMount; inherited?: KnowledgeMount }> {
  const [explicit, inherited] = await Promise.all([
    sessionDefaultMount(sessionId, signal),
    projectId === undefined ? Promise.resolve(undefined) : projectDefaultMount(projectId, signal),
  ])
  if (explicit !== undefined) {
    return { recordingEnabled: explicit.enabled && explicit.writeMode !== 'none', explicit, ...inherited === undefined ? {} : { inherited } }
  }
  return { recordingEnabled: inherited !== undefined && inherited.enabled && inherited.writeMode !== 'none', ...inherited === undefined ? {} : { inherited } }
}

async function setCurrentSessionRecording(sessionId: string, projectId: string | undefined, enabled: boolean): Promise<void> {
  const view = await currentDefaultMountState(sessionId, projectId)
  await requestManagement<KnowledgeMount>('mounts', {
    method: 'POST',
    body: { draft: defaultSessionRecordingDraft(sessionId, enabled, view.explicit, view.inherited) },
  })
}

function defaultSessionRecordingDraft(
  sessionId: string,
  recordingEnabled: boolean,
  previous?: KnowledgeMount,
  inherited?: KnowledgeMount,
): Omit<KnowledgeMount, 'id' | 'base'> {
  const source = previous ?? inherited
  return {
    targetKind: 'session',
    targetId: sessionId,
    knowledgeBaseId: DEFAULT_KNOWLEDGE_BASE_ID,
    enabled: source?.enabled ?? true,
    recallEnabled: source?.recallEnabled ?? true,
    writeMode: recordingEnabled ? writebackModeForEnabledMount(source) : 'none',
    includeTags: source?.includeTags ?? [],
    excludeTags: source?.excludeTags ?? [],
    extractionInstructions: source?.extractionInstructions.replace(KNOWLEDGE_SESSION_DISABLE_DEFAULT_MARKER, '').trim()
      || 'Current Ltx JC RAG default knowledge base mount for this session.',
  }
}

function writebackModeForEnabledMount(previous?: KnowledgeMount): KnowledgeMount['writeMode'] {
  return previous?.writeMode === 'direct' ? 'direct' : DEFAULT_KNOWLEDGE_WRITE_MODE
}

async function sessionDefaultMount(sessionId: string, signal?: AbortSignal): Promise<KnowledgeMount | undefined> {
  const mounts = await requestManagement<KnowledgeMount[]>(
    `mounts?targetKind=session&targetId=${encodeURIComponent(sessionId)}`,
    signal === undefined ? {} : { signal },
  )
  return mounts.find(mount => mount.knowledgeBaseId === DEFAULT_KNOWLEDGE_BASE_ID)
}

async function projectDefaultMount(projectId: string, signal?: AbortSignal): Promise<KnowledgeMount | undefined> {
  const mounts = await requestManagement<KnowledgeMount[]>(
    `mounts?targetKind=project&targetId=${encodeURIComponent(projectId)}`,
    signal === undefined ? {} : { signal },
  )
  return mounts.find(mount => mount.knowledgeBaseId === DEFAULT_KNOWLEDGE_BASE_ID && mount.enabled && mount.recallEnabled)
}

async function createKnowledgeSession(client: ClientContext): Promise<string> {
  const sessions = client.get('sessions') as unknown as SessionsLike
  const workspaces = client.get('workspaces') as unknown as WorkspacesLike
  const current = sessions.list.getSnapshot().current
  const currentSummary = current === undefined ? undefined : sessions.list.getSnapshot().byId[current]
  const workspace = current === undefined
    ? undefined
    : workspaces.list.getSnapshot().items.find(item => item.sessionIds.includes(current))
  if (workspace !== undefined) return sessions.create({ workspaceId: workspace.workspaceId })
  if (currentSummary?.cwd !== undefined) return sessions.create({ cwd: currentSummary.cwd })
  return sessions.create()
}

function KnowledgeWritebackStatus({ sessionId, turn }: { sessionId: string; turn: number }) {
  type Status = { status: 'running' | 'completed' | 'failed'; summary: string; error?: string; retryable: boolean }
  const [state, setState] = useState<Status>()
  const [retrying, setRetrying] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    void fetch(`/ltx-jc-rag-control/v1/writeback-status?sessionId=${encodeURIComponent(sessionId)}&turn=${turn}`, {
      headers: { accept: 'application/json', 'x-ltx-jc-rag-client': 'conversation-web' }, signal: controller.signal,
    }).then(async response => response.ok ? response.json() as Promise<Status> : undefined)
      .then(value => { if (value?.summary) setState(value) })
      .catch(() => {})
    return () => { controller.abort() }
  }, [sessionId, turn])
  if (state === undefined) return null
  const retry = async (): Promise<void> => {
    setRetrying(true)
    try {
      const response = await fetch(`/ltx-jc-rag-control/v1/writeback-status?sessionId=${encodeURIComponent(sessionId)}&turn=${turn}`, {
        method: 'POST', headers: { accept: 'application/json', 'x-ltx-jc-rag-client': 'conversation-web' },
      })
      if (!response.ok) throw new Error(`retry failed with HTTP ${response.status}`)
      setState(await response.json() as Status)
    } catch (error) {
      setState(previous => previous === undefined ? previous : {
        ...previous, error: error instanceof Error ? error.message : String(error), retryable: true,
      })
    } finally { setRetrying(false) }
  }
  return <div className="ltx-jc-rag-writeback-status">
    <span>上下文注入</span><strong>Ltx JC RAG 知识库</strong><span title={state.error}>{state.summary}</span>
    {state.status === 'failed' && state.retryable && <button type="button" disabled={retrying} onClick={() => { void retry() }}>{retrying ? '重试中…' : '重试'}</button>}
  </div>
}

function createKnowledgeWorkspaceController(client: ClientContext): KnowledgeWorkspaceController {
  const listeners = new Set<() => void>()
  let disposeWorkspace: (() => void) | undefined
  const notify = (): void => { for (const listener of listeners) listener() }
  const close = (): void => {
    if (disposeWorkspace === undefined) return
    const dispose = disposeWorkspace
    disposeWorkspace = undefined
    dispose()
    notify()
  }
  const controller: KnowledgeWorkspaceController = {
    isOpen: () => disposeWorkspace !== undefined,
    toggle: () => {
      if (disposeWorkspace !== undefined) return close()
      activatePluginWorkspace(PLUGIN_ID)
      const dispose = client.slots.register({ name: 'main.conversation', priority: -1 }, props => (
        <KnowledgeWorkspace {...props} client={client} workspace={controller} />
      ))
      disposeWorkspace = dispose
      notify()
    },
    close,
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
  return controller
}

function KnowledgeConnectionCard() {
  const [current, setCurrent] = useState<KnowledgeConnectionView>()
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadError, setLoadError] = useState('')
  const [open, setOpen] = useState(false)
  const [backend, setBackend] = useState<'local' | 'remote'>('local')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [remoteToken, setRemoteToken] = useState('')
  const [timeout, setTimeoutValue] = useState('10000')
  const [autoMountDefaultKnowledgeBase, setAutoMountDefaultKnowledgeBase] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string }>()

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setLoadState('loading')
    setLoadError('')
    try {
      const value = await requestConnection('GET', undefined, signal)
      setCurrent(value)
      setLoadState('ready')
    } catch (error) {
      if (signal?.aborted) return
      setLoadError(connectionErrorMessage(error))
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => { controller.abort() }
  }, [load])

  useEffect(() => {
    if (dirty || current === undefined) return
    setBackend(current.backend)
    setRemoteUrl(current.remoteUrl ?? '')
    setTimeoutValue(String(current.remoteTimeoutMs ?? 10000))
    setAutoMountDefaultKnowledgeBase(current.autoMountDefaultKnowledgeBase)
  }, [current, dirty])

  const timeoutNumber = Number(timeout)
  const urlError = backend === 'remote' ? validateRemoteUrl(remoteUrl) : undefined
  const tokenError = backend === 'remote' && !current?.tokenConfigured && remoteToken.trim().length === 0
    ? '首次连接必须填写客户端令牌。'
    : remoteToken.length > 0 && remoteToken.trim().length < 24 ? '令牌至少需要 24 个字符。' : undefined
  const timeoutError = !Number.isInteger(timeoutNumber) || timeoutNumber < 100 || timeoutNumber > 120000
    ? '超时必须是 100 到 120000 毫秒之间的整数。'
    : undefined
  const invalid = urlError !== undefined || tokenError !== undefined || timeoutError !== undefined

  const edit = (action: () => void): void => {
    action()
    setDirty(true)
    setMessage(undefined)
  }
  const reset = (): void => {
    setBackend(current?.backend ?? 'local')
    setRemoteUrl(current?.remoteUrl ?? '')
    setRemoteToken('')
    setTimeoutValue(String(current?.remoteTimeoutMs ?? 10000))
    setAutoMountDefaultKnowledgeBase(current?.autoMountDefaultKnowledgeBase ?? true)
    setDirty(false)
    setMessage(undefined)
  }
  const save = async (): Promise<void> => {
    if (!dirty || invalid || !current?.writable || saving) return
    setSaving(true)
    setMessage(undefined)
    try {
      const next = await requestConnection('PUT', {
        backend,
        remoteTimeoutMs: timeoutNumber,
        autoMountDefaultKnowledgeBase,
        ...backend === 'remote' ? { remoteUrl: remoteUrl.trim() } : {},
        ...backend === 'remote' && remoteToken.trim().length > 0 ? { remoteToken: remoteToken.trim() } : {},
      })
      setCurrent(next)
      setRemoteToken('')
      setDirty(false)
      setMessage({
        kind: 'success',
        text: backend === 'remote' ? '已验证并切换至远程知识库。' : '已切换至本地知识库。',
      })
    } catch (error) {
      setMessage({ kind: 'error', text: connectionErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className={`ltx-jc-rag-settings-card${open ? ' ltx-jc-rag-settings-card--open' : ''}`}>
      <button type="button" className="ltx-jc-rag-settings-header" aria-expanded={open} onClick={() => { setOpen(value => !value) }}>
        <span><strong>Ltx JC RAG 知识库连接</strong><small>默认使用本机 Ltx JC RAG 知识库；远程可后续接企业中央服务</small></span>
        <span className="ltx-jc-rag-settings-summary">{loadState === 'loading' ? '读取中' : loadState === 'error' ? '连接入口' : current?.backend === 'remote' ? '远程' : '本地'}<i aria-hidden="true" /></span>
      </button>
      {open && <div className="ltx-jc-rag-settings-body">
        {loadState === 'loading' ? <p className="ltx-jc-rag-settings-note" role="status">正在读取连接配置…</p>
          : loadState === 'error' ? <div className="ltx-jc-rag-settings-load-error" role="alert">
            <p>{loadError}</p>
            <button type="button" onClick={() => { void load() }}>重新读取</button>
          </div> : <>
          <fieldset className="ltx-jc-rag-source-picker">
            <legend>知识库来源</legend>
            <label className={backend === 'local' ? 'is-selected' : ''}>
              <input type="radio" name="ltx-jc-rag-backend" checked={backend === 'local'} onChange={() => edit(() => { setBackend('local') })} />
              <span><strong>本地</strong><small>数据保存在当前 DSH 的 SQLite 中</small></span>
            </label>
            <label className={`${backend === 'remote' ? 'is-selected' : ''}${!current?.canSwitchRemote ? ' is-disabled' : ''}`}>
              <input type="radio" name="ltx-jc-rag-backend" checked={backend === 'remote'} disabled={!current?.canSwitchRemote} onChange={() => edit(() => { setBackend('remote') })} />
              <span><strong>远程</strong><small>召回和回写统一使用中央知识库</small></span>
            </label>
          </fieldset>
          <label className="ltx-jc-rag-auto-mount-toggle">
            <input
              type="checkbox"
              checked={autoMountDefaultKnowledgeBase}
              onChange={event => edit(() => { setAutoMountDefaultKnowledgeBase(event.target.checked) })}
            />
            <span>
              <strong>新普通会话默认挂载知识库</strong>
              <small>开启后，每个新建空白普通会话会自动挂载默认知识库用于召回；关闭后只在知识库会话或手动挂载时使用。</small>
            </span>
          </label>
          {!current?.canSwitchRemote && <p className="ltx-jc-rag-settings-note">当前实例是中央知识库服务，不能再切换到另一台远程服务。</p>}
          {backend === 'remote' && <div className="ltx-jc-rag-remote-fields">
            <label htmlFor="ltx-jc-rag-remote-url">服务器地址
              <input id="ltx-jc-rag-remote-url" type="url" value={remoteUrl} placeholder="https://example.com/knowledge-api/v1" autoComplete="url" onChange={event => edit(() => { setRemoteUrl(event.target.value) })} aria-invalid={urlError !== undefined} aria-describedby={urlError ? 'ltx-jc-rag-url-error' : undefined} />
              {urlError && <small id="ltx-jc-rag-url-error" className="ltx-jc-rag-field-error">{urlError}</small>}
            </label>
            <label htmlFor="ltx-jc-rag-remote-token">客户端令牌
              <input id="ltx-jc-rag-remote-token" type="password" value={remoteToken} placeholder={current?.tokenConfigured ? '已保存；留空则保持不变' : '粘贴客户端令牌'} autoComplete="new-password" onChange={event => edit(() => { setRemoteToken(event.target.value) })} aria-invalid={tokenError !== undefined} aria-describedby="ltx-jc-rag-token-help" />
              <small id="ltx-jc-rag-token-help" className={tokenError ? 'ltx-jc-rag-field-error' : undefined}>{tokenError ?? (current?.tokenConfigured ? '令牌已安全保存，页面无法读取；输入新令牌可覆盖。' : '令牌保存后不可读取，只能覆盖。')}</small>
            </label>
          </div>}
          <label className="ltx-jc-rag-timeout-field" htmlFor="ltx-jc-rag-timeout">请求超时（毫秒）
            <input id="ltx-jc-rag-timeout" type="number" min="100" max="120000" step="100" value={timeout} onChange={event => edit(() => { setTimeoutValue(event.target.value) })} aria-invalid={timeoutError !== undefined} />
            {timeoutError && <small className="ltx-jc-rag-field-error">{timeoutError}</small>}
          </label>
          {!current?.writable && <p className="ltx-jc-rag-settings-note">当前插件没有配置持久化路径，无法保存连接。</p>}
          {message && <p className={`ltx-jc-rag-settings-message is-${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'} aria-live="polite">{message.text}</p>}
          <div className="ltx-jc-rag-settings-actions">
            <button type="button" onClick={reset} disabled={!dirty || saving}>放弃更改</button>
            <button type="button" className="is-primary" onClick={() => { void save() }} disabled={!dirty || invalid || saving || !current?.writable}>{saving ? '正在验证…' : '验证并连接'}</button>
          </div>
        </>}
      </div>}
    </li>
  )
}

function validateRemoteUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim())
    const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1'
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) return '远程知识库必须使用 HTTPS。'
    return undefined
  } catch { return '请输入完整的知识库 API 地址。' }
}

function connectionErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('Failed to fetch')) return '无法访问插件连接接口，请确认插件服务已加载。'
  return message || '连接配置操作失败，请检查地址、令牌和 DSH 日志。'
}

async function requestConnection(
  method: 'GET' | 'PUT',
  body?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<KnowledgeConnectionView> {
  const response = await fetch(CONNECTION_CONTROL_PATH, {
    method,
    headers: { accept: 'application/json', ...body === undefined ? {} : { 'content-type': 'application/json' } },
    ...body === undefined ? {} : { body: JSON.stringify(body) },
    ...signal === undefined ? {} : { signal },
  })
  const payload = await response.json().catch(() => undefined) as unknown
  if (!response.ok) {
    const message = payload !== null && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : `连接接口返回 HTTP ${response.status}`
    throw new Error(message)
  }
  if (!isConnectionView(payload)) throw new Error('插件连接接口返回了无效数据。')
  cachedConnectionView = payload
  return payload
}

async function requestManagement<T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown>; signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`${LOCAL_MANAGEMENT_PATH}/${path.replace(/^\/+/u, '')}`, {
    method: options.method ?? 'GET',
    headers: {
      accept: 'application/json',
      'x-ltx-jc-rag-client': 'management-web',
      ...options.body === undefined ? {} : { 'content-type': 'application/json' },
    },
    ...options.body === undefined ? {} : { body: JSON.stringify(options.body) },
    ...options.signal === undefined ? {} : { signal: options.signal },
  })
  const payload = await response.json().catch(() => undefined) as unknown
  if (!response.ok) {
    const message = payload !== null && typeof payload === 'object' && typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : `知识库接口返回 HTTP ${response.status}`
    throw new Error(message)
  }
  return payload as T
}

function knowledgeSessionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('Failed to fetch')) return '无法访问知识库接口，请确认插件服务已启动。'
  return message || '知识库会话创建失败。'
}

function isConnectionView(value: unknown): value is KnowledgeConnectionView {
  if (value === null || typeof value !== 'object') return false
  const item = value as Partial<KnowledgeConnectionView>
  return (item.backend === 'local' || item.backend === 'remote')
    && Number.isInteger(item.remoteTimeoutMs)
    && typeof item.tokenConfigured === 'boolean'
    && typeof item.autoMountDefaultKnowledgeBase === 'boolean'
    && typeof item.canSwitchRemote === 'boolean'
    && typeof item.writable === 'boolean'
    && typeof item.managementAvailable === 'boolean'
    && (!item.managementAvailable || isManagementPath(item.managementPath))
}

function isManagementPath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
}

function KnowledgeLauncher({ wide, workspace }: SidebarActionProps & { workspace: KnowledgeWorkspaceController }) {
  const [open, setOpen] = useState(workspace.isOpen())

  useEffect(() => workspace.subscribe(() => { setOpen(workspace.isOpen()) }), [workspace])

  return (
    <button
      type="button"
      className={`ltx-jc-rag-trigger${wide ? '' : ' ltx-jc-rag-trigger--rail'}${open ? ' is-active' : ''}`}
      aria-label={open ? '返回对话' : 'Ltx JC RAG 知识库'}
      aria-pressed={open}
      title={wide ? undefined : open ? '返回对话' : 'Ltx JC RAG 知识库'}
      onClick={() => { workspace.toggle() }}
    >
      <IconDataOutline16 size={wide ? 16 : 18} />
      {wide && <span>{open ? '返回对话' : 'Ltx JC RAG 知识库'}</span>}
    </button>
  )
}

function KnowledgeWorkspace({
  sessionId,
  useSessions,
  client,
  workspace,
}: ConversationSlotProps & { client: ClientContext; workspace: KnowledgeWorkspaceController }) {
  const cachedManagementPath = cachedConnectionView?.managementAvailable ? cachedConnectionView.managementPath : undefined
  const [panelState, setPanelState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>(cachedConnectionView === undefined ? 'loading' : cachedManagementPath === undefined ? 'unavailable' : 'ready')
  const [managementPath, setManagementPath] = useState<string | undefined>(cachedManagementPath)
  const [panelError, setPanelError] = useState('')
  const projectId = useSessions((state: SessionListState) => sessionId === undefined ? undefined : state.byId[sessionId]?.cwd)
  const knowledgeUrl = managementPath === undefined ? undefined : knowledgePanelUrl(managementPath, sessionId, projectId)
  const frame = useRef<HTMLIFrameElement | null>(null)
  const themeFrame = useRef(0)

  const loadManagement = useCallback(async (background = false): Promise<void> => {
    if (!background) setPanelState('loading')
    setPanelError('')
    try {
      const connection = await requestConnection('GET')
      if (!connection.managementAvailable || connection.managementPath === undefined) {
        setManagementPath(undefined)
        setPanelState('unavailable')
        return
      }
      setManagementPath(connection.managementPath)
      setPanelState('ready')
    } catch (error) {
      setManagementPath(undefined)
      setPanelError(connectionErrorMessage(error))
      setPanelState('error')
    }
  }, [])

  useEffect(() => {
    void loadManagement(cachedConnectionView !== undefined)
  }, [loadManagement])

  const sendTheme = useCallback((): void => {
    const currentFrame = frame.current
    if (currentFrame === null) return
    const target = currentFrame.contentWindow
    if (target === null) return
    const computed = getComputedStyle(document.body)
    target.postMessage(
      createKnowledgeHostTheme(computed, client.theme.getTheme()),
      frameOrigin(currentFrame) ?? '*',
    )
  }, [client])

  const scheduleTheme = useCallback((): void => {
    if (themeFrame.current !== 0) window.cancelAnimationFrame(themeFrame.current)
    themeFrame.current = window.requestAnimationFrame(() => {
      themeFrame.current = 0
      sendTheme()
    })
  }, [sendTheme])

  useEffect(() => {
    const off = client.on('theme/change', scheduleTheme)
    const onMessage = (event: MessageEvent): void => {
      const currentFrame = frame.current
      if (event.source !== currentFrame?.contentWindow) return
      const expectedOrigin = frameOrigin(currentFrame)
      if (expectedOrigin !== undefined && event.origin !== expectedOrigin) return
      const data = event.data as { type?: unknown; version?: unknown } | null
      if (data?.type === KNOWLEDGE_THEME_READY_MESSAGE && data.version === KNOWLEDGE_THEME_PROTOCOL_VERSION) sendTheme()
    }
    window.addEventListener('message', onMessage)
    scheduleTheme()
    return () => {
      off()
      window.removeEventListener('message', onMessage)
      if (themeFrame.current !== 0) window.cancelAnimationFrame(themeFrame.current)
    }
  }, [client, scheduleTheme, sendTheme])

  return (
    <section className="ltx-jc-rag-workspace" data-xiaohei-surface="plugin-workspace" aria-labelledby="ltx-jc-rag-workspace-title">
      <header className="ltx-jc-rag-workspace-header">
        <div>
          <button type="button" data-xiaohei-workspace-close onClick={workspace.close} aria-label="返回会话" title="返回会话"><IconChevronLeftOutline14 size={15} /></button>
          <IconDataOutline16 size={18} />
          <span><h2 id="ltx-jc-rag-workspace-title">Ltx JC RAG 知识库</h2><p>文档、审核、挂载与访问管理</p></span>
        </div>
      </header>
      {panelState === 'ready' && knowledgeUrl !== undefined
        ? <iframe ref={frame} className="ltx-jc-rag-frame" src={knowledgeUrl} title="Ltx JC RAG 知识库管理台" onLoad={sendTheme} />
        : <div className="ltx-jc-rag-panel-state" role={panelState === 'error' ? 'alert' : 'status'} aria-live="polite">
          <span className="ltx-jc-rag-panel-state-icon" aria-hidden="true">{panelState === 'loading' ? '···' : panelState === 'error' ? '!' : '—'}</span>
          <div>
            <h3>{panelState === 'loading' ? '正在打开知识库…' : panelState === 'error' ? '暂时无法打开知识库' : '这台 DSH 未启用知识库管理台'}</h3>
            <p>{panelState === 'loading'
              ? '正在确认当前实例是否提供管理页面。'
              : panelState === 'error'
                ? panelError
                : '本地召回和回写仍可使用。当前 profile 已显式关闭 exposeWeb；重新启用后即可在这里管理。使用远程知识库时，请前往中央 DSH 的知识库管理台。'}</p>
            {panelState === 'error' && <button type="button" onClick={() => { void loadManagement() }}>重试</button>}
          </div>
        </div>}
    </section>
  )
}

function knowledgePanelUrl(managementPath: string, sessionId?: string, projectId?: string): string {
  const params = new URLSearchParams()
  if (sessionId !== undefined) params.set('sessionId', sessionId)
  if (projectId !== undefined) params.set('projectId', projectId)
  const query = params.toString()
  return query.length === 0 ? managementPath : `${managementPath}${managementPath.includes('?') ? '&' : '?'}${query}`
}

function frameOrigin(frame: HTMLIFrameElement): string | undefined {
  try {
    const origin = new URL(frame.src).origin
    return origin === 'null' ? undefined : origin
  } catch {
    return undefined
  }
}

function installStyles(): () => void {
  const previous = document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${STYLE_ID}"]`)
  previous?.remove()
  const style = document.createElement('style')
  style.dataset.plugin = PLUGIN_ID
  style.dataset.pluginCss = STYLE_ID
  style.textContent = cssText
  document.head.appendChild(style)
  return () => { style.remove() }
}
