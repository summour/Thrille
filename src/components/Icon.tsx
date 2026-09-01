export type IconName =
  | 'home'
  | 'list'
  | 'search'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'chevronLeft'
  | 'chevronRight';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const PATHS: Record<IconName, { d: string; fill?: boolean }[]> = {
  home: [{ d: 'M3 10.5 12 3l9 7.5' }, { d: 'M5 9.5V21h14V9.5' }],
  list: [{ d: 'M4 6h16M4 12h16M4 18h10' }],
  search: [{ d: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z' }, { d: 'M20 20l-3.6-3.6' }],
  bookmark: [{ d: 'M6 3h12v18l-6-4.5L6 21z' }],
  bookmarkFilled: [{ d: 'M6 3h12v18l-6-4.5L6 21z', fill: true }],
  chevronLeft: [{ d: 'M15 18l-6-6 6-6' }],
  chevronRight: [{ d: 'M9 18l6-6-6-6' }],
};

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
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