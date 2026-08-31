import { Injectable } from "@angular/core";
import { ObservableCache } from "./observable-cache";
import { EntityMetadata, ListMetadata } from "../entity/entity-types";

@Injectable({ providedIn: 'root' })
export class AdminCache {
  readonly entityMetadata =
    new ObservableCache<string, EntityMetadata>();

  readonly listMetadata =
    new ObservableCache<string, ListMetadata>();

  //readonly formMetadata =
  //  new ObservableCache<string, FormMetadata>();

  clear(): void {
    this.entityMetadata.clear();
    this.listMetadata.clear();
    //this.formMetadata.clear();
  }
}