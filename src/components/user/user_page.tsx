import {
  Button,
  Col,
  PageHeader,
  Row,
  Space,
  Statistic,
} from "antd";
import { ContentBlock } from "components/shared/content_block";
import {
  LikeOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { UserProfileView } from "./user_view";
import { User } from "entities/user";
import { StatistcsLikeBlock } from "components/shared/statistics_like_block";
import { useContext, useEffect, useState } from "react";
import { EditUserForm, ReferralForm } from "./user_form";
import { useEffectSkipFirst, useForm } from "utils/hooks";
import * as H from "history";
import { useParams, withRouter } from "react-router";
import {
  fetchConnectedAccountInfo,
  fetchAccountImageUrl,
  fetchConnectedAccountReferralNum,
  fetchMonthlyDistributedFavoNum,
  refer,
  addFavos
} from "api/fetch_sol/sbt";
import { SimpleFavorite, useFetchFavoritesApi, usePatchFavoriteApi } from "api/favorite";
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

  const [url, setUrl] = useState<string | undefined>();
  const [favo, setFavo] = useState();
  const [grade, setGrade] = useState();
  const [maki, setMaki] = useState();

  const [makiMemory, setMakiMemory] = useState();
  const [referral, setReferral] = useState();
  const [referralRemain, setReferralRemain] = useState();
  const [monthlyDistributedFavoNum, setMonthlyDistributedFavoNum] = useState();
  const [havingFavoCount, setHavingFavoCount] = useState(0);
  // const currentAddress =  await getCurrentAccountAddress();
  const favoritesApi = useFetchFavoritesApi();
  const favoritePatchApi = usePatchFavoriteApi();
  const globalState = useContext(GlobalStateContext);

  const userApi = useFetchUserApi();
  const putUserApi = usePutUserApi();
  const [favoTotalVal, setFavoTotalVal] = useState<number>();
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
        setUrl(await fetchAccountImageUrl())
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

  useEffect(() => {
    if ( accountAddress != null){
      favoritesApi.execute(accountAddress!);
    }
  }, [accountAddress]);

  useEffectSkipFirst(() => {
    globalState.setLoading(userApi.loading);
    if (userApi.isSuccess() && !props.isMyPage) {
      // この部分が実行されるのは、マイページではないときのみ
      (async function () {
        setUrl(await fetchAccountImageUrl(userApi.response.user.eoa))
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

  useEffect(()=> {
    let favoTotalVal = 0;
    for (let step = 0; step < favoritesApi.response.results.length; step++) {
      favoTotalVal += favoritesApi.response.results[step].volume
    }
    setFavoTotalVal(favoTotalVal)
  }, [favoritesApi])

  const sendDataToChain = async () => {
    for (let step = 0; step < favoritesApi.response.results.length; step++) {
      console.log({"アドレス": favoritesApi.response.results[step].eoa, 'いいね': favoritesApi.response.results[step].volume})
      try {
        // オンチェーンにデータを保存する
        await addFavos(favoritesApi.response.results[step].eoa, favoritesApi.response.results[step].volume);
        // DBのレコードを同期済みに変更する
        favoritePatchApi.execute({id: favoritesApi.response.results[step].id})
      } catch (error) {
        console.error(error);
      }      
    }
  }

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
            url
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
            <Col span={16}>
                <StatistcsLikeBlock title="いいねを同期">
                <Space direction="vertical">
                  <Space style={{ alignItems: "center" }}>
                    <SyncOutlined
                      style={{
                        verticalAlign: 2,
                      }}
                    /> 
                    { favoTotalVal }
                  </Space>
                </Space>
                </StatistcsLikeBlock>
                <Button
                  type="primary"
                  style={{ marginTop: 20 }}
                  onClick={ async () => await sendDataToChain() }
                >
                  獲得したいいねをチェーンに反映させる
                </Button>
              </Col>
          </Row>
        </ContentBlock>
        {props.isMyPage && (<>
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
        </>)}
      </Space>
    </>
  );
};

export default withRouter(UserPage);
