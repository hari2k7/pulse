import type { FC, HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'card';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
}

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  aspectRatio,
  className = '',
  style,
  ...rest
}) => {
  const baseClasses = 'bg-[#222222] animate-pulse select-none';

  const variantClasses = {
    text: 'h-4 rounded-[4px] w-full',
    rect: 'rounded-[4px] w-full',
    circle: 'rounded-full',
    card: 'rounded-[4px] w-full aspect-[3/2]',
  }[variant];

  const inlineStyles = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
    ...(aspectRatio !== undefined ? { aspectRatio } : {}),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={inlineStyles}
      aria-hidden="true"
      {...rest}
    />
  );
};
