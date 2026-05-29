import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateWeeklySchedules } from '../cron/scheduleGenerator.js';
import { mockPrismaClient } from './setup.js';
import { testUUID } from './helpers.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Schedule Generator', () => {
  it('correctly calculates the range and generates schedules for 1 week', async () => {
    const activityId = testUUID();
    
    // 1. Mock active activity templates with one Monday time slot
    mockPrismaClient.activityTemplate.findMany.mockResolvedValueOnce([
      {
        id: activityId,
        defaultStatus: 'ACTIVE',
        timeSlots: [
          {
            weekday: 'MONDAY',
            startTime: new Date('2026-06-01T09:00:00.000Z'),
            endTime: new Date('2026-06-01T10:00:00.000Z'),
          },
        ],
      },
    ]);

    // 2. Mock no existing schedules in DB
    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);

    // 3. Spy on schedule.createMany to capture what gets generated
    mockPrismaClient.schedule.createMany.mockResolvedValueOnce({ count: 1 });

    // 4. Run schedule generation for 1 week
    await generateWeeklySchedules(1);

    // 5. Verify the pre-fetch DB query parameters
    expect(mockPrismaClient.schedule.findMany).toHaveBeenCalledTimes(1);
    const findArgs = vi.mocked(mockPrismaClient.schedule.findMany).mock.calls[0]?.[0];
    expect(findArgs).toBeDefined();
    const rangeStart = findArgs!.where!.startAt!.gte as Date;
    const rangeEnd = findArgs!.where!.startAt!.lte as Date;

    expect(rangeStart).toBeDefined();
    expect(rangeEnd).toBeDefined();

    // Verify rangeStart is the Monday of next week
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const expectedRangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
    expect(rangeStart.getTime()).toBe(expectedRangeStart.getTime());

    // The range should span exactly 7 days minus 1 millisecond
    const diffMs = rangeEnd.getTime() - rangeStart.getTime() + 1;
    const diffDays = diffMs / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(7);

    // Verify createMany was called with 1 schedule row
    expect(mockPrismaClient.schedule.createMany).toHaveBeenCalledTimes(1);
    const createArgs = vi.mocked(mockPrismaClient.schedule.createMany).mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();
    expect(createArgs!.data).toHaveLength(1);
    
    const generatedRow = (createArgs!.data as any)[0];
    expect(generatedRow.activityId).toBe(activityId);

    // Compute expected startAt and endAt UTC date/times for MONDAY time slot
    const expectedStartAt = new Date(expectedRangeStart);
    expectedStartAt.setUTCHours(9, 0, 0, 0);
    const expectedEndAt = new Date(expectedRangeStart);
    expectedEndAt.setUTCHours(10, 0, 0, 0);

    expect(generatedRow.startAt.getTime()).toBe(expectedStartAt.getTime());
    expect(generatedRow.endAt.getTime()).toBe(expectedEndAt.getTime());
  });

  it('correctly calculates range and generates schedules for 16 weeks', async () => {
    const activityId = testUUID();

    mockPrismaClient.activityTemplate.findMany.mockResolvedValueOnce([
      {
        id: activityId,
        defaultStatus: 'ACTIVE',
        timeSlots: [
          {
            weekday: 'MONDAY',
            startTime: new Date('2026-06-01T09:00:00.000Z'),
            endTime: new Date('2026-06-01T10:00:00.000Z'),
          },
        ],
      },
    ]);

    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([]);
    mockPrismaClient.schedule.createMany.mockResolvedValueOnce({ count: 16 });

    // Run for 16 weeks
    await generateWeeklySchedules(16);

    const findArgs = vi.mocked(mockPrismaClient.schedule.findMany).mock.calls[0]?.[0];
    expect(findArgs).toBeDefined();
    const rangeStart = findArgs!.where!.startAt!.gte as Date;
    const rangeEnd = findArgs!.where!.startAt!.lte as Date;

    // Verify rangeStart is the Monday of next week
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const expectedRangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
    expect(rangeStart.getTime()).toBe(expectedRangeStart.getTime());

    // The range should span exactly 16 * 7 days minus 1 millisecond
    const diffMs = rangeEnd.getTime() - rangeStart.getTime() + 1;
    const diffDays = diffMs / (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(16 * 7);

    const createArgs = vi.mocked(mockPrismaClient.schedule.createMany).mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();
    
    const generatedRows = createArgs!.data as any[];
    expect(generatedRows).toHaveLength(16);

    // Verify the startAt and endAt timestamps of the first generated week
    const firstRow = generatedRows[0];
    const expectedFirstStartAt = new Date(expectedRangeStart);
    expectedFirstStartAt.setUTCHours(9, 0, 0, 0);
    const expectedFirstEndAt = new Date(expectedRangeStart);
    expectedFirstEndAt.setUTCHours(10, 0, 0, 0);

    expect(firstRow.activityId).toBe(activityId);
    expect(firstRow.startAt.getTime()).toBe(expectedFirstStartAt.getTime());
    expect(firstRow.endAt.getTime()).toBe(expectedFirstEndAt.getTime());

    // Verify the startAt and endAt timestamps of the last (16th) week
    const lastRow = generatedRows[15];
    const expectedLastStartAt = new Date(expectedRangeStart);
    expectedLastStartAt.setUTCDate(expectedRangeStart.getUTCDate() + 15 * 7);
    expectedLastStartAt.setUTCHours(9, 0, 0, 0);
    const expectedLastEndAt = new Date(expectedRangeStart);
    expectedLastEndAt.setUTCDate(expectedRangeStart.getUTCDate() + 15 * 7);
    expectedLastEndAt.setUTCHours(10, 0, 0, 0);

    expect(lastRow.activityId).toBe(activityId);
    expect(lastRow.startAt.getTime()).toBe(expectedLastStartAt.getTime());
    expect(lastRow.endAt.getTime()).toBe(expectedLastEndAt.getTime());
  });

  it('tolerates DB millisecond/microsecond variations and skips duplicate generation', async () => {
    const activityId = testUUID();
    const now = new Date();

    // Let's find what the generated Monday date would be
    // We can simulate nextMonday start date
    // We'll mock activity templates with a TUESDAY time slot
    mockPrismaClient.activityTemplate.findMany.mockResolvedValueOnce([
      {
        id: activityId,
        defaultStatus: 'ACTIVE',
        timeSlots: [
          {
            weekday: 'TUESDAY',
            startTime: new Date('2026-06-01T14:30:00.000Z'),
            endTime: new Date('2026-06-01T15:30:00.000Z'),
          },
        ],
      },
    ]);

    // Get next Monday from now without using the utility under test
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const baseMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));

    // Tuesday is baseMonday + 1 day
    const expectedStartAt = new Date(baseMonday);
    expectedStartAt.setUTCDate(baseMonday.getUTCDate() + 1);
    expectedStartAt.setUTCHours(14, 30, 0, 0);

    // Mock existing schedule in DB having different millisecond/microsecond precision
    // (e.g. 123ms instead of 000ms)
    const dbStartAt = new Date(expectedStartAt.getTime());
    dbStartAt.setUTCMilliseconds(123);

    mockPrismaClient.schedule.findMany.mockResolvedValueOnce([
      {
        activityId,
        startAt: dbStartAt,
      },
    ]);

    mockPrismaClient.schedule.createMany.mockResolvedValueOnce({ count: 0 });

    await generateWeeklySchedules(1);

    // Let's see what was passed to createMany
    const createArgs = vi.mocked(mockPrismaClient.schedule.createMany).mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();

    // Verify no new schedule was prepared for insertion because it was successfully deduplicated
    expect(createArgs!.data).toHaveLength(0);
  });
});
