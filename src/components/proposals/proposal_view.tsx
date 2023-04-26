import { Card, Progress, Space, Tag, TagProps } from "antd";
import { Proposal, ProposalStatus } from "entities/proposal";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { CSSProperties } from "styled-components";
import moment from "moment";
import { Flex } from "components/shared/flex";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ContentBlock } from "components/shared/content_block";

import { getState } from "api/fetch_sol/governance";

export const ProposalListView = (proposal: Proposal) => {
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
      <Flex justifyContent="space-between">
        <Space>
          <div>#{proposal.web3Id}</div>
          <div>{proposal.title}</div>
        </Space>
        {ProposalStatusView(proposal, true)}
      </Flex>
    </Card>
  );
};

export const ProposalStatusView = (proposal: Proposal, loadStatus = false) => {
  const [status, setStatus] = useState<ProposalStatus | undefined>();

  useEffect(() => {
    if (loadStatus) {
      (async () => {
        const _status = await getState(proposal.web3Id);
        setStatus(_status);
      })();
    }
  }, []);

  return (
    <Tag color="#f33a">
      {(loadStatus ? status : proposal.status) ?? "UNDEFINED"}
    </Tag>
  );
};

export const ProposalVoteView = (proposal: Proposal) => {
  const params = useParams<{ id: string }>();
  const forPercent = Math.round(
    (100 * (proposal.forCount ?? 0)) /
      (proposal.forCount! + proposal.againstCount! || 1)
  );
  const forColor = forPercent === 100 ? "#52c41a" : "#1890ff";

  return (
    <Space style={{ width: "100%" }}>
      <Progress
        width={200}
        percent={100}
        type="dashboard"
        status="exception"
        success={{ percent: forPercent, strokeColor: forColor }}
        format={(_) => (
          <Space direction="vertical">
            <Space style={{ alignItems: "center" }}>
              <div style={{ color: forColor }}>{proposal.forCount ?? 0}</div>
              <div style={{ color: "#000" }}>vs</div>
              <div>{proposal.againstCount ?? 0}</div>
            </Space>
            <div style={{ color: "#8c8c8c", fontSize: 20 }}>
              {/* 定足数: {proposal.quorum ?? 0} */}
            </div>
          </Space>
        )}
      />

      {/* <ContentBlock title="棄権">
              <Progress
                type="circle"
                status="normal"
                percent={80}
                strokeColor="#d9d9d9"
                format={(p) => `${p} vote`}
              />
            </ContentBlock> */}
    </Space>
  );
};
