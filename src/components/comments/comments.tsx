import {
  Alert,
  Avatar,
  Button,
  Comment as AntdComment,
  Form,
  InputNumber,
  List,
  message,
  notification,
  Tooltip,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Comment, CommentForm } from "entities/comment";
import React, { useEffect, useState } from "react";
import { useEffectSkipFirst, useForm } from "utils/hooks";
import {
  useFavoCommentApi,
  useFetchCommentApi,
  usePostCommentApi,
} from "api/comment";
import { ApiSet } from "utils/network/api_hooks";
import { LectureResponse } from "api/lecture";
import { useParams } from "react-router";
import moment from "moment";
import { LikeOutlined } from "@ant-design/icons";
import {
  fetchAccountImageUrl,
  fetchConnectedAccountInfo,
  addFavos,
} from "api/fetch_sol/sbt";
import { getCurrentAccountAddress } from "api/fetch_sol/utils";
import { useFetchUserApi, useFetchUserByAccountAddressApi } from "api/user";
import { AvatorView } from "components/user/user_view";
import * as H from "history";
import { Link } from "react-router-dom";

export type EditorProps = {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  submitting: boolean;
  value: string;
};

const Editor = ({ onChange, onSubmit, submitting, value }: EditorProps) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button
        htmlType="submit"
        loading={submitting}
        onClick={onSubmit}
        type="primary"
      >
        Add Comment
      </Button>
    </Form.Item>
  </>
);

export type LectureCommentsListProps = {
  lectureApi: ApiSet<LectureResponse> & { execute: (id: number) => void };
  histroy: H.History;
};

