import React, { useRef } from 'react';
import type { Material, BooleanString } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface MaterialInputTableProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  createNewMaterial: () => Material;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const tableHeaders = [
  "Material", "Distância <= 150km", 
  "Consumo > 10x/mês", "Volume > 0.5m³", "Etapa", "Solicita na OP", "Valor <= R$500", "Frágil", "Ações"
];

const BooleanSelect: React.FC<{ value: BooleanString; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; disabled: boolean }> = ({ value, onChange, disabled }) => (
  <select value={value} onChange={onChange} disabled={disabled} className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 disabled:bg-gray-100">
    <option value="Nao">Não</option>
    <option value="Sim">Sim</option>
  </select>
);

export const MaterialInputTable: React.FC<MaterialInputTableProps> = ({ materials, setMaterials, createNewMaterial, onFileChange, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addRow = () => {
    setMaterials(prev => [...prev, createNewMaterial()]);
  };

  const removeRow = (id: string) => {
    setMaterials(prev => prev.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof Material, value: string | BooleanString) => {
    setMaterials(prev => prev.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const tdSelectClass = "px-4 py-2 min-w-[130px]";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map(header => (
              <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {materials.map((material) => (
            <tr key={material.id} className={isLoading ? 'opacity-50' : ''}>
              <td className="px-4 py-2 whitespace-nowrap"><input type="text" value={material.material} onChange={e => updateRow(material.id, 'material', e.target.value)} disabled={isLoading} className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 disabled:bg-gray-100" /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.distancia} onChange={e => updateRow(material.id, 'distancia', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.consumo} onChange={e => updateRow(material.id, 'consumo', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.volume} onChange={e => updateRow(material.id, 'volume', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.etapa} onChange={e => updateRow(material.id, 'etapa', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.solicitaOP} onChange={e => updateRow(material.id, 'solicitaOP', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.valor} onChange={e => updateRow(material.id, 'valor', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className={tdSelectClass}><BooleanSelect value={material.fragil} onChange={e => updateRow(material.id, 'fragil', e.target.value as BooleanString)} disabled={isLoading} /></td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <button onClick={() => removeRow(material.id)} disabled={materials.length <= 1 || isLoading} className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed">
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-4">
        <button onClick={addRow} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
          <PlusIcon />
          Adicionar Linha
        </button>
        <button onClick={handleImportClick} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 text-sm font-medium rounded-md hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          Importar do Excel
        </button>
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".xlsx, .xls"
            className="hidden"
        />
      </div>
    </div>
  );
};