import type { ComponentChildren } from 'preact';

export type WorkbenchIconName =
  | 'plus'
  | 'undo'
  | 'redo'
  | 'share'
  | 'check'
  | 'refresh'
  | 'copy'
  | 'link'
  | 'close'
  | 'trash'
  | 'more'
  | 'tag'
  | 'range'
  | 'charset'
  | 'sigma'
  | 'pin';

const paths: Record<WorkbenchIconName, ComponentChildren> = {
  plus: <><path d="M12 5v14M5 12h14" /></>,
  undo: <><path d="M9 7 4 12l5 5" /><path d="M5 12h8a6 6 0 1 1 0 12" transform="translate(0 -6)" /></>,
  redo: <><path d="m15 7 5 5-5 5" /><path d="M19 12h-8a6 6 0 1 0 0 12" transform="translate(0 -6)" /></>,
  share: <><circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" /><path d="m8.1 10.8 7.7-4.5M8.1 13.2l7.7 4.5" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  tag: <><path d="M20 13 13 20l-9-9V4h7l9 9Z" /><circle cx="8.5" cy="8.5" r="1.5" /></>,
  range: <><path d="M5 7h14M5 17h14" /><circle cx="9" cy="7" r="2" fill="var(--rtc-paper-raised, white)" /><circle cx="15" cy="17" r="2" fill="var(--rtc-paper-raised, white)" /></>,
  charset: <><path d="M4 18 9 5l5 13M6 13h6M15 9h5M17.5 6.5v5" /></>,
  sigma: <><path d="M18 5H7l6 7-6 7h11" /></>,
  pin: <><path d="M12 17v5M5 17h14" /><path d="m6 3 1 7-3 4h16l-3-4 1-7Z" /></>,
};

export function WorkbenchIcon({ name }: { name: WorkbenchIconName }) {
  return (
    <svg
      class="rtc-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
