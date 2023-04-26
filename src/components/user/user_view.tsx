import {
  Avatar,
  Button,
  Card,
  Descriptions,
  List,
  Skeleton,
  Space,
  Spin,
} from "antd";
import { fetchAccountImageUrl } from "api/fetch_sol/sbt";
import { User } from "entities/user";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

type UserListViewProps = {
  user: User;
};

type ChangeSkinViewProps = {
  token_id: number;
  selectedTokenId: number | null;
  setSelectedTokenId: (value: number) => void;
};

export const UserProfileView = (
  user: User,
  setChangeSkinForm: (value: boolean) => void,
  userUrl?: string
) => {
  return (
    <Space size={20}>
      {AvatorViewUrl(userUrl, 180)}
      <Descriptions
        labelStyle={{ width: 140 }}
        style={{ minWidth: 400 }}
        column={1}
        bordered
      >
        <Descriptions.Item label="EOA">{user.eoa}</Descriptions.Item>
        <Descriptions.Item label="名前">{user.name}</Descriptions.Item>
        <Descriptions.Item label="メール">{user.mail}</Descriptions.Item>
      </Descriptions>
      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          setChangeSkinForm(true);
        }}
      >
        スキンを着せ替える
      </Button>
    </Space>
  );
};

export const UserListView = (props: UserListViewProps): JSX.Element => {
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  return (
    <Card
      style={{
        backgroundColor: isHover ? "#fafafa" : "#fff",
      }}
      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Skeleton avatar title={false} loading={false} active>
        <List.Item.Meta
          avatar={AvatorView(props.user.eoa)}
          title={props.user.name}
          description={<div>address: {props.user.eoa}</div>}
        />
      </Skeleton>
    </Card>
  );
};

export const AvatorView = (address?: string, size?: number) => {
  const [src, setSrc] = useState<string | undefined>();
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  useEffect(() => {
    (async function () {
      setSrc(await fetchAccountImageUrl(address));
    })();
  }, []);
  return src === undefined ? (
    <Spin indicator={antIcon} />
  ) : (
    <Avatar src={src} size={size} />
  );
};

export const AvatorViewUrl = (url?: string, size?: number) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return url === undefined ? (
    <Spin indicator={antIcon} />
  ) : (
    <Avatar src={url} size={size} />
  );
};

export const ChangeSkinView = (props: ChangeSkinViewProps): JSX.Element => {
  const [isHover, setIsHover] = useState(false);

  const handleItemClick = (value: number) => {
    props.setSelectedTokenId(value);
  };

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };

  return (
    <Card
      style={{
        backgroundColor:
          isHover || props.token_id === props.selectedTokenId
            ? "#fafafa"
            : "#fff",
      }}
      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        props.setSelectedTokenId(props.token_id);
        handleItemClick(props.token_id);
      }}
    >
      {props.token_id === 0 ? "デフォルト" : `トークン ID: ${props.token_id}`}
    </Card>
  );
};
