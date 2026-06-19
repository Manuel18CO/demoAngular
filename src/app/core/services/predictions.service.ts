import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Prediction } from '../models/prediction';

@Service()
export class PredictionsService {
  private readonly http = inject(HttpClient);

  submit(prediction: Prediction): Promise<{ ok: boolean; total: number }> {
    return firstValueFrom(
      this.http.post<{ ok: boolean; total: number }>('/api/predictions', prediction),
    );
  }
}
