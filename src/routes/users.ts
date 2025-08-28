import { Router, Request, Response, NextFunction } from 'express';
import { UserResponse, CreateUserDto, UpdateUserDto, ApiResponse } from '../types';
import { listUsers, getUserById, createUser, updateUser, deleteUser } from '../users/userService';
import { toUserResponse, toUserResponseList } from '../users/userMapper';

const router = Router();
type RouteHandler = (req: Request, res: Response) => void;

const handleRouteError =
  (handler: RouteHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      handler(req, res);
    } catch (error) {
      next(error);
    }
  };

router.get(
  '/',
  handleRouteError((_req: Request, res: Response): void => {
    const userList = toUserResponseList(listUsers());
    const response: ApiResponse<UserResponse[]> = {
      success: true,
      data: userList,
      message: `Found ${userList.length} user(s)`,
    };
    res.json(response);
  })
);

router.get(
  '/:id',
  handleRouteError((req: Request, res: Response): void => {
    const response: ApiResponse<UserResponse> = {
      success: true,
      data: toUserResponse(getUserById(req.params.id)),
    };
    res.json(response);
  })
);

router.post(
  '/',
  handleRouteError((req: Request, res: Response): void => {
    const response: ApiResponse<UserResponse> = {
      success: true,
      data: toUserResponse(createUser(req.body as CreateUserDto)),
      message: 'User created successfully',
    };
    res.status(201).json(response);
  })
);

router.put(
  '/:id',
  handleRouteError((req: Request, res: Response): void => {
    const response: ApiResponse<UserResponse> = {
      success: true,
      data: toUserResponse(updateUser(req.params.id, req.body as UpdateUserDto)),
      message: 'User updated successfully',
    };
    res.json(response);
  })
);

router.delete(
  '/:id',
  handleRouteError((req: Request, res: Response): void => {
    deleteUser(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully',
    };
    res.json(response);
  })
);

export default router;
