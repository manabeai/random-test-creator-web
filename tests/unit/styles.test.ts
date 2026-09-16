// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { compileCSSManifest, compileCSSManifestFile } from '@master/css-compiler';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const entry = compileCSSManifestFile(`${root}/src/index.css`, { root });
const workbench = compileCSSManifestFile(`${root}/src/editor/workbench.css`, { root });

describe('Master CSS compilation', () => {
  test('compiles compositions without warnings or unresolved directives', () => {
    expect(entry.warnings).toEqual([]);
    expect(workbench.warnings).toEqual([]);
    expect(workbench.css).not.toMatch(/@(compose|reference|preserve)\b/);
    expect(workbench.css).not.toContain('--tw-');
  });

  test('resolves the incumbent palette through the shared manifest', () => {
    const compiled = compileCSSManifest('.control { @compose bg:rtc-focus p:12px; }', {
      baseManifest: entry.manifest,
    });
    expect(compiled.warnings).toEqual([]);
    expect(compiled.css).toContain('background-color:var(--color-rtc-focus)');
    expect(compiled.css).toContain('padding:12px');
  });

  test('retains dynamic notation states, wrapping and responsive overrides', () => {
    expect(workbench.css).toContain('.rtc-variable-popover--empty');
    expect(workbench.css).toContain('.rtc-interval-control.is-expression');
    expect(workbench.css).toContain('.rtc-preview-content[hidden]');
    expect(workbench.css).toContain('height:100dvh');
    expect(workbench.css).toContain('flex-wrap:wrap');
    expect(workbench.css).not.toContain(':wrap{');
    for (const width of [430, 820, 1120]) {
      expect(workbench.css).toContain(`@media (width<=${width}px)`);
    }
    expect(workbench.css).toContain('prefers-reduced-motion:reduce');
  });

  test('preserves reset/longhand ordering and local popover widths', () => {
    const tabs = workbench.css.match(/\.rtc-preview-tabs button\{([^}]+)\}/)?.[1];
    expect(tabs).toBeDefined();
    expect(tabs).toContain('border:0;');
    expect(tabs).toMatch(/border-bottom:2px solid (?:transparent|#0000)/);
    expect(tabs!.indexOf('border-bottom:')).toBeGreaterThan(tabs!.indexOf('border:'));
    const shared = workbench.css.indexOf('.rtc-variable-popover,.rtc-node-inspector,.rtc-advanced-popover{');
    const local = workbench.css.indexOf('.rtc-variable-popover{width:min(560px,');
    expect(shared).toBeGreaterThanOrEqual(0);
    expect(local).toBeGreaterThan(shared);
  });
});
