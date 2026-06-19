import { httpResource } from '@angular/common/http';
import { Service } from '@angular/core';

export interface TopScorer {
  name: string;
  teamId: string;
  goals: number;
}

@Service()
export class StatsService {
  topScorers() {
    return httpResource<TopScorer[]>(() => '/api/stats/top-scorers', { defaultValue: [] });
  }
}
