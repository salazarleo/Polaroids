export const MELHOR_OFERTA_QTD = 5;
export const PRECO_POLAROID_UNITARIO_CENTAVOS = 99;
export const PRECO_POLAROID_EXTRA_CENTAVOS = PRECO_POLAROID_UNITARIO_CENTAVOS;
export const PRECO_MELHOR_OFERTA_CENTAVOS = 450;

export function calcularPrecoPolaroidsCentavos(qtd: number) {
  if (qtd <= 0) return 0;
  if (qtd < MELHOR_OFERTA_QTD) return qtd * PRECO_POLAROID_UNITARIO_CENTAVOS;

  return PRECO_MELHOR_OFERTA_CENTAVOS + (qtd - MELHOR_OFERTA_QTD) * PRECO_POLAROID_EXTRA_CENTAVOS;
}

export function formatarPrecoCentavos(valorCentavos: number) {
  return (valorCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
