import { Router } from 'express';
import {controller} from "../controllers/activity.controller";

import READ from "../db/readQueries";
import {authMiddleware, restrictToMinRole} from "../middleware/auth";
import {ProfileRole} from "../db/prisma";

export const router: Router = Router(); // express.


//get all profiles that have favorited this activity:
router.get('/favorites', authMiddleware, restrictToMinRole(ProfileRole.LEADER), async (_req, res) => {
    res.json( await READ.profilesFavorited('6233715d-5631-4e2b-8236-2d39ec323b47') )
})


// get all participants of an activity, add date parameter
router.get('/participants', authMiddleware, restrictToMinRole( ProfileRole.LEADER), async (_req, res) => {
    res.json( await READ.partipantsOf('5d0f491d-752f-433d-a58f-0b5d0ff3d3fe') )
})


/*
    GET /activities --- public, no auth required --> get activity information
        --> all, by weekday, by time
    POST /activities --- leader only --> create new activity
    PUT /activities/:id --- leader only --> update activity; what about PATCH --> dont think its supported by all browsers
    DELETE /activities/:id --- leader only --> delete activity

    Each activity should include: title, sport, date/time, location, leaderId.
*/


// PUT /activities/:id --- leader only --> update activity
router.put('/:id', authMiddleware, restrictToMinRole( ProfileRole.LEADER), controller.updateActivity)


// DELETE /activities/:id --- leader only --> delete activity
router.delete('/:id', authMiddleware, restrictToMinRole( ProfileRole.LEADER), controller.deleteActivity)


// POST /activities --- leader only --> create new activity
router.post('', authMiddleware, restrictToMinRole( ProfileRole.LEADER), controller.newActivity)


//GET /activities
router.get('', controller.getActivity)