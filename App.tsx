import React, { useState, useCallback } from 'react';
import { Material, MaterialWithStrategy, BooleanString } from './types';
import { suggestStrategies } from './services/strategySuggester';
import { MaterialInputTable } from './components/MaterialInputTable';
import { ResultsTable } from './components/ResultsTable';

// Declara a variável global XLSX para o TypeScript
declare var XLSX: any;

const createNewMaterial = (): Material => ({
  id: crypto.randomUUID(),
  material: '',
  granel: 'Nao',
  distancia: 'Nao',
  consumo: 'Nao',
  volume: 'Nao',
  etapa: 'Nao',
  solicitaOP: 'Nao',
  valor: 'Nao',
  fragil: 'Nao',
});

const App: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([createNewMaterial()]);
  const [results, setResults] = useState<MaterialWithStrategy[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = useCallback(() => {
    const suggestions = materials.map(material => {
      const suggestedStrategies = suggestStrategies(material);
      return {
        ...material,
        sugestao: suggestedStrategies.length > 0 ? suggestedStrategies.join(', ') : 'Nenhuma sugestão encontrada',
      };
    });
    setResults(suggestions);
  }, [materials]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const columnMapping: { [key: string]: keyof Omit<Material, 'id'> } = {
          'material': 'material',
          'granel': 'granel',
          'distância <= 150km': 'distancia',
          'consumo > 10x/mês': 'consumo',
          'consumo > 10x mês': 'consumo', // Alias para cabeçalho sem barra
          'volume > 0.5m³': 'volume',
          'etapa': 'etapa',
          'solicita na op': 'solicitaOP',
          'valor <= r$500': 'valor',
          'frágil': 'fragil',
        };

        const normalizeBoolean = (value: any): BooleanString => {
            const strValue = String(value).toLowerCase().trim();
            if (['sim', 's', 'true', '1', 'yes', 'y'].includes(strValue)) {
                return 'Sim';
            }
            return 'Nao';
        };

        const importedMaterials: Material[] = json.map(row => {
            const material: Partial<Material> = { id: crypto.randomUUID() };
            for(const rawHeader in row) {
                const normalizedHeader = rawHeader.toLowerCase().trim();
                const materialKey = columnMapping[normalizedHeader];
                if(materialKey) {
                    if (materialKey === 'material') {
                        material[materialKey] = String(row[rawHeader]);
                    } else {
                        (material as any)[materialKey] = normalizeBoolean(row[rawHeader]);
                    }
                }
            }
            // Garante que todos os campos existam
            return {
                ...createNewMaterial(),
                ...material,
            };
        });
        
        if (importedMaterials.length > 0) {
            setMaterials(importedMaterials);
        } else {
            setError("Nenhuma linha válida encontrada no arquivo Excel. Verifique os cabeçalhos das colunas.");
        }

      } catch (err) {
        console.error("Erro ao processar o arquivo:", err);
        setError("Ocorreu um erro ao processar o arquivo Excel. Verifique se o formato está correto.");
      } finally {
        setIsLoading(false);
        // Limpa o valor do input para permitir o re-upload do mesmo arquivo
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    if (!results) return;

    const headers = {
        material: "Material",
        granel: "Granel",
        distancia: "Distância <= 150km",
        consumo: "Consumo > 10x/mês",
        volume: "Volume > 0.5m³",
        etapa: "Etapa",
        solicitaOP: "Solicita na OP",
        valor: "Valor <= R$500",
        fragil: "Frágil",
        sugestao: "Estratégia Sugerida",
    };

    const dataToExport = results.map(row => ({
        [headers.material]: row.material,
        [headers.granel]: row.granel,
        [headers.distancia]: row.distancia,
        [headers.consumo]: row.consumo,
        [headers.volume]: row.volume,
        [headers.etapa]: row.etapa,
        [headers.solicitaOP]: row.solicitaOP,
        [headers.valor]: row.valor,
        [headers.fragil]: row.fragil,
        [headers.sugestao]: row.sugestao,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estratégias");

    // Define larguras das colunas para melhor visualização
    worksheet['!cols'] = [
        { wch: 30 }, // Material
        { wch: 10 }, // Granel
        { wch: 20 }, // Distância
        { wch: 20 }, // Consumo
        { wch: 20 }, // Volume
        { wch: 10 }, // Etapa
        { wch: 15 }, // Solicita na OP
        { wch: 20 }, // Valor
        { wch: 10 }, // Frágil
        { wch: 40 }, // Estratégia Sugerida
    ];

    XLSX.writeFile(workbook, "Estrategias_Sugeridas.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Calculo de Estratégia de Estoque</h1>
          <p className="mt-2 text-md text-gray-600 max-w-3xl mx-auto">
            Insira os dados dos materiais na tabela abaixo ou importe um arquivo Excel. O sistema aplicará um conjunto de regras para sugerir a estratégia de estoque mais adequada.
          </p>
        </header>

        <main>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Dados de Entrada</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}
            <MaterialInputTable 
              materials={materials} 
              setMaterials={setMaterials} 
              createNewMaterial={createNewMaterial}
              onFileChange={handleFileChange}
              isLoading={isLoading}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSuggest}
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? 'Processando...' : 'Sugerir Estratégias'}
              </button>
            </div>
          </div>

          {results && (
            <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Resultados</h2>
                  <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Exportar para Excel
                  </button>
              </div>
              <ResultsTable data={results} />
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Calculo de Estratégia de Estoque. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;