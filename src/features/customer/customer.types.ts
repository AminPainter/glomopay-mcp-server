export type TCustomer = { name: string; email: string };

export type TCustomersListApiResponse = {
  data: TCustomer[];
  pageMeta: {
    current: 1;
    previous: null | number;
    next: null | number;
    perPage: number;
    pages: number;
    count: number;
  };
};
