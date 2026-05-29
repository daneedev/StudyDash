export type ClassItem = {
  id: string;
  name: string;
  inviteCode: string;
  isAdmin: boolean;
};

export type ClassApiItem = {
  id?: string;
  name?: string;
  inviteCode?: string;
  role?: string;
  class?: {
    id?: string;
    name?: string;
    inviteCode?: string;
  };
};

export type ClassesApiResponse =
  | ClassApiItem[]
  | {
      data?: ClassApiItem[] | { classes?: ClassApiItem[] };
    };
