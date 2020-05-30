import { Injectable, Inject } from '@angular/core';
import algoliasearch, { AlgoliaSearchOptions } from 'algoliasearch';
import { CONFIG, Config } from '../config';

export class ErrorAlgoliaConfigUndefined extends Error {}

@Injectable({
  providedIn: 'root',
})
export class AlgoliaService {
  constructor(
    @Inject(CONFIG)
    private config: Config,
  ) {}

  async search<T>(
    indexName: string,
    query: string,
    options: AlgoliaSearchOptions,
  ) {
    if (!this.config.algolia) {
      throw new ErrorAlgoliaConfigUndefined();
    }

    const client = algoliasearch(
      this.config.algolia.app_id,
      this.config.algolia.search_api_key,
    );

    const index = client.initIndex(indexName);
    const res = await index.search<T>(query, options);
    return {
      total: res.nbHits,
      hits: res.hits,
    };
  }
}