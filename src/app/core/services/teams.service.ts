import { httpResource } from '@angular/common/http';
import { Service, Signal } from '@angular/core';
import { Player, Team } from '../models/team';

interface TeamsQuery {
  q?: string;
  group?: string;
  confederation?: string;
}

@Service()
export class TeamsService {
  teams(query: Signal<TeamsQuery>) {
    return httpResource<Team[]>(
      () => ({
        url: '/api/teams',
        params: { ...query() },
      }),
      { defaultValue: [] },
    );
  }

  team(id: Signal<string | null>) {
    return httpResource<Team | undefined>(() => {
      const value = id();
      return value ? `/api/teams/${value}` : undefined;
    });
  }

  players(teamId: Signal<string | null>) {
    return httpResource<Player[]>(
      () => {
        const value = teamId();
        return value ? `/api/teams/${value}/players` : undefined;
      },
      { defaultValue: [] },
    );
  }
}
