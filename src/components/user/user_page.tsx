import { Button, Col, PageHeader, Row, Space, Statistic } from "antd";
import { ContentBlock } from "components/shared/content_block";
import { LikeOutlined } from "@ant-design/icons";
import { UserProfileView } from "./user_view";
import { User } from "entities/user";
import { StatistcsLikeBlock } from "components/shared/statistics_like_block";
import { useContext, useEffect, useState } from "react";
import { ChangeSkinForm, EditUserForm, ReferralForm } from "./user_form";
import { useEffectSkipFirst, useForm } from "utils/hooks";
import * as H from "history";
import { useParams, withRouter } from "react-router";
import {
  fetchConnectedAccountInfo,
  fetchAccountImageUrl,
  fetchConnectedAccountReferralNum,
  fetchMonthlyDistributedFavoNum,
  refer,
} from "api/fetch_sol/sbt";
import { getCurrentAccountAddress } from "api/fetch_sol/utils";
import {
  useFetchUserApi,
  useFetchUserByAccountAddressApi,
  usePutUserApi,
} from "api/user";
import { GlobalStateContext } from "contexts/global_state_context";

type UserPageProps = {
  history: H.History;
  isMyPage?: boolean;
};

export const UserPage = (props: UserPageProps): JSX.Element => {
  return (
    <PageHeader
      onBack={() => props.history.push("/users")}
      style={{
        width: "100%",
        backgroundColor: "inherit",
      }}
      title={"SBTホルダー"}
    >
      <UserPageContent />
    </PageHeader>
  );
};

type UserPageContentProps = {
  isMyPage?: boolean;
};

