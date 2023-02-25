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
  import { PagingResponse } from "entities";

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

  type SimpleFavorite = {
    id: number;
    volume: number;
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

  // export function useFetchFavoritesApi(): IndexApiSet<FavoritesResponse> & { execute: (address: string) => void } {
  //   const apiPath = "favorites/user_favorites";
  //   const api = useIndexApi<FavoritesResponse>(new HttpClient(), {
  //     initialState: { page: 1, perPage: 10 },
  //     initialResponse: { count: 0, results: [] },
  //   });
  
  //   const execute = (address: string): void => {
  //     api.execute(apiPath, { params: address });
  //   };
  
  //   return {
  //     ...api,
  //     isSuccess: () => !api.loading && !api.isError,
  //     execute: execute,
  //   };
  // }
  