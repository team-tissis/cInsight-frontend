import React, { useState } from "react";
import {
  Comment as AntdComment,
  Tooltip,
  InputNumber,
  Button,
  notification,
} from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import { LikeOutlined } from "@ant-design/icons";
import { AvatorView } from "components/user/user_view";
import { Comment } from "entities/comment";
import { addFavos } from "api/fetch_sol/sbt";
import { ApiSet } from "utils/network/api_hooks";
import { LectureResponse } from "api/lecture";
import { BaseResponse } from "utils/network/api_hooks";

type CommentListViewProps = {
  item: Comment;
  hasSbt: number;
  account: string | undefined;
  remainFavo: number;
  lectureApi: ApiSet<LectureResponse>;
  favoCommentApi: ApiSet<BaseResponse> & { execute: (object: Comment) => void };
};

export const CommentListView = (props: CommentListViewProps): JSX.Element => {
  const [count, setCount] = useState<number>(0);
  // const [forceReloading, setForceReloading] = useState(0);

  const handleChange = (value: number | null) => {
    console.log({ value: value });
    if (value == null) {
      setCount(0);
    } else {
      setCount(value);
    }
  };

  const handleAddFavos = (item: Comment, favoNum: number) => {
    console.log({ item: item });
    console.log({
      eoa: props.lectureApi.response.lecture.author?.eoa,
    });
    console.log({
      commenter_eoa: item.commenter?.eoa,
    });
    console.log({ favoNum: favoNum });
    try {
      item.favo_newly_added = count;

      // スマコンへのいいねの反映
      addFavos(item.commenter?.eoa, count);
      // DBへのいいねの反映
      props.favoCommentApi.execute(item);

      notification.config({
        maxCount: 1,
      });
      notification["info"]({
        message: "コメントに「いいね」を押しました",
        style: {
          backgroundColor: "#E6F7FF",
        },
      });
      // 再レンダリング
      // setForceReloading((prev) => prev + 1);
    } catch {
      notification.config({
        maxCount: 1,
      });
      notification["error"]({
        message: "コメントへの「いいね」に失敗しました",
      });
    }
  };

  return (
    <AntdComment
      actions={[
        <Tooltip key="comment-basic-like">
          <span>
            <div>
              <LikeOutlined
                style={{
                  verticalAlign: "middle",
                }}
              />
              <span style={{ display: "inline-block", width: "5px" }}></span>
              {props.item.favo}
              <span style={{ display: "inline-block", width: "20px" }}></span>
              <InputNumber
                min={0}
                max={props.remainFavo}
                defaultValue={0}
                onChange={handleChange}
                style={{ width: "50px" }}
                size="small"
              />
              <Button
                key={"lecture like button"}
                type="primary"
                disabled={
                  count === 0 ||
                  props.item.commenter?.eoa === props.account ||
                  props.hasSbt === 0
                }
                onClick={() => handleAddFavos(props.item, count)}
                size="small"
              >
                いいねを送る
              </Button>
            </div>
          </span>
        </Tooltip>,
      ]}
      // author={<a>Gourav Hammad</a>}
      // avatar={<Avatar style={{ backgroundColor: 'green' }}>G</Avatar>}

      author={props.item.commenter?.name}
      avatar={
        <Link
          style={{ textDecoration: "auto" }}
          to={`/users/${props.item.commenter?.id}`}
        >
          {AvatorView(props.item.commenter?.eoa)}
        </Link>
      }
      content={props.item.content}
      datetime={moment(props.item.createdAt).fromNow()}
    />
  );
};
