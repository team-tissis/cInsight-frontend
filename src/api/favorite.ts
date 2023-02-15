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
  import { CookieManager } from "utils/cookie_manager";
  import { comments, lectureData } from "sample_data/lecture";
  import { sleep } from "utils/util";
  import { message, notification } from "antd";
  
  export type Favorite = {
    lecture_id?: string;
    eoa?: string;
  };
  
  export type FavoriteForm = Favorite;

  export function usePostFavoriteApi(): ApiSet<BaseResponse> & {
    execute: (form: Form<FavoriteForm>) => void;
  } {
    const api = usePostApi<BaseResponse, FavoriteForm>(
      new HttpClient(),
      {
        initialResponse: {},
      },
      { formatJson: true }
    );
  
    const execute = (form: Form<FavoriteForm>) => {
      const apiPath = `favorites/`;
      console.log({いいね機能のフォーム: form})
      api.execute(apiPath, form);
    };
  
    return {
      ...api,
      isSuccess: () => !api.loading && !api.isError,
      execute: execute,
    };
  }
  
//   export function useDeleteLectureApi(): ApiSet<BaseResponse> & {
//     execute: (id: string) => void;
//   } {
//     const api = useDeleteApi<BaseResponse>(new HttpClient(), {
//       initialResponse: {},
//     });
  
//     const execute = (id: string): void => {
//       const apiPath = `lectures/${id}/`;
//       api.execute(apiPath);
//     };
//     return {
//       ...api,
//       isSuccess: () => !api.loading && !api.isError,
//       execute: execute,
//     };
//   }
  