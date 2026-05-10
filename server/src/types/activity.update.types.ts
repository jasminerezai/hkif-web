import {ActivityTemplateModel, TimeSlotModel} from '../generated/prisma/models';
import {ActivityStatus, Weekday} from '../db/prisma';
export const UpdateType = {
    GENERAL: 'GENERAL',
    TIME: 'TIME',
    LEADER: 'LEADER'
} as const;

export type UpdateTypes = (typeof UpdateType)[keyof typeof UpdateType]

export const UpdateAction = {
    ADD: 'ADD',
    DELETE: 'DELETE',
    UPDATE: 'UPDATE'
} as const;

export type UpdateAction = (typeof UpdateAction)[keyof typeof UpdateAction]

type reqBody = {
    type: UpdateTypes,
    action: UpdateAction
}

// general req.body
type include =
    | string
    | number
    | ActivityStatus
type nonNested<T> = { [K in keyof T as T[K] extends include ? K : never]: T[K] }
type nonNestedData = Omit<nonNested<ActivityTemplateModel>, "id">
type generalReqBody = reqBody & {
    type: typeof UpdateType.GENERAL,
    action: typeof UpdateAction.UPDATE,
    data: nonNestedData
}

// time req.body
type timeReqBodyDelete = reqBody & {
    type: typeof UpdateType.TIME,
    action: typeof UpdateAction.DELETE,
    weekday: Weekday
}
type timeSlotAdd = Omit<TimeSlotModel, "id" | "activityId" | "activity">

type timeReqBodyAdd = reqBody & {
    type: typeof UpdateType.TIME,
    action: typeof UpdateAction.ADD,
    data: timeSlotAdd | timeSlotAdd[]
}

type weekday_startTime_Id = Omit<TimeSlotModel, "id" | "activityId" | "activity" | "endTime">
type timeReqBodyUpdate = reqBody & {
    type: typeof UpdateType.TIME,
    action: typeof UpdateAction.UPDATE,
    weekday_startTime: weekday_startTime_Id,
    data: timeSlotAdd
}


// leader req.body
type leaderReqBody = reqBody & {
    type: typeof UpdateType.LEADER,
    action: typeof UpdateAction.ADD | typeof UpdateAction.DELETE,
    leaderId: string
}


type anyReqBody =
    | generalReqBody
    | timeReqBodyDelete
    | timeReqBodyAdd
    | timeReqBodyUpdate
    | leaderReqBody

function isGeneralReqBody(body: any): body is generalReqBody {
    return (
        body?.type === UpdateType.GENERAL &&
        body?.action === UpdateAction.UPDATE &&
        body?.data !== undefined
    )
}

function isTimeReqBodyDelete(body: any): body is timeReqBodyDelete {
    return (
        body?.type === UpdateType.TIME &&
        body?.action === UpdateAction.DELETE &&
        body?.weekday !== undefined
    )
}

function isTimeReqBodyAdd(body: any): body is timeReqBodyAdd {
    return (
        body?.type === UpdateType.TIME &&
        body?.action === UpdateAction.ADD &&
        body?.data !== undefined
    )
}

function isTimeReqBodyUpdate(body: any): body is timeReqBodyUpdate {
    return (
        body?.type === UpdateType.TIME &&
        body?.action === UpdateAction.UPDATE &&
        body?.weekday_startTime !== undefined &&
        body?.data !== undefined
    )
}

function isLeaderReqBody(body: any): body is leaderReqBody {
    return (
        body?.type === UpdateType.LEADER &&
        (
            body?.action === UpdateAction.ADD ||
            body?.action === UpdateAction.DELETE
        ) &&
        typeof body?.leaderId === 'string'
    )
}

function assertReqBody(body: any): asserts body is anyReqBody {
    if (
        isGeneralReqBody(body) ||
        isTimeReqBodyDelete(body) ||
        isTimeReqBodyAdd(body) ||
        isTimeReqBodyUpdate(body) ||
        isLeaderReqBody(body)
    ) {
        return
    }

    throw new Error('Invalid request body')
}

function narrowReqBody(body: anyReqBody) {
    switch (body.type) {
        case UpdateType.GENERAL:
            body.data
            break

        case UpdateType.TIME:
            switch (body.action) {
                case UpdateAction.ADD:
                    body.data
                    break

                case UpdateAction.DELETE:
                    body.weekday
                    break

                case UpdateAction.UPDATE:
                    body.weekday_startTime
                    break
            }
            break

        case UpdateType.LEADER:
            body.leaderId
            break
    }
}

function whichReqBodyType(body: any){
    assertReqBody(body)
    narrowReqBody(body)
}

