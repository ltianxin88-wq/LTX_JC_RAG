window.__ModuleLoader__.load({ id: "ltx-jc-rag", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// src/workspace-ownership.ts
var WORKSPACE_ACTIVATE_EVENT = "ltx-jc-rag/workspace-activate";
function activatePluginWorkspace(pluginId) {
  window.dispatchEvent(new CustomEvent(WORKSPACE_ACTIVATE_EVENT, {
    detail: { pluginId }
  }));
}
function observePluginWorkspace(pluginId, close) {
  const onActivate = (event) => {
    const detail = event.detail;
    if (detail?.pluginId !== pluginId) close();
  };
  window.addEventListener(WORKSPACE_ACTIVATE_EVENT, onActivate);
  return () => window.removeEventListener(WORKSPACE_ACTIVATE_EVENT, onActivate);
}

// src/client.tsx
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client.css
var client_default = '.ltx-jc-rag-trigger,\n.ltx-jc-rag-hero-toggle,\n.ltx-jc-rag-workspace,\n.ltx-jc-rag-settings-card,\n.ltx-jc-rag-writeback-status,\n.ltx-jc-rag-answer-source {\n  --knowledge-accent: #3a3a3c;\r\n  --knowledge-on-accent: #fff;\r\n  --knowledge-danger: #d70015;\r\n  --knowledge-success: #248a3d;\r\n  --knowledge-pane: rgb(242 243 247 / 78%);\r\n  --knowledge-raised: #fff;\r\n  --knowledge-control: rgb(255 255 255 / 82%);\r\n  --knowledge-border: rgb(60 60 67 / 14%);\r\n  --knowledge-text: #1d1d1f;\r\n  --knowledge-text-secondary: #515154;\r\n  --knowledge-hover: rgba(118, 118, 128, .1);\r\n  --knowledge-glare-light: rgb(255 255 255 / 82%);\r\n  --knowledge-glare-rim: rgb(60 60 67 / 15%);\r\n  --knowledge-glass-filter: saturate(1.18) contrast(1.025) blur(28px);\r\n  --knowledge-glass-shadow: inset 0 1px 0 rgb(255 255 255 / 58%), inset 0 -1px 0 rgb(60 60 67 / 12%);\r\n}\r\n\r\nbody[data-ds-dark-theme] :is(\n  .ltx-jc-rag-trigger,\n  .ltx-jc-rag-hero-toggle,\n  .ltx-jc-rag-workspace,\n  .ltx-jc-rag-settings-card,\n  .ltx-jc-rag-writeback-status,\n  .ltx-jc-rag-answer-source\n) {\n  --knowledge-accent: #e5e5ea;\r\n  --knowledge-on-accent: #1d1d1f;\r\n  --knowledge-danger: #ff453a;\r\n  --knowledge-success: #30d158;\r\n  --knowledge-pane: rgb(8 10 12 / 19%);\r\n  --knowledge-raised: rgb(10 12 15 / 44%);\r\n  --knowledge-control: rgb(255 255 255 / 7%);\r\n  --knowledge-border: rgb(255 255 255 / 10%);\r\n  --knowledge-text: #f5f5f7;\r\n  --knowledge-text-secondary: #d1d1d6;\r\n  --knowledge-hover: rgb(255 255 255 / 8%);\r\n  --knowledge-glare-light: rgb(255 255 255 / 42%);\r\n  --knowledge-glare-rim: rgb(0 0 0 / 24%);\r\n  --knowledge-glass-shadow: inset 0 1px 0 rgb(255 255 255 / 18%), inset 0 -1px 0 rgb(0 0 0 / 30%);\r\n}\r\n\r\n.ltx-jc-rag-trigger,\n.ltx-jc-rag-hero-toggle,\n.ltx-jc-rag-panel-state button,\n.ltx-jc-rag-settings-card button,\n.ltx-jc-rag-writeback-status button,\n.ltx-jc-rag-session-notice button {\n  -webkit-appearance: none;\r\n  appearance: none;\r\n  margin: 0;\r\n}\r\n\r\n.ltx-jc-rag-trigger {\r\n  position: relative;\r\n  flex: none;\r\n  min-width: 0;\r\n  max-width: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  width: auto;\r\n  height: 34px;\r\n  margin: 4px 0;\r\n  padding: 6px 8px 6px 10px;\r\n  box-sizing: border-box;\r\n  border: 0;\r\n  border-radius: 12px;\r\n  overflow: hidden;\r\n  background: transparent;\r\n  color: var(--dsw-alias-label-primary);\r\n  cursor: pointer;\r\n  font: inherit;\r\n  font-size: 14px;\r\n  line-height: 22px;\r\n  white-space: nowrap;\r\n  isolation: isolate;\r\n  transition:\r\n    color 120ms ease,\r\n    background-color 120ms ease,\r\n    box-shadow 160ms ease;\r\n}\r\n\r\n.ltx-jc-rag-trigger:hover {\r\n  background: var(--knowledge-hover);\r\n}\r\n\r\n.ltx-jc-rag-trigger > * {\r\n  position: relative;\r\n  z-index: 1;\r\n}\r\n\r\n.ltx-jc-rag-trigger::before {\r\n  position: absolute;\r\n  z-index: 0;\r\n  top: -55%;\r\n  bottom: -55%;\r\n  left: -64%;\r\n  width: 52%;\r\n  border-radius: 45%;\r\n  background: linear-gradient(\r\n    90deg,\r\n    transparent,\r\n    color-mix(in srgb, var(--knowledge-glare-light) 76%, transparent) 50%,\r\n    color-mix(in srgb, var(--knowledge-glare-rim) 18%, transparent) 63%,\r\n    transparent\r\n  );\r\n  opacity: 0;\r\n  transform: skewX(-18deg) translate3d(0, 0, 0);\r\n  pointer-events: none;\r\n  transition:\r\n    opacity 150ms ease-out,\r\n    transform 720ms cubic-bezier(.2, .72, .2, 1);\r\n  content: "";\r\n}\r\n\r\n.ltx-jc-rag-trigger:hover::before {\r\n  opacity: .96;\r\n  transform: skewX(-18deg) translate3d(320%, 0, 0);\r\n}\r\n\r\n.ltx-jc-rag-trigger:focus-visible,\r\n.ltx-jc-rag-writeback-status button:focus-visible {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: 2px;\r\n}\r\n\r\n.ltx-jc-rag-trigger.is-active {\r\n  background: var(--knowledge-control);\r\n  color: var(--knowledge-text);\r\n  box-shadow: 0 1px 2px rgb(0 0 0 / 7%), inset 0 1px 0 rgb(255 255 255 / 28%);\r\n}\r\n\r\n.ltx-jc-rag-trigger--rail {\n  width: 36px;\n  height: 36px;\n  margin: 8px 0 4px;\n  padding: 0;\n  justify-content: center;\r\n  gap: 0;\r\n  border-radius: 50%;\n}\n\n.ltx-jc-rag-session {\n  position: relative;\n  flex: none;\n  min-width: 0;\n  width: 100%;\n  margin: -4px 2px 8px;\n}\n\n.ltx-jc-rag-session--rail {\n  width: 36px;\n  margin: -4px 0 12px;\n}\n\n.ltx-jc-rag-session-button {\n  width: 100%;\n  margin: 0;\n}\n\n.ltx-jc-rag-session-panel {\n  display: grid;\n  gap: 8px;\n  margin-top: 6px;\n  padding: 9px;\n  border: 1px solid var(--knowledge-border);\n  border-radius: 12px;\n  background: var(--knowledge-control);\n  box-shadow: var(--knowledge-glass-shadow), 0 8px 22px rgb(0 0 0 / 6%);\n  color: var(--knowledge-text);\n}\n\n.ltx-jc-rag-session-panel label {\n  display: grid;\n  gap: 5px;\n  min-width: 0;\n  color: var(--knowledge-text-secondary);\n  font-size: 12px;\n}\n\n.ltx-jc-rag-session-panel select {\n  -webkit-appearance: none;\n  appearance: none;\n  min-width: 0;\n  height: 32px;\n  padding: 5px 26px 5px 9px;\n  border: 1px solid var(--knowledge-border);\n  border-radius: 9px;\n  background:\n    linear-gradient(45deg, transparent 50%, currentColor 50%) calc(100% - 14px) 13px / 5px 5px no-repeat,\n    linear-gradient(135deg, currentColor 50%, transparent 50%) calc(100% - 9px) 13px / 5px 5px no-repeat,\n    var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-1, #fff));\n  color: var(--knowledge-text);\n  font: inherit;\n  font-size: 13px;\n}\n\n.ltx-jc-rag-session-panel p {\n  margin: 0;\n  color: var(--knowledge-text-secondary);\n  font-size: 12px;\n  line-height: 17px;\n}\n\n.ltx-jc-rag-session-panel p[role="alert"] {\n  color: var(--knowledge-danger);\n}\n\n.ltx-jc-rag-session-panel > div {\n  display: flex;\n  justify-content: flex-end;\n  gap: 6px;\n}\n\n.ltx-jc-rag-session-panel button {\n  min-height: 30px;\n  padding: 5px 10px;\n  border: 0;\n  border-radius: 9px;\n  background: var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, .1));\n  color: var(--knowledge-text);\n  cursor: pointer;\n  font: inherit;\n  font-size: 12px;\n}\n\n.ltx-jc-rag-session-panel button.is-primary {\n  background: var(--knowledge-accent);\n  color: var(--knowledge-on-accent);\n}\n\n.ltx-jc-rag-session-panel button:disabled {\n  cursor: default;\n  opacity: .45;\n}\n\n.ltx-jc-rag-session-notice {\n  display: inline-flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 7px;\n  max-width: 100%;\n  margin: 0 0 8px;\n  padding: 6px 10px;\n  box-sizing: border-box;\n  border: 1px solid var(--knowledge-border);\n  border-radius: 10px;\n  background: var(--knowledge-control);\n  color: var(--knowledge-text-secondary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ltx-jc-rag-session-notice.is-exited {\n  color: var(--knowledge-text-secondary);\n}\n\n.ltx-jc-rag-session-notice strong {\n  min-width: 0;\n  overflow: hidden;\n  color: var(--knowledge-text);\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.ltx-jc-rag-session-notice button {\n  flex: none;\n  min-height: 24px;\n  padding: 1px 8px;\n  border: 1px solid color-mix(in srgb, var(--knowledge-border) 70%, var(--knowledge-text-secondary));\n  border-radius: 7px;\n  background: var(--knowledge-control);\n  color: var(--knowledge-text);\n  cursor: pointer;\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ltx-jc-rag-session-notice button:hover {\n  background: var(--knowledge-hover);\n}\n\n.ltx-jc-rag-session-notice button:disabled {\n  cursor: default;\n  opacity: .55;\n}\n\n.ltx-jc-rag-session-notice button:focus-visible {\n  outline: 2px solid var(--knowledge-accent);\n  outline-offset: 2px;\n}\n\n.ltx-jc-rag-session-notice em {\n  flex-basis: 100%;\n  color: var(--knowledge-danger);\n  font-style: normal;\n}\n\n.ltx-jc-rag-hero-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  min-height: 28px;\n  padding: 0 8px;\n  border: 0;\n  border-radius: 16px;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-size: 13px;\n  line-height: 20px;\n  font-weight: 500;\n  cursor: pointer;\n}\n\n.ltx-jc-rag-hero-toggle:hover,\n.ltx-jc-rag-hero-toggle[aria-checked="true"] {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.ltx-jc-rag-hero-toggle:disabled {\n  cursor: default;\n  opacity: .56;\n}\n\n.ltx-jc-rag-hero-toggle:focus-visible {\n  outline: 2px solid var(--knowledge-accent);\n  outline-offset: 2px;\n}\n\n.ltx-jc-rag-hero-toggle i {\n  position: relative;\n  flex: none;\n  width: 24px;\n  height: 14px;\n  border-radius: 999px;\n  background: var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, .16));\n  box-shadow: inset 0 0 0 1px var(--knowledge-border);\n  transition: background-color .15s ease;\n}\n\n.ltx-jc-rag-hero-toggle i::after {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--dsw-alias-label-tertiary, #6b7280);\n  transition: transform .16s cubic-bezier(.2, .8, .2, 1), background-color .15s ease;\n  content: "";\n}\n\n.ltx-jc-rag-hero-toggle[aria-checked="true"] {\n  color: color-mix(in srgb, var(--knowledge-success) 84%, var(--knowledge-text));\n}\n\n.ltx-jc-rag-hero-toggle[aria-checked="true"] i {\n  background: color-mix(in srgb, var(--knowledge-success) 20%, transparent);\n  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--knowledge-success) 42%, transparent);\n}\n\n.ltx-jc-rag-hero-toggle[aria-checked="true"] i::after {\n  background: var(--knowledge-success);\n  transform: translateX(10px);\n}\n\n.ltx-jc-rag-answer-source {\n  display: inline-flex;\n  align-self: flex-start;\n  align-items: center;\n  gap: 7px;\n  max-width: 100%;\n  padding: 6px 10px;\n  box-sizing: border-box;\n  border: 1px solid color-mix(in srgb, var(--knowledge-success) 36%, transparent);\n  border-radius: 10px;\n  background: color-mix(in srgb, var(--knowledge-success) 11%, transparent);\n  color: var(--knowledge-success);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ltx-jc-rag-answer-source strong {\n  min-width: 0;\n  overflow: hidden;\n  color: color-mix(in srgb, var(--knowledge-success) 84%, var(--knowledge-text));\n  font-weight: 600;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n/* Rail (collapsed) mode: the host footer seat is a horizontal row sized for a\n   single 36px circle per entry; with several entries it overflows the 56px\n   rail and the circles drift off the settings axis. Stack the entries\r\n   vertically, centered on the same axis as the settings circle. The --rail\r\n   class on the knowledge trigger is the collapsed-mode signal, so wide mode\r\n   is untouched. */\r\ndiv:has(> div[data-slot="sidebar.footer.action"] .ltx-jc-rag-trigger--rail) {\r\n  flex-direction: column;\r\n  align-items: center;\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .ltx-jc-rag-trigger,\r\n  .ltx-jc-rag-trigger::before { transition: none; }\r\n  .ltx-jc-rag-trigger::before { display: none; }\r\n}\r\n\r\n.ltx-jc-rag-workspace {\r\n  width: 100%;\r\n  height: 100%;\r\n  min-width: 0;\r\n  min-height: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  overflow: hidden;\r\n  background: transparent;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header {\r\n  position: relative;\r\n  z-index: 2;\r\n  flex: none;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 16px;\r\n  min-height: 52px;\r\n  margin: 8px 10px 0;\r\n  padding: 7px 14px;\r\n  box-sizing: border-box;\r\n  border: 1px solid var(--knowledge-border);\r\n  border-radius: 14px 14px 11px 11px;\r\n  background:\r\n    linear-gradient(145deg, color-mix(in srgb, var(--knowledge-glare-light) 20%, transparent), transparent 58%),\r\n    var(--knowledge-pane);\r\n  box-shadow: var(--knowledge-glass-shadow);\r\n  -webkit-backdrop-filter: var(--knowledge-glass-filter);\r\n  backdrop-filter: var(--knowledge-glass-filter);\r\n}\r\n\r\n.ltx-jc-rag-workspace-header > div {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  min-width: 0;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header [data-xiaohei-workspace-close] {\r\n  -webkit-appearance: none;\r\n  appearance: none;\r\n  display: grid;\r\n  place-items: center;\r\n  box-sizing: border-box;\r\n  flex: none;\r\n  width: 30px;\r\n  height: 30px;\r\n  margin: 0;\r\n  padding: 0;\r\n  border: 1px solid transparent;\r\n  border-radius: 9px;\r\n  color: var(--knowledge-text-secondary);\r\n  background: transparent;\r\n  font: inherit;\r\n  line-height: 1;\r\n  -webkit-tap-highlight-color: transparent;\r\n  cursor: pointer;\r\n  transition: color 140ms ease, background 140ms ease, border-color 140ms ease, transform 140ms ease;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header [data-xiaohei-workspace-close]:hover {\r\n  border-color: var(--knowledge-border);\r\n  color: var(--knowledge-text);\r\n  background: var(--knowledge-control);\r\n}\r\n\r\n.ltx-jc-rag-workspace-header [data-xiaohei-workspace-close]:active { transform: scale(.96); }\r\n.ltx-jc-rag-workspace-header [data-xiaohei-workspace-close]:focus-visible {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: 2px;\r\n}\r\n.ltx-jc-rag-workspace-header [data-xiaohei-workspace-close] > svg {\r\n  display: block;\r\n  pointer-events: none;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header > div > span {\r\n  display: grid;\r\n  min-width: 0;\r\n  gap: 2px;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header h2,\r\n.ltx-jc-rag-workspace-header p {\r\n  margin: 0;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header h2 {\r\n  color: var(--knowledge-text);\r\n  font-size: 15px;\r\n  line-height: 22px;\r\n  font-weight: 600;\r\n}\r\n\r\n.ltx-jc-rag-workspace-header p {\r\n  color: var(--knowledge-text-secondary);\r\n  font-size: 11px;\r\n  line-height: 16px;\r\n}\r\n\r\n.ltx-jc-rag-frame {\r\n  flex: 1;\r\n  display: block;\r\n  width: 100%;\r\n  min-height: 0;\r\n  margin: 0;\r\n  border: 0;\r\n  border-radius: 0;\r\n  background: transparent;\r\n  box-shadow: none;\r\n}\r\n\r\n.ltx-jc-rag-panel-state {\r\n  flex: 1;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 16px;\r\n  min-height: 0;\r\n  margin: 8px 10px 10px;\r\n  padding: 32px;\r\n  box-sizing: border-box;\r\n  border: 1px solid var(--knowledge-border);\r\n  border-radius: 15px;\r\n  background: var(--knowledge-pane);\r\n  box-shadow: var(--knowledge-glass-shadow);\r\n  -webkit-backdrop-filter: var(--knowledge-glass-filter);\r\n  backdrop-filter: var(--knowledge-glass-filter);\r\n  color: var(--dsw-alias-label-primary, #171719);\r\n}\r\n\r\n.ltx-jc-rag-panel-state-icon {\r\n  flex: none;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 12px;\r\n  background: var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, .1));\r\n  color: var(--dsw-alias-label-secondary, #68686f);\r\n  font-size: 18px;\r\n  font-weight: 600;\r\n}\r\n\r\n.ltx-jc-rag-panel-state > div { max-width: 560px; }\r\n.ltx-jc-rag-panel-state h3 { margin: 0 0 6px; font-size: 17px; line-height: 24px; font-weight: 600; }\r\n.ltx-jc-rag-panel-state p { margin: 0; color: var(--dsw-alias-label-secondary, #68686f); font-size: 13px; line-height: 20px; }\r\n.ltx-jc-rag-panel-state button {\r\n  min-width: 72px;\r\n  min-height: 32px;\r\n  margin-top: 16px;\r\n  padding: 6px 14px;\r\n  border: 0;\r\n  border-radius: 10px;\r\n  background: var(--knowledge-accent);\r\n  color: var(--knowledge-on-accent);\r\n  cursor: pointer;\r\n  font: inherit;\r\n}\r\n.ltx-jc-rag-panel-state button:focus-visible {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: 2px;\r\n}\r\n\r\n.ltx-jc-rag-settings-card {\r\n  list-style: none;\r\n  overflow: hidden;\r\n  border: 1px solid var(--knowledge-border);\r\n  border-radius: 14px;\r\n  background:\r\n    linear-gradient(145deg, color-mix(in srgb, var(--knowledge-glare-light) 16%, transparent), transparent 58%),\r\n    var(--knowledge-pane);\r\n  color: var(--dsw-alias-label-primary, #171719);\r\n  box-shadow: var(--knowledge-glass-shadow), 0 8px 24px rgb(0 0 0 / 5%);\r\n  -webkit-backdrop-filter: var(--knowledge-glass-filter);\r\n  backdrop-filter: var(--knowledge-glass-filter);\r\n  transition: border-color .16s, background .16s, box-shadow .2s, transform .2s cubic-bezier(.22, 1, .36, 1);\r\n}\r\n.ltx-jc-rag-settings-card:hover {\r\n  border-color: color-mix(in srgb, var(--knowledge-border) 68%, var(--knowledge-text-secondary));\r\n  box-shadow: var(--knowledge-glass-shadow), 0 12px 30px rgb(0 0 0 / 8%);\r\n  transform: translateY(-1px);\r\n}\r\n.ltx-jc-rag-settings-card--open {\r\n  border-color: color-mix(in srgb, var(--knowledge-border) 68%, var(--knowledge-text-secondary));\r\n  background: var(--knowledge-pane);\r\n}\r\n.ltx-jc-rag-settings-header { display: flex; width: 100%; align-items: center; gap: 12px; padding: 14px 16px; border: 0; border-radius: 12px; background: transparent; color: inherit; text-align: left; cursor: pointer; font: inherit; }\r\n.ltx-jc-rag-settings-header:focus-visible {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: -2px;\r\n}\r\n.ltx-jc-rag-settings-actions button:focus-visible,\r\n.ltx-jc-rag-settings-load-error button:focus-visible {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: 2px;\r\n}\r\n.ltx-jc-rag-settings-header > span:first-child { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 4px; }\r\n.ltx-jc-rag-settings-header strong { font-size: 15px; font-weight: 600; line-height: 1.4; }\r\n.ltx-jc-rag-settings-header small { color: var(--dsw-alias-label-tertiary); font-size: 13px; line-height: 1.5; }\r\n.ltx-jc-rag-source-picker small,\r\n.ltx-jc-rag-remote-fields small { color: var(--dsw-alias-label-secondary, #68686f); font-size: 12px; }\r\n.ltx-jc-rag-settings-summary { display: flex; flex: none; align-items: center; gap: 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\r\n.ltx-jc-rag-settings-summary i { width: 8px; height: 8px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg); transition: transform 160ms ease; }\r\n.ltx-jc-rag-settings-card--open .ltx-jc-rag-settings-summary i { transform: rotate(225deg); }\r\n\r\n.ltx-jc-rag-settings-body {\r\n  display: grid;\r\n  gap: 18px;\r\n  margin: 0 16px;\r\n  padding-bottom: 8px;\r\n  border-top: 1px solid var(--dsw-alias-border-l2);\r\n}\r\n\r\n.ltx-jc-rag-source-picker {\r\n  min-width: 0;\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 10px;\r\n  margin: 18px 0 0;\r\n  padding: 0;\r\n  border: 0;\r\n}\r\n\r\n.ltx-jc-rag-source-picker legend { margin-bottom: 8px; padding: 0; color: inherit; font-size: 13px; font-weight: 600; }\r\n.ltx-jc-rag-source-picker label {\r\n  display: flex;\r\n  gap: 10px;\r\n  padding: 13px;\r\n  border: 1px solid var(--dsw-alias-divider-primary, rgba(128, 128, 128, .2));\r\n  border-radius: 14px;\r\n  cursor: pointer;\r\n}\r\n.ltx-jc-rag-source-picker label.is-selected {\r\n  border-color: var(--knowledge-accent);\r\n  background: color-mix(in srgb, var(--knowledge-accent) 7%, transparent);\r\n}\r\n.ltx-jc-rag-source-picker label.is-disabled {\r\n  cursor: default;\r\n  opacity: .55;\r\n}\r\n.ltx-jc-rag-source-picker label:focus-within {\r\n  outline: 2px solid var(--knowledge-accent);\r\n  outline-offset: 2px;\r\n}\r\n.ltx-jc-rag-source-picker input {\r\n  -webkit-appearance: none;\r\n  appearance: none;\r\n  width: 16px;\r\n  height: 16px;\r\n  display: inline-grid;\r\n  place-content: center;\r\n  flex: none;\r\n  margin: 2px 0 0;\r\n  border: 1px solid var(--dsw-alias-divider-primary, rgba(128, 128, 128, .34));\r\n  border-radius: 50%;\r\n  background: var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-1, #fff));\r\n  color: var(--knowledge-on-accent);\r\n  cursor: pointer;\r\n  transition: border-color .15s ease, background-color .15s ease;\r\n}\r\n.ltx-jc-rag-source-picker input::before {\r\n  content: "";\r\n  width: 6px;\r\n  height: 6px;\r\n  border-radius: 50%;\r\n  background: currentColor;\r\n  opacity: 0;\r\n  transform: scale(.55);\r\n  transition: opacity .12s ease, transform .15s cubic-bezier(.2, .8, .2, 1);\r\n}\r\n.ltx-jc-rag-source-picker input:checked { border-color: var(--knowledge-accent); background: var(--knowledge-accent); }\r\n.ltx-jc-rag-source-picker input:checked::before { opacity: 1; transform: scale(1); }\r\n.ltx-jc-rag-source-picker input:disabled { cursor: default; }\n.ltx-jc-rag-source-picker span { display: grid; gap: 3px; }\n\n.ltx-jc-rag-auto-mount-toggle {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n  margin: 0;\n  padding: 12px 13px;\n  border: 1px solid var(--dsw-alias-divider-primary, rgba(128, 128, 128, .2));\n  border-radius: 14px;\n  background: var(--knowledge-control);\n  color: var(--knowledge-text);\n  cursor: pointer;\n}\n.ltx-jc-rag-auto-mount-toggle input {\n  -webkit-appearance: none;\n  appearance: none;\n  flex: none;\n  width: 38px;\n  height: 22px;\n  margin: 0;\n  padding: 2px;\n  box-sizing: border-box;\n  border: 1px solid var(--dsw-alias-divider-primary, rgba(128, 128, 128, .28));\n  border-radius: 999px;\n  background: var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, .14));\n  cursor: pointer;\n  transition: background-color .15s ease, border-color .15s ease;\n}\n.ltx-jc-rag-auto-mount-toggle input::before {\n  display: block;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-1, #fff));\n  box-shadow: 0 1px 2px rgb(0 0 0 / 20%);\n  transform: translateX(0);\n  transition: transform .16s cubic-bezier(.2, .8, .2, 1);\n  content: "";\n}\n.ltx-jc-rag-auto-mount-toggle input:checked {\n  border-color: var(--knowledge-accent);\n  background: var(--knowledge-accent);\n}\n.ltx-jc-rag-auto-mount-toggle input:checked::before { transform: translateX(16px); }\n.ltx-jc-rag-auto-mount-toggle input:focus-visible {\n  outline: 2px solid var(--knowledge-accent);\n  outline-offset: 2px;\n}\n.ltx-jc-rag-auto-mount-toggle span {\n  display: grid;\n  gap: 3px;\n  min-width: 0;\n}\n.ltx-jc-rag-auto-mount-toggle strong {\n  font-size: 13px;\n  line-height: 18px;\n  font-weight: 600;\n}\n.ltx-jc-rag-auto-mount-toggle small {\n  color: var(--dsw-alias-label-secondary, #68686f);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ltx-jc-rag-remote-fields { display: grid; grid-template-columns: 1.25fr 1fr; gap: 12px; }\n.ltx-jc-rag-remote-fields label,\n.ltx-jc-rag-timeout-field { display: grid; gap: 6px; color: var(--dsw-alias-label-secondary, #68686f); font-size: 12px; }\n.ltx-jc-rag-remote-fields input,\r\n.ltx-jc-rag-timeout-field input {\r\n  -webkit-appearance: none;\r\n  appearance: none;\r\n  min-height: 38px;\r\n  box-sizing: border-box;\r\n  padding: 8px 11px;\r\n  border: 1px solid var(--dsw-alias-divider-primary, rgba(128, 128, 128, .25));\r\n  border-radius: 10px;\r\n  outline: none;\r\n  background: var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-1, #fff));\r\n  color: var(--dsw-alias-label-primary, #171719);\r\n  font: inherit;\r\n}\r\n.ltx-jc-rag-remote-fields input:focus,\r\n.ltx-jc-rag-timeout-field input:focus { border-color: var(--knowledge-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--knowledge-accent) 16%, transparent); }\r\n.ltx-jc-rag-remote-fields input:-webkit-autofill,\r\n.ltx-jc-rag-remote-fields input:-webkit-autofill:hover,\r\n.ltx-jc-rag-remote-fields input:-webkit-autofill:focus {\r\n  -webkit-text-fill-color: var(--dsw-alias-label-primary, #171719);\r\n  box-shadow: 0 0 0 1000px var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-1, #fff)) inset;\r\n  caret-color: var(--dsw-alias-label-primary, #171719);\r\n}\r\n.ltx-jc-rag-timeout-field input::-webkit-inner-spin-button,\r\n.ltx-jc-rag-timeout-field input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }\r\n.ltx-jc-rag-timeout-field { max-width: 240px; }\r\n.ltx-jc-rag-field-error { color: var(--knowledge-danger) !important; }\r\n\r\n.ltx-jc-rag-settings-message,\r\n.ltx-jc-rag-settings-note { margin: 0; color: var(--dsw-alias-label-secondary, #68686f); font-size: 12px; }\r\n.ltx-jc-rag-settings-message.is-success { color: var(--knowledge-success); }\r\n.ltx-jc-rag-settings-message.is-error { color: var(--knowledge-danger); }\r\n.ltx-jc-rag-settings-load-error {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 12px;\r\n  margin-top: 18px;\r\n  padding: 12px 14px;\r\n  border-radius: 12px;\r\n  background: color-mix(in srgb, var(--knowledge-danger) 8%, transparent);\r\n  color: var(--knowledge-danger);\r\n  font-size: 13px;\r\n}\r\n.ltx-jc-rag-settings-load-error p { margin: 0; }\r\n.ltx-jc-rag-settings-load-error button {\r\n  flex: none;\r\n  min-height: 30px;\r\n  padding: 5px 10px;\r\n  border: 0;\r\n  border-radius: 9px;\r\n  background: var(--xiaohei-plugin-control-fill, var(--dsw-alias-bg-layer-2, #fff));\r\n  color: var(--dsw-alias-label-primary, #171719);\r\n  cursor: pointer;\r\n  font: inherit;\r\n}\r\n.ltx-jc-rag-settings-actions { display: flex; justify-content: flex-end; gap: 8px; }\r\n.ltx-jc-rag-settings-actions button {\r\n  min-height: 34px;\r\n  padding: 7px 13px;\r\n  border: 0;\r\n  border-radius: 10px;\r\n  background: var(--dsw-alias-interactive-bg-hover, rgba(128, 128, 128, .1));\r\n  color: var(--dsw-alias-label-primary, #171719);\r\n  cursor: pointer;\r\n  font: inherit;\r\n  font-size: 13px;\r\n}\r\n.ltx-jc-rag-settings-actions button.is-primary { background: var(--knowledge-accent); color: var(--knowledge-on-accent); }\r\n.ltx-jc-rag-settings-actions button:disabled { cursor: default; opacity: .45; }\r\n\r\n@media (max-width: 720px) {\r\n  .ltx-jc-rag-source-picker,\r\n  .ltx-jc-rag-remote-fields { grid-template-columns: 1fr; }\r\n  .ltx-jc-rag-settings-summary { font-size: 0; }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .ltx-jc-rag-settings-card,\r\n  .ltx-jc-rag-settings-header,\r\n  .ltx-jc-rag-settings-summary i { transition: none; }\r\n}\r\n\r\n.ltx-jc-rag-writeback-status {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-width: 0;\r\n  color: var(--dsw-alias-label-tertiary, #6b7280);\r\n  font-size: 12px;\r\n  line-height: 1.5;\r\n}\r\n.ltx-jc-rag-writeback-status strong {\r\n  color: var(--dsw-alias-label-secondary, #374151);\r\n  font-weight: 600;\r\n}\r\n.ltx-jc-rag-writeback-status button {\r\n  min-height: 24px;\r\n  padding: 0 9px;\r\n  border: 1px solid var(--dsw-alias-separator, #d1d5db);\r\n  border-radius: 7px;\r\n  color: var(--dsw-alias-label-secondary, #374151);\r\n  background: var(--dsw-alias-button-elevated-fill, #fff);\r\n  cursor: pointer;\r\n  font: inherit;\r\n}\r\n.ltx-jc-rag-writeback-status button:disabled { cursor: default; opacity: .5; }\r\n';

// src/constants.ts
var KNOWLEDGE_SETTINGS_NAMESPACE = "ltx-jc-rag-connection";
var KNOWLEDGE_SESSION_STRICT_MARKER = "@ltx-jc-rag-session:strict";
var KNOWLEDGE_SESSION_DISABLE_DEFAULT_MARKER = "@ltx-jc-rag-session:default-disabled";

// src/theme-bridge.ts
var KNOWLEDGE_THEME_MESSAGE = "ltx-jc-rag/host-theme";
var KNOWLEDGE_THEME_READY_MESSAGE = "ltx-jc-rag/host-theme-ready";
var KNOWLEDGE_THEME_PROTOCOL_VERSION = 1;
var WORKSPACE_TOKENS = {
  light: {
    "--bg": "#e9e9ed",
    "--surface": "#f2f3f7",
    "--surface-raised": "#ffffff",
    "--surface-soft": "#eceef1",
    "--surface-hover": "#e5e5e7",
    "--dialog-surface": "#ffffff",
    "--text": "#1d1d1f",
    "--text-secondary": "#515154",
    "--text-tertiary": "#6e6e73",
    "--border": "rgb(60 60 67 / 14%)",
    "--border-strong": "rgb(60 60 67 / 24%)",
    "--accent": "#3a3a3c",
    "--accent-hover": "#1d1d1f",
    "--accent-soft": "#e2e2e5",
    "--on-accent": "#ffffff",
    "--success": "#248a3d",
    "--success-soft": "#e8f5eb",
    "--warning": "#c93400",
    "--warning-soft": "#fff1e8",
    "--danger": "#d70015",
    "--danger-soft": "#ffebed",
    "--shadow": "0 24px 64px rgb(0 0 0 / 20%)"
  },
  dark: {
    "--bg": "transparent",
    "--surface": "rgb(8 10 12 / 20%)",
    "--surface-raised": "rgb(10 12 15 / 44%)",
    "--surface-soft": "rgb(255 255 255 / 6%)",
    "--surface-hover": "rgb(255 255 255 / 7.5%)",
    "--dialog-surface": "rgb(10 12 15 / 72%)",
    "--text": "#f5f5f7",
    "--text-secondary": "#d1d1d6",
    "--text-tertiary": "#98989d",
    "--border": "rgb(255 255 255 / 10%)",
    "--border-strong": "rgb(255 255 255 / 18%)",
    "--accent": "#e5e5ea",
    "--accent-hover": "#ffffff",
    "--accent-soft": "rgb(255 255 255 / 9%)",
    "--on-accent": "#1d1d1f",
    "--success": "#30d158",
    "--success-soft": "rgb(48 209 88 / 13%)",
    "--warning": "#ff9f0a",
    "--warning-soft": "rgb(255 159 10 / 13%)",
    "--danger": "#ff453a",
    "--danger-soft": "rgb(255 69 58 / 14%)",
    "--shadow": "0 28px 72px rgb(0 0 0 / 42%)"
  }
};
function createKnowledgeHostTheme(_computed, snapshot) {
  return {
    type: KNOWLEDGE_THEME_MESSAGE,
    version: KNOWLEDGE_THEME_PROTOCOL_VERSION,
    colorScheme: snapshot.active.colorScheme,
    tokens: { ...WORKSPACE_TOKENS[snapshot.active.colorScheme] }
  };
}

// src/client.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var PLUGIN_ID = "ltx-jc-rag";
var STYLE_ID = `${PLUGIN_ID}/client`;
var DEFAULT_KNOWLEDGE_BASE_ID = "default";
var DEFAULT_KNOWLEDGE_WRITE_MODE = "audit";
var CONNECTION_CONTROL_PATH = "/ltx-jc-rag-control/v1/connection";
var LOCAL_MANAGEMENT_PATH = "/ltx-jc-rag-local/v1";
var cachedConnectionView;
var inject = ["slots", "theme", "sessions", "workspaces"];
function apply(ctx) {
  ctx.effect(installStyles, "ltx-jc-rag: client styles");
  const workspace = createKnowledgeWorkspaceController(ctx);
  ctx.effect(() => observePluginWorkspace(PLUGIN_ID, workspace.close), "ltx-jc-rag: exclusive workspace");
  ctx.effect(() => () => {
    workspace.close();
  }, "ltx-jc-rag: workspace lifecycle");
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "knowledge",
    order: -10
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeLauncher, { ...props, workspace })));
  ctx.slots.inject("sidebar.new-session.action", () => ctx.slots.register({
    name: "sidebar.new-session.action",
    id: "ltx-jc-rag-session",
    order: -100
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeSessionLauncher, { ...props, client: ctx })));
  ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
    name: "settings.plugins.tab",
    id: KNOWLEDGE_SETTINGS_NAMESPACE,
    order: 20,
    label: () => "\u77E5\u8BC6\u5E93"
  }, KnowledgeConnectionCard));
  ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
    name: "conversation.chat.turnTail",
    id: "ltx-jc-rag-writeback-status"
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeAnswerSource, { sessionId: String(props.sessionId) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeWritebackStatus, { sessionId: String(props.sessionId), turn: props.turn.turn })
  ] })));
  ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
    name: "conversation.input.dock",
    id: "ltx-jc-rag-session",
    order: -20
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeSessionNotice, { ...props })));
  ctx.slots.inject("conversation.hero.actions", () => ctx.slots.register({
    name: "conversation.hero.actions",
    id: "ltx-jc-rag-current-session",
    order: -20
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeHeroSessionToggle, { ...props })));
}
function KnowledgeHeroSessionToggle({ sessionId, projectId }) {
  const [state, setState] = (0, import_react.useState)("loading");
  const [enabled, setEnabled] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  const load = (0, import_react.useCallback)(async (signal) => {
    if (!sessionId) {
      setState("idle");
      setEnabled(false);
      setError("");
      return;
    }
    setState("loading");
    setError("");
    try {
      let view = await currentDefaultMountState(sessionId, projectId, signal);
      if (signal?.aborted) return;
      setEnabled(view.recordingEnabled);
      setState("idle");
    } catch (error2) {
      if (signal?.aborted) return;
      setError(knowledgeSessionError(error2));
      setState("error");
    }
  }, [projectId, sessionId]);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
    };
  }, [load]);
  const toggle = async () => {
    if (!sessionId || state === "loading" || state === "saving") return;
    if (state === "error") {
      await load();
      return;
    }
    const next = !enabled;
    setState("saving");
    setError("");
    setEnabled(next);
    try {
      await setCurrentSessionRecording(sessionId, projectId, next);
      const view = await currentDefaultMountState(sessionId, projectId);
      setEnabled(view.recordingEnabled);
      setState("idle");
    } catch (error2) {
      setEnabled(!next);
      setError(knowledgeSessionError(error2));
      setState("error");
    }
  };
  const disabled = !sessionId || state === "loading" || state === "saving";
  const label = state === "loading" ? "\u5BF9\u8BDD\u8BB0\u5F55\u8BFB\u53D6\u4E2D" : state === "saving" ? "\u5BF9\u8BDD\u8BB0\u5F55\u4FDD\u5B58\u4E2D" : enabled ? "\u6B63\u5728\u8BB0\u5F55\u672C\u6B21\u5BF9\u8BDD" : "\u672C\u6B21\u5BF9\u8BDD\u4E0D\u8BB0\u5F55";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "ltx-jc-rag-hero-toggle",
      role: "switch",
      "aria-checked": enabled,
      "aria-busy": state === "loading" || state === "saving",
      "aria-label": label,
      title: error || (sessionId ? "\u63A7\u5236\u5F53\u524D\u4F1A\u8BDD\u662F\u5426\u8BB0\u5F55\u5230\u77E5\u8BC6\u5E93\uFF1B\u4E0D\u4F1A\u5F71\u54CD\u77E5\u8BC6\u5E93\u68C0\u7D22" : "\u8FDB\u5165\u4F1A\u8BDD\u540E\u53EF\u63A7\u5236\u662F\u5426\u8BB0\u5F55"),
      disabled,
      onClick: () => {
        void toggle();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 14 }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u8BB0\u5F55\u5BF9\u8BDD" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" })
      ]
    }
  );
}
function KnowledgeSessionLauncher({ wide, expandSidebar, client }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const [bases, setBases] = (0, import_react.useState)([]);
  const [selected, setSelected] = (0, import_react.useState)("");
  const [state, setState] = (0, import_react.useState)("idle");
  const [message, setMessage] = (0, import_react.useState)("");
  const load = async () => {
    setState("loading");
    setMessage("");
    try {
      const items = (await requestManagement("knowledge-bases")).filter((base) => base.status === "active");
      setBases(items);
      setSelected((current) => current || items[0]?.id || "");
      setState("idle");
    } catch (error) {
      setState("idle");
      setMessage(knowledgeSessionError(error));
    }
  };
  const toggle = () => {
    if (!wide) {
      expandSidebar?.();
      setOpen(true);
      if (bases.length === 0 && state !== "loading") void load();
      return;
    }
    setOpen((value) => {
      const next = !value;
      if (next && bases.length === 0 && state !== "loading") void load();
      return next;
    });
  };
  const create = async () => {
    if (!selected || state === "creating") return;
    setState("creating");
    setMessage("");
    try {
      const sessionId = await createKnowledgeSession(client);
      const base = bases.find((item) => item.id === selected);
      await requestManagement("mounts", {
        method: "POST",
        body: {
          draft: {
            targetKind: "session",
            targetId: sessionId,
            knowledgeBaseId: selected,
            enabled: true,
            recallEnabled: true,
            writeMode: DEFAULT_KNOWLEDGE_WRITE_MODE,
            includeTags: [],
            excludeTags: [],
            extractionInstructions: `${KNOWLEDGE_SESSION_STRICT_MARKER}
Strict Ltx JC RAG knowledge session. Answer only from the selected knowledge base.`
          }
        }
      });
      client.get("sessions").open(sessionId);
      setOpen(false);
      setMessage(`\u5DF2\u8FDB\u5165 Ltx JC RAG \u77E5\u8BC6\u5E93\u4F1A\u8BDD\uFF1A${base?.name ?? selected}`);
    } catch (error) {
      setMessage(knowledgeSessionError(error));
    } finally {
      setState("idle");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `ltx-jc-rag-session${wide ? "" : " ltx-jc-rag-session--rail"}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: `ltx-jc-rag-trigger ltx-jc-rag-session-button${wide ? "" : " ltx-jc-rag-trigger--rail"}`,
        "aria-label": "Ltx JC RAG \u77E5\u8BC6\u5E93\u4F1A\u8BDD",
        "aria-expanded": open,
        title: wide ? void 0 : "Ltx JC RAG \u77E5\u8BC6\u5E93\u4F1A\u8BDD",
        onClick: toggle,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: wide ? 16 : 18 }),
          wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u77E5\u8BC6\u5E93\u4F1A\u8BDD" })
        ]
      }
    ),
    wide && open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-session-panel", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u9009\u62E9\u77E5\u8BC6\u5E93" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: selected, disabled: state !== "idle" || bases.length === 0, onChange: (event) => {
          setSelected(event.target.value);
        }, children: bases.map((base) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: base.id, children: base.name }, base.id)) })
      ] }),
      message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: message.startsWith("\u5DF2\u8FDB\u5165") ? "status" : "alert", children: message }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
          void load();
        }, disabled: state === "loading" || state === "creating", children: state === "loading" ? "\u8BFB\u53D6\u4E2D\u2026" : "\u5237\u65B0" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "is-primary", onClick: () => {
          void create();
        }, disabled: !selected || state !== "idle", children: state === "creating" ? "\u521B\u5EFA\u4E2D\u2026" : "\u8FDB\u5165" })
      ] })
    ] })
  ] });
}
function KnowledgeSessionNotice({ sessionId }) {
  const mount = useStrictKnowledgeSessionMount(sessionId);
  const [exited, setExited] = (0, import_react.useState)(false);
  const [leaving, setLeaving] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => {
    setExited(false);
    setLeaving(false);
    setError("");
  }, [sessionId]);
  const leave = async () => {
    if (mount === void 0 || leaving) return;
    setLeaving(true);
    setError("");
    try {
      await requestManagement(`mounts/${encodeURIComponent(mount.id)}`, { method: "DELETE" });
      setExited(true);
    } catch (error2) {
      setError(knowledgeSessionError(error2));
    } finally {
      setLeaving(false);
    }
  };
  if (exited) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ltx-jc-rag-session-notice is-exited", role: "status", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u5DF2\u9000\u51FA Ltx JC RAG \u77E5\u8BC6\u5E93\u4F1A\u8BDD\uFF0C\u5F53\u524D\u4E3A\u666E\u901A\u56DE\u7B54" }) });
  if (mount === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-session-notice", role: "status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 14 }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u5DF2\u8FDB\u5165 Ltx JC RAG \u77E5\u8BC6\u5E93\u4F1A\u8BDD" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: mount.base?.name ?? mount.knowledgeBaseId }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
      void leave();
    }, disabled: leaving, children: leaving ? "\u9000\u51FA\u4E2D\u2026" : "\u9000\u51FA" }),
    error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { role: "alert", children: error })
  ] });
}
function KnowledgeAnswerSource({ sessionId }) {
  const mount = useStrictKnowledgeSessionMount(sessionId);
  if (mount === void 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-answer-source", role: "note", "aria-label": "Ltx JC RAG \u77E5\u8BC6\u5E93\u56DE\u7B54", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 14 }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u6839\u636E Ltx JC RAG \u77E5\u8BC6\u5E93\u56DE\u7B54" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: mount.base?.name ?? mount.knowledgeBaseId })
  ] });
}
function useStrictKnowledgeSessionMount(sessionId) {
  const [mount, setMount] = (0, import_react.useState)();
  (0, import_react.useEffect)(() => {
    if (sessionId === void 0) {
      setMount(void 0);
      return;
    }
    const controller = new AbortController();
    void requestManagement(`mounts/resolve?sessionId=${encodeURIComponent(String(sessionId))}`, { signal: controller.signal }).then((items) => {
      if (controller.signal.aborted) return;
      setMount(items.find((item) => item.targetKind === "session" && item.extractionInstructions.includes(KNOWLEDGE_SESSION_STRICT_MARKER)));
    }).catch(() => {
      if (!controller.signal.aborted) setMount(void 0);
    });
    return () => {
      controller.abort();
    };
  }, [sessionId]);
  return mount;
}
async function currentDefaultMountState(sessionId, projectId, signal) {
  const [explicit, inherited] = await Promise.all([
    sessionDefaultMount(sessionId, signal),
    projectId === void 0 ? Promise.resolve(void 0) : projectDefaultMount(projectId, signal)
  ]);
  if (explicit !== void 0) {
    return { recordingEnabled: explicit.enabled && explicit.writeMode !== "none", explicit, ...inherited === void 0 ? {} : { inherited } };
  }
  return { recordingEnabled: inherited !== void 0 && inherited.enabled && inherited.writeMode !== "none", ...inherited === void 0 ? {} : { inherited } };
}
async function setCurrentSessionRecording(sessionId, projectId, enabled) {
  const view = await currentDefaultMountState(sessionId, projectId);
  await requestManagement("mounts", {
    method: "POST",
    body: { draft: defaultSessionRecordingDraft(sessionId, enabled, view.explicit, view.inherited) }
  });
}
function defaultSessionRecordingDraft(sessionId, recordingEnabled, previous, inherited) {
  const source = previous ?? inherited;
  return {
    targetKind: "session",
    targetId: sessionId,
    knowledgeBaseId: DEFAULT_KNOWLEDGE_BASE_ID,
    enabled: source?.enabled ?? true,
    recallEnabled: source?.recallEnabled ?? true,
    writeMode: recordingEnabled ? writebackModeForEnabledMount(source) : "none",
    includeTags: source?.includeTags ?? [],
    excludeTags: source?.excludeTags ?? [],
    extractionInstructions: source?.extractionInstructions.replace(KNOWLEDGE_SESSION_DISABLE_DEFAULT_MARKER, "").trim() || "Current Ltx JC RAG default knowledge base mount for this session."
  };
}
function writebackModeForEnabledMount(previous) {
  return previous?.writeMode === "direct" ? "direct" : DEFAULT_KNOWLEDGE_WRITE_MODE;
}
async function sessionDefaultMount(sessionId, signal) {
  const mounts = await requestManagement(
    `mounts?targetKind=session&targetId=${encodeURIComponent(sessionId)}`,
    signal === void 0 ? {} : { signal }
  );
  return mounts.find((mount) => mount.knowledgeBaseId === DEFAULT_KNOWLEDGE_BASE_ID);
}
async function projectDefaultMount(projectId, signal) {
  const mounts = await requestManagement(
    `mounts?targetKind=project&targetId=${encodeURIComponent(projectId)}`,
    signal === void 0 ? {} : { signal }
  );
  return mounts.find((mount) => mount.knowledgeBaseId === DEFAULT_KNOWLEDGE_BASE_ID && mount.enabled && mount.recallEnabled);
}
async function createKnowledgeSession(client) {
  const sessions = client.get("sessions");
  const workspaces = client.get("workspaces");
  const current = sessions.list.getSnapshot().current;
  const currentSummary = current === void 0 ? void 0 : sessions.list.getSnapshot().byId[current];
  const workspace = current === void 0 ? void 0 : workspaces.list.getSnapshot().items.find((item) => item.sessionIds.includes(current));
  if (workspace !== void 0) return sessions.create({ workspaceId: workspace.workspaceId });
  if (currentSummary?.cwd !== void 0) return sessions.create({ cwd: currentSummary.cwd });
  return sessions.create();
}
function KnowledgeWritebackStatus({ sessionId, turn }) {
  const [state, setState] = (0, import_react.useState)();
  const [retrying, setRetrying] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    void fetch(`/ltx-jc-rag-control/v1/writeback-status?sessionId=${encodeURIComponent(sessionId)}&turn=${turn}`, {
      headers: { accept: "application/json", "x-ltx-jc-rag-client": "conversation-web" },
      signal: controller.signal
    }).then(async (response) => response.ok ? response.json() : void 0).then((value) => {
      if (value?.summary) setState(value);
    }).catch(() => {
    });
    return () => {
      controller.abort();
    };
  }, [sessionId, turn]);
  if (state === void 0) return null;
  const retry = async () => {
    setRetrying(true);
    try {
      const response = await fetch(`/ltx-jc-rag-control/v1/writeback-status?sessionId=${encodeURIComponent(sessionId)}&turn=${turn}`, {
        method: "POST",
        headers: { accept: "application/json", "x-ltx-jc-rag-client": "conversation-web" }
      });
      if (!response.ok) throw new Error(`retry failed with HTTP ${response.status}`);
      setState(await response.json());
    } catch (error) {
      setState((previous) => previous === void 0 ? previous : {
        ...previous,
        error: error instanceof Error ? error.message : String(error),
        retryable: true
      });
    } finally {
      setRetrying(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-writeback-status", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u4E0A\u4E0B\u6587\u6CE8\u5165" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ltx JC RAG \u77E5\u8BC6\u5E93" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { title: state.error, children: state.summary }),
    state.status === "failed" && state.retryable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: retrying, onClick: () => {
      void retry();
    }, children: retrying ? "\u91CD\u8BD5\u4E2D\u2026" : "\u91CD\u8BD5" })
  ] });
}
function createKnowledgeWorkspaceController(client) {
  const listeners = /* @__PURE__ */ new Set();
  let disposeWorkspace;
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const close = () => {
    if (disposeWorkspace === void 0) return;
    const dispose = disposeWorkspace;
    disposeWorkspace = void 0;
    dispose();
    notify();
  };
  const controller = {
    isOpen: () => disposeWorkspace !== void 0,
    toggle: () => {
      if (disposeWorkspace !== void 0) return close();
      activatePluginWorkspace(PLUGIN_ID);
      const dispose = client.slots.register({ name: "main.conversation", priority: -1 }, (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnowledgeWorkspace, { ...props, client, workspace: controller }));
      disposeWorkspace = dispose;
      notify();
    },
    close,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
  return controller;
}
function KnowledgeConnectionCard() {
  const [current, setCurrent] = (0, import_react.useState)();
  const [loadState, setLoadState] = (0, import_react.useState)("loading");
  const [loadError, setLoadError] = (0, import_react.useState)("");
  const [open, setOpen] = (0, import_react.useState)(false);
  const [backend, setBackend] = (0, import_react.useState)("local");
  const [remoteUrl, setRemoteUrl] = (0, import_react.useState)("");
  const [remoteToken, setRemoteToken] = (0, import_react.useState)("");
  const [timeout, setTimeoutValue] = (0, import_react.useState)("10000");
  const [autoMountDefaultKnowledgeBase, setAutoMountDefaultKnowledgeBase] = (0, import_react.useState)(true);
  const [dirty, setDirty] = (0, import_react.useState)(false);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [message, setMessage] = (0, import_react.useState)();
  const load = (0, import_react.useCallback)(async (signal) => {
    setLoadState("loading");
    setLoadError("");
    try {
      const value = await requestConnection("GET", void 0, signal);
      setCurrent(value);
      setLoadState("ready");
    } catch (error) {
      if (signal?.aborted) return;
      setLoadError(connectionErrorMessage(error));
      setLoadState("error");
    }
  }, []);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => {
      controller.abort();
    };
  }, [load]);
  (0, import_react.useEffect)(() => {
    if (dirty || current === void 0) return;
    setBackend(current.backend);
    setRemoteUrl(current.remoteUrl ?? "");
    setTimeoutValue(String(current.remoteTimeoutMs ?? 1e4));
    setAutoMountDefaultKnowledgeBase(current.autoMountDefaultKnowledgeBase);
  }, [current, dirty]);
  const timeoutNumber = Number(timeout);
  const urlError = backend === "remote" ? validateRemoteUrl(remoteUrl) : void 0;
  const tokenError = backend === "remote" && !current?.tokenConfigured && remoteToken.trim().length === 0 ? "\u9996\u6B21\u8FDE\u63A5\u5FC5\u987B\u586B\u5199\u5BA2\u6237\u7AEF\u4EE4\u724C\u3002" : remoteToken.length > 0 && remoteToken.trim().length < 24 ? "\u4EE4\u724C\u81F3\u5C11\u9700\u8981 24 \u4E2A\u5B57\u7B26\u3002" : void 0;
  const timeoutError = !Number.isInteger(timeoutNumber) || timeoutNumber < 100 || timeoutNumber > 12e4 ? "\u8D85\u65F6\u5FC5\u987B\u662F 100 \u5230 120000 \u6BEB\u79D2\u4E4B\u95F4\u7684\u6574\u6570\u3002" : void 0;
  const invalid = urlError !== void 0 || tokenError !== void 0 || timeoutError !== void 0;
  const edit = (action) => {
    action();
    setDirty(true);
    setMessage(void 0);
  };
  const reset = () => {
    setBackend(current?.backend ?? "local");
    setRemoteUrl(current?.remoteUrl ?? "");
    setRemoteToken("");
    setTimeoutValue(String(current?.remoteTimeoutMs ?? 1e4));
    setAutoMountDefaultKnowledgeBase(current?.autoMountDefaultKnowledgeBase ?? true);
    setDirty(false);
    setMessage(void 0);
  };
  const save = async () => {
    if (!dirty || invalid || !current?.writable || saving) return;
    setSaving(true);
    setMessage(void 0);
    try {
      const next = await requestConnection("PUT", {
        backend,
        remoteTimeoutMs: timeoutNumber,
        autoMountDefaultKnowledgeBase,
        ...backend === "remote" ? { remoteUrl: remoteUrl.trim() } : {},
        ...backend === "remote" && remoteToken.trim().length > 0 ? { remoteToken: remoteToken.trim() } : {}
      });
      setCurrent(next);
      setRemoteToken("");
      setDirty(false);
      setMessage({
        kind: "success",
        text: backend === "remote" ? "\u5DF2\u9A8C\u8BC1\u5E76\u5207\u6362\u81F3\u8FDC\u7A0B\u77E5\u8BC6\u5E93\u3002" : "\u5DF2\u5207\u6362\u81F3\u672C\u5730\u77E5\u8BC6\u5E93\u3002"
      });
    } catch (error) {
      setMessage({ kind: "error", text: connectionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: `ltx-jc-rag-settings-card${open ? " ltx-jc-rag-settings-card--open" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ltx-jc-rag-settings-header", "aria-expanded": open, onClick: () => {
      setOpen((value) => !value);
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Ltx JC RAG \u77E5\u8BC6\u5E93\u8FDE\u63A5" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u9ED8\u8BA4\u4F7F\u7528\u672C\u673A Ltx JC RAG \u77E5\u8BC6\u5E93\uFF1B\u8FDC\u7A0B\u53EF\u540E\u7EED\u63A5\u4F01\u4E1A\u4E2D\u592E\u670D\u52A1" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ltx-jc-rag-settings-summary", children: [
        loadState === "loading" ? "\u8BFB\u53D6\u4E2D" : loadState === "error" ? "\u8FDE\u63A5\u5165\u53E3" : current?.backend === "remote" ? "\u8FDC\u7A0B" : "\u672C\u5730",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" })
      ] })
    ] }),
    open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ltx-jc-rag-settings-body", children: loadState === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ltx-jc-rag-settings-note", role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u8FDE\u63A5\u914D\u7F6E\u2026" }) : loadState === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-settings-load-error", role: "alert", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: loadError }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
        void load();
      }, children: "\u91CD\u65B0\u8BFB\u53D6" })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { className: "ltx-jc-rag-source-picker", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: "\u77E5\u8BC6\u5E93\u6765\u6E90" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: backend === "local" ? "is-selected" : "", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "ltx-jc-rag-backend", checked: backend === "local", onChange: () => edit(() => {
            setBackend("local");
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u672C\u5730" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u6570\u636E\u4FDD\u5B58\u5728\u5F53\u524D DSH \u7684 SQLite \u4E2D" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: `${backend === "remote" ? "is-selected" : ""}${!current?.canSwitchRemote ? " is-disabled" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "ltx-jc-rag-backend", checked: backend === "remote", disabled: !current?.canSwitchRemote, onChange: () => edit(() => {
            setBackend("remote");
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u8FDC\u7A0B" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u53EC\u56DE\u548C\u56DE\u5199\u7EDF\u4E00\u4F7F\u7528\u4E2D\u592E\u77E5\u8BC6\u5E93" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ltx-jc-rag-auto-mount-toggle", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "checkbox",
            checked: autoMountDefaultKnowledgeBase,
            onChange: (event) => edit(() => {
              setAutoMountDefaultKnowledgeBase(event.target.checked);
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u65B0\u666E\u901A\u4F1A\u8BDD\u9ED8\u8BA4\u6302\u8F7D\u77E5\u8BC6\u5E93" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "\u5F00\u542F\u540E\uFF0C\u6BCF\u4E2A\u65B0\u5EFA\u7A7A\u767D\u666E\u901A\u4F1A\u8BDD\u4F1A\u81EA\u52A8\u6302\u8F7D\u9ED8\u8BA4\u77E5\u8BC6\u5E93\u7528\u4E8E\u53EC\u56DE\uFF1B\u5173\u95ED\u540E\u53EA\u5728\u77E5\u8BC6\u5E93\u4F1A\u8BDD\u6216\u624B\u52A8\u6302\u8F7D\u65F6\u4F7F\u7528\u3002" })
        ] })
      ] }),
      !current?.canSwitchRemote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ltx-jc-rag-settings-note", children: "\u5F53\u524D\u5B9E\u4F8B\u662F\u4E2D\u592E\u77E5\u8BC6\u5E93\u670D\u52A1\uFF0C\u4E0D\u80FD\u518D\u5207\u6362\u5230\u53E6\u4E00\u53F0\u8FDC\u7A0B\u670D\u52A1\u3002" }),
      backend === "remote" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-remote-fields", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { htmlFor: "ltx-jc-rag-remote-url", children: [
          "\u670D\u52A1\u5668\u5730\u5740",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: "ltx-jc-rag-remote-url", type: "url", value: remoteUrl, placeholder: "https://example.com/knowledge-api/v1", autoComplete: "url", onChange: (event) => edit(() => {
            setRemoteUrl(event.target.value);
          }), "aria-invalid": urlError !== void 0, "aria-describedby": urlError ? "ltx-jc-rag-url-error" : void 0 }),
          urlError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { id: "ltx-jc-rag-url-error", className: "ltx-jc-rag-field-error", children: urlError })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { htmlFor: "ltx-jc-rag-remote-token", children: [
          "\u5BA2\u6237\u7AEF\u4EE4\u724C",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: "ltx-jc-rag-remote-token", type: "password", value: remoteToken, placeholder: current?.tokenConfigured ? "\u5DF2\u4FDD\u5B58\uFF1B\u7559\u7A7A\u5219\u4FDD\u6301\u4E0D\u53D8" : "\u7C98\u8D34\u5BA2\u6237\u7AEF\u4EE4\u724C", autoComplete: "new-password", onChange: (event) => edit(() => {
            setRemoteToken(event.target.value);
          }), "aria-invalid": tokenError !== void 0, "aria-describedby": "ltx-jc-rag-token-help" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { id: "ltx-jc-rag-token-help", className: tokenError ? "ltx-jc-rag-field-error" : void 0, children: tokenError ?? (current?.tokenConfigured ? "\u4EE4\u724C\u5DF2\u5B89\u5168\u4FDD\u5B58\uFF0C\u9875\u9762\u65E0\u6CD5\u8BFB\u53D6\uFF1B\u8F93\u5165\u65B0\u4EE4\u724C\u53EF\u8986\u76D6\u3002" : "\u4EE4\u724C\u4FDD\u5B58\u540E\u4E0D\u53EF\u8BFB\u53D6\uFF0C\u53EA\u80FD\u8986\u76D6\u3002") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "ltx-jc-rag-timeout-field", htmlFor: "ltx-jc-rag-timeout", children: [
        "\u8BF7\u6C42\u8D85\u65F6\uFF08\u6BEB\u79D2\uFF09",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { id: "ltx-jc-rag-timeout", type: "number", min: "100", max: "120000", step: "100", value: timeout, onChange: (event) => edit(() => {
          setTimeoutValue(event.target.value);
        }), "aria-invalid": timeoutError !== void 0 }),
        timeoutError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "ltx-jc-rag-field-error", children: timeoutError })
      ] }),
      !current?.writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ltx-jc-rag-settings-note", children: "\u5F53\u524D\u63D2\u4EF6\u6CA1\u6709\u914D\u7F6E\u6301\u4E45\u5316\u8DEF\u5F84\uFF0C\u65E0\u6CD5\u4FDD\u5B58\u8FDE\u63A5\u3002" }),
      message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `ltx-jc-rag-settings-message is-${message.kind}`, role: message.kind === "error" ? "alert" : "status", "aria-live": "polite", children: message.text }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-settings-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: reset, disabled: !dirty || saving, children: "\u653E\u5F03\u66F4\u6539" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "is-primary", onClick: () => {
          void save();
        }, disabled: !dirty || invalid || saving || !current?.writable, children: saving ? "\u6B63\u5728\u9A8C\u8BC1\u2026" : "\u9A8C\u8BC1\u5E76\u8FDE\u63A5" })
      ] })
    ] }) })
  ] });
}
function validateRemoteUrl(value) {
  try {
    const url = new URL(value.trim());
    const loopback = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) return "\u8FDC\u7A0B\u77E5\u8BC6\u5E93\u5FC5\u987B\u4F7F\u7528 HTTPS\u3002";
    return void 0;
  } catch {
    return "\u8BF7\u8F93\u5165\u5B8C\u6574\u7684\u77E5\u8BC6\u5E93 API \u5730\u5740\u3002";
  }
}
function connectionErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Failed to fetch")) return "\u65E0\u6CD5\u8BBF\u95EE\u63D2\u4EF6\u8FDE\u63A5\u63A5\u53E3\uFF0C\u8BF7\u786E\u8BA4\u63D2\u4EF6\u670D\u52A1\u5DF2\u52A0\u8F7D\u3002";
  return message || "\u8FDE\u63A5\u914D\u7F6E\u64CD\u4F5C\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u5730\u5740\u3001\u4EE4\u724C\u548C DSH \u65E5\u5FD7\u3002";
}
async function requestConnection(method, body, signal) {
  const response = await fetch(CONNECTION_CONTROL_PATH, {
    method,
    headers: { accept: "application/json", ...body === void 0 ? {} : { "content-type": "application/json" } },
    ...body === void 0 ? {} : { body: JSON.stringify(body) },
    ...signal === void 0 ? {} : { signal }
  });
  const payload = await response.json().catch(() => void 0);
  if (!response.ok) {
    const message = payload !== null && typeof payload === "object" && typeof payload.error === "string" ? payload.error : `\u8FDE\u63A5\u63A5\u53E3\u8FD4\u56DE HTTP ${response.status}`;
    throw new Error(message);
  }
  if (!isConnectionView(payload)) throw new Error("\u63D2\u4EF6\u8FDE\u63A5\u63A5\u53E3\u8FD4\u56DE\u4E86\u65E0\u6548\u6570\u636E\u3002");
  cachedConnectionView = payload;
  return payload;
}
async function requestManagement(path, options = {}) {
  const response = await fetch(`${LOCAL_MANAGEMENT_PATH}/${path.replace(/^\/+/u, "")}`, {
    method: options.method ?? "GET",
    headers: {
      accept: "application/json",
      "x-ltx-jc-rag-client": "management-web",
      ...options.body === void 0 ? {} : { "content-type": "application/json" }
    },
    ...options.body === void 0 ? {} : { body: JSON.stringify(options.body) },
    ...options.signal === void 0 ? {} : { signal: options.signal }
  });
  const payload = await response.json().catch(() => void 0);
  if (!response.ok) {
    const message = payload !== null && typeof payload === "object" && typeof payload.error === "string" ? payload.error : `\u77E5\u8BC6\u5E93\u63A5\u53E3\u8FD4\u56DE HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}
function knowledgeSessionError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("Failed to fetch")) return "\u65E0\u6CD5\u8BBF\u95EE\u77E5\u8BC6\u5E93\u63A5\u53E3\uFF0C\u8BF7\u786E\u8BA4\u63D2\u4EF6\u670D\u52A1\u5DF2\u542F\u52A8\u3002";
  return message || "\u77E5\u8BC6\u5E93\u4F1A\u8BDD\u521B\u5EFA\u5931\u8D25\u3002";
}
function isConnectionView(value) {
  if (value === null || typeof value !== "object") return false;
  const item = value;
  return (item.backend === "local" || item.backend === "remote") && Number.isInteger(item.remoteTimeoutMs) && typeof item.tokenConfigured === "boolean" && typeof item.autoMountDefaultKnowledgeBase === "boolean" && typeof item.canSwitchRemote === "boolean" && typeof item.writable === "boolean" && typeof item.managementAvailable === "boolean" && (!item.managementAvailable || isManagementPath(item.managementPath));
}
function isManagementPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}
function KnowledgeLauncher({ wide, workspace }) {
  const [open, setOpen] = (0, import_react.useState)(workspace.isOpen());
  (0, import_react.useEffect)(() => workspace.subscribe(() => {
    setOpen(workspace.isOpen());
  }), [workspace]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: `ltx-jc-rag-trigger${wide ? "" : " ltx-jc-rag-trigger--rail"}${open ? " is-active" : ""}`,
      "aria-label": open ? "\u8FD4\u56DE\u5BF9\u8BDD" : "Ltx JC RAG \u77E5\u8BC6\u5E93",
      "aria-pressed": open,
      title: wide ? void 0 : open ? "\u8FD4\u56DE\u5BF9\u8BDD" : "Ltx JC RAG \u77E5\u8BC6\u5E93",
      onClick: () => {
        workspace.toggle();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: wide ? 16 : 18 }),
        wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: open ? "\u8FD4\u56DE\u5BF9\u8BDD" : "Ltx JC RAG \u77E5\u8BC6\u5E93" })
      ]
    }
  );
}
function KnowledgeWorkspace({
  sessionId,
  useSessions,
  client,
  workspace
}) {
  const cachedManagementPath = cachedConnectionView?.managementAvailable ? cachedConnectionView.managementPath : void 0;
  const [panelState, setPanelState] = (0, import_react.useState)(cachedConnectionView === void 0 ? "loading" : cachedManagementPath === void 0 ? "unavailable" : "ready");
  const [managementPath, setManagementPath] = (0, import_react.useState)(cachedManagementPath);
  const [panelError, setPanelError] = (0, import_react.useState)("");
  const projectId = useSessions((state) => sessionId === void 0 ? void 0 : state.byId[sessionId]?.cwd);
  const knowledgeUrl = managementPath === void 0 ? void 0 : knowledgePanelUrl(managementPath, sessionId, projectId);
  const frame = (0, import_react.useRef)(null);
  const themeFrame = (0, import_react.useRef)(0);
  const loadManagement = (0, import_react.useCallback)(async (background = false) => {
    if (!background) setPanelState("loading");
    setPanelError("");
    try {
      const connection = await requestConnection("GET");
      if (!connection.managementAvailable || connection.managementPath === void 0) {
        setManagementPath(void 0);
        setPanelState("unavailable");
        return;
      }
      setManagementPath(connection.managementPath);
      setPanelState("ready");
    } catch (error) {
      setManagementPath(void 0);
      setPanelError(connectionErrorMessage(error));
      setPanelState("error");
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void loadManagement(cachedConnectionView !== void 0);
  }, [loadManagement]);
  const sendTheme = (0, import_react.useCallback)(() => {
    const currentFrame = frame.current;
    if (currentFrame === null) return;
    const target = currentFrame.contentWindow;
    if (target === null) return;
    const computed = getComputedStyle(document.body);
    target.postMessage(
      createKnowledgeHostTheme(computed, client.theme.getTheme()),
      frameOrigin(currentFrame) ?? "*"
    );
  }, [client]);
  const scheduleTheme = (0, import_react.useCallback)(() => {
    if (themeFrame.current !== 0) window.cancelAnimationFrame(themeFrame.current);
    themeFrame.current = window.requestAnimationFrame(() => {
      themeFrame.current = 0;
      sendTheme();
    });
  }, [sendTheme]);
  (0, import_react.useEffect)(() => {
    const off = client.on("theme/change", scheduleTheme);
    const onMessage = (event) => {
      const currentFrame = frame.current;
      if (event.source !== currentFrame?.contentWindow) return;
      const expectedOrigin = frameOrigin(currentFrame);
      if (expectedOrigin !== void 0 && event.origin !== expectedOrigin) return;
      const data = event.data;
      if (data?.type === KNOWLEDGE_THEME_READY_MESSAGE && data.version === KNOWLEDGE_THEME_PROTOCOL_VERSION) sendTheme();
    };
    window.addEventListener("message", onMessage);
    scheduleTheme();
    return () => {
      off();
      window.removeEventListener("message", onMessage);
      if (themeFrame.current !== 0) window.cancelAnimationFrame(themeFrame.current);
    };
  }, [client, scheduleTheme, sendTheme]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ltx-jc-rag-workspace", "data-xiaohei-surface": "plugin-workspace", "aria-labelledby": "ltx-jc-rag-workspace-title", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { className: "ltx-jc-rag-workspace-header", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "data-xiaohei-workspace-close": true, onClick: workspace.close, "aria-label": "\u8FD4\u56DE\u4F1A\u8BDD", title: "\u8FD4\u56DE\u4F1A\u8BDD", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, { size: 15 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 18 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { id: "ltx-jc-rag-workspace-title", children: "Ltx JC RAG \u77E5\u8BC6\u5E93" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "\u6587\u6863\u3001\u5BA1\u6838\u3001\u6302\u8F7D\u4E0E\u8BBF\u95EE\u7BA1\u7406" })
      ] })
    ] }) }),
    panelState === "ready" && knowledgeUrl !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", { ref: frame, className: "ltx-jc-rag-frame", src: knowledgeUrl, title: "Ltx JC RAG \u77E5\u8BC6\u5E93\u7BA1\u7406\u53F0", onLoad: sendTheme }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ltx-jc-rag-panel-state", role: panelState === "error" ? "alert" : "status", "aria-live": "polite", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ltx-jc-rag-panel-state-icon", "aria-hidden": "true", children: panelState === "loading" ? "\xB7\xB7\xB7" : panelState === "error" ? "!" : "\u2014" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: panelState === "loading" ? "\u6B63\u5728\u6253\u5F00\u77E5\u8BC6\u5E93\u2026" : panelState === "error" ? "\u6682\u65F6\u65E0\u6CD5\u6253\u5F00\u77E5\u8BC6\u5E93" : "\u8FD9\u53F0 DSH \u672A\u542F\u7528\u77E5\u8BC6\u5E93\u7BA1\u7406\u53F0" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: panelState === "loading" ? "\u6B63\u5728\u786E\u8BA4\u5F53\u524D\u5B9E\u4F8B\u662F\u5426\u63D0\u4F9B\u7BA1\u7406\u9875\u9762\u3002" : panelState === "error" ? panelError : "\u672C\u5730\u53EC\u56DE\u548C\u56DE\u5199\u4ECD\u53EF\u4F7F\u7528\u3002\u5F53\u524D profile \u5DF2\u663E\u5F0F\u5173\u95ED exposeWeb\uFF1B\u91CD\u65B0\u542F\u7528\u540E\u5373\u53EF\u5728\u8FD9\u91CC\u7BA1\u7406\u3002\u4F7F\u7528\u8FDC\u7A0B\u77E5\u8BC6\u5E93\u65F6\uFF0C\u8BF7\u524D\u5F80\u4E2D\u592E DSH \u7684\u77E5\u8BC6\u5E93\u7BA1\u7406\u53F0\u3002" }),
        panelState === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
          void loadManagement();
        }, children: "\u91CD\u8BD5" })
      ] })
    ] })
  ] });
}
function knowledgePanelUrl(managementPath, sessionId, projectId) {
  const params = new URLSearchParams();
  if (sessionId !== void 0) params.set("sessionId", sessionId);
  if (projectId !== void 0) params.set("projectId", projectId);
  const query = params.toString();
  return query.length === 0 ? managementPath : `${managementPath}${managementPath.includes("?") ? "&" : "?"}${query}`;
}
function frameOrigin(frame) {
  try {
    const origin = new URL(frame.src).origin;
    return origin === "null" ? void 0 : origin;
  } catch {
    return void 0;
  }
}
function installStyles() {
  const previous = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`);
  previous?.remove();
  const style = document.createElement("style");
  style.dataset.plugin = PLUGIN_ID;
  style.dataset.pluginCss = STYLE_ID;
  style.textContent = client_default;
  document.head.appendChild(style);
  return () => {
    style.remove();
  };
}
return module.exports; } });
//# sourceMappingURL=client.js.map
