import {
    ApiSet,
    BaseResponse,
    IndexApiSet,
    useDeleteApi,
    useDownloadApi,
    useIndexApi,
    usePatchApi,
    usePostApi,
    usePostRawApi,
    usePutApi,
    useShowApi,
  } from "utils/network/api_hooks";
  import { HttpClient } from "../utils/network/axios";
  
  export type Favorite = {
    lecture_id?: string;
    eoa?: string;
  };
  
  export type FavoriteForm = Favorite;

  export function usePostFavoriteApi(): ApiSet<BaseResponse> & {
    execute: (form: FavoriteForm) => void;
  } {
    const api = usePostRawApi<BaseResponse, FavoriteForm>(
      new HttpClient(),
      {
        initialResponse: {},
      },
      { formatJson: true }
    );
  
    const execute = (form: FavoriteForm) => {
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
  