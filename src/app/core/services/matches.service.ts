import { httpResource } from '@angular/common/http';
import { Service, Signal } from '@angular/core';
import { Match, MatchStage, MatchStatus } from '../models/match';

interface MatchesQuery {
  stage?: MatchStage | '';
  group?: string;
  status?: MatchStatus | '';
  teamId?: string;
}

@Service()
export class MatchesService {
  matches(query: Signal<MatchesQuery>) {
    return httpResource<Match[]>(
      () => ({
        url: '/api/matches',
        params: { ...query() },
      }),
      { defaultValue: [] },
    );
  }

  match(id: Signal<string | null>) {
    return httpResource<Match | undefined>(() => {
      const value = id();
      return value ? `/api/matches/${value}` : undefined;
    });
  }
}
