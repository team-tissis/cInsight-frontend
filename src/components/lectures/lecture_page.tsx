import { useParams, withRouter } from "react-router";
import { QuestionCircleOutlined, StopOutlined } from "@ant-design/icons";

import * as H from "history";
import { Flex } from "components/shared/flex";
import { useContext, useEffect, useState } from "react";
import {
  useDeleteLectureApi,
  useFetchLectureApi,
  useFavoLectureApi,
  usePutLectureApi,
} from "api/lecture";
import { useFetchLectureCustomerApi } from "api/lecture_customer";
import { LectureCommentsList } from "components/comments/comments";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  notification,
  InputNumber,
  PageHeader,
  Popconfirm,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { valueType } from "antd/lib/statistic/utils";
import { LikeOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { GlobalStateContext } from "contexts/global_state_context";
import { useEffectSkipFirst, useForm } from "utils/hooks";
import { ContentBlock } from "components/shared/content_block";
import {
  getLectureStatus,
  LectureStatusView,
  LectureTagsView,
} from "./lecture_view";
import Countdown from "antd/lib/statistic/Countdown";
import { Lecture } from "entities/lecture";
import moment from "moment";
import { PurchaseMovieModal } from "components/purchase_movie_modal/purchase_movie_modal";
import { StatistcsLikeBlock } from "components/shared/statistics_like_block";
import { sleep } from "utils/util";
import { EditLectureForm } from "./lecture_form";
import { useFetchCommentsApi } from "api/comment";
import { CommentSearchForm } from "entities/comment";
import { addFavos, fetchConnectedAccountInfo } from "api/fetch_sol/sbt";
import {
  getCurrentAccountAddress,
  createSequentialNumberArray,
} from "api/fetch_sol/utils";
import {
  usePostLectureCustomerApi,
  LectureJoinInForm,
} from "api/lecture_customer";
import { useFetchUserByAccountAddressApi } from "api/user";

const { Option } = Select;

type Props = {
  history: H.History;
};

type FavoriteLectureForm = {
  lecture_id?: string;
  eoa?: string;
  favo_newly_added?: number;
};

const LecturePage = (props: Props) => {
  const params = useParams<{ id: string }>();
  const lectureApi = useFetchLectureApi();
  const lectureCustomerApi = useFetchLectureCustomerApi();
  const searchForm = useForm<CommentSearchForm>({});
  const globalState = useContext(GlobalStateContext);
  const [movieVisible, setMovieVisible] = useState(false);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [openEditLectureForm, setOpenEditLectureForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [applyStatus, setApplyStatus] = useState<
    "open" | "allplyed" | "closed"
  >("open");
  const [forceReloading, setForceReloading] = useState(0);
  const editLectureForm = useForm<Lecture>({});
  const putLectureApi = usePutLectureApi();
  const deleteLectureApi = useDeleteLectureApi();

  const userApiByAccountAddress = useFetchUserByAccountAddressApi();
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );
  const [count, setCount] = useState<number>(0);
  const [remainFavo, setRemainFavo] = useState<number>(0);

  // const postFavoriteApi = usePostFavoriteLectureApi();
  const favoLectureApi = useFavoLectureApi();
  const postLectureCustomerApi = usePostLectureCustomerApi();

  useEffect(() => {
    lectureApi.execute(Number(params.id));
    // 勉強会の参加を示したユーザーを取得
    lectureCustomerApi.execute(params.id);
  }, [forceReloading]);

  useEffect(() => {
    // ToDo1: アカウントアドレスを取得
    (async () => {
      const _accountAddress = await getCurrentAccountAddress();
      console.log({ 自分のアカウントアドレス: _accountAddress });
      setAccountAddress(_accountAddress);
      setRemainFavo(Number(await fetchConnectedAccountInfo("remainFavoNumOf")));
      userApiByAccountAddress.execute(_accountAddress!);
    })();
  }, []);

  useEffectSkipFirst(() => {
    globalState.setLoading(lectureApi.loading);
    if (lectureApi.isSuccess()) {
      console.log(lectureApi.response);
    }
  }, [lectureApi.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(putLectureApi.loading);
    if (putLectureApi.isSuccess()) {
      lectureApi.execute(Number(params.id));
    }
  }, [putLectureApi.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(deleteLectureApi.loading);
    if (deleteLectureApi.isSuccess()) {
      setOpenDeleteConfirm(false);
      lectureApi.execute(Number(params.id));
      props.history.push("/lectures");
    }
  }, [deleteLectureApi.loading]);

  const lecture = (): Lecture | undefined => {
    return lectureApi.response?.lecture;
  };

  const handleEditModalOpen = () => {
    setOpenEditLectureForm(true);
    editLectureForm.set(() => lecture() ?? {});
  };

  const handleAddFavos = (favoNum: number) => {
    // setした後にDOMの読み込みが走ってからでないと、値の更新はされない
    console.log({ favoNum: favoNum });
    const formVal: FavoriteLectureForm = {
      lecture_id: lecture()?.id,
      // eoa: userApiByAccountAddress.response.user.eoa,
      favo_newly_added: favoNum,
    };
    // DBへのいいねの反映
    // postFavoriteApi.execute(formVal);
    favoLectureApi.execute(formVal);
    // スマコンへのいいねの反映
    addFavos(lecture()?.author?.eoa, favoNum);
    // 再レンダリング
    setForceReloading((prev) => prev + 1);
  };

  // 勉強会の参加登録
  const handleJoinInLecture = () => {
    // setした後にDOMの読み込みが走ってからでないと、値の更新はされない
    const formVal: LectureJoinInForm = {
      lecture_id: lecture()?.id,
      eoa: userApiByAccountAddress.response.user.eoa,
    };
    // DBへのいいねの反映
    postLectureCustomerApi.execute(formVal);
    // 再レンダリング
    setForceReloading((prev) => prev + 1);
  };

  // const handleStep = (
  //   _: number,
  //   info: { offset: valueType; type: "up" | "down" }
  // ) => {
  //   console.log({ remainFavo: remainFavo });
  //   console.log({ count: count });
  //   console.log({ info_type: info.type });
  //   if (info.type === "up") {
  //     setCount((prev) => prev + 1);
  //   } else {
  //     setCount((prev) => prev - 1);
  //   }
  //   // この時点では更新されないが、問題なし。
  //   // console.log({ count: count });
  // };

  const handleChange = (value: number | null) => {
    console.log({ value: value });
    if (value == null) {
      setCount(0);
    } else {
      setCount(value);
    }
  };

  return (
    <PageHeader
      onBack={() => props.history.push("/lectures")}
      title={lecture()?.name}
      tags={LectureStatusView(lecture() ?? {})}
      extra={[
        <Popconfirm
          key="delete confirm"
          title="この処理は取り消せません。本当に削除してもよろしいですか？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          open={openDeleteConfirm}
          onConfirm={() => {
            deleteLectureApi.execute(String(lecture()?.id));
          }}
          okButtonProps={{ loading: deleteLectureApi.loading }}
          onCancel={() => setOpenDeleteConfirm(false)}
        >
          <Button
            key={"lecture apply button"}
            type="primary"
            style={{ width: "100%" }}
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            削除
          </Button>
        </Popconfirm>,
        <Button
          key={"lecture apply button"}
          style={{ width: "100%" }}
          onClick={handleEditModalOpen}
        >
          編集
        </Button>,
        <EditLectureForm
          open={openEditLectureForm}
          onCancel={() => setOpenEditLectureForm(false)}
          onOk={() => {
            console.log(editLectureForm.object);
            putLectureApi.execute(editLectureForm.object);
            setOpenEditLectureForm(false);
          }}
          key={"new lecture NewLectureForm"}
          form={editLectureForm}
        />,
      ]}
      // subTitle="This is a subtitle"
    >
      <PurchaseMovieModal
        open={openPurchaseModal}
        onOk={() => {
          sleep(
            0.5,
            () => globalState.setLoading(true),
            () => {
              globalState.setLoading(false);
              setMovieVisible(true);
              setOpenPurchaseModal(false);
              notification.open({
                message: "勉強会の動画が解除されました！",
                icon: <UnlockOutlined style={{ color: "#108ee9" }} />,
                placement: "top",
              });
              lectureApi.execute(Number(params.id));
            }
          );
        }}
        onCancel={() => setOpenPurchaseModal(false)}
        lecture={lecture()}
      />
      <Space size={20} direction="vertical">
        {(() => {
          switch (getLectureStatus(lecture() ?? {})) {
            // case "Not Started":
            //   return (

            //   );
            case "Held Now":
              return (
                <Alert message="この勉強会はただいま開催中です。" type="info" />
              );
            case "End":
              return (
                <Alert message="この勉強会は終了しました。" type="success" />
              );

            default:
              break;
          }
        })()}
        <ContentBlock title="基本情報">
          <Descriptions column={2}>
            <Descriptions.Item label="主催者">
              {lecture()?.author?.name}
            </Descriptions.Item>
            <Descriptions.Item label="タグ">
              {LectureTagsView(lecture() ?? {})}
            </Descriptions.Item>
            <Descriptions.Item label="開始日時">
              {moment(lecture()?.fromDate).format("yyyy/MM/DD HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="終了日時">
              {moment(lecture()?.toDate).format("yyyy/MM/DD HH:mm")}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Remark">empty</Descriptions.Item>
            <Descriptions.Item label="Address">
              No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
            </Descriptions.Item> */}
            <Descriptions.Item span={3} label="資料URL">
              <a
                className={lecture()?.materialUrl && "linked-text"}
                href={lecture()?.materialUrl}
                target="_blank"
                rel="noreferrer"
              >
                {lecture()?.materialUrl ?? "--"}
              </a>
            </Descriptions.Item>
            <Descriptions.Item
              span={3}
              style={{ alignItems: "center" }}
              label="動画URL"
            >
              <a
                className={lecture()?.movieUrl && "linked-text"}
                href={lecture()?.movieUrl}
                target="_blank"
                rel="noreferrer"
              >
                {lecture()?.movieUrl ?? "--"}
              </a>
              {/* {movieVisible ? (
                <a
                  className="linked-text"
                  href={lecture()?.movieUrl ?? ""}
                  target="_blank"
                  rel="noreferrer"
                >
                  {lecture()?.movieUrl ?? ""}
                </a>
              ) : getLectureStatus(lecture() ?? {}) === "End" ? (
                <Space style={{ alignItems: "center", paddingBottom: 10 }}>
                  <Button
                    type="primary"
                    size="small"
                    icon={
                      <LockOutlined
                        style={{
                          verticalAlign: "text-top",
                        }}
                      />
                    }
                    shape="round"
                    onClick={() => setOpenPurchaseModal(true)}
                  >
                    動画を解除する
                  </Button>
                </Space>
              ) : (
                "--"
              )} */}
            </Descriptions.Item>
          </Descriptions>
        </ContentBlock>
        <ContentBlock title={"勉強会の説明"}>
          <Typography>
            <Typography.Paragraph>
              {lecture()?.description}
            </Typography.Paragraph>
          </Typography>
        </ContentBlock>
        <ContentBlock title="統計情報">
          <Row gutter={16} style={{ width: "100%" }}>
            <Col span={8}>
              <Space direction="vertical">
                <Statistic
                  title="いいね"
                  value={lecture()?.favo ?? 0}
                  prefix={
                    <LikeOutlined
                      style={{
                        verticalAlign: "middle",
                      }}
                    />
                  }
                />
                <div>
                  {/**
                  この勉強会に
                  <span
                    style={{ display: "inline-block", width: "10px" }}
                  ></span>
                   */}
                  <InputNumber
                    min={0}
                    max={remainFavo}
                    defaultValue={0}
                    onChange={handleChange}
                    style={{ width: "50px" }}
                  />
                  <Button
                    key={"lecture like button"}
                    type="primary"
                    disabled={
                      getLectureStatus(lecture() ?? {}) !== "End" ||
                      lecture()?.author?.eoa == accountAddress ||
                      count === 0
                    }
                    onClick={() => handleAddFavos(count)}
                  >
                    <LikeOutlined
                      style={{
                        verticalAlign: "middle",
                      }}
                    />
                    を送る
                  </Button>
                </div>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical">
                <Statistic
                  title="参加人数/参加可能枠"
                  // value={lecture()?.attendeeNum}
                  value={lectureCustomerApi.response.results.length}
                  suffix={`/ ${lecture()?.attendeeMaxNum}`}
                />
                {(() => {
                  switch (applyStatus) {
                    case "open":
                      return (
                        <Button
                          key={"lecture apply button"}
                          type="ghost"
                          onClick={() => handleJoinInLecture()}
                        >
                          参加登録
                        </Button>
                      );
                    case "closed":
                      return (
                        <Button
                          key={"lecture apply button"}
                          danger
                          type="primary"
                          style={{
                            backgroundColor: "#ff4d4f",
                            border: "0px",
                            color: "#fff",
                          }}
                          icon={
                            <StopOutlined
                              style={{
                                verticalAlign: "text-top",
                              }}
                            />
                          }
                          disabled
                        >
                          満席
                        </Button>
                      );
                    case "allplyed":
                      return (
                        <Button key={"lecture apply button"} type="primary">
                          参加登録
                        </Button>
                      );
                  }
                })()}
                ,
              </Space>
            </Col>
            <Col span={8}>
              <Countdown
                title={`開催日まで`}
                value={lecture()?.fromDate}
                format="D日H時間m分s秒"
              />
            </Col>
          </Row>
        </ContentBlock>
        <ContentBlock title="コメント">
          <LectureCommentsList
            histroy={props.history}
            lectureApi={lectureApi}
          />
        </ContentBlock>
      </Space>
    </PageHeader>
  );
};

export default withRouter(LecturePage);
