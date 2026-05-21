import { Router } from 'express';
import { controller as userController} from '../controllers/user.controller.js';
import { authMiddleware } from "../middleware/auth.js";

const userRoutes = Router();

//For every route: check if the user is logged In and a member
userRoutes.use(authMiddleware)

/*
FAVORITES:
----------
POST /users/me/favorites/:activityId — add favorite sport
DELETE /users/me/favorites/:activityId — remove favorite sport
GET /users/me/favorites — return user's favorite sports list
 */
userRoutes.get('/me/favorites', userController.getFavorites );

userRoutes.post('/me/favorites/:activityId', userController.newFavorites);

userRoutes.delete('/me/favorites/:activityId', userController.deleteFavorites);

/*
PROFILE
----------
GET ./api/users/me -- returns full profile (email, profileName, favorites: ActivityDto[], participations: ScheduleDto[] )

PATCH ./api/users/me -- update email, profileName, or role?? NOT IN ISSUE DESCRIPTION
 */

userRoutes.get('/me', userController.getFullProfile)


export default userRoutes;





