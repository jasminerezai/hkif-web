export interface ParticipantCountPerActivityDto {
  activityId: string;
  activityName: string;
  participantCount: number;
}

export interface PopularActivityDto {
  activityId: string;
  activityName: string;
  participantCount: number;
  favoriteCount: number;
}

export interface CancellationRatePerActivityDto {
  activityId: string;
  activityName: string;
  totalSchedules: number;
  cancelledSchedules: number;
  cancellationRate: number;
}

export interface CancellationRatesDto {
  overallRate: number;
  totalSchedules: number;
  cancelledSchedules: number;
  perActivity: CancellationRatePerActivityDto[];
}

export interface AdminStatisticsDto {
  totalParticipantsPerActivity: ParticipantCountPerActivityDto[];
  mostPopularActivities: PopularActivityDto[];
  cancellationRates: CancellationRatesDto;
}
