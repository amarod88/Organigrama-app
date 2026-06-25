export interface OrgNode {
  id: number;
  name: string;
  desc: string;
  comment?: string;
  children?: OrgNode[];
}
