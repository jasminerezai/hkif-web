import express, {Router} from 'express';

import READ from "../db/readQueries";
import {protect, restrictTo} from "../middleware/auth.middleware";
import {ProfileRole} from "../db/prisma";

export const router: Router = express.Router();


//get all profiles that have favorited this activity:
router.get('/favorites', protect, restrictTo( ProfileRole.LEADER, ProfileRole.BOARD_MEMBER, ProfileRole.ADMIN ), async (_req, res) => {
    res.json( await READ.profilesFavorited('6233715d-5631-4e2b-8236-2d39ec323b47') )
})

// get all participants of an activity, add date parameter
router.get('/participants', protect, restrictTo( ProfileRole.LEADER, ProfileRole.BOARD_MEMBER, ProfileRole.ADMIN ), async (_req, res) => {
    res.json( await READ.partipantsOf('5d0f491d-752f-433d-a58f-0b5d0ff3d3fe') )
})