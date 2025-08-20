// If you haven't already, install zustand: npm install zustand
import { atom } from 'jotai';
import { Subject, TopicFormValues, Topic } from 'types/types';
import { subjectApi, topicApi } from 'services/api';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';

export const subjectsAtom = atom<Subject[]>([]);
export const loadingAtom = atom(false);
export const errorAtom = atom<string | null>(null);
export const subjectAtom = atom<Subject | null>(null);

// Topic details atoms
export const topicDetailsAtom = atom<Topic | null>(null);
export const loadingTopicDetailsAtom = atom(false);
export const errorTopicDetailsAtom = atom<string | null>(null);

export const fetchSubjectsAtom = atom(null, async (get, set) => {
  set(loadingAtom, true);
  set(errorAtom, null);
  try {
    const res = await subjectApi.getSubjects();
    // console.log('Fetched subjects:', res.data.data);
    set(subjectsAtom, res.data.data || []);
  } catch (err: any) {
    set(errorAtom, err.message || 'Failed to fetch subjects');
  } finally {
    set(loadingAtom, false);
  }
});

export const addTopicAtom = atom(
  null,
  async (get, set, topic: TopicFormValues & { subject: string }) => {
    set(loadingAtom, true);
    set(errorAtom, null);
    try {
      const res = await topicApi.create(topic);
      const updatedSubject = res.data.data.subject;
      set(subjectAtom, updatedSubject);
      // Also update subjectsAtom if needed
      const subjects = get(subjectsAtom);
      set(
        subjectsAtom,
        subjects.map((s) => (s._id === updatedSubject._id ? updatedSubject : s))
      );
    } catch (err: any) {
      set(errorAtom, err.message || 'Failed to add topic');
    } finally {
      set(loadingAtom, false);
    }
  }
);

export const updateTopicAtom = atom(
  null,
  async (get, set, { topicId, data }: { topicId: string; data: TopicFormValues }) => {
    set(loadingAtom, true);
    set(errorAtom, null);
    try {
      const res = await topicApi.update(topicId, data);
      const updatedSubject = res.data.data.subject;
      set(subjectAtom, updatedSubject);
      // Also update subjectsAtom if needed
      const subjects = get(subjectsAtom);
      set(
        subjectsAtom,
        subjects.map((s) => (s._id === updatedSubject._id ? updatedSubject : s))
      );
    } catch (err: any) {
      set(errorAtom, err.message || 'Failed to update topic');
    } finally {
      set(loadingAtom, false);
    }
  }
);

export const deleteTopicAtom = atom(null, async (get, set, topicId: string) => {
  set(loadingAtom, true);
  set(errorAtom, null);
  try {
    const res = await topicApi.delete(topicId);
    if (res.data.success) {
      const updatedSubject = res.data.data.subject;
      // console.log(JSON.stringify(updatedSubject, null, 2));

      // Update the atom for the subject detail page
      set(subjectAtom, updatedSubject);

      // Update the atom for the subjects list page
      const subjects = get(subjectsAtom);
      set(
        subjectsAtom,
        subjects.map((s) => (s._id === updatedSubject._id ? updatedSubject : s))
      );

      console.log(`Deleted topic with ID: ${topicId}`);
    }
  } catch (err) {
    handleError(err as AxiosError);
  } finally {
    set(loadingAtom, false);
  }
});

export const fetchSubjectAtom = atom(
  null,
  async (get, set, subjectId: string, callApi: boolean) => {
    set(loadingAtom, true);
    set(errorAtom, null);
    try {
      if (callApi) {
        const res = await subjectApi.getSubjectById(subjectId);
        set(subjectAtom, res.data.data);
      } else {
        const subjects = get(subjectsAtom);
        set(subjectAtom, subjects.find((s) => s._id === subjectId) || null);
      }
    } catch (err: any) {
      set(errorAtom, err.message || 'Failed to fetch subject');
    } finally {
      set(loadingAtom, false);
    }
  }
);

export const fetchTopicDetailsAtom = atom(
  null,
  async (get, set, topicId: string, callApi: boolean) => {
    set(loadingTopicDetailsAtom, true);
    set(errorTopicDetailsAtom, null);
    try {
      if (callApi) {
        const res = await topicApi.getById(topicId);
        set(topicDetailsAtom, res.data.data || null);
      } else {
        const topics = get(subjectAtom)?.topics || [];
        set(topicDetailsAtom, topics.find((t) => t._id === topicId) || null);
      }
    } catch (err: any) {
      set(errorTopicDetailsAtom, err.message || 'Failed to fetch topic details');
    } finally {
      set(loadingTopicDetailsAtom, false);
    }
  }
);
