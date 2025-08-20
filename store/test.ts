import { atom } from 'jotai';
import type { Test } from 'types/types';

export const testAtom = atom<Test | null>(null);
export const loadingTestAtom = atom(false);
export const errorTestAtom = atom<string | null>(null);
export const currentTestIndexAtom = atom(0);
export const testAnswersAtom = atom<number[]>([]); 