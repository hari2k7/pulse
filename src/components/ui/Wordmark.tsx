import type { FC } from 'react';
import { StrangeLogo, type StrangeLogoProps } from '../strange/StrangeLogo';

export type WordmarkProps = StrangeLogoProps;

export const Wordmark: FC<WordmarkProps> = (props) => {
  return <StrangeLogo {...props} />;
};
