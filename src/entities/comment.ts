import { CommentProps, TagProps } from "antd";
import { BaseSearchForm } from "entities";
import { Lecture } from "./lecture";
import { User } from "./user";

export type CommentStatus = "Not Started" | "Held Now" | "End";

export type Comment = {
  id?: string;
  content?: string;
  commenterEoa?: string;
  lecture?: Lecture;
  lectureId?: string;
  createdAt?: string;
};

export type CommentSearchForm = BaseSearchForm & Comment;

export type CommentForm = Comment;
