/*
to get any weeks schedule: send a date in the week you want in the url
 a la: '/schedule?date=<some-date>&onlyThisDay=<boolean>'
 if (onlyThisDay) => return only activity from the given date
 else => return weeks worth activities
 - switch around the logic? replace 'onlyThisDay' with 'entireWeek'
    - less data transfer by default
 --> returns, if available the schedule
 */

import express, {Router} from 'express';
import {asyncHandler} from "../middleware/asyncHandler.js";
import {controller} from "../controller/controller.schedule.js";

export const router: Router = express.Router();

// returns the currents week schedule
router.get('/current', asyncHandler(controller.currentWeek) )



