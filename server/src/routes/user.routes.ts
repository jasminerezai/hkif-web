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
FAVORITES REQUESTS:
    - CREATE: Post -> connects existing activities with the users account; Requires activity ids in req.bodyX
    - READ: Get -> returns users favoritesX
    - DELETE: Delete -> disconnect existing activities with the users account; Requires activity ids in req.bodyX
*there isn't really an update-route for the relation-table
'/favorites/edit' split at HTTP-method
 */

router.get('/favorites', userController.getFavorites );

router.post('/favorites/edit', userController.newFavorites)

router.delete('/favorites/edit', userController.deleteFavorites)


/*
PARTICIPATION REQUESTS OF SINGLE USER:


*/


/*
LEADER ACTIVITIES:
    <---> restrict to >=LEADER
*/





