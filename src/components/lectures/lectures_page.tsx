import { Flex } from "components/shared/flex";
import { lectureData } from "sample_data/lecture";
import { Lecture, LectureSearchForm } from "entities/lecture";
import React, { useContext, useEffect, useState } from "react";
import { TableParams } from "utils/table_params";
import { LecturesTable } from "./lectures_table";
import { GlobalStateContext } from "contexts/global_state_context";
import { Button, PageHeader, Space, Tabs, Tag } from "antd";
import { sleep } from "utils/util";
import { NewLectureForm } from "./lecture_form";
import { useFetchLecturesApi, usePostLectureApi } from "api/lecture";
import { useEffectSkipFirst, useForm } from "utils/hooks";

import { ContentBlock } from "components/shared/content_block";

import FullCalendar from "@fullcalendar/react";
import { DatesSetArg } from "@fullcalendar/common";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarOutlined, TableOutlined } from "@ant-design/icons";
import moment from "moment";
import * as H from "history";
import { withRouter } from "react-router";
import { getLectureStatus, LectureStatusView } from "./lecture_view";
import { LecturesCalender } from "./lectures_calender";

import { getCurrentAccountAddress } from "api/fetch_sol/utils";
import { useFetchUserByAccountAddressApi } from "api/user";

import {format} from 'date-fns'

type Props = {
  history: H.History;
};

const LecturesPage = (props: Props): JSX.Element => {
  const globalState = useContext(GlobalStateContext);
  const newLectureForm = useForm<Lecture>({});
  const searchForm = useForm<LectureSearchForm>({});
  const lecturesApi = useFetchLecturesApi(searchForm);
  const postLectureApi = usePostLectureApi();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("calender");
  const [tableParams, setTableParams] = useState<TableParams<Lecture>>({
    pagination: {
      current: 1,
      pageSize: 20,
    },
  });
  const [openNewLectureForm, setOpenNewLectureForm] = useState(false);

  useEffect(() => {
    lecturesApi.execute();
  }, [searchForm.object, JSON.stringify(tableParams)]);

  useEffectSkipFirst(() => {
    globalState.setLoading(lecturesApi.loading);
  }, [lecturesApi.loading]);

  useEffectSkipFirst(() => {
    globalState.setLoading(postLectureApi.loading);
    if (postLectureApi.isSuccess()) {
      lecturesApi.execute();
    }
  }, [postLectureApi.loading]);

  const userApiByAccountAddress = useFetchUserByAccountAddressApi();
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    (async () => {
      const _accountAddress = await getCurrentAccountAddress();
      setAccountAddress(_accountAddress);
    })();
  }, []);

  useEffectSkipFirst(() => {
    if (accountAddress !== undefined) {
      userApiByAccountAddress.execute(accountAddress);
    }
  }, [accountAddress]);

  useEffectSkipFirst(() => {
    globalState.setLoading(userApiByAccountAddress.loading);
    if (userApiByAccountAddress.isSuccess()) {
      console.log(userApiByAccountAddress.response.user.id);
      newLectureForm.updateObject(
        "authorId",
        userApiByAccountAddress.response.user.id
      );
      // カレンダーの開始と終了を本日の午前9:00・10:00にする
      const defaultStartAt = format(new Date(), "yyyy-MM-dd 09:00:00+09:00")
      const defaultFinishAt = format(new Date(), "yyyy-MM-dd 10:00:00+09:00")
      newLectureForm.set({
        authorId: userApiByAccountAddress.response.user.id,
        toDate: defaultStartAt,
        fromDate: defaultFinishAt,
        attendeeNum: 0,
        attendeeMaxNum: 20
      });
    }
  }, [userApiByAccountAddress.loading]);

  console.log(newLectureForm.object);

  return (
    <>
      <PageHeader
        style={{
          width: "100%",
          backgroundColor: "inherit",
        }}
        title={"勉強会"}
        extra={[
          <Button
            onClick={() => {
              setOpenNewLectureForm(true);
            }}
            type="primary"
            key="new lecture NewLectureForm button"
          >
            勉強会の新規作成
          </Button>,
          <NewLectureForm
            open={openNewLectureForm}
            onCancel={() => setOpenNewLectureForm(false)}
            onOk={() => {
              postLectureApi.execute(newLectureForm);
              newLectureForm.set({
                authorId: userApiByAccountAddress.response.user.id,
              });
              setOpenNewLectureForm(false);
            }}
            key={"new lecture NewLectureForm"}
            form={newLectureForm}
          />,
        ]}
      >
        <ContentBlock
        // title="勉強会一覧"
        >
          <Tabs
            type="card"
            defaultActiveKey={tab}
            onChange={(key: string) => setTab(key)}
            items={[
              {
                label: (
                  <span>
                    <TableOutlined
                      style={{
                        verticalAlign: 1,
                      }}
                    />
                    Table
                  </span>
                ),
                key: "table",
                children: (
                  <LecturesTable
                    data={lecturesApi.response.results}
                    loading={loading}
                    tableParams={tableParams}
                    setTableParams={setTableParams}
                  />
                ),
              },
              {
                label: (
                  <span>
                    <CalendarOutlined
                      style={{
                        verticalAlign: "middle",
                      }}
                    />
                    Calender
                  </span>
                ),
                key: "calender",
                children: (
                  <LecturesCalender
                    data={lecturesApi.response.results}
                    loading={lecturesApi.loading}
                    history={props.history}
                  />
                ),
              },
            ]}
          />
        </ContentBlock>
      </PageHeader>
    </>
  );
};

export default withRouter(LecturesPage);
