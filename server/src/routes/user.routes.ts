// import { protect, restrictToMinRole } from '../middleware/auth.middleware';
import { Router } from 'express';
import { ProfileRole } from '../db/prisma';
import {controller as userController} from '../controllers/user.controller';
import {authMiddleware, restrictToMinRole} from "../middleware/auth";

export const router = Router();

//For every route: check if the user is logged In and a member
router.use(authMiddleware)
router.use(restrictToMinRole(ProfileRole.MEMBER))

/*
FAVORITES:
----------
POST /users/me/favorites/:sportId — add favorite sport
DELETE /users/me/favorites/:sportId — remove favorite sport
GET /users/me/favorites — return user's favorite sports list
 */
router.get('/me/favorites', userController.getFavorites );

router.post('/me/favorites/:activityId', userController.newFavorites)

router.delete('/me/favorites/:activityId', userController.deleteFavorites)


/*
PARTICIPATION REQUESTS OF SINGLE USER:


*/


/*
LEADER ACTIVITIES:
    <---> restrict to >=LEADER
*/





