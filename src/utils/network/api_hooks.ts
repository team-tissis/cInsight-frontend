import {
  Dispatch,
  useState,
  useEffect,
  useCallback,
  useReducer,
  SetStateAction,
  useContext,
} from "react";

import { Form } from "utils/hooks";
import { IHttpClient } from "./http_interface";
import snakeCase from "lodash.snakecase";
import { GlobalStateContext } from "contexts/global_state_context";
import { useParams } from "react-router";

export type BaseResponse = {
  message?: string;
};

export type ApiSet<T> = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  apiError: ApiError;
  response: T;
  setResponse: Dispatch<SetStateAction<T>>;
  isError: boolean;
  isSuccess: () => boolean;
  isFailure: () => boolean;
  status: number | undefined;
  clearApiError: () => void;
};

export type IndexApiSet<T> = ApiSet<T> & {
  pageSet: PageSet;
  setState: (state: Partial<IndexApiState>) => void;
};

/**
 * messagesにはエラーメッセージがすべて配列で入っている
 * detailsには{ modal_name: { attribute_name: message} }が入っている
 */
export type ApiError = Record<any, any>;

export function useApiState(): [
  boolean,
  Dispatch<SetStateAction<boolean>>,
  ApiError,
  (error: any) => void,
  boolean,
  () => boolean,
  () => boolean,
  number | undefined,
  Dispatch<SetStateAction<number | undefined>>,
  () => void
] {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError>({});
  const [isError, setIsError] = useState<boolean>(false);
  const [status, setStatus] = useState<number | undefined>();
  const globalState = useContext(GlobalStateContext);
  const handleError = (error: any) => {
    if (error && error.response) {
      setStatus(error?.response?.status);
      setApiError(() => error.response.data);
      globalState.setError(error.response.data);
      setIsError(true);
    }
  };
  const isSuccess = (): boolean => {
    return !loading && !isError && !!status && status < 300;
  };
  const isFailure = (): boolean => {
    return !loading && isError && !!status && status >= 300;
  };
  const clearApiError = () => {
    setApiError({});
  };

  useEffect(() => {
    if (loading) {
      // ロード開始時にエラーを消す
      setApiError({});
      setIsError(false);
      setStatus(undefined);
    }
  }, [loading]);

  return [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ];
}

type RansackOrderParams = {
  s?: string;
};

export type IndexParams = {
  page: number;
  perPage: number;
  q?: RansackOrderParams;
};

export type PageSet = {
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
};

export type IndexApiState = {
  page: number;
  perPage: number;
};

enum IndexApiAction {
  SET_PAGE = "SET_PAGE",
  SET_PER_PAGE = "SET_PER_PAGE",
  SET_ORDER = "SET_ORDER",
  SET_ORDER_BY = "SET_ORDER_BY",
  SET_STATE = "SET_STATE",
}

type SetPageAction = { type: IndexApiAction.SET_PAGE; payload: number };
type SetPerPageAction = { type: IndexApiAction.SET_PER_PAGE; payload: number };
type SetAllStateAction = {
  type: IndexApiAction.SET_STATE;
  payload: Partial<IndexApiState>;
};
type IndexApiActionType = SetPageAction | SetPerPageAction | SetAllStateAction;

const initialIndexState: IndexApiState = {
  page: 1,
  perPage: 50,
};

const indexReducer = (
  state: IndexApiState,
  action: IndexApiActionType
): IndexApiState => {
  switch (action.type) {
    case IndexApiAction.SET_PAGE:
      return { ...state, page: action.payload };
    case IndexApiAction.SET_PER_PAGE:
      return { ...state, perPage: action.payload };
    case IndexApiAction.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
/**
 * IndexでつかうApiSetを返す
 */
export function useIndexApi<T extends BaseResponse>(
  httpClient: IHttpClient,
  props: {
    initialResponse: T;
    initialState?: Partial<IndexApiState>;
    params?: any;
  }
): IndexApiSet<T> & {
  execute: (path: string, options?: { params?: any }) => void;
} {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const [indexApiState, dispatch] = useReducer(
    indexReducer,
    props.initialState
      ? { ...initialIndexState, ...props.initialState }
      : initialIndexState
  );

  const setPage = (page: number) => {
    dispatch({ type: IndexApiAction.SET_PAGE, payload: page });
  };
  const setPerPage = (perPage: number) => {
    dispatch({ type: IndexApiAction.SET_PER_PAGE, payload: perPage });
  };
  const setState = (state: Partial<IndexApiState>) => {
    dispatch({ type: IndexApiAction.SET_STATE, payload: state });
  };

  const pageSet: PageSet = {
    page: indexApiState.page,
    setPage: setPage,
    perPage: indexApiState.perPage,
    setPerPage: setPerPage,
  };

  const execute = async (path: string, options?: { params?: any }) => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      const params: any = { ...options?.params };
      if (params.json) {
        params.json = JSON.stringify(params.json);
      }
      const result = await httpClient.get(path, params);
      const data: T = result.data;
      setStatus(result.status);
      setResponse(() => data);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading: loading,
    setLoading: setLoading,
    apiError: apiError,
    response: response,
    setResponse: setResponse,
    execute: execute,
    pageSet: pageSet,
    setState: setState,
    isError: isError,
    isSuccess: isSuccess,
    isFailure: isFailure,
    status: status,
    clearApiError,
  };
}

export type ApiArgument<T> = {
  initialResponse: T;
};

export function useShowApi<T extends BaseResponse>(
  httpClient: IHttpClient,
  props: ApiArgument<T>
): ApiSet<T> & { execute: (apiPath: string, params?: any) => void } {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);

  const execute = useCallback(async (apiPath: string, params?: any) => {
    setLoading(true);
    try {
      const p: any = { ...params };
      if (p.json) {
        p.json = JSON.stringify(p.json);
      }
      const result = await httpClient.get(apiPath, p);
      const data: T = result.data;
      setResponse(() => data);
      setStatus(result.status);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  }, []);

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status: status,
    clearApiError,
  };
}

