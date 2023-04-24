import { useParams, withRouter } from "react-router";
import { QuestionCircleOutlined, StopOutlined } from "@ant-design/icons";

import * as H from "history";
import { Flex } from "components/shared/flex";
import { useContext, useEffect, useState } from "react";
import { useFetchProposalApi, usePutProposalApi } from "api/proposal";
import {
  Alert,
  Button,
  Card,
  Col,
  Comment,
  Descriptions,
  Form as AntdForm,
  Modal,
  ModalProps,
  PageHeader,
  Popconfirm,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { LikeOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { GlobalStateContext } from "contexts/global_state_context";
import { Form, useEffectSkipFirst, useForm, useQuery } from "utils/hooks";
import { ContentBlock } from "components/shared/content_block";

import Countdown from "antd/lib/statistic/Countdown";
import { Proposal, ProposalStatus } from "entities/proposal";
import moment from "moment";
import { StatistcsLikeBlock } from "components/shared/statistics_like_block";
import { sleep } from "utils/util";
import { EditProposalForm } from "./proposal_form";
import { red, green, grey } from "@ant-design/colors";
import { ProposalStatusView, ProposalVoteView } from "./proposal_view";
import { SelectRadioField } from "components/shared/input";

import {
  getProposalCount,
  getProposalInfo,
  getAccountVotingInfo,
  getState,
  vote,
} from "api/fetch_sol/governance";

const { Title, Paragraph, Text, Link } = Typography;

type Props = {
  history: H.History;
};

const ProposalPage = (props: Props) => {
  const params = useParams<{ id: string }>();
  const proposalApi = useFetchProposalApi();
  const globalState = useContext(GlobalStateContext);

  const [openEditProposalForm, setOpenEditProposalForm] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [applyStatus, setApplyStatus] = useState<
    "open" | "allplyed" | "closed"
  >("allplyed");
  const editProposalForm = useForm<Proposal>({
    proposerEoa: "nisshimo",
  });
  const putProposalApi = usePutProposalApi();
  const [postProposal, setPostProposal] = useState<number>(0);

  useEffect(() => {
    proposalApi.execute(Number(params.id));
    (async function () {
      setProposer(await getProposalInfo("proposer", Number(params.id)));
      setTargets(await getProposalInfo("targets", Number(params.id)));
      setValues(await getProposalInfo("values", Number(params.id)));
      setSignatures(await getProposalInfo("signatures", Number(params.id)));
      setCalldatas(await getProposalInfo("calldatas", Number(params.id)));
      setHasVoted(await getAccountVotingInfo("hasVoted", Number(params.id)));
      setCanVote(await getAccountVotingInfo("canVote", Number(params.id)));
      setCanCancel(await getAccountVotingInfo("canCancel", Number(params.id)));
      setForVotes(await getProposalInfo("forVotes", Number(params.id)));
      setAgainstVotes(await getProposalInfo("againstVotes", Number(params.id)));
      setSupport(await getAccountVotingInfo("support", Number(params.id)));
      setVotes(await getAccountVotingInfo("votes", Number(params.id)));
      setDebug(await getAccountVotingInfo("canCancel", Number(params.id)));
    })();
  }, [postProposal]);

  useEffectSkipFirst(() => {
    globalState.setLoading(proposalApi.loading);
    if (proposalApi.isSuccess()) {
      (async () => {
        console.log("getting status");
        const _status = await getState(proposalApi.response.proposal.web3Id);
        setStatus(_status);
      })();
    }
  }, [proposalApi.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(putProposalApi.loading);
    if (putProposalApi.isSuccess()) {
      proposalApi.execute(Number(params.id));
    }
  }, [putProposalApi.loading]);

  const [targets, setTargets] = useState();
  const [values, setValues] = useState();
  const [signatures, setSignatures] = useState();
  const [calldatas, setCalldatas] = useState();
  const [proposer, setProposer] = useState();
  const [hasVoted, setHasVoted] = useState();
  const [canVote, setCanVote] = useState<boolean | undefined>();
  const [canCancel, setCanCancel] = useState<boolean | undefined>();
  const [forVotes, setForVotes] = useState(undefined);
  const [againstVotes, setAgainstVotes] = useState(undefined);
  const [support, setSupport] = useState();
  const [votes, setVotes] = useState();
  const [debug, setDebug] = useState();
  const [status, setStatus] = useState<ProposalStatus | undefined>();

  const proposal = (): Proposal | undefined => {
    return {
      ...proposalApi.response?.proposal,
      forCount: Number(forVotes) ?? 0,
      againstCount: Number(againstVotes) ?? 0,
      status: status,
    };
  };

  console.log(
    `canVote: ${canVote} \n`,
    `canCancel: ${canCancel} \n`,
    `forVotes (assume its type is number): ${forVotes} \n`,
    `againstVotes (assume its type is number): ${againstVotes} \n`
  );

  const handleEditModalOpen = () => {
    setOpenEditProposalForm(true);
    editProposalForm.set(() => proposal() ?? {});
  };

  console.log(hasVoted);

  return (
    <PageHeader
      onBack={() => props.history.push("/proposals")}
      title={`Proposal ${proposal()?.web3Id}: ${proposal()?.title}`}
      tags={[ProposalStatusView(proposal()!)]}
      extra={[
        <Popconfirm
          key="delete confirm"
          title="この処理は取り消せません。本当にProposalをCancelしてもよろしいですか？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          open={openCancelConfirm}
          okButtonProps={{ danger: true }}
          okText="OK"
          cancelText="戻る"
          onConfirm={() => {
            putProposalApi.execute({ ...proposal(), status: "Canceled" });
          }}
          onCancel={() => setOpenCancelConfirm(false)}
        >
          <Button
            key={"proposal apply button"}
            type="primary"
            style={{ width: "100%" }}
            danger
            disabled={proposal()?.status !== "Active" || !canCancel}
            onClick={() => setOpenCancelConfirm(true)}
          >
            Cancel
          </Button>
        </Popconfirm>,
        // <Button
        //   key={"proposal apply button"}
        //   style={{ width: "100%" }}
        //   onClick={handleEditModalOpen}
        // >
        //   編集
        // </Button>,
        <EditProposalForm
          open={openEditProposalForm}
          onCancel={() => setOpenEditProposalForm(false)}
          onOk={() => {
            putProposalApi.execute(editProposalForm.object);
            setOpenEditProposalForm(false);
          }}
          key={"new proposal NewProposalForm"}
          form={editProposalForm}
        />,
      ]}
      // subTitle="This is a subtitle"
    >
      <Space style={{ width: "100%" }} size={20} direction="vertical">
        <Space size={20}>
          <ContentBlock
            title="投票"
            style={{
              width: 268,
              minHeight: 344,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ padding: 10 }}>
                <Skeleton
                  loading={forVotes === undefined || againstVotes === undefined}
                >
                  {ProposalVoteView(proposal()!)}
                </Skeleton>
              </div>
              <Button
                size="large"
                type="primary"
                disabled={proposal()?.status !== "Active" || !canVote}
                onClick={() => {
                  setVoteModalOpen(true);
                }}
              >
                投票
              </Button>
              <VoteModal
                proposal={proposal() ?? {}}
                title="投票"
                open={voteModalOpen}
                onCancel={() => setVoteModalOpen(false)}
                onSubmit={async (form: Form<VoteForm>) => {
                  await vote(proposal()?.web3Id, form.object.voteResult, "");
                  setPostProposal((prev) => prev + 1);
                }}
              />
            </div>
          </ContentBlock>
          <ContentBlock
            style={{
              minHeight: 344,
              width: globalState.collapsed
                ? globalState.dimension.width - 128 - 248 - 40
                : globalState.dimension.width - 248 - 248 - 40,
            }}
            title="提案情報"
          >
            <Row>
              <Col span={12}>
                <StatistcsLikeBlock title="提案者">
                  <div
                    style={{
                      fontSize: 20,
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {proposer}
                  </div>
                </StatistcsLikeBlock>
              </Col>
            </Row>

            <Row style={{ marginTop: 30 }}>
              <Col span={12}>
                <StatistcsLikeBlock title="実行コントラクト">
                  <div
                    style={{
                      fontSize: 20,
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {targets}
                  </div>
                </StatistcsLikeBlock>
              </Col>
              <Col span={12}>
                <StatistcsLikeBlock title="値">
                  <div
                    style={{
                      fontSize: 20,
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {values}
                  </div>
                </StatistcsLikeBlock>
              </Col>
            </Row>

            <Row style={{ marginTop: 30 }}>
              <Col span={12}>
                <StatistcsLikeBlock title="関数シグネチャ">
                  <div
                    style={{
                      fontSize: 20,
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {signatures}
                  </div>
                </StatistcsLikeBlock>
              </Col>
              <Col span={12}>
                <StatistcsLikeBlock title="データ">
                  <div
                    style={{
                      fontSize: 20,
                      whiteSpace: "pre-line",
                      lineHeight: 1.2,
                    }}
                  >
                    {proposal()?.datas}
                  </div>
                </StatistcsLikeBlock>
              </Col>
            </Row>
          </ContentBlock>
        </Space>
        <ContentBlock
          style={{
            width: "100%",
          }}
          title="提案内容の説明"
        >
          <Typography>
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {proposal()?.description}
            </Paragraph>
          </Typography>
        </ContentBlock>
        <ContentBlock
          style={{
            minHeight: 244,
          }}
          title="ユーザー情報"
        >
          <Row>
            <Col span={12}>
              <StatistcsLikeBlock title="投票ステータス">
                <div
                  style={{
                    fontSize: 20,
                    whiteSpace: "pre-line",
                    lineHeight: 1.2,
                  }}
                >
                  {hasVoted}
                </div>
              </StatistcsLikeBlock>
            </Col>
            <Col span={12}>
              <StatistcsLikeBlock title="投票内容">
                <div
                  style={{
                    fontSize: 20,
                    whiteSpace: "pre-line",
                    lineHeight: 1.2,
                  }}
                >
                  {support}
                </div>
              </StatistcsLikeBlock>
            </Col>
          </Row>
          <Row style={{ marginTop: 30 }}>
            <Col span={12}>
              <StatistcsLikeBlock title="保持投票数">
                <div
                  style={{
                    fontSize: 20,
                    whiteSpace: "pre-line",
                    lineHeight: 1.2,
                  }}
                >
                  {votes}
                </div>
              </StatistcsLikeBlock>
            </Col>
          </Row>
        </ContentBlock>
      </Space>
    </PageHeader>
  );
};

export default withRouter(ProposalPage);
export type VoteForm = {
  proposal: Proposal;
  voteResult?: "for" | "against" | "abstention";
};

type VoteModalProps = ModalProps & {
  proposal: Proposal;
  onSubmit: (form: Form<VoteForm>) => void;
};

const VoteModal = (props: VoteModalProps) => {
  const voteForm = useForm<VoteForm>({
    proposal: props.proposal,
  });

  useEffect(() => {
    voteForm.updateObject("proposal", props.proposal);
  }, [JSON.stringify(props.proposal)]);
  return (
    <Modal {...props} onOk={() => props.onSubmit(voteForm)}>
      <AntdForm>
        <SelectRadioField
          form={voteForm}
          attr="voteResult"
          direction="vertical"
          selectItems={[
            {
              label: "賛成",
              value: "for",
            },
            {
              label: "反対",
              value: "against",
            },
            {
              label: "棄権",
              value: "abstention",
            },
          ]}
        />
      </AntdForm>
    </Modal>
  );
};
