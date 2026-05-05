import "dotenv/config";

// @ts-ignore
import {prisma} from "../src/db/prisma.ts"; // "@ts-ignore" for file ending '.ts'
import { ProfileRole, ActivityStatus, Weekday} from '../src/generated/prisma/enums'

/*
ChatGPT chat: https://chatgpt.com/share/69f8d77a-aa14-83eb-90b7-e90269da81bf
 */

import bcrypt from "bcryptjs";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

// Map weekday enum → JS weekday index
const weekdayMap: Record<Weekday, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 0,
};

function nextDateForWeekday(base: Date, weekday: Weekday) {
    const target = weekdayMap[weekday];
    const date = new Date(base);
    const diff = (target - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + diff);
    return date;
}
function randomStatus(): ActivityStatus {
    const r = Math.random();

    if (r < 0.7) return ActivityStatus.ACTIVE;
    if (r < 0.85) return ActivityStatus.CANCELLED;
    if (r < 0.95) return ActivityStatus.DELAYED;
    return ActivityStatus.INACTIVE;
}
// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
    console.log("🌱 Seeding database...");

    // ──────────────────────────────────────────────
    // Profiles (30)
    // ──────────────────────────────────────────────
    const profiles = [];

    for (let i = 1; i <= 30; i++) {
        const plainPassword = `user${i}pass`; // Plain: userXpass
        const hashed = await hashPassword(plainPassword);

        const role =
            i === 1
                ? ProfileRole.ADMIN
                : i <= 5
                    ? ProfileRole.LEADER
                    : ProfileRole.USER;

        const profile = await prisma.profile.create({
            data: {
                email: `user${i}@example.com`,
                password: hashed,
                role,
            },
        });

        profiles.push(profile);
    }

    // ──────────────────────────────────────────────
    // Activity Templates (10)
    // ──────────────────────────────────────────────
    const activityNames = [
        "Yoga",
        "Football",
        "Basketball",
        "Swimming",
        "Running Club",
        "Tennis",
        "Pilates",
        "Crossfit",
        "Dance",
        "Boxing",
    ];

    const activities = [];

    for (let i = 0; i < 10; i++) {
        const activity = await prisma.activityTemplate.create({
            data: {
                name: activityNames[i],
                description: `${activityNames[i]} session`,
                location: `Location ${i + 1}`,
                maxCapacity: 10 + i * 2,
            },
        });

        activities.push(activity);
    }

    // ──────────────────────────────────────────────
    // Time Slots (1–2 per activity)
    // ──────────────────────────────────────────────
    const timeSlots = [];

    for (const activity of activities) {
        const slotsPerActivity = Math.random() > 0.5 ? 2 : 1;

        for (let i = 0; i < slotsPerActivity; i++) {
            const weekday = randomItem(Object.values(Weekday));

            const startHour = 8 + Math.floor(Math.random() * 10);
            const start = new Date(`1970-01-01T${String(startHour).padStart(2, "0")}:00:00Z`);
            const end = new Date(`1970-01-01T${String(startHour + 1).padStart(2, "0")}:00:00Z`);

            const slot = await prisma.timeSlot.create({
                data: {
                    activityId: activity.id,
                    weekday,
                    startTime: start,
                    endTime: end,
                },
            });

            timeSlots.push(slot);
        }
    }

    // ──────────────────────────────────────────────
    // Leader assignments
    // ──────────────────────────────────────────────
    const leaders = profiles.filter(p => p.role === ProfileRole.LEADER);

    for (const activity of activities) {
        const leader = randomItem(leaders);

        await prisma.leaderActivity.create({
            data: {
                profileId: leader.id,
                activityId: activity.id,
            },
        });
    }

    // ──────────────────────────────────────────────
    // Favorites (random)
    // ──────────────────────────────────────────────
    for (const profile of profiles) {
        const favCount = Math.floor(Math.random() * 3);

        for (let i = 0; i < favCount; i++) {
            const activity = randomItem(activities);

            await prisma.favorite
                .create({
                    data: {
                        profileId: profile.id,
                        activityId: activity.id,
                    },
                })
                .catch(() => {}); // ignore duplicates
        }
    }

    // ──────────────────────────────────────────────
    // Schedules (3 weeks)
    // ──────────────────────────────────────────────
    const schedules = [];
    const today = new Date();

    for (const slot of timeSlots) {
        for (let week = 0; week < 3; week++) {
            const base = addDays(today, week * 7);
            const date = nextDateForWeekday(base, slot.weekday);

            const start = new Date(date);
            start.setHours(slot.startTime.getHours(), 0, 0);

            const end = new Date(date);
            end.setHours(slot.endTime.getHours(), 0, 0);

            const status = randomStatus();

            let finalStart = new Date(start);
            let finalEnd: Date | null = new Date(end);

            // Adjust based on status
            if (status === ActivityStatus.CANCELLED) {
                finalEnd = null;
            }

            if (status === ActivityStatus.DELAYED) {
                finalStart = new Date(start.getTime() + 30 * 60 * 1000); // +30 min
                finalEnd = new Date(end.getTime() + 30 * 60 * 1000);
            }

            if (status === ActivityStatus.INACTIVE) {
                // Optional: push to past
                finalStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
                finalEnd = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const schedule = await prisma.schedule.create({
                data: {
                    activityId: slot.activityId,
                    startAt: finalStart,
                    endAt: finalEnd,
                    status,
                },
            });

            schedules.push(schedule);
        }
    }

    // ──────────────────────────────────────────────
    // Participations (random)
    // ──────────────────────────────────────────────
    for (const schedule of schedules) {
        const participants = profiles.sort(() => 0.5 - Math.random()).slice(0, 5);

        for (const profile of participants) {
            await prisma.participationLog
                .create({
                    data: {
                        profileId: profile.id,
                        scheduleId: schedule.id,
                        interested: Math.random() > 0.5,
                    },
                })
                .catch(() => {});
        }
    }

    console.log("✅ Seeding complete");
}

// ──────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

