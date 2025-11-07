import { Material } from '../types';

export function suggestStrategies(material: Material): string[] {
    const { consumo, volume, valor, distancia, etapa, granel, fragil } = material;

    const consumo_gt_10x = consumo === 'Sim';

    // Regra exclusiva: Se o consumo for baixo, sugere apenas "Planos" e para.
    if (!consumo_gt_10x) {
        return ['1.1- Planos'];
    }

    // --- As regras a seguir são executadas apenas se o consumo > 10x/mês ---
    
    const suggestions: string[] = [];
    
    const volume_gt_0_5 = volume === 'Sim';
    const valor_lte_500 = valor === 'Sim';
    const distancia_lte_150 = distancia === 'Sim';
    const is_etapa = etapa === 'Sim';
    const is_granel = granel === 'Sim';
    const is_fragil = fragil === 'Sim';

    // Rule 1.1 (Planos): A condição original era (!consumo_gt_10x || volume_gt_0_5).
    // Como estamos no ramo de alto consumo, simplifica para verificar apenas a alta volumetria.
    if (volume_gt_0_5) {
        suggestions.push('1.1- Planos');
    }

    // Rule 1.2 (Kanban): A condição original era (consumo_gt_10x && valor_lte_500).
    // Simplifica para verificar o baixo custo, já que o consumo já é alto.
    if (valor_lte_500) {
        suggestions.push('1.2- Kanban');
    }

    // Rule 1.3 (Entrega Diária): Baixa volumetria E Fornecedor próximo. Inalterada.
    if (!volume_gt_0_5 && distancia_lte_150) {
        suggestions.push('1.3- Entrega Diária');
    }

    // Rule 1.4 (Crossdocking): Fornecedor próximo E Material em etapa. Inalterada.
    if (distancia_lte_150 && is_etapa) {
        suggestions.push('1.4- Crossdocking');
    }

    // Rule 1.5 (Estoque): A condição original era ((!isPlano && !isKanban && !volume_gt_0_5) || is_fragil)
    // No contexto de alto consumo: isPlano se torna (volume_gt_0_5) e isKanban se torna (valor_lte_500).
    // A condição simplifica para: ((!volume_gt_0_5 && !valor_lte_500) || is_fragil)
    if ((!volume_gt_0_5 && !valor_lte_500) || is_fragil) {
        suggestions.push('1.5- Estoque');
    }

    // Rule 1.6 (Consumível): Flag de Granel. Inalterada.
    if (is_granel) {
        suggestions.push('1.6- Consumível');
    }

    return suggestions;
}
