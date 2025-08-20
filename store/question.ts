import { atom } from 'jotai';
import { Question, QuestionFormValues } from 'types/types';
import { questionApi } from 'services/api';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';
import { router } from 'expo-router';

export interface QuestionPagination {
  questions: Question[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalQuestions: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface QuestionQueryParams {
  topicId: string;
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  tier?: string;
}

export const questionsAtom = atom<Question[]>([]);
export const paginationAtom = atom<QuestionPagination['pagination'] | null>(null);
export const loadingQuestionsAtom = atom(false);
export const errorQuestionsAtom = atom<string | null>(null);
export const lastQueryParamsAtom = atom<QuestionQueryParams>({
  topicId: '',
  page: 1,
  limit: 20,
  search: '',
  difficulty: '',
  tier: '',
});

export const fetchQuestionsByTopicAtom = atom(
  null,
  async (get, set, params: QuestionQueryParams & { append?: boolean }) => {
    set(loadingQuestionsAtom, true);
    set(errorQuestionsAtom, null);
    const { append, ...queryParams } = params;
    set(lastQueryParamsAtom, queryParams);
    try {
      const {
        topicId,
        page = 1,
        limit = 20,
        search = '',
        difficulty = '',
        tier = '',
        append = false,
      } = params;
      const res = await questionApi.getByTopic(topicId, { page, limit, search, difficulty, tier });
      const { questions, pagination } = res.data.data;
      if (append) {
        set(questionsAtom, [...get(questionsAtom), ...questions]);
      } else {
        set(questionsAtom, questions);
      }
      set(paginationAtom, pagination);
    } catch (err) {
      handleError(err as AxiosError);
      set(errorQuestionsAtom, 'Failed to fetch questions.');
    } finally {
      set(loadingQuestionsAtom, false);
    }
  }
);

export const resetQuestionsAtom = atom(null, (get, set) => {
  set(questionsAtom, []);
  set(paginationAtom, null);
  set(errorQuestionsAtom, null);
});

export const refetchCurrentQuestionsAtom = atom(null, async (get, set) => {
  const lastParams = get(lastQueryParamsAtom);
  set(loadingQuestionsAtom, true);
  set(errorQuestionsAtom, null);
  try {
    const { topicId, page = 1, limit = 20, search = '', difficulty = '', tier = '' } = lastParams;
    const res = await questionApi.getByTopic(topicId, { page, limit, search, difficulty, tier });
    const { questions, pagination } = res.data.data;
    set(questionsAtom, questions);
    set(paginationAtom, pagination);
  } catch (err) {
    handleError(err as AxiosError);
    set(errorQuestionsAtom, 'Failed to fetch questions.');
  } finally {
    set(loadingQuestionsAtom, false);
  }
});

export const addQuestionAtom = atom(
  null,
  async (get, set, data: QuestionFormValues & { topic: string }) => {
    set(loadingQuestionsAtom, true);
    set(errorQuestionsAtom, null);
    try {
      await questionApi.create(data);
      await set(refetchCurrentQuestionsAtom);
      router.back();
    } catch (err) {
      handleError(err as AxiosError);
    } finally {
      set(loadingQuestionsAtom, false);
    }
  }
);

export const updateQuestionAtom = atom(
  null,
  async (get, set, { questionId, data }: { questionId: string; data: QuestionFormValues }) => {
    set(loadingQuestionsAtom, true);
    set(errorQuestionsAtom, null);
    try {
      await questionApi.update(questionId, data);
      await set(refetchCurrentQuestionsAtom);
      router.back();
    } catch (err) {
      handleError(err as AxiosError);
    } finally {
      set(loadingQuestionsAtom, false);
    }
  }
);

export const deleteQuestionAtom = atom(null, async (get, set, questionId: string) => {
  set(loadingQuestionsAtom, true);
  set(errorQuestionsAtom, null);
  try {
    await questionApi.delete(questionId);
    await set(refetchCurrentQuestionsAtom);
  } catch (err) {
    handleError(err as AxiosError);
  } finally {
    set(loadingQuestionsAtom, false);
  }
});
