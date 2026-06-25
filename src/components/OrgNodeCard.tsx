import { OrgNode } from '../types';

interface Props {
  node: OrgNode;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function OrgNodeCard({ node, isSelected, onSelect }: Props) {
  return (
    <div
      className={`node-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(node.id)}
    >
      <div className="node-name">{node.name || 'Sin nombre'}</div>
      <div className="node-desc">{node.desc || ''}</div>
      {node.comment && <div className="node-comment text-xs italic opacity-70 mt-1">{node.comment}</div>}
    </div>
  );
}
