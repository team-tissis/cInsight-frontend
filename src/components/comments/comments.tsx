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
import { CommentListView } from "components/comments/comment_view";

export type EditorProps = {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  submitting: boolean;
  value: string;
  hasSbt: number;
};

const Editor = ({
  onChange,
  onSubmit,
  submitting,
  value,
  hasSbt,
}: EditorProps) => (
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
        disabled={hasSbt === 0}
      >
        コメントを追加
      </Button>
    </Form.Item>
  </>
);

export type LectureCommentsListProps = {
  lectureApi: ApiSet<LectureResponse> & { execute: (id: number) => void };
  histroy: H.History;
  hasSbt: number;
};

export const LectureCommentsList = (props: LectureCommentsListProps) => {
  const postCommentApi = usePostCommentApi();
  const favoCommentApi = useFavoCommentApi();
  // const commentApi = useFetchCommentApi();
  const userApiByAccountAddress = useFetchUserByAccountAddressApi();
  const params = useParams<{ id: string }>();
  const commentForm = useForm<CommentForm>({
    lectureId: params.id,
  });
  const [account, setAccount] = useState<string | undefined>(undefined);

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
                <CommentListView
                  item={item}
                  hasSbt={props.hasSbt}
                  account={account}
                  remainFavo={remainFavo}
                  lectureApi={props.lectureApi}
                  favoCommentApi={favoCommentApi}
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
            hasSbt={props.hasSbt}
          />
        }
      />
    </>
  );
};
