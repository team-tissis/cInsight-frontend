import { useState } from "react";

const chainid2name: Record<number, string> = {
  1: "Ethereum Mainnet",
  3: "Ropsten Test Network",
  31337: "Mumbai",
};

export type BaseMetaMaskApiSet<T> = {
  loading: boolean;
  isError: boolean;
  isSuccess: () => boolean;
  execute: () => void;
  response?: T;
  setResponse: (response: T) => void;
  ethereum: any;
};

const useBaseMetaMaskApi = <T extends any>(
  method?: string,
  responseFormatter: (originalResponse: any) => T = (originalResponse) =>
    originalResponse
): BaseMetaMaskApiSet<T> => {
  const { ethereum } = window as any;
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [response, setResponse] = useState<T | undefined>();
  const isSuccess = () => !loading && !isError;
  const execute = async (params?: any[]) => {
    setLoading(true);
    try {
      const response = responseFormatter(
        await ethereum.request({ method, params })
      );
      setResponse(response);
    } catch (e: any) {
      setIsError(true);
    }
    setLoading(false);
  };
  return {
    loading,
    isError,
    isSuccess,
    execute,
    response,
    setResponse,
    ethereum,
  };
};

export type checkMetaMaskInstalledApiResponse = {
  metaMaskInstalled?: boolean;
};

export const useCheckMetaMaskInstalledApi =
  (): BaseMetaMaskApiSet<checkMetaMaskInstalledApiResponse> => {
    const formatter = (metaMaskInstalled: boolean) => ({
      metaMaskInstalled,
    });
    const baseApiSet = useBaseMetaMaskApi<checkMetaMaskInstalledApiResponse>();
    const execute = () => {
      baseApiSet.setResponse(
        formatter(baseApiSet.ethereum && baseApiSet.ethereum.isMetaMask)
      );
    };
    return { ...baseApiSet, execute };
  };

export type FetchMetaMaskAccountsApiResponse = {
  accounts: string[];
};

export const useFetchMetaMaskAccountsApi =
  (): BaseMetaMaskApiSet<FetchMetaMaskAccountsApiResponse> => {
    const formatter = (accounts: string[]) => ({
      accounts,
    });
    const baseApiSet = useBaseMetaMaskApi<FetchMetaMaskAccountsApiResponse>(
      "eth_accounts",
      formatter
    );
    return baseApiSet;
  };

export type RequestMetaMaskAccountsApiResponse = {
  accounts: string[];
};

export const useRequestMetaMaskAccountsApi =
  (): BaseMetaMaskApiSet<RequestMetaMaskAccountsApiResponse> => {
    const formatter = (accounts: string[]) => ({
      accounts,
    });
    const baseApiSet = useBaseMetaMaskApi<RequestMetaMaskAccountsApiResponse>(
      "eth_requestAccounts",
      formatter
    );
    return baseApiSet;
  };

export type FetchChainIdApiResponse = {
  chainId: string;
};

export const useFetchChainIdApi =
  (): BaseMetaMaskApiSet<FetchChainIdApiResponse> => {
    const formatter = (chainId: string) => ({
      chainId,
    });
    const baseApiSet = useBaseMetaMaskApi<FetchChainIdApiResponse>(
      "eth_chainId",
      formatter
    );
    return baseApiSet;
  };

export const useSwitchEvmChainApi = (): BaseMetaMaskApiSet<null> => {
  const baseApiSet = useBaseMetaMaskApi<null>("wallet_switchEthereumChain");
  return baseApiSet;
};

export type CheckHasSbtApiResponse = {
  hasSbt: boolean;
};

export const useCheckHasSbtApi = () => {
  const baseApiSet = useBaseMetaMaskApi<CheckHasSbtApiResponse>(
    "command to check hasApi"
  );
  const execute = () => {
    baseApiSet.setResponse({ hasSbt: false });
  };
  return { ...baseApiSet, execute };
};
