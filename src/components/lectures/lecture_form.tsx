import {
  DatePickerProps,
  Form as AntdForm,
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
  TextAreaField,
} from "components/shared/input";
import { Lecture } from "entities/lecture";
import moment, { Moment } from "moment";
import { Form, useForm } from "utils/hooks";
import { RangeValue } from "rc-picker/lib/interface";

const FormView = (form: Form<Lecture>): JSX.Element => {
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 },
  };
  return (
    <AntdForm {...layout}>
      <InputField label="勉強会の名前" form={form} attr="name" />
      <DateField
        label="作成日時"
        form={form}
        attr="createdAt"
        fieldProps={{
          disabled: true,
          value: moment(form.object.createdAt),
          showTime: true,
        }}
      />
      <RangeField
        label="日付"
        form={form}
        attr="fromDate"
        onChange={(formatStirng: [string, string]) => {
          console.log(formatStirng[0]);
          form.update((f) => {
            f.fromDate = moment(formatStirng[0], "YYYY/MM/DD HH:mm").format();
            f.toDate = moment(formatStirng[1], "YYYY/MM/DD HH:mm").format();
          });
        }}
        fieldProps={
          {
            showTime: {
              minuteStep: 15,
              secondStep: 60,
              format: "HH時mm分",
            },
            format: "YYYY/MM/DD HH:mm",
            defaultValue: [
              moment(form.object.fromDate, "YYYY/MM/DD HH:mm"),
              moment(form.object.toDate, "YYYY/MM/DD HH:mm"),
            ],
            disabledDate: (current) => {
              const customDate = moment().format("YYYY-MM-DD");
              return current && current < moment(customDate, "YYYY-MM-DD");
            },
            // value: form.object.date,
          } as RangePickerProps
        }
      />
      <SelectField
        label="タグ"
        form={form}
        attr="tags"
        selectItems={[]}
        mode="tags"
        onChange={(e) => form.updateObject("tags", e)}
        includeBlank={false}
      />
      <TextAreaField label="説明" form={form} attr="description" />
      <InputField form={form} label="資料URL" attr="materialUrl" />
      <InputField form={form} label="録画URL" attr="movieUrl" />
      {/**
      <InputField
        type="number"
        form={form}
        label="参加人数"
        attr="attendeeNum"
        min={0}
      />
       */}
      <InputField
        type="number"
        form={form}
        label="最大参加人数"
        attr="attendeeMaxNum"
        min={1}
      />
    </AntdForm>
  );
};

export type NewLectureFormProps = ModalProps & {
  form: Form<Lecture>;
};

export const NewLectureForm = (props: NewLectureFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="勉強会の新規作成" {...rest}>
      {FormView(form)}
    </Modal>
  );
};

export type EditLectureFormProps = ModalProps & {
  form: Form<Lecture>;
};

export const EditLectureForm = (props: NewLectureFormProps) => {
  const { form, ...rest } = props;
  return (
    <Modal title="勉強会の編集" {...rest}>
      {FormView(form)}
    </Modal>
  );
};
