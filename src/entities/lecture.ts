import { BaseSearchForm } from "entities";
import { User } from "./user";
import { Comment } from "./comment";

export type LectureStatus = "Not Started" | "Held Now" | "End";

export type Lecture = {
  id?: string;
  name?: string;
  fromDate?: string;
  toDate?: string;
  tags?: string[];
  description?: string;
  materialUrl?: string;
  movieUrl?: string;
  attendeeNum?: number;
  attendeeMaxNum?: number;
  comments?: Comment[];
  favo?: number;

  moviePrice?: number;
  author?: User;
  authorId?: string;
  nLike?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LectureSearchForm = BaseSearchForm & Lecture;

export type LectureForm = Lecture;
