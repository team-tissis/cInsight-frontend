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

  export type SimpleFavorite = {
    id: number;
    volume: number;
    eoa: string;
  };
  type FavoritesResponse = BaseResponse & {
    results: SimpleFavorite[];
  };

  export function useFetchFavoritesApi(): ApiSet<FavoritesResponse> & {
    execute: (accountAddress: string) => void;
  } {
    const api = useShowApi<FavoritesResponse>(new HttpClient(), {
      initialResponse: { results: [] },
    });

    const execute = (accountAddress: string): void => {
      const apiPath = `favorites/user_favorites/`;
      api.execute(apiPath, { accountAddress });
    };
  
    return {
      ...api,
      isSuccess: () => !api.loading && !api.isError,
      execute: execute,
    };
  }

  export type FavoParams = {
    id?: number;
  };
  export function usePatchFavoriteApi(): ApiSet<BaseResponse> & {
    execute: (params: FavoParams) => void;
  } {
    const api = usePutApi<BaseResponse, FavoParams>(
      new HttpClient(),
      {
        initialResponse: {},
      },
      { formatJson: true }
    );
  
    const execute = (params: FavoParams) => {
      const apiPath = 'favorites/update_to_sync/'
      api.execute(apiPath, params);
    };
  
    return {
      ...api,
      isSuccess: () => !api.loading && !api.isError,
      execute: execute,
    };
  }
