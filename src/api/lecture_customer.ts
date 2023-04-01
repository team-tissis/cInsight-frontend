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
  
  
export type LectureJoinInForm = {
    lecture_id?: string;
    eoa?: string;
};

export function usePostLectureCustomerApi(): ApiSet<BaseResponse> & {
    execute: (form: LectureJoinInForm) => void;
} {
    const api = usePostRawApi<BaseResponse, LectureJoinInForm>(
      new HttpClient(),
      {
        initialResponse: {},
      },
      { formatJson: true }
    );
  
    const execute = (form: LectureJoinInForm) => {
      const apiPath = `lecture_customers/simple_create/`;
      console.log({勉強会の参加登録機能のフォーム: form})
      api.execute(apiPath, form);
    };
  
    return {
      ...api,
      isSuccess: () => !api.loading && !api.isError,
      execute: execute,
    };
}

export type SimpleCustomer = {
    id: number;
    volume: number;
    eoa: string;
};
type LectureCustomerResponse = BaseResponse & {
    results: SimpleCustomer[];
};

export function useFetchLectureCustomerApi(): ApiSet<LectureCustomerResponse> & {
    execute: (lectureId: string) => void;
} {
    const api = useShowApi<LectureCustomerResponse>(new HttpClient(), {
        initialResponse: { results: [] },
    });
  
    const execute = (lectureId: string): void => {
        const apiPath = `favorites/user_favorites/`;
        api.execute(apiPath, { lectureId });
    };
    
    return {
        ...api,
        isSuccess: () => !api.loading && !api.isError,
        execute: execute,
    };
}