export const LectureCommetnsList = (props: LectureCommentsListProps) => {
  const postCommentApi = usePostCommentApi();
  const favoCommentApi = useFavoCommentApi();
  const commentApi = useFetchCommentApi();
  const userApiByAccountAddress = useFetchUserByAccountAddressApi();
  const params = useParams<{ id: string }>();
  const commentForm = useForm<CommentForm>({
    lectureId: params.id,
  });
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [forceReloading, setForceReloading] = useState(0);

  const [count, setCount] = useState<number>(0);
  const [remainFavo, setRemainFavo] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setAccount(await getCurrentAccountAddress());
      setRemainFavo(Number(await fetchConnectedAccountInfo("remainFavoNumOf")));
    })();
  }, []);

  // useEffect(() => {
  //   commentApi.execute(Number(params.id));
  // }, [forceReloading]);

  useEffectSkipFirst(() => {
    if (account !== undefined) {
      userApiByAccountAddress.execute(account);
      // commentForm.updateObject("commenterEoa", account);
    }
  }, [account]);

  useEffectSkipFirst(() => {
    if (userApiByAccountAddress.isSuccess()) {
      console.log(userApiByAccountAddress.response.user);
      commentForm.updateObject(
        "commenterId",
        userApiByAccountAddress.response.user.id
      );
      // commentForm.updateObject("commenter", userApiByAccountAddress.response.user);
    }
  }, [userApiByAccountAddress.loading]);

  useEffectSkipFirst(() => {
    if (postCommentApi.isSuccess()) {
      props.lectureApi.execute(Number(props.lectureApi.response.lecture.id));
    }
  }, [postCommentApi.loading]);

  useEffectSkipFirst(() => {
    if (favoCommentApi.isSuccess()) {
      props.lectureApi.execute(Number(props.lectureApi.response.lecture.id));
    }
  }, [favoCommentApi.loading]);

  const handleChange = (value: number | null) => {
    console.log({ value: value });
    if (value == null) {
      setCount(0);
    } else {
      setCount(value);
    }
  };

  const handleAddFavos = (item: Comment, favoNum: number) => {
    if (item.commenter?.eoa === account) {
      notification.config({
        maxCount: 1,
      });
      notification["error"]({
        message: "自分のコメントにはいいねを押せません",
        style: {
          backgroundColor: "#FFF2F0",
        },
      });
    } else {
      console.log({ item: item });
      console.log({
        eoa: props.lectureApi.response.lecture.author?.eoa,
      });
      console.log({
        commenter_eoa: item.commenter?.eoa,
      });
      item.favo_newly_added = count;
      // スマコンへのいいねの反映
      addFavos(item.commenter?.eoa, count);
      notification.config({
        maxCount: 1,
      });
      notification["info"]({
        message: "コメントに「いいね」を押しました",
        style: {
          backgroundColor: "#E6F7FF",
        },
      });
      // DBへのいいねの反映
      favoCommentApi.execute(item);

      // const formVal: FavoriteCommentForm = {
      //   comment_id: comment()?.id,
      //   eoa: userApiByAccountAddress.response.user.eoa,
      // };
      // postFavoriteApi.execute(formVal);
      console.log({ favo: commentForm.object.favo });
      favoCommentApi.execute(item); // 再レンダリング
      setForceReloading((prev) => prev + 1);
    }

    // setした後にDOMの読み込みが走ってからでないと、値の更新はされない
    console.log({ favoNum: favoNum });
    // const formVal: FavoriteLectureForm = {
    //   lecture_id: lecture()?.id,
    //   eoa: userApiByAccountAddress.response.user.eoa,
    //   favo_newly_added: favoNum,
    // };
    // // DBへのいいねの反映
    // postFavoriteApi.execute(formVal);
    // // スマコンへのいいねの反映
    // addFavos(lecture()?.author?.eoa, favoNum);
    // // 再レンダリング
    // setForceReloading((prev) => prev + 1);
  };

  return (
    <>
      {!!(props.lectureApi.response.lecture.comments ?? []).length && (
        <List
          itemLayout="horizontal"
          dataSource={props.lectureApi.response.lecture.comments ?? []}
          renderItem={(item: Comment) => {
            const action =
              Number(item.id) % 3 === 0
                ? "liked"
                : Number(item.id) % 3 === 1
                ? "disliked"
                : undefined;
            return (
              <li>
                <AntdComment
                  actions={[
                    <Tooltip key="comment-basic-like" title="Like">
                      <span>
                        {/*
                        <LikeOutlined
                          style={{
                            verticalAlign: "middle",
                          }}
                        />
                        */}
                        {/* 
                        <span className="comment-action">{item.favo ?? 0}</span>
                        */}
                        <span
                          style={{ display: "inline-block", width: "5px" }}
                        ></span>
                        <InputNumber
                          min={0}
                          max={remainFavo}
                          defaultValue={0}
                          onChange={handleChange}
                          style={{ width: "50px" }}
                          size="small"
                        />
                        <Button
                          key={"lecture like button"}
                          type="primary"
                          disabled={count === 0}
                          onClick={() => handleAddFavos(item, count)}
                          size="small"
                        >
                          <LikeOutlined
                            style={{
                              verticalAlign: "middle",
                            }}
                          />
                          を送る
                        </Button>
                      </span>
                    </Tooltip>,
                  ]}
                  // author={<a>Gourav Hammad</a>}
                  // avatar={<Avatar style={{ backgroundColor: 'green' }}>G</Avatar>}

                  author={item.commenter?.name}
                  avatar={
                    <Link
                      style={{ textDecoration: "auto" }}
                      to={`/users/${item.commenter?.id}`}
                    >
                      {AvatorView(item.commenter?.eoa)}
                    </Link>
                  }
                  content={item.content}
                  datetime={moment(item.createdAt).fromNow()}
                />
              </li>
            );
          }}
        />
      )}
      <AntdComment
        avatar={AvatorView(account)}
        content={
          <Editor
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              // e.target.value: フォームに入力された内容
              console.log({ e_target_value: e.target.value });
              commentForm.updateObject("content", e.target.value);
            }}
            onSubmit={() => {
              if (commentForm.object.content?.length) {
                postCommentApi.execute(commentForm);
              }
            }}
            submitting={postCommentApi.loading}
            value={commentForm.object.content ?? ""}
          />
        }
      />
    </>
  );
};
