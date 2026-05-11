import { Router } from 'express';
import { ProfileRole } from '../db/prisma';
import { controller as userController} from '../controllers/user.controller';
import { authMiddleware, restrictToMinRole } from "../middleware/auth";

const userRoutes = Router();

//For every route: check if the user is logged In and a member
userRoutes.use(authMiddleware)
userRoutes.use(restrictToMinRole(ProfileRole.MEMBER))

/*
FAVORITES:
----------
POST /users/me/favorites/:activityId — add favorite sport
DELETE /users/me/favorites/:activityId — remove favorite sport
GET /users/me/favorites — return user's favorite sports list
 */
userRoutes.get('/me/favorites', userController.getFavorites );

userRoutes.post('/me/favorites/:activityId', userController.newFavorites)

userRoutes.delete('/me/favorites/:activityId', userController.deleteFavorites)


export default userRoutes;





