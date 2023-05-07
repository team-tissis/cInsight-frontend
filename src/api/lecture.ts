import {
  ApiSet,
  BaseResponse,
  IndexApiSet,
  useDeleteApi,
  useDownloadApi,
  useIndexApi,
  usePatchApi,
  usePostApi,
  usePutApi,
  useShowApi,
} from "utils/network/api_hooks";
import { Form, useEffectSkipFirst } from "utils/hooks";
import { HttpClient } from "../utils/network/axios";
import { PagingResponse } from "entities";
import { Lecture, LectureForm, LectureSearchForm } from "entities/lecture";

type LecturesResponse = PagingResponse & {
  results: Lecture[];
};

export function useFetchLecturesApi(
  searchForm: Form<LectureSearchForm>
): IndexApiSet<LecturesResponse> & { execute: () => void } {
  const apiPath = "lectures/";
  const api = useIndexApi<LecturesResponse>(new HttpClient(), {
    initialState: { page: 1, perPage: 10 },
    initialResponse: { count: 0, results: [] },
  });

  const execute = (): void => {
    api.execute(apiPath, { params: searchForm.object });
  };

  useEffectSkipFirst(() => {
    searchForm.update((f) => {
      if (api.pageSet.page) f.page = api.pageSet.page;
      if (api.pageSet.perPage) f.perPage = api.pageSet.perPage;
    });
  }, [api.pageSet.page, api.pageSet.perPage]);

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export type LectureResponse = BaseResponse & {
  lecture: Lecture;
};

export function useFetchLectureApi(): ApiSet<LectureResponse> & {
  execute: (id: number) => void;
} {
  const api = useShowApi<LectureResponse>(new HttpClient(), {
    initialResponse: { lecture: {} },
  });

  const execute = (id: number): void => {
    const apiPath = `lectures/${id}/`;
    api.execute(apiPath);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function usePostLectureApi(): ApiSet<BaseResponse> & {
  execute: (form: Form<LectureForm>) => void;
} {
  const api = usePostApi<BaseResponse, LectureForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (form: Form<LectureForm>) => {
    const apiPath = `lectures/`;
    api.execute(apiPath, form);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function usePutLectureApi(): ApiSet<BaseResponse> & {
  execute: (object: Lecture) => void;
} {
  const api = usePutApi<BaseResponse, LectureForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (object: Lecture) => {
    const apiPath = `lectures/${object.id}/`;
    api.execute(apiPath, object);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function useDeleteLectureApi(): ApiSet<BaseResponse> & {
  execute: (id: string) => void;
} {
  const api = useDeleteApi<BaseResponse>(new HttpClient(), {
    initialResponse: {},
  });

  const execute = (id: string): void => {
    const apiPath = `lectures/${id}/`;
    api.execute(apiPath);
  };
  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function useFavoLectureApi(): ApiSet<BaseResponse> & {
  execute: (object: Lecture) => void;
} {
  const api = usePutApi<BaseResponse, LectureForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (object: Lecture) => {
    const apiPath = `lectures/favo/`;
    api.execute(apiPath, object);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}
