import { Injectable, Inject } from "@angular/core";
import { from } from "rxjs";
import { map } from "rxjs/operators";
import * as algoliasearch from "algoliasearch";
import { CONFIG, Config } from "../types/config";

@Injectable({
  providedIn: "root"
})
export class AlgoliaService {
  constructor(
    @Inject(CONFIG)
    private config: Config
  ) {}

  search$<T>(indexName: string, params: algoliasearch.QueryParameters) {
    if (!this.config.algolia) {
      throw Error("config.alogolia is undefined");
    }
    const client = algoliasearch(
      this.config.algolia["app_id"],
      this.config.algolia["search_api_key"]
    );
    const index = client.initIndex(indexName);
    return from(index.search(params)).pipe(
      map(
        res =>
          res.hits as ({
            objectID: string;
          } & T)[]
      )
    );
  }
}
