import { ResponseType } from '../enums/response-type.enum';

export interface Response {
  message: string;
  type: ResponseType;
}
