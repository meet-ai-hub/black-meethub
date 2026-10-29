/*
 * CONFIGURAÇÃO DA BLACK MEETHUB
 * Tudo que muda de uma oferta para outra fica aqui.
 * Troque os valores marcados com TODO antes de publicar.
 */
window.BLACK = {
  // Fim da Black (horário de Brasília). Usado na contagem regressiva.
  endsAt: "2026-11-30T23:59:59-03:00", // TODO: confirmar data

  // Abertura da oferta de Black para quem está na lista de acesso antecipado.
  revealAt: "2026-11-02T20:00:00-03:00", // abertura para os cadastrados (TODO: confirmar a hora)

  // Pixel do Meta (deixe vazio para não carregar).
  pixelId: "", // TODO

  // WhatsApp do time comercial (só números, com DDI e DDD).
  whatsapp: "", // TODO: ex. "5531999999999"

  // Para onde vão as respostas do formulário de aplicação
  // (webhook do Zapier, Make, n8n, RD Station, planilha etc.). Recebe um POST em JSON.
  formWebhook: "", // TODO

  // Link da agenda para marcar a reunião (Calendly, Google Agenda etc.).
  // Se ficar vazio, depois da aplicação a pessoa é levada ao WhatsApp.
  scheduleUrl: "", // TODO

  offers: {
    execucao: {
      name: "Execução e Tração com IA",
      url: "execucao-e-tracao-com-ia/",
      seats: "Vagas limitadas por turma", // TODO: ex. "Últimas 20 vagas"
    },
    gestao: {
      name: "Gestão e Escala",
      url: "gestao-e-escala/",
      seats: "Vagas limitadas por turma", // TODO
    },
    implementacao: {
      name: "Implementação e Acompanhamento",
      url: "implementacao-e-acompanhamento/",
      seats: "Turmas reduzidas", // TODO
    },
  },
};
