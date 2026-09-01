export type IconName =
  | 'home'
  | 'list'
  | 'search'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'chevronLeft'
  | 'chevronRight'
  | 'sun'
  | 'moon';

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
  sun: [
    { d: 'M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' },
    { d: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z' },
  ],
  moon: [{ d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }],
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