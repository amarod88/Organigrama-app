/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { OrgNode } from './types';
import { ChartNode } from './components/OrgChartNode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Eye, EyeOff } from 'lucide-react';

const initialData: OrgNode = {
  id: 1, name: "Director General", desc: "Estrategia global.", children: [
    { id: 2, name: "Gerente de Operaciones", desc: "Procesos diarios.", children: [
      { id: 5, name: "Supervisor", desc: "Control.", children: [] }
    ]},
    { id: 3, name: "Gerente de TI", desc: "Tecnología.", children: [
      { id: 6, name: "Desarrollador", desc: "Código.", children: [] }
    ]},
    { id: 4, name: "Gerente Finanzas", desc: "Recursos.", children: [] }
  ]
};

export default function App() {
  const [data, setData] = useState<OrgNode>(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [title, setTitle] = useState("Organigrama Interactivo");
  const [subtitle, setSubtitle] = useState("");
  const [theme, setTheme] = useState("corporate");
  const [signature, setSignature] = useState("Anibal Amador");
  const [isSignatureVisible, setIsSignatureVisible] = useState(true);
  const exportRef = useRef<HTMLDivElement>(null);

  const findNode = (node: OrgNode, id: number): OrgNode | null => {
    if (node.id === id) return node;
    if (node.children) for (let child of node.children) { let f = findNode(child, id); if (f) return f; }
    return null;
  };

  const findParent = (node: OrgNode, id: number, parent: OrgNode | null = null): OrgNode | null => {
    if (node.id === id) return parent;
    if (node.children) for (let child of node.children) { let f = findParent(child, id, node); if (f) return f; }
    return null;
  };

  const updateNode = (id: number, updates: Partial<OrgNode>) => {
    const newData = JSON.parse(JSON.stringify(data));
    const node = findNode(newData, id);
    if (node) {
      Object.assign(node, updates);
      setData(newData);
    }
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    
    const canvas = await html2canvas(exportRef.current, {
      scale: 3, // Higher scale for better quality
      backgroundColor: "#ffffff",
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save('organigrama.pdf');
  };

  const selectedNode = selectedNodeId ? findNode(data, selectedNodeId) : null;

  return (
    <div className={`min-h-screen p-4 ${theme === 'dark' ? 'theme-dark' : theme === 'minimal' ? 'theme-minimal' : theme === 'vibrant' ? 'theme-vibrant' : ''}`}>
      <header className="flex flex-col items-center gap-2 mb-8">
        <div className="flex gap-2 mt-2">
          <select className="border p-2 rounded-lg" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="corporate">Corporativo</option>
            <option value="dark">Oscuro</option>
            <option value="minimal">Minimalista</option>
            <option value="vibrant">Vibrante</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleExportPDF}>📤 Exportar PDF</button>
        </div>
      </header>

      <div ref={exportRef} className="bg-white p-4">
        <div className="flex flex-col items-center gap-2 mb-8">
            <input className="text-2xl font-bold text-center bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none mt-4" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="text-lg text-center bg-transparent border-b border-transparent focus:border-blue-500 outline-none" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo" />
        </div>

        <div className="overflow-x-auto">
            <ul className="org-chart">
            <ChartNode node={data} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />
            </ul>
        </div>
        
        <footer className={`text-center p-4 text-gray-500 text-sm transition-opacity duration-300 ${isSignatureVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className='flex justify-center items-center gap-2'>
                Elaborado por: <input className="border-b border-gray-400 bg-transparent text-center" value={signature} onChange={(e) => setSignature(e.target.value)} />
                <button onClick={() => setIsSignatureVisible(!isSignatureVisible)}>
                    {isSignatureVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>
        </footer>
      </div>

      {selectedNode && (
        <div className="fixed bottom-4 left-4 right-4 md:right-4 md:left-auto md:w-80 bg-white p-4 rounded-xl shadow-lg border z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Editar Nodo</h3>
            <button className="text-gray-500 hover:text-black text-xl" onClick={() => setSelectedNodeId(null)}>×</button>
          </div>
          <div className="flex flex-col gap-2">
            <input className="border p-2 rounded" value={selectedNode.name} onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })} placeholder="Nombre" />
            <textarea className="border p-2 rounded" value={selectedNode.desc} onChange={(e) => updateNode(selectedNode.id, { desc: e.target.value })} placeholder="Descripción" />
            <textarea className="border p-2 rounded" value={selectedNode.comment || ''} onChange={(e) => updateNode(selectedNode.id, { comment: e.target.value })} placeholder="Comentario" />
            
            <div className="grid grid-cols-2 gap-2 mt-2">
                <button className="bg-green-500 text-white p-2 rounded flex-1" onClick={() => {
                    const node = findNode(data, selectedNode.id);
                    if (node) {
                        if (!node.children) node.children = [];
                        node.children.push({ id: Date.now(), name: "Nuevo", desc: "", children: [] });
                        setData(JSON.parse(JSON.stringify(data)));
                    }
                }}>➕ Subnodo</button>
                <button className="bg-blue-500 text-white p-2 rounded flex-1" onClick={() => {
                    const parent = findParent(data, selectedNode.id);
                    if (parent && parent.children) {
                        const idx = parent.children.findIndex(c => c.id === selectedNode.id);
                        parent.children.splice(idx + 1, 0, { id: Date.now(), name: "Nuevo", desc: "", children: [] });
                        setData(JSON.parse(JSON.stringify(data)));
                    } else {
                        alert("No se puede agregar un hermano al nodo raíz.");
                    }
                }}>↔️ Hermano</button>
            </div>
            <button className="bg-red-500 text-white p-2 rounded w-full mt-2" onClick={() => { 
                const newData = JSON.parse(JSON.stringify(data));
                const deleteNode = (n: OrgNode, id: number): boolean => {
                  if (!n.children) return false;
                  const idx = n.children.findIndex(c => c.id === id);
                  if (idx !== -1) { n.children.splice(idx, 1); return true; }
                  for (let child of n.children) { if (deleteNode(child, id)) return true; }
                  return false;
                };
                if (deleteNode(newData, selectedNode.id)) { setData(newData); setSelectedNodeId(null); }
            }}>🗑️ Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}
