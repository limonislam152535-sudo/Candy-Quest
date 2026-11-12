export type AdState =
  | 'DISABLED'
  | 'NOT_READY'
  | 'LOADING'
  | 'READY'
  | 'SHOWING'
  | 'CLOSED'
  | 'FAILED';

export type AdFormat = 'smartlink' | 'banner' | 'socialBar' | 'popunder';
