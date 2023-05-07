import {
  DatePickerProps,
  Card,
  Form as AntdForm,
  List,
  Modal,
  ModalProps,
  Space,
} from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import TextArea from "antd/lib/input/TextArea";
import {
  DateField,
  InputField,
  RangeField,
  SelectField,
} from "components/shared/input";
import { User } from "entities/user";
import moment, { Moment } from "moment";
import { Form, useForm } from "utils/hooks";
import { ChangeSkinView } from "./user_view";
import { fetchSkinNftList, setIcon } from "api/fetch_sol/sbt";
import { createSequentialNumberArray } from "api/fetch_sol/utils";
import { useEffect, useState } from "react";

const FormView = (form: Form<User>, isNew = false): JSX.Element => {
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };
  return (
    <AntdForm {...layout}>
      <InputField label="ニックネーム" form={form} attr="name" />
      <InputField label="メールアドレス" form={form} attr="mail" />
      {isNew && (
        <InputField
          label="紹介者アドレス"
          form={form}
          attr="referencerAddress"
        />
      )}
    </AntdForm>
  );
};

export type EditUserFormProps = ModalProps & {
  form: Form<User>;
};

export const EditUserForm = (props: EditUserFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="勉強会の編集" {...rest}>
      {FormView(form)}
    </Modal>
  );
};

export type CreateUserSbtFormProps = ModalProps & {
  form: Form<User>;
};

export const CreateUserSbtForm = (props: CreateUserSbtFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="新規SBTの発行" {...rest}>
      {FormView(form, true)}
    </Modal>
  );
};

export type ReferralForm = {
  walletAddress?: string;
};

export type ReferralFormProps = ModalProps & {
  form: Form<ReferralForm>;
};

export type ChangeSkinFormProps = ModalProps & {
  form: Form<ReferralForm>;
  selectedTokenId: number | null;
  setSelectedTokenId: (tokenId: number) => void;
};

export const ReferralForm = (props: ReferralFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="新規リファラル" {...rest}>
      <InputField
        form={form}
        attr="walletAddress"
        label="ウォレット アドレス"
      />
    </Modal>
  );
};

export const ChangeSkinForm = (props: ChangeSkinFormProps) => {
  const { form, ...rest } = props;
  const [skinNftList, setSkinNftList] = useState<number[]>([]);

  useEffect(() => {
    (async () => setSkinNftList(await fetchSkinNftList()))();
  }, []);

  return (
    <Modal title="スキン一覧" {...rest}>
      {/** 
    <Modal title="スキン一覧" {...rest} onOk={() => 1}>
     */}
      <List
        itemLayout="vertical"
        split={false}
        size={"small"}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 3,
        }}
        dataSource={[0].concat(skinNftList)}
        renderItem={(item) => (
          <List.Item key={item}>
            <ChangeSkinView
              token_id={item}
              selectedTokenId={props.selectedTokenId}
              setSelectedTokenId={props.setSelectedTokenId}
            />
          </List.Item>
        )}
        // dataSource={createSequentialNumberArray(0, skinNftList.length - 1)}
        // renderItem={(item) => <List.Item key={item}>{skinNftList[item]}</List.Item>}
      />
    </Modal>
  );
};
