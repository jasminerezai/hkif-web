import {Favorite} from '../generated/prisma'

export type FavoriteCreateDelete = Pick<Favorite, 'activityId' | 'profileId'>;