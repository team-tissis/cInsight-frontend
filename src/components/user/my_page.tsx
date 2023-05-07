import {
  Button,
  Col,
  Form,
  PageHeader,
  notification,
  Row,
  Skeleton,
  Space,
  Statistic,
  Switch,
} from "antd";
import { ContentBlock } from "components/shared/content_block";
import {
  LikeOutlined,
  ArrowUpOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import Countdown from "antd/lib/statistic/Countdown";
import { UserProfileView } from "./user_view";
import { User } from "entities/user";
import { StatistcsLikeBlock } from "components/shared/statistics_like_block";
import { useEffect, useState } from "react";
import { CreateUserSbtForm, EditUserForm, ReferralForm } from "./user_form";
import { useEffectSkipFirst, useForm } from "utils/hooks";
import * as H from "history";
import { useCheckHasSbtApi } from "api/meta_mask";
import { UserPage, UserPageContent } from "./user_page";
import { withRouter } from "react-router";
import { mint, fetchConnectedAccountInfo } from "api/fetch_sol/sbt";
import { getCurrentAccountAddress } from "api/fetch_sol/utils";
import { usePostUserApi } from "api/user";
import { has } from "lodash";

type Props = {
  history: H.History;
};

export const MyPage = (props: Props) => {
  // const checkHasSbtApi = useCheckHasSbtApi();
  const [postForm, setPostForm] = useState<number>(0);
  const [hasSbt, setHasSbt] = useState(0);
  useEffect(() => {
    (async function () {
      setHasSbt(Number(await fetchConnectedAccountInfo("gradeOf")));
    })();
  }, [postForm]);

  // useEffect(() => {
  //   checkHasSbtApi.execute();
  // }, []);

  // console.log({ hasSbt: hasSbt });

  return (
    <PageHeader
      style={{
        width: "100%",
        backgroundColor: "inherit",
      }}
      title={"マイページ"}
      // extra={[
      //   <Form.Item label="SBT" key="switch has sbt flag">
      //     <Switch
      //       checkedChildren={"Exist"}
      //       unCheckedChildren={"Not Exist"}
      //       checked={checkHasSbtApi.response?.hasSbt}
      //       onChange={(hasSbt) => {
      //         checkHasSbtApi.setResponse({ hasSbt });
      //       }}
      //     />
      //   </Form.Item>,
      // ]}
    >
      {/* {checkHasSbtApi.response?.hasSbt ? ( */}
      {/* <Skeleton loading={hasSbt === undefined}> */}
      {hasSbt != 0 ? (
        <UserPageContent isMyPage />
      ) : (
        <MyPageWithoutSbt setPostForm={setPostForm} />
      )}
      {/* </Skeleton> */}
    </PageHeader>
  );
};

export default withRouter(MyPage);

type MyPageWithoutSbtProps = {
  setPostForm: any;
};

type MintResponse = {
  status: boolean;
  message: string;
};

const MyPageWithoutSbt = (props: MyPageWithoutSbtProps) => {
  const [openCreateUserSbtForm, setOpenCreateUserSbtForm] = useState(false);
  const createUserSbtForm = useForm<User>({});
  const [account, setAccount] = useState<string | undefined>(undefined);
  const postUserApi = usePostUserApi();

  useEffect(() => {
    (async () => setAccount(await getCurrentAccountAddress()))();
  }, []);

  useEffectSkipFirst(() => {
    if (createUserSbtForm.object.eoa) {
      postUserApi.execute(createUserSbtForm);
    }
  }, [createUserSbtForm.object.eoa]);

  return (
    <>
      <CreateUserSbtForm
        open={openCreateUserSbtForm}
        form={createUserSbtForm}
        onCancel={() => setOpenCreateUserSbtForm(false)}
        onOk={async () => {
          console.log({ user: account });
          // postする処理
          try {
            const response: MintResponse = await mint(
              createUserSbtForm.object.referencerAddress
            );
            if (!response.status) {
              notification.config({
                maxCount: 1,
              });
              notification["error"]({
                message: response.message,
                style: {
                  backgroundColor: "#FFF2F0",
                },
              });
              throw new Error(response.message);
            }
            createUserSbtForm.updateObject("eoa", account);
            props.setPostForm((prev: number) => prev + 1);
            notification["success"]({
              message: response.message,
              style: {
                backgroundColor: "#F2FFF0",
              },
            });
          } catch (e) {
            console.error(e);
          }
          setOpenCreateUserSbtForm(false);
        }}
      />
      <Space size={20} direction="vertical" style={{ width: "100%" }}>
        <ContentBlock title="SBTの発行">
          <Button
            onClick={() => {
              setOpenCreateUserSbtForm(true);
            }}
            type="primary"
          >
            SBTを発行する
          </Button>
        </ContentBlock>
      </Space>
    </>
  );
};
