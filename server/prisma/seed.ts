import "dotenv/config";
// import { PrismaClient} from "@prisma/client/extension"; // why /extension?
// import {PrismaPg} from '@prisma/adapter-pg';
// import { PrismaClient } from "@prisma/client/extension"
//
// const connectionString = `${process.env.DATABASE_URL}`;
//
// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });
import {prisma} from "../src/db/prisma.ts";

import bcrypt from "bcryptjs";


/*
for development the DB was populated with the help of chatgpt:
https://chatgpt.com/share/69ecf527-8d6c-83eb-b7a8-6e8d198dc166

The activities currently in the DB DO NOT REFLECT / ARE ACTUAL ACTIVITIES
 */
async function seed() {
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.profile.createMany(
        {
            data: [
                {
                    email: "alice.johnson@example.com",
                    profile_name: "Alice Johnson",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "ben.carter@example.com",
                    profile_name: "Ben Carter",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "clara.smith@example.com",
                    profile_name: "Clara Smith",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "daniel.brown@example.com",
                    profile_name: "Daniel Brown",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "emma.wilson@example.com",
                    profile_name: "Emma Wilson",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "felix.anderson@example.com",
                    profile_name: "Felix Anderson",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "grace.thomas@example.com",
                    profile_name: "Grace Thomas",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "henry.moore@example.com",
                    profile_name: "Henry Moore",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "isla.martin@example.com",
                    profile_name: "Isla Martin",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "jack.walker@example.com",
                    profile_name: "Jack Walker",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "karen.hall@example.com",
                    profile_name: "Karen Hall",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "liam.allen@example.com",
                    profile_name: "Liam Allen",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "mia.young@example.com",
                    profile_name: "Mia Young",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "noah.king@example.com",
                    profile_name: "Noah King",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "olivia.scott@example.com",
                    profile_name: "Olivia Scott",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "peter.green@example.com",
                    profile_name: "Peter Green",
                    password: hashedPassword,
                    profile_role: "LEADER",
                },
                {
                    email: "quinn.adams@example.com",
                    profile_name: "Quinn Adams",
                    password: hashedPassword,
                    profile_role: "LEADER",
                },
                {
                    email: "ruby.baker@example.com",
                    profile_name: "Ruby Baker",
                    password: hashedPassword,
                    profile_role: "LEADER",
                },
                {
                    email: "samuel.gonzalez@example.com",
                    profile_name: "Samuel Gonzalez",
                    password: hashedPassword,
                    profile_role: "LEADER",
                },
                {
                    email: "tina.nelson@example.com",
                    profile_name: "Tina Nelson",
                    password: hashedPassword,
                    profile_role: "LEADER",
                },
                {
                    email: "ulysses.hill@example.com",
                    profile_name: "Ulysses Hill",
                    password: hashedPassword,
                    profile_role: "BOARD_MEMBER",
                },
                {
                    email: "victoria.rivera@example.com",
                    profile_name: "Victoria Rivera",
                    password: hashedPassword,
                    profile_role: "BOARD_MEMBER",
                },
                {
                    email: "william.campbell@example.com",
                    profile_name: "William Campbell",
                    password: hashedPassword,
                    profile_role: "BOARD_MEMBER",
                },
                {
                    email: "xenia.mitchell@example.com",
                    profile_name: "Xenia Mitchell",
                    password: hashedPassword,
                    profile_role: "BOARD_MEMBER",
                },
                {
                    email: "yusuf.perez@example.com",
                    profile_name: "Yusuf Perez",
                    password: hashedPassword,
                    profile_role: "ADMIN",
                },
                {
                    email: "zoe.roberts@example.com",
                    profile_name: "Zoe Roberts",
                    password: hashedPassword,
                    profile_role: "ADMIN",
                },
                {
                    email: "adam.turner@example.com",
                    profile_name: "Adam Turner",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "bella.phillips@example.com",
                    profile_name: "Bella Phillips",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "caleb.evans@example.com",
                    profile_name: "Caleb Evans",
                    password: hashedPassword,
                    profile_role: "USER",
                },
                {
                    email: "daisy.edwards@example.com",
                    profile_name: "Daisy Edwards",
                    password: hashedPassword,
                    profile_role: "USER",
                },
            ],
        }
    );

    await prisma.template_activity.createMany(
        {
            data: [
                {
                    activity_name: "Morning Yoga",
                    description: "A relaxing yoga session for all skill levels.",
                    location: "Gym Hall A",
                    time_slots: {
                        monday: ["07:00", "09:00"],
                        wednesday: ["07:00", "09:00"],
                    },
                    fk_leader: 16,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Evening Basketball",
                    description: "Weekly basketball games and practice.",
                    location: "Sports Court",
                    time_slots: {
                        tuesday: ["18:00", "20:00"],
                        thursday: ["18:00", "20:00"],
                    },
                    fk_leader: 17,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Swimming Lessons",
                    description: "Beginner-friendly swimming classes.",
                    location: "Pool Center",
                    time_slots: {
                        saturday: ["10:00", "12:00"],
                    },
                    fk_leader: 18,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Book Club",
                    description: "Discussing one book every two weeks.",
                    location: "Library Room",
                    time_slots: {
                        friday: ["17:00", "18:30"],
                    },
                    fk_leader: 19,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Board Game Night",
                    description: "Casual board games and social gathering.",
                    location: "Community Hall",
                    time_slots: {
                        saturday: ["19:00", "22:00"],
                    },
                    fk_leader: 20,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Coding Workshop",
                    description: "Hands-on JavaScript and Prisma tutorials.",
                    location: "Tech Room",
                    time_slots: {
                        monday: ["18:00", "20:30"],
                    },
                    fk_leader: 25,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Cycling Group",
                    description: "Weekend cycling around the city trails.",
                    location: "Bike Station",
                    time_slots: {
                        sunday: ["08:00", "11:00"],
                    },
                    fk_leader: 21,
                    default_status: "DELAYED",
                },
                {
                    activity_name: "Cooking Class",
                    description: "Learn international recipes and techniques.",
                    location: "Kitchen Lab",
                    time_slots: {
                        wednesday: ["17:30", "20:00"],
                    },
                    fk_leader: 22,
                    default_status: "ACTIVE",
                },
                {
                    activity_name: "Photography Walk",
                    description: "Outdoor photography practice sessions.",
                    location: "City Center",
                    time_slots: {
                        sunday: ["14:00", "16:30"],
                    },
                    fk_leader: 23,
                    default_status: "INACTIVE",
                },
                {
                    activity_name: "Music Jam Session",
                    description: "Bring your instrument and play together.",
                    location: "Studio B",
                    time_slots: {
                        friday: ["19:00", "21:30"],
                    },
                    fk_leader: 24,
                    default_status: "CANCELLED",
                },
            ],
        }
    );

    await prisma.schedule.createMany(
        {
            data: [
                // Week 18
                {
                    week_nr: 18,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-04-27"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-04-29"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-04-28"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-04-30"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 3,
                    scheduled_date: new Date("2026-05-02"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T10:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 4,
                    scheduled_date: new Date("2026-05-01"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 5,
                    scheduled_date: new Date("2026-05-02"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 6,
                    scheduled_date: new Date("2026-04-27"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 7,
                    scheduled_date: new Date("2026-05-03"),
                    status: "DELAYED",
                    scheduled_time: new Date("1970-01-01T08:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 8,
                    scheduled_date: new Date("2026-04-29"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:30:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 9,
                    scheduled_date: new Date("2026-05-03"),
                    status: "INACTIVE",
                    scheduled_time: new Date("1970-01-01T14:00:00"),
                },
                {
                    week_nr: 18,
                    fk_activity_id: 10,
                    scheduled_date: new Date("2026-05-01"),
                    status: "CANCELLED",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },

                // Week 19
                {
                    week_nr: 19,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-05-04"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-05-06"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-05-05"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-05-07"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 3,
                    scheduled_date: new Date("2026-05-09"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T10:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 4,
                    scheduled_date: new Date("2026-05-08"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 5,
                    scheduled_date: new Date("2026-05-09"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 6,
                    scheduled_date: new Date("2026-05-04"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 7,
                    scheduled_date: new Date("2026-05-10"),
                    status: "DELAYED",
                    scheduled_time: new Date("1970-01-01T08:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 8,
                    scheduled_date: new Date("2026-05-06"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:30:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 9,
                    scheduled_date: new Date("2026-05-10"),
                    status: "INACTIVE",
                    scheduled_time: new Date("1970-01-01T14:00:00"),
                },
                {
                    week_nr: 19,
                    fk_activity_id: 10,
                    scheduled_date: new Date("2026-05-08"),
                    status: "CANCELLED",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },

                // Week 20
                {
                    week_nr: 20,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-05-11"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 1,
                    scheduled_date: new Date("2026-05-13"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T07:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-05-12"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 2,
                    scheduled_date: new Date("2026-05-14"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 3,
                    scheduled_date: new Date("2026-05-16"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T10:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 4,
                    scheduled_date: new Date("2026-05-15"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 5,
                    scheduled_date: new Date("2026-05-16"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 6,
                    scheduled_date: new Date("2026-05-11"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T18:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 7,
                    scheduled_date: new Date("2026-05-17"),
                    status: "DELAYED",
                    scheduled_time: new Date("1970-01-01T08:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 8,
                    scheduled_date: new Date("2026-05-13"),
                    status: "ACTIVE",
                    scheduled_time: new Date("1970-01-01T17:30:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 9,
                    scheduled_date: new Date("2026-05-17"),
                    status: "INACTIVE",
                    scheduled_time: new Date("1970-01-01T14:00:00"),
                },
                {
                    week_nr: 20,
                    fk_activity_id: 10,
                    scheduled_date: new Date("2026-05-15"),
                    status: "CANCELLED",
                    scheduled_time: new Date("1970-01-01T19:00:00"),
                },
            ],
        }
    );

    await prisma.favorites.createMany(
        {
            data: [
                { fk_profile_id: 1, fk_activity_id: 1 },
                { fk_profile_id: 1, fk_activity_id: 6 },

                { fk_profile_id: 2, fk_activity_id: 2 },
                { fk_profile_id: 2, fk_activity_id: 5 },

                { fk_profile_id: 3, fk_activity_id: 3 },
                { fk_profile_id: 3, fk_activity_id: 8 },

                { fk_profile_id: 4, fk_activity_id: 4 },
                { fk_profile_id: 4, fk_activity_id: 10 },

                { fk_profile_id: 5, fk_activity_id: 1 },
                { fk_profile_id: 5, fk_activity_id: 7 },

                { fk_profile_id: 6, fk_activity_id: 2 },
                { fk_profile_id: 6, fk_activity_id: 9 },

                { fk_profile_id: 7, fk_activity_id: 5 },
                { fk_profile_id: 7, fk_activity_id: 8 },

                { fk_profile_id: 8, fk_activity_id: 6 },
                { fk_profile_id: 8, fk_activity_id: 10 },

                { fk_profile_id: 9, fk_activity_id: 3 },
                { fk_profile_id: 9, fk_activity_id: 4 },

                { fk_profile_id: 10, fk_activity_id: 1 },
                { fk_profile_id: 10, fk_activity_id: 2 },

                { fk_profile_id: 11, fk_activity_id: 7 },
                { fk_profile_id: 11, fk_activity_id: 9 },

                { fk_profile_id: 12, fk_activity_id: 5 },
                { fk_profile_id: 12, fk_activity_id: 6 },

                { fk_profile_id: 13, fk_activity_id: 8 },
                { fk_profile_id: 13, fk_activity_id: 10 },

                { fk_profile_id: 14, fk_activity_id: 2 },
                { fk_profile_id: 14, fk_activity_id: 3 },

                { fk_profile_id: 15, fk_activity_id: 1 },
                { fk_profile_id: 15, fk_activity_id: 4 },

                { fk_profile_id: 16, fk_activity_id: 6 },
                { fk_profile_id: 16, fk_activity_id: 8 },

                { fk_profile_id: 17, fk_activity_id: 2 },
                { fk_profile_id: 17, fk_activity_id: 5 },

                { fk_profile_id: 18, fk_activity_id: 3 },
                { fk_profile_id: 18, fk_activity_id: 7 },

                { fk_profile_id: 19, fk_activity_id: 4 },
                { fk_profile_id: 19, fk_activity_id: 10 },

                { fk_profile_id: 20, fk_activity_id: 5 },
                { fk_profile_id: 20, fk_activity_id: 9 },
            ],
        }
    );

    await prisma.participation_log.createMany(
        {
            data: [
                // Morning Yoga - 2026-04-27
                {
                    fk_activity_id: 1,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 1,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 1,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 5,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 1,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 10,
                    expressed_interest: true,
                    participated: false,
                },

                // Morning Yoga - 2026-04-29
                {
                    fk_activity_id: 1,
                    fk_scheduled_date: new Date("2026-04-29"),
                    fk_profile_id: 15,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 1,
                    fk_scheduled_date: new Date("2026-04-29"),
                    fk_profile_id: 8,
                    expressed_interest: false,
                    participated: false,
                },

                // Evening Basketball - 2026-04-28
                {
                    fk_activity_id: 2,
                    fk_scheduled_date: new Date("2026-04-28"),
                    fk_profile_id: 2,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 2,
                    fk_scheduled_date: new Date("2026-04-28"),
                    fk_profile_id: 6,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 2,
                    fk_scheduled_date: new Date("2026-04-28"),
                    fk_profile_id: 14,
                    expressed_interest: true,
                    participated: false,
                },

                // Evening Basketball - 2026-04-30
                {
                    fk_activity_id: 2,
                    fk_scheduled_date: new Date("2026-04-30"),
                    fk_profile_id: 17,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 2,
                    fk_scheduled_date: new Date("2026-04-30"),
                    fk_profile_id: 10,
                    expressed_interest: false,
                    participated: false,
                },

                // Swimming Lessons - 2026-05-02
                {
                    fk_activity_id: 3,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 3,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 3,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 9,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 3,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 18,
                    expressed_interest: true,
                    participated: false,
                },

                // Book Club - 2026-05-01
                {
                    fk_activity_id: 4,
                    fk_scheduled_date: new Date("2026-05-01"),
                    fk_profile_id: 4,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 4,
                    fk_scheduled_date: new Date("2026-05-01"),
                    fk_profile_id: 15,
                    expressed_interest: true,
                    participated: true,
                },

                // Board Game Night - 2026-05-02
                {
                    fk_activity_id: 5,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 2,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 5,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 7,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 5,
                    fk_scheduled_date: new Date("2026-05-02"),
                    fk_profile_id: 20,
                    expressed_interest: true,
                    participated: false,
                },

                // Coding Workshop - 2026-04-27
                {
                    fk_activity_id: 6,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 1,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 6,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 8,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 6,
                    fk_scheduled_date: new Date("2026-04-27"),
                    fk_profile_id: 12,
                    expressed_interest: false,
                    participated: false,
                },

                // Cycling Group - 2026-05-03
                {
                    fk_activity_id: 7,
                    fk_scheduled_date: new Date("2026-05-03"),
                    fk_profile_id: 5,
                    expressed_interest: true,
                    participated: false,
                },
                {
                    fk_activity_id: 7,
                    fk_scheduled_date: new Date("2026-05-03"),
                    fk_profile_id: 11,
                    expressed_interest: true,
                    participated: false,
                },

                // Cooking Class - 2026-04-29
                {
                    fk_activity_id: 8,
                    fk_scheduled_date: new Date("2026-04-29"),
                    fk_profile_id: 3,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 8,
                    fk_scheduled_date: new Date("2026-04-29"),
                    fk_profile_id: 7,
                    expressed_interest: true,
                    participated: true,
                },
                {
                    fk_activity_id: 8,
                    fk_scheduled_date: new Date("2026-04-29"),
                    fk_profile_id: 16,
                    expressed_interest: false,
                    participated: false,
                },

                // Photography Walk - 2026-05-03
                {
                    fk_activity_id: 9,
                    fk_scheduled_date: new Date("2026-05-03"),
                    fk_profile_id: 6,
                    expressed_interest: true,
                    participated: false,
                },
                {
                    fk_activity_id: 9,
                    fk_scheduled_date: new Date("2026-05-03"),
                    fk_profile_id: 20,
                    expressed_interest: false,
                    participated: false,
                },

                // Music Jam Session - 2026-05-01
                {
                    fk_activity_id: 10,
                    fk_scheduled_date: new Date("2026-05-01"),
                    fk_profile_id: 4,
                    expressed_interest: true,
                    participated: false,
                },
                {
                    fk_activity_id: 10,
                    fk_scheduled_date: new Date("2026-05-01"),
                    fk_profile_id: 13,
                    expressed_interest: true,
                    participated: false,
                },
                {
                    fk_activity_id: 10,
                    fk_scheduled_date: new Date("2026-05-01"),
                    fk_profile_id: 19,
                    expressed_interest: false,
                    participated: false,
                },
            ],
        }
    )
}

seed().then( () => prisma.$disconnect() );