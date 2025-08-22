import { atomWithStorage } from 'jotai/utils';
import { Question } from 'types/types';

export const testStateAtom = atomWithStorage<{
  SID: string;
  Qs: Question[];
  ANS: number[];
  ST: string;
  IDX: string;
  TL: string;
}>('testState', {
  SID: '',
  Qs: [],
  ANS: [],
  ST: '',
  IDX: '',
  TL: '',
});
