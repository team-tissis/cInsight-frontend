import { Proposal, ProposalSearchForm } from "entities/proposal";
import React, { useContext, useEffect, useState } from "react";
import { TableParams } from "utils/table_params";
import { GlobalStateContext } from "contexts/global_state_context";
import { Button, List, PageHeader, Space, Tabs, Tag } from "antd";
import { NewProposalForm } from "./proposal_form";
import { useFetchProposalsApi, usePostProposalApi } from "api/proposal";
import { useEffectSkipFirst, useForm } from "utils/hooks";

import { ContentBlock } from "components/shared/content_block";

import * as H from "history";
import { withRouter } from "react-router";
import { ProposalListView } from "./proposal_view";

import { propose } from "../../api/fetch_sol/governance";

type Props = {
  history: H.History;
};

const ProposalsPage = (props: Props): JSX.Element => {
  const globalState = useContext(GlobalStateContext);
  const defaultNewProposalForm: Proposal = {
    title: "いいね付与数を倍に増やしませんか？",
    targets:
      "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e / 0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", // Bonfire のコントラクトアドレス
    values: "0 / 0",
    signatures:
      "setMonthlyDistributedFavoNum(uint16) / setMonthlyDistributedFavoNum(uint16)",
    datas: "20 / 30",
    datatypes: "uint16 / uint16",
    description:
      "現在，1ヶ月につき10のいいねが付与されていますが，DAOの規模拡大に伴って，良い発表やコメントの数が日に日に増えています．それに伴い，付与数も増やすべきだと考えます．",
    // status: "Active",
  };
  const newProposalForm = useForm<Proposal>(defaultNewProposalForm);
  const searchForm = useForm<ProposalSearchForm>({});
  const proposalsApi = useFetchProposalsApi(searchForm);
  const postProposalApi = usePostProposalApi();
  const [tableParams, setTableParams] = useState<TableParams<Proposal>>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });
  const [openNewProposalForm, setOpenNewProposalForm] = useState(false);

  useEffect(() => {
    proposalsApi.execute();
  }, [searchForm.object, JSON.stringify(tableParams)]);

  useEffectSkipFirst(() => {
    globalState.setLoading(proposalsApi.loading);
  }, [proposalsApi.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(postProposalApi.loading);
    if (postProposalApi.isSuccess()) {
      proposalsApi.execute();
    }
  }, [postProposalApi.loading]);

  return (
    <>
      <PageHeader
        style={{
          width: "100%",
          backgroundColor: "inherit",
        }}
        title={"Proposal"}
        extra={[
          <Button
            onClick={() => {
              setOpenNewProposalForm(true);
            }}
            type="primary"
            key="new proposal NewProposalForm button"
          >
            Proposalの新規作成
          </Button>,
          <NewProposalForm
            open={openNewProposalForm}
            width={700}
            onCancel={() => setOpenNewProposalForm(false)}
            onOk={() => {
              propose(
                newProposalForm.object.targets,
                newProposalForm.object.values,
                newProposalForm.object.signatures,
                newProposalForm.object.datas,
                newProposalForm.object.datatypes,
                newProposalForm.object.description
              );
              postProposalApi.execute(newProposalForm);
              newProposalForm.resetForm();
              setOpenNewProposalForm(false);
            }}
            key={"new proposal NewProposalForm"}
            form={newProposalForm}
          />,
        ]}
      >
        <ContentBlock
        // title="Proposal一覧"
        >
          <List
            split={false}
            size={"small"}
            itemLayout="vertical"
            dataSource={proposalsApi.response.results}
            renderItem={(item) => (
              <List.Item
                onClick={() => props.history.push(`/proposals/${item.web3Id}`)}
              >
                {ProposalListView(item)}
              </List.Item>
            )}
          />
        </ContentBlock>
      </PageHeader>
    </>
  );
};

export default withRouter(ProposalsPage);
