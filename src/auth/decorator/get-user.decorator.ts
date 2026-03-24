import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestUser = {
  [key: string]: unknown;
};

type RequestWithUser = {
  user: RequestUser;
};

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
