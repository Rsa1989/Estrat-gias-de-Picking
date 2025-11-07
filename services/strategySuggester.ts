import { Material } from '../types';

// Define a prioridade de exibição das estratégias
const STRATEGY_PRIORITY: { [key: string]: number } = {
    '1.4- Crossdocking': 1,
    '1.3- Entrega Diária': 2,
    '1.1- Planos': 3,
    '1.2- Kanban': 4,
    '1.5- Estoque': 4,
    '1.6- Consumível': 5,
};

export function suggestStrategies(material: Material): string[] {
    const { consumo, volume, valor, distancia, etapa, granel, fragil, solicitaOP } = material;

    // REGRA DE PRIORIDADE MÁXIMA: Se for a granel, é sempre "Consumível".
    if (granel === 'Sim') {
        return ['1.6- Consumível'];
    }

    const consumo_gt_10x = consumo === 'Sim';

    // Regra exclusiva para baixo consumo: Se não for a granel e o consumo for baixo, sugere "Planos" e para.
    if (!consumo_gt_10x) {
        return ['1.1- Planos'];
    }

    // --- As regras a seguir são executadas apenas se o consumo > 10x/mês e não for granel ---
    
    const suggestions: string[] = [];
    
    const volume_gt_0_5 = volume === 'Sim';
    const valor_lte_500 = valor === 'Sim';
    const distancia_lte_150 = distancia === 'Sim';
    const is_etapa = etapa === 'Sim';
    const is_fragil = fragil === 'Sim';
    const solicita_op = solicitaOP === 'Sim';

    // Rule 1.2 (Kanban): A condição original era (consumo_gt_10x && valor_lte_500).
    // Simplifica para verificar o baixo custo, já que o consumo já é alto.
    if (valor_lte_500) {
        suggestions.push('1.2- Kanban');
    }

    // Rule 1.3 (Entrega Diária): Baixa volumetria E Fornecedor próximo. Inalterada.
    if (!volume_gt_0_5 && distancia_lte_150) {
        suggestions.push('1.3- Entrega Diária');
    }

    // Rule 1.4 (Crossdocking): Fornecedor próximo E Material em etapa E Solicitado na OP.
    if (distancia_lte_150 && is_etapa && solicita_op) {
        suggestions.push('1.4- Crossdocking');
    }

    // Rule 1.5 (Estoque): A condição original era ((!isPlano && !isKanban && !volume_gt_0_5) || is_fragil)
    // No contexto de alto consumo: isPlano é sempre falso (pois Planos é só para baixo consumo),
    // e isKanban se torna (valor_lte_500).
    // A condição simplifica para: ((!valor_lte_500 && !volume_gt_0_5) || is_fragil)
    if ((!volume_gt_0_5 && !valor_lte_500) || is_fragil) {
        suggestions.push('1.5- Estoque');
    }

    // A regra de Consumível foi movida para o topo, pois tem prioridade máxima.

    // Se nenhuma outra estratégia for aplicável, a estratégia padrão é Estoque.
    if (suggestions.length === 0) {
        suggestions.push('1.5- Estoque');
    }

    // Ordena as sugestões com base na prioridade definida
    suggestions.sort((a, b) => {
        const priorityA = STRATEGY_PRIORITY[a] ?? 99;
        const priorityB = STRATEGY_PRIORITY[b] ?? 99;
        return priorityA - priorityB;
    });

    return suggestions;
}