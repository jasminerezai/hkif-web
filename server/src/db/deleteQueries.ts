import { prisma } from "./prisma";

export class DELETE {
    static async deleteActivity(activityId: string) {
        const res = await prisma.activityTemplate.delete({
            where: { id: activityId }
        });
        return res;
    }
}