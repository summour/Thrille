export type IconName =
  | 'home'
  | 'list'
  | 'search'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'chevronLeft'
  | 'chevronRight'
  | 'volume'
  | 'volumeOff'
  | 'play'
  | 'pause'
  | 'stop'
  | 'close'
  | 'sun'
  | 'moon'
  | 'highlighter'
  | 'plus'
  | 'trash'
  | 'check'
  | 'edit'
  | 'copy'
  | 'sliders';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PATHS: Record<IconName, { d: string; fill?: boolean }[]> = {
  home: [{ d: 'M3 10.5 12 3l9 7.5' }, { d: 'M5 9.5V21h14V9.5' }],
  list: [{ d: 'M4 6h16M4 12h16M4 18h10' }],
  search: [{ d: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' }, { d: 'M20 20l-3.6-3.6' }],
  bookmark: [{ d: 'M6 3h12v18l-6-4.5L6 21z' }],
  bookmarkFilled: [{ d: 'M6 3h12v18l-6-4.5L6 21z', fill: true }],
  chevronLeft: [{ d: 'M15 18l-6-6 6-6' }],
  chevronRight: [{ d: 'M9 18l6-6-6-6' }],
  volume: [
    { d: 'M11 5L6 9H2v6h4l5 4V5z' },
    { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' },
    { d: 'M19.07 4.93a10 10 0 0 1 0 14.14' },
  ],
  volumeOff: [
    { d: 'M11 5L6 9H2v6h4l5 4V5z' },
    { d: 'M23 9l-6 6' },
    { d: 'M17 9l6 6' },
  ],
  play: [{ d: 'M6 4l14 8-14 8V4z', fill: true }],
  pause: [
    { d: 'M6 4h4v16H6z', fill: true },
    { d: 'M14 4h4v16h-4z', fill: true },
  ],
  stop: [{ d: 'M6 6h12v12H6z', fill: true }],
  close: [
    { d: 'M18 6L6 18' },
    { d: 'M6 6l12 12' },
  ],
  sun: [
    { d: 'M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
    { d: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z' },
  ],
  moon: [{ d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }],
  highlighter: [
    { d: 'M15 3.5l5.5 5.5-8.5 8.5-5 1.5 1.5-5L15 3.5z' },
    { d: 'M12 6.5l5.5 5.5' },
    { d: 'M3 21h7' },
  ],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  trash: [
    { d: 'M3 6h18' },
    { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
  ],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  edit: [
    { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' },
  ],
  copy: [
    { d: 'M9 9h13v13H9z' },
    { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' },
  ],
  sliders: [
    { d: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' },
  ],
};

export function Icon({ name, size = 20, className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name].map((path, index) => (
        <path key={index} d={path.d} fill={path.fill ? 'currentColor' : 'none'} />
      ))}
    </svg>
  );
}
