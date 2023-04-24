import { User, UserSearchForm } from "entities/user";
import React, { useContext, useEffect, useState } from "react";
import { TableParams } from "utils/table_params";
import { GlobalStateContext } from "contexts/global_state_context";
import { List, PageHeader } from "antd";
import { useFetchUsersApi } from "api/user";
import { useEffectSkipFirst, useForm } from "utils/hooks";

import { ContentBlock } from "components/shared/content_block";

import * as H from "history";
import { withRouter } from "react-router";
import { UserListView } from "./user_view";

type Props = {
  history: H.History;
};

const UsersPage = (props: Props): JSX.Element => {
  const globalState = useContext(GlobalStateContext);
  const searchForm = useForm<UserSearchForm>({});
  const usersApi = useFetchUsersApi(searchForm);
  const [tableParams, setTableParams] = useState<TableParams<User>>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });

  useEffect(() => {
    usersApi.execute();
  }, [searchForm.object, tableParams]);

  useEffectSkipFirst(() => {
    globalState.setLoading(usersApi.loading);
  }, [usersApi.loading]);

  console.log("start");
  console.log(usersApi.response.results);
  console.log("end");

  return (
    <>
      <PageHeader
        style={{
          width: "100%",
          backgroundColor: "inherit",
        }}
        title={"SBTホルダーリスト"}
      >
        <ContentBlock
        // title="勉強会一覧"
        >
          <List
            itemLayout="vertical"
            split={false}
            size={"small"}
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 5,
            }}
            // pagination={{
            //   onChange: (page) => {
            //     setTableParams({
            //       ...tableParams,
            //       pagination: {
            //         ...tableParams.pagination,
            //         current: page,
            //       },
            //     });
            //   },
            //   pageSize: 5,
            // }}
            // dataSource={usersApi.response.results}
            dataSource={usersApi.response.results || []}
            renderItem={(item) => (
              <List.Item
                onClick={() => props.history.push(`/users/${item.id}`)}
                key={item.token}
              >
                <UserListView user={item} />
              </List.Item>
            )}
          />
        </ContentBlock>
      </PageHeader>
    </>
  );
};

export default withRouter(UsersPage);
