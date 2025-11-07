
export type BooleanString = 'Sim' | 'Nao';

export interface Material {
  id: string; // Unique ID for React key
  material: string;
  granel: BooleanString;
  distancia: BooleanString;
  consumo: BooleanString;
  volume: BooleanString;
  etapa: BooleanString;
  valor: BooleanString;
  fragil: BooleanString;
}

export interface MaterialWithStrategy extends Material {
  sugestao: string;
}