import { atom } from 'jotai';
import type { Quiz, quizAnswerType } from 'types/types';

export const quizAtom = atom<Quiz | null>(null);
export const loadingQuizAtom = atom(false);
export const errorQuizAtom = atom<string | null>(null);
export const currentQuizIndexAtom = atom(0);
export const quizAnswersAtom = atom<quizAnswerType[]>([]); 