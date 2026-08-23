import { BaseRecord, DataProvider, GetListParams, GetListResponse, HttpError } from "@refinedev/core";
import { MOCK_SUBJECTS } from "./mock-subjects";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest"
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";

const buildHttpError = async (res:Response) : Promise<HttpError> => {
  console.log('not nice');
  let message = 'Request failed';

  try {
    const payload = (await res.json()) as { message? : string }
    
    if (payload?.message) {
      message = payload.message;
    }
  } catch {
    // Ignore errors
  }
  
  return {
    message,
    statusCode: res.status
  }
}

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({resource}) => resource,

    buildQueryParams: async ({resource, pagination, filters}) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string|number> = {page, limit: pageSize};

      filters?.forEach((filter)=>{
        const field = 'field' in filter? filter.field : '';
        const value = String(filter.value);

        if (resource === 'subjects') {
          if (field === 'department') params.department = value;
          if (field === 'name' || field === 'code') {
            params.search = value;
          }
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      console.log(response.ok);
      if (!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  }
}

const {dataProvider: restDataProvider} = createDataProvider(BACKEND_BASE_URL, options);
 

const dataProvider: DataProvider = {
  ...restDataProvider,

  getList: async (params) => {
    try {
      return await restDataProvider.getList(params);
    } catch (error: any) {
      console.log("Caught request error:", error);
      console.log("Status:", error?.response?.status);
      console.log("Message:", error?.message);

      const statusCode =
        error?.response?.status ??
        error?.statusCode ??
        error?.status;

      const httpError: HttpError = {
        message:
          error?.response?.data?.message ??
          error?.message ??
          "Request failed",
        statusCode,
      };

      throw httpError;
    }
  },
};

export { dataProvider };