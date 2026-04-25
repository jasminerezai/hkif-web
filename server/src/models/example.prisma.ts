import '../../bootstrap'; // used when testing in local file and it requires process.env variables
import {prisma} from "../db/prisma";
import {prof_role} from "../generated/prisma/enums";


async function exampleCreate(){
    const newProfile = await prisma.profile.create({//returns the object with that data
        data: {
            email: "alice55@example.com",
            profile_name: "alice",
            password: "123",
            profile_role: prof_role.USER
            /*
            <column_name> : <value>
             */
        }
    });
    prisma.profile.createManyAndReturn({
        data: [

        ]
    })
    return newProfile;
}

async function exampleSelect(){
    const five = await prisma.profile.findMany(// returns array of objects
        {take: 5} //limit the number of rows
    );
    const multi = await prisma.profile.findMany({
        where: {password: "123"},
        select: {email: true},
        take: 3
    })
    console.log(multi)
    return five
}

function exampleUpdate(){
    return prisma.profile.update({ // returns update object
        where: {
            email: "alice@example.com"
        },
        data: {
            password: "456"
        }

    })
}

async function main(){
    // const alice = await exampleCreate()
    // console.log(alice)
    console.log(exampleSelect())
    // console.log( await prisma.profile.findFirst())
    // console.log(await exampleUpdate())
}

main().catch(err => console.log(err)).finally(async () => await prisma.$disconnect()); // not strictly necessary: await prisma.$disconnect()
export {main}