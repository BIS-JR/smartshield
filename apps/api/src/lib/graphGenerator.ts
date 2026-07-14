import crypto from 'node:crypto';
import { faker } from '@faker-js/faker';

function seedToInt(seed: string): number {
  const hash = crypto.createHash('sha256').update(seed).digest();
  return hash.readUInt32BE(0);
}

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type GraphNodeType = 'empresa' | 'pessoa' | 'banco' | 'conta' | 'ip' | 'dispositivo';

export interface GeneratedNode {
  key: string;
  nodeType: GraphNodeType;
  label: string;
}

export interface GeneratedEdge {
  sourceKey: string;
  targetKey: string;
  relationType: string;
  weight: number;
}

/**
 * Gera um grafo determinístico (nós e arestas em "camadas de ocultação")
 * a partir do id da entidade e do número de camadas ("casca de cebola").
 * A mesma entidade sempre produz o mesmo grafo.
 */
export function generateOwnershipGraph(entityKey: string, entityLabel: string, layersCount: number) {
  const random = mulberry32(seedToInt(entityKey));
  faker.seed(seedToInt(entityKey));

  const nodes: GeneratedNode[] = [];
  const edges: GeneratedEdge[] = [];

  const rootKey = 'root';
  nodes.push({ key: rootKey, nodeType: 'empresa', label: entityLabel });

  let previousLayerKeys = [rootKey];

  for (let layer = 0; layer < layersCount; layer++) {
    const nodeCount = 1 + Math.floor(random() * 2); // 1-2 nós por camada
    const currentLayerKeys: string[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const key = `l${layer}-${i}`;
      const isLastLayer = layer === layersCount - 1;
      const nodeType: GraphNodeType = isLastLayer
        ? random() > 0.5
          ? 'conta'
          : 'banco'
        : random() > 0.5
          ? 'pessoa'
          : 'empresa';

      const label =
        nodeType === 'pessoa'
          ? faker.person.fullName()
          : nodeType === 'empresa'
            ? faker.company.name()
            : nodeType === 'banco'
              ? faker.helpers.arrayElement(['Banco Alfa', 'Banco Meridiano', 'Banco Convex', 'Cooperativa Sul'])
              : `Conta ${faker.finance.accountNumber(8)}`;

      nodes.push({ key, nodeType, label });
      currentLayerKeys.push(key);

      const parentKey = previousLayerKeys[i % previousLayerKeys.length];
      edges.push({
        sourceKey: parentKey,
        targetKey: key,
        relationType: nodeType === 'conta' ? 'titular' : 'controla',
        weight: 1,
      });
    }

    previousLayerKeys = currentLayerKeys;
  }

  // nós de suporte (IP e dispositivo) conectados diretamente à raiz, comuns
  // em investigações de fraude corporativa.
  if (random() > 0.3) {
    nodes.push({ key: 'ip-1', nodeType: 'ip', label: faker.internet.ipv4() });
    edges.push({ sourceKey: rootKey, targetKey: 'ip-1', relationType: 'acesso', weight: 0.5 });
  }
  if (random() > 0.5) {
    nodes.push({ key: 'device-1', nodeType: 'dispositivo', label: `Dispositivo ${faker.string.alphanumeric(6).toUpperCase()}` });
    edges.push({ sourceKey: rootKey, targetKey: 'device-1', relationType: 'acesso', weight: 0.5 });
  }

  return { nodes, edges };
}
