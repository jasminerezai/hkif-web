/*
- [ ] querying a specific user
- [ ] all profiles that favorite an activity
	- [ ] by profile_id --> all favorites of a profile
	- [ ] by activity_name --> all profiles that prefer this activity
- [ ] all leaders
	- [ ] all leaders & bord members
	- [ ] all bord members
 */
import '../../bootstrap';
// import {profileModel} from '../generated/prisma/models/profile.ts';
// import {ProfileAggregateArgs} from '../generated/prisma/models/profile.ts';
import {prisma} from "./prisma.ts";
import {prof_role} from "../generated/prisma/enums";
// import type {} from "../generated/prisma/models"
import {schedule} from '@prisma/client'


// QUERY OBJECTS

/**
 * Query the profile table with this Object
 * @param profileId
 */
const byProfileId = (profileId: number) => {//: ProfileAggregateArgs
    return {
        where: {
            profile_id: profileId
        }
    }
}
const user: profile

/**
 * query template for activity id, then query the favorites table
 * @param activity_id ex: id of "Volleyball"
 */
const membersOfActivity = (activity_id: number) => {//
    return {
        where: {
            fk_activity_id: activity_id//findActivityIdByName(activity_name) // do i have to destructure?
        }
    }
}

/**
 * returns the activity_id of a given activity_name
 * @param activity_name
 */
const findActivityIdByName = (activity_name: string) => {
    return {
        where: { activity_name: activity_name },
        select: { activity_id: true }
    }
}




// FUNCTION CALLS TO DB??

async function findActivityId(activity_name: string){
    // console.log(await prisma.template_activity.findFirst(findActivityIdByName(activity_name)))
    return prisma.template_activity.findFirst(findActivityIdByName(activity_name))
}

async function profilesThatLike(activity_name: string){//
    // let id_result= await findActivityId(activity_name)//
    // let result:  {
    //     fk_profile_id: number
    //     fk_activity_id: number
    // }[]
    // if(id_result) {
    //     const {activity_id} = id_result;
    //     result = await prisma.favorites.findMany(
    //         membersOfActivity(activity_id)
    //     )
    //     console.log(activity_name)
    //     console.log(result)
    // }
    // let result = await prisma.favorites.findMany({
    //     where: {
    //         fk_activity_id: 4
    //     }
    // })
    const users = await prisma.profile.findMany({
        // include: {
        //     favorites: {
        //         where: {
        //             fk_activity_id: 1
        //         }
        //     }
        // },
        take: 5
    })
    if(users.length > 0) {
        // let {favorites} = users;
        // console.log(users)
        // console.log(users[0].favorites[0])
        console.log()

        let firstUser: Exlcude<pr> = users[0]
        // if(firstUser){
        //     let user: Exclude<(
        //     {
        //         favorites: {
        //             fk_activity_id: number
        //             fk_profile_id: number
        //         }[]
        //     } & {
        //         profile_id: number
        //         email: string
        //         profile_name: string
        //         password: string
        //         profile_role: prof_role
        //     }
        //     ),
        //     {
        //     favorites: {
        //         fk_activity_id: number
        //         fk_profile_id: number
        //     }[]
        //     }> = firstUser;
        // }
        console.log(users)
    }

}

// findActivityId("Book Club").catch(err => console.log(err)).finally(async () => await prisma.$disconnect())

// profilesThatLike("Book Club").catch(err => console.log(err)).finally(async () => await prisma.$disconnect())
profilesThatLike("Evening Basketball").catch(err => console.log(err)).finally(async () => await prisma.$disconnect())