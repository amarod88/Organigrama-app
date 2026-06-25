import { OrgNode } from '../types';
import { OrgNodeCard } from './OrgNodeCard';

export function ChartNode({ node, selectedNodeId, onSelect }: { node: OrgNode, selectedNodeId: number | null, onSelect: (id: number) => void, key?: any }) {
  return (
    <li>
      <OrgNodeCard
        node={node}
        isSelected={node.id === selectedNodeId}
        onSelect={onSelect}
      />
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <ChartNode
              key={child.id}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
