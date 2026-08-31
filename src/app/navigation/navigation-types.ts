import { IconInfo } from '../shared/icon-info';

export interface RestEntityNode {
  id: string;
  title: string;
  type: 'rest-entity';
  icon?: IconInfo;
  config: {
    resource: string;
  };
}

export type AdminNode = RestEntityNode;

export interface NavigationSection {
  id: string;
  title: string;
  nodes: AdminNode[];
}

export interface NavigationResponse {
  sections: NavigationSection[];
}
