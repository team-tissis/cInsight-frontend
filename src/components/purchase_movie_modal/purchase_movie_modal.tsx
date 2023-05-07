import {
  Alert,
  Button,
  Col,
  Descriptions,
  Modal,
  ModalProps,
  Row,
  Space,
  Statistic,
} from "antd";
import Countdown from "antd/lib/statistic/Countdown";
import { LectureTagsView } from "components/lectures/lecture_view";
import { ContentBlock } from "components/shared/content_block";
import { Lecture } from "entities/lecture";
import { User } from "entities/user";
import moment from "moment";

export type PurchaseMovieModalProps = {
  lecture?: Lecture;
  user?: User;
} & ModalProps;

export const PurchaseMovieModal = (
  props: PurchaseMovieModalProps
): JSX.Element => {
  return (
    <Modal title={`${props.lecture?.name}の動画の購入`} {...props}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <ContentBlock title="勉強会の情報" style={{ padding: 0 }}>
          <Descriptions labelStyle={{ width: 180 }} column={1} bordered>
            <Descriptions.Item label="勉強会の名前">
              {props.lecture?.name}
            </Descriptions.Item>
            <Descriptions.Item label="開催日">
              {moment(props.lecture?.fromDate).format("yyyy/MM/DD")}
            </Descriptions.Item>
            <Descriptions.Item label="主催者">
              {props.lecture?.author?.name}
            </Descriptions.Item>
            <Descriptions.Item label="タグ">
              {LectureTagsView(props.lecture ?? {})}
            </Descriptions.Item>
          </Descriptions>
        </ContentBlock>
        <ContentBlock title="商品の情報" style={{ padding: 0 }}>
          <Descriptions labelStyle={{ width: 180 }} bordered column={1}>
            <Descriptions.Item label="購入する商品">
              <span style={{ fontWeight: "bold" }}>
                勉強会：{props.lecture?.name}の講義動画
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="価格">
              <span style={{ fontWeight: "bold" }}>
                {props.lecture?.moviePrice ?? 0} ETH
              </span>
            </Descriptions.Item>
          </Descriptions>
        </ContentBlock>
        <Alert
          message="この処理は取り消せません。誤って購入しないよう注意して下さい。"
          type="error"
          style={{ width: "100%", marginTop: 10 }}
        />
      </Space>
    </Modal>
  );
};
