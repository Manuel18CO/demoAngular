import { Pipe, PipeTransform } from '@angular/core';
import { TEAMS } from '../../core/mocks/teams.data';

const TEAMS_BY_ID = new Map(TEAMS.map((t) => [t.id, t]));

@Pipe({ name: 'teamName' })
export class TeamNamePipe implements PipeTransform {
  transform(id: string, format: 'name' | 'code' | 'flag' | 'flag-name' = 'name'): string {
    const team = TEAMS_BY_ID.get(id);
    if (!team) return id;
    switch (format) {
      case 'code': return team.code;
      case 'flag': return team.flag;
      case 'flag-name': return `${team.flag} ${team.name}`;
      default: return team.name;
    }
  }
}
