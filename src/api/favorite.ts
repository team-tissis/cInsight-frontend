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

export type FavoriteLecture = {
  lecture_id?: string;
  eoa?: string;
  favo_num?: number;
};
export type FavoriteLectureForm = FavoriteLecture;

export type FavoriteComment = {
  comment_id?: string;
  eoa?: string;
};

export function usePostFavoriteLectureApi(): ApiSet<BaseResponse> & {
  execute: (form: FavoriteLectureForm) => void;
} {
  const api = usePostRawApi<BaseResponse, FavoriteLectureForm>(
    new HttpClient(),
    {
      initialResponse: {},
    },
    { formatJson: true }
  );

  const execute = (form: FavoriteLectureForm) => {
    const apiPath = `favorites/`;
    console.log({ 勉強会に対するいいね機能のフォーム: form });
    api.execute(apiPath, form);
  };

  return {
    ...api,
    isSuccess: () => !api.loading && !api.isError,
    execute: execute,
  };
}
