import { Router } from 'express';
import { controller } from "../controllers/activity.controller";

import { protect, restrictTo } from "../middleware/auth";
import { ProfileRole } from "../db/prisma";

export const router: Router = Router(); // express.

// GET /activities
router.get('', controller.getActivities);

// POST /activities --- leader only --> create new activity
router.post('', protect, restrictTo(ProfileRole.LEADER, ProfileRole.BOARD_MEMBER, ProfileRole.ADMIN), controller.newActivity);

// PUT /activities/:id --- leader only --> update activity
router.put('/:id', protect, restrictTo(ProfileRole.LEADER, ProfileRole.BOARD_MEMBER, ProfileRole.ADMIN), controller.updateActivity);

// DELETE /activities/:id --- leader only --> delete activity
router.delete('/:id', protect, restrictTo(ProfileRole.LEADER, ProfileRole.BOARD_MEMBER, ProfileRole.ADMIN), controller.deleteActivity);

