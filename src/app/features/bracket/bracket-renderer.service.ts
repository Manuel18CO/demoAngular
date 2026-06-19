import { Service } from '@angular/core';

export interface BracketNode {
  label: string;
  team?: string;
  children?: BracketNode[];
}

const DEMO_NODES: BracketNode[] = [
  {
    label: 'Final',
    children: [
      {
        label: 'Semifinal 1',
        children: [
          { label: 'CF1 — ARG vs BRA', team: 'ARG' },
          { label: 'CF2 — FRA vs ENG', team: 'FRA' },
        ],
      },
      {
        label: 'Semifinal 2',
        children: [
          { label: 'CF3 — ESP vs POR', team: 'ESP' },
          { label: 'CF4 — GER vs NED', team: 'NED' },
        ],
      },
    ],
  },
];

@Service()
export class BracketRendererService {
  async loadHeavyDeps(): Promise<void> {
    await new Promise((res) => setTimeout(res, 600));
  }

  getDemoBracket(): BracketNode[] {
    return DEMO_NODES;
  }
}
