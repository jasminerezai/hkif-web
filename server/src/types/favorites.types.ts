import {Favorite} from '../generated/prisma/index.js';

export type FavoriteCreateDelete = Pick<Favorite, 'activityId' | 'profileId'>;
