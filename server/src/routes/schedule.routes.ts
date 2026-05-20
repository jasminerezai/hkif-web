/*
to get any weeks schedule: send a date in the week you want in the url
 a la: '/schedule?date=<some-date>&onlyThisDay=<boolean>'
 if (onlyThisDay) => return only activity from the given date
 else => return weeks worth activities
 - switch around the logic? replace 'onlyThisDay' with 'entireWeek'
    - less data transfer by default
 --> returns, if available the schedule
 */
// current route: '/api/schedules'

import  {Router} from 'express';
import {controller} from "../controllers/schedule.controller.js";
import {authMiddleware, restrictToMinRole} from "../middleware/auth.js";
import {ProfileRole} from "../db/prisma.js";


const scheduleRoutes: Router = Router();

// returns the currents week schedule
scheduleRoutes.get('/current', controller.currentWeek ) // re-route to getSchedule function?



// query: ?date=<some_date(default: today)&entireWeek=<boolean(default: true)>
scheduleRoutes.get('', controller.getSchedule )

// CREATE schedule: restrict to BOARD_MEMBER and above
scheduleRoutes.post(
    '',
    authMiddleware,
    restrictToMinRole(ProfileRole.BOARD_MEMBER),
    controller.createSchedule
);

// UPDATE schedule: restrict to LEADER and above
scheduleRoutes.put(
    '/:scheduleId',
    authMiddleware,
    restrictToMinRole(ProfileRole.LEADER),
    controller.updateSchedule
);

scheduleRoutes.patch(
    '/:scheduleId',
    authMiddleware,
    restrictToMinRole(ProfileRole.LEADER),
    controller.updateSchedule
);

// DELETE schedule: restrict to BOARD_MEMBER and above
scheduleRoutes.delete(
    '/:scheduleId',
    authMiddleware,
    restrictToMinRole(ProfileRole.BOARD_MEMBER),
    controller.deleteSchedule
);


export default scheduleRoutes;



