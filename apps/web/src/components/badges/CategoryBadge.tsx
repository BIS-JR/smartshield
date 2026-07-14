export const DOCUMENT_CATEGORY_LABEL: Record<string, string> = {
  rg_falso: 'RG Falso',
  cnh: 'CNH',
  procuracoes: 'Procurações',
  contratos: 'Contratos',
  notas_fiscais: 'Notas Fiscais',
  balancos: 'Balanços',
  adulteracoes: 'Adulterações',
  documentos_ia: 'Documentos IA',
};

export function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">{label}</span>
  );
}
