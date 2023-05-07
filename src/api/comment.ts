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
import { Comment, CommentForm, CommentSearchForm } from "entities/comment";
import { CookieManager } from "utils/cookie_manager";
import { sleep } from "utils/util";
import { message, notification } from "antd";

type CommentsResponse = PagingResponse & {
  results: Comment[];
};

export function useFetchCommentsApi(
  searchForm: Form<CommentSearchForm>
): IndexApiSet<CommentsResponse> & { execute: () => void } {
  const api = useIndexApi<CommentsResponse>(new HttpClient(), {
    initialState: { page: 1, perPage: 50 },
    initialResponse: { count: 0, results: [] },
  });

  const execute = (): void => {
    const apiPath = "comments/";
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

export type CommentResponse = BaseResponse & {
  comment: Comment;
};

export function useFetchCommentApi(): ApiSet<CommentResponse> & {
  execute: (id: number) => void;
} {
  const api = useShowApi<CommentResponse>(new HttpClient(), {
    initialResponse: { comment: {} },
  });

  const execute = (id: number): void => {
    const apiPath = `comments/${id}/`;
    api.execute(apiPath);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function usePostCommentApi(): ApiSet<BaseResponse> & {
  execute: (form: Form<CommentForm>) => void;
} {
  const api = usePostApi<BaseResponse, CommentForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: false }
  );

  const execute = (form: Form<CommentForm>) => {
    const apiPath = `comments/`;
    api.execute(apiPath, form);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function usePutCommentApi(): ApiSet<BaseResponse> & {
  execute: (object: Comment) => void;
} {
  const api = usePutApi<BaseResponse, CommentForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (object: Comment) => {
    const apiPath = `comments/${object.id}/`;
    api.execute(apiPath, object);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function useFavoCommentApi(): ApiSet<BaseResponse> & {
  execute: (object: Comment) => void;
} {
  const api = usePutApi<BaseResponse, CommentForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (object: Comment) => {
    const apiPath = `comments/favo/`;
    api.execute(apiPath, object);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}

export function useDeleteCommentApi(): ApiSet<BaseResponse> & {
  execute: (id: string) => void;
} {
  const api = useDeleteApi<BaseResponse>(new HttpClient(), {
    initialResponse: {},
  });

  const execute = (id: string): void => {
    const apiPath = `comments/${id}/`;
    api.execute(apiPath);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}
