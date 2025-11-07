import React from 'react';
import type { MaterialWithStrategy } from '../types';

interface ResultsTableProps {
  data: MaterialWithStrategy[];
}

const tableHeaders = [
  "Material", "Granel", "Distância <= 150km", 
  "Consumo > 10x/mês", "Volume > 0.5m³", "Etapa", "Valor <= R$500", "Frágil", "Estratégia Sugerida"
];

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  const tdBooleanResultClass = "px-4 py-3 text-sm text-gray-500 min-w-[130px]";

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
          {data.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.material || '-'}</td>
              <td className={tdBooleanResultClass}>{item.granel}</td>
              <td className={tdBooleanResultClass}>{item.distancia}</td>
              <td className={tdBooleanResultClass}>{item.consumo}</td>
              <td className={tdBooleanResultClass}>{item.volume}</td>
              <td className={tdBooleanResultClass}>{item.etapa}</td>
              <td className={tdBooleanResultClass}>{item.valor}</td>
              <td className={tdBooleanResultClass}>{item.fragil}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-600">{item.sugestao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};