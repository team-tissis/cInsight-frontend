import { BaseEntity, BaseSearchForm } from ".";

export type User = BaseEntity & {
  id?: string;
  name?: string;
  mail?: string;
  eoa?: string;
  createdAt?: string;
  updatedAt?: string;

  fullName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  isStaff?: string;
  likeRest?: number;
  avatorUrl?: string;
  token?: string;
  accountLink?: string;
  referencerAddress?: string;
};

export type UserForm = User;

export type UserSearchForm = BaseSearchForm & {
  name?: string;
  id?: string;
};