export function usePostApi<T extends BaseResponse, U>(
  httpClient: IHttpClient,
  props: ApiArgument<T>,
  option?: { formatJson?: boolean }
): ApiSet<T> & { execute: (apiPath: string, form?: Form<U>) => void } {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const globalState = useContext(GlobalStateContext);

  const execute = async (apiPath: string, form?: Form<U>) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const result = await httpClient.post(
        apiPath,
        form?.object,
        option?.formatJson
      );
      const data: T = result.data;
      if (data.message) {
        globalState.setNotificationMessage({
          body: data.message,
          colorType: "success",
        });
      }
      setResponse(() => data);
      setStatus(result.status);
      form?.resetForm();
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}

export function usePostRawApi<T extends BaseResponse, U>(
  httpClient: IHttpClient,
  props: ApiArgument<T>,
  option?: { formatJson?: boolean }
): ApiSet<T> & { execute: (apiPath: string, form?: U) => void } {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const globalState = useContext(GlobalStateContext);

  const execute = async (apiPath: string, form?: U) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const result = await httpClient.post(
        apiPath,
        form,
        option?.formatJson
      );
      const data: T = result.data;
      if (data.message) {
        globalState.setNotificationMessage({
          body: data.message,
          colorType: "success",
        });
      }
      setResponse(() => data);
      setStatus(result.status);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}


export function usePatchApi<T extends BaseResponse, U>(
  httpClient: IHttpClient,
  props: ApiArgument<T>,
  option?: { formatJson?: boolean }
): ApiSet<T> & {
  execute: (apiPath: string, params?: U) => void;
} {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const globalState = useContext(GlobalStateContext);

  const execute = async (apiPath: string, params?: U) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const result = await httpClient.patch(
        apiPath,
        params,
        option?.formatJson
      );
      const data: T = result.data;
      if (data.message) {
        globalState.setNotificationMessage({
          body: data.message,
          colorType: "success",
        });
      }
      setResponse(() => data);
      setStatus(result.status);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}

export function usePutApi<T extends BaseResponse, U>(
  httpClient: IHttpClient,
  props: ApiArgument<T>,
  option?: { formatJson?: boolean }
): ApiSet<T> & {
  execute: (apiPath: string, params?: U) => void;
} {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const globalState = useContext(GlobalStateContext);

  const execute = async (apiPath: string, params?: U) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const result = await httpClient.put(apiPath, params, option?.formatJson);
      const data: T = result.data;
      if (data.message) {
        globalState.setNotificationMessage({
          body: data.message,
          colorType: "success",
        });
      }
      setResponse(() => data);
      setStatus(result.status);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}

export function useDeleteApi<T extends BaseResponse>(
  httpClient: IHttpClient,
  props: ApiArgument<T>
): ApiSet<T> & { execute: (apiPath: string) => void } {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);
  const globalState = useContext(GlobalStateContext);

  const execute = async (apiPath: string) => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const result = await httpClient.delete(apiPath);
      const data: T = result.data;
      if (data.message) {
        globalState.setNotificationMessage({
          body: data.message,
          colorType: "success",
        });
      }
      setResponse(() => data);
      setStatus(result.status);
    } catch (e) {
      handleError(e);
    }
    setLoading(false);
  };

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}

export function useDownloadApi<T extends BaseResponse>(
  httpClient: IHttpClient,
  props: ApiArgument<T>
): ApiSet<T> & {
  execute: (apiPath: string, filename: string, params?: any) => void;
} {
  const [
    loading,
    setLoading,
    apiError,
    handleError,
    isError,
    isSuccess,
    isFailure,
    status,
    setStatus,
    clearApiError,
  ] = useApiState();
  const [response, setResponse] = useState<T>(props.initialResponse);

  const execute = useCallback(
    async (apiPath: string, filename: string, params?: any) => {
      setLoading(true);
      try {
        const result = await httpClient.download(apiPath, filename, params);
        setStatus(result.status);
      } catch (e) {
        handleError(e);
      }
      setLoading(false);
    },
    []
  );

  return {
    loading,
    setLoading,
    apiError,
    response,
    setResponse,
    execute,
    isError,
    isSuccess,
    isFailure,
    status,
    clearApiError,
  };
}
