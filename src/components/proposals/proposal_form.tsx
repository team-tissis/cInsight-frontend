import { Form as AntdForm, Modal, ModalProps } from "antd";
import { InputField, TextAreaField } from "components/shared/input";
import { Proposal } from "entities/proposal";
import { Form } from "utils/hooks";

const FormView = (form: Form<Proposal>): JSX.Element => {
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };
  return (
    <AntdForm {...layout}>
      <h5 style={{ marginLeft: "1cm" }}>概要</h5>
      <InputField label="タイトル" form={form} attr="title" />
      <TextAreaField label="説明" form={form} attr="description" />
      <h5 style={{ marginLeft: "1cm" }}>実行内容</h5>
      <div style={{ marginLeft: "1cm", marginBottom: "0.25cm" }}>
        複数の関数を実行したい場合は、スラッシュ区切りで入力してください。
      </div>
      <TextAreaField label="実行コントラクト" form={form} attr="targets" />
      {/*
        <InputField type="number" label="値" form={form} attr="values" />
      */}
      <TextAreaField label="値 (Ether)" form={form} attr="values" />
      <TextAreaField label="関数シグネチャ" form={form} attr="signatures" />
      <TextAreaField label="データ" form={form} attr="datas" />
      <TextAreaField label="データ型" form={form} attr="datatypes" />
      {/*
              <TextAreaField label="状態" form={form} attr="status" />
      */}
    </AntdForm>
  );
};

export type NewProposalFormProps = ModalProps & {
  form: Form<Proposal>;
};

export const NewProposalForm = (props: NewProposalFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="Proposalの新規作成" {...rest}>
      {FormView(form)}
    </Modal>
  );
};

export type EditProposalFormProps = ModalProps & {
  form: Form<Proposal>;
};

export const EditProposalForm = (props: NewProposalFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="Proposalの編集" {...rest}>
      {FormView(form)}
    </Modal>
  );
};