export const UserPageContent = (props: UserPageContentProps): JSX.Element => {
  const [openEditUserForm, setOpenEditUserForm] = useState(false);
  const editUserForm = useForm<User>({});
  const [openReferralForm, setOpenRefaralForm] = useState(false);
  const referralForm = useForm<ReferralForm>({});
  const [openChangeSkinForm, setOpenChangeSkinForm] = useState(false);
  const changeSkinForm = useForm({});

  const [url, setUrl] = useState<string | undefined>();
  const [favo, setFavo] = useState();
  const [grade, setGrade] = useState();
  const [maki, setMaki] = useState();

  const [makiMemory, setMakiMemory] = useState();
  const [referral, setReferral] = useState();
  const [referralRemain, setReferralRemain] = useState();
  const [monthlyDistributedFavoNum, setMonthlyDistributedFavoNum] = useState();
  const globalState = useContext(GlobalStateContext);

  const userApi = useFetchUserApi();
  const putUserApi = usePutUserApi();
  const userApiByAccountAddress = useFetchUserByAccountAddressApi();
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );

  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (!props.isMyPage) {
      // マイページではないとき
      userApi.execute(Number(params.id));
    } else {
      // マイページのとき
      (async () => {
        const _accountAddress = await getCurrentAccountAddress();
        setAccountAddress(_accountAddress);
      })();
    }
  }, []);

  useEffectSkipFirst(() => {
    if (accountAddress !== undefined) {
      // マイページのとき
      userApiByAccountAddress.execute(accountAddress);
      (async function () {
        setUrl(await fetchAccountImageUrl());
        setFavo(await fetchConnectedAccountInfo("favoOf"));
        setGrade(await fetchConnectedAccountInfo("gradeOf"));
        setMaki(await fetchConnectedAccountInfo("makiOf"));
        setMakiMemory(await fetchConnectedAccountInfo("makiMemoryOf"));
        setReferral(await fetchConnectedAccountInfo("referralOf"));
        setReferralRemain(await fetchConnectedAccountReferralNum());
        setMonthlyDistributedFavoNum(await fetchMonthlyDistributedFavoNum());
      })();
    }
  }, [accountAddress]);

  useEffect(() => {
    globalState.setLoading(userApiByAccountAddress.loading);
    if (userApiByAccountAddress.isSuccess() && props.isMyPage) {
      // この部分が実行されるのは、マイページのときのみ
      editUserForm.set(userApiByAccountAddress.response.user);
    }
  }, [userApiByAccountAddress.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(userApi.loading);
    if (userApi.isSuccess() && !props.isMyPage) {
      // この部分が実行されるのは、マイページではないときのみ
      (async function () {
        setUrl(await fetchAccountImageUrl(userApi.response.user.eoa));
        setFavo(
          await fetchConnectedAccountInfo("favoOf", userApi.response.user.eoa)
        );
        setGrade(
          await fetchConnectedAccountInfo("gradeOf", userApi.response.user.eoa)
        );
        setMaki(
          await fetchConnectedAccountInfo("makiOf", userApi.response.user.eoa)
        );
        setMakiMemory(
          await fetchConnectedAccountInfo(
            "makiMemoryOf",
            userApi.response.user.eoa
          )
        );
        setReferral(
          await fetchConnectedAccountInfo(
            "referralOf",
            userApi.response.user.eoa
          )
        );
        setReferralRemain(
          await fetchConnectedAccountReferralNum(userApi.response.user.eoa)
        );
        setMonthlyDistributedFavoNum(await fetchMonthlyDistributedFavoNum());
      })();
    }
  }, [userApi.loading]);

  useEffectSkipFirst(() => {
    if (putUserApi.isSuccess()) {
      // マイページのとき
      // このスコープ内はこのままでよき
      userApiByAccountAddress.execute(accountAddress!);
    }
  }, [putUserApi.loading]);

  return (
    <>
      <EditUserForm
        open={openEditUserForm}
        form={editUserForm}
        onCancel={() => setOpenEditUserForm(false)}
        onOk={() => {
          putUserApi.execute(editUserForm.object);
          setOpenEditUserForm(false);
          putUserApi.execute(editUserForm.object);
        }}
      />
      <ReferralForm
        open={openReferralForm}
        form={referralForm}
        onCancel={() => setOpenRefaralForm(false)}
        onOk={() => {
          refer(referralForm.object.walletAddress);
        }}
      />
      <ChangeSkinForm
        open={openChangeSkinForm}
        form={changeSkinForm}
        onCancel={() => setOpenChangeSkinForm(false)}
        // onOk={() => {
        // }}
      />
      <Space size={20} direction="vertical" style={{ width: "100%" }}>
        <ContentBlock
          title="基本情報"
          pageHeaderProps={{
            extra: props.isMyPage && [
              <Button
                key={"edit user"}
                onClick={() => setOpenEditUserForm(true)}
              >
                編集
              </Button>,
            ],
          }}
        >
          {UserProfileView(
            props.isMyPage
              ? userApiByAccountAddress.response.user
              : userApi.response.user,
            setOpenChangeSkinForm,
            url,
            props.isMyPage
          )}
        </ContentBlock>
        <ContentBlock title="SBT INFO">
          <Row>
            <Col span={8}>
              <Statistic
                title="Grade"
                value={grade}
                valueStyle={{ color: "#3f8600" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="薪"
                value={maki}
                valueStyle={{ color: "#3f8600" }}
              />
              <div style={{ fontSize: 14, paddingTop: 10 }}>
                現在のレートです
              </div>
            </Col>
            <Col span={8}>
              <Statistic
                title="来月付与される薪"
                value={makiMemory}
                valueStyle={{ color: "#3f8600" }}
              />
              {/* <div style={{ fontSize: 14, paddingTop: 10 }}>
                翌月にレートに反映されます
              </div> */}
            </Col>
            <Col span={8}>
              <StatistcsLikeBlock title="今月のいいね付与数">
                <Space direction="vertical">
                  <Space style={{ alignItems: "center" }}>
                    <LikeOutlined
                      style={{
                        verticalAlign: 2,
                      }}
                    />
                    {favo} / {monthlyDistributedFavoNum}
                  </Space>
                </Space>
                <div style={{ fontSize: 14, paddingTop: 10 }}>
                  翌月にリセットされます
                </div>
              </StatistcsLikeBlock>
            </Col>
          </Row>
        </ContentBlock>
        {props.isMyPage && (
          <ContentBlock title="リファラル">
            <StatistcsLikeBlock title="リファラル数（翌月にリセットされます）">
              {referral} / {referralRemain}
            </StatistcsLikeBlock>
            <Button
              type="primary"
              style={{ marginTop: 20 }}
              onClick={() => {
                setOpenRefaralForm(true);
              }}
            >
              新規リファラル
            </Button>
          </ContentBlock>
        )}
      </Space>
    </>
  );
};

export default withRouter(UserPage);
