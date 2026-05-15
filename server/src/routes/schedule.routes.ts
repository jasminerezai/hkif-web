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


const scheduleRoutes: Router = Router();

// returns the currents week schedule
scheduleRoutes.get('/current', controller.currentWeek ) // re-route to getSchedule function?



// query: ?date=<some_date(default: today)&entireWeek=<boolean(default: true)>
scheduleRoutes.get('', controller.getSchedule )

/*
CREATE:
- new Week
READ: see aboveX
UPDATE: --> activities.routes.ts
- activity status
DELETE:
- weeks older than three?
 */


export default scheduleRoutes



