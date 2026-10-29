(function () {
  var cfg = window.BLACK || {};
  var offers = cfg.offers || {};
  var pageOffer = document.body.dataset.offer;

  // Preenche nomes, vagas e links a partir do config.js
  document.querySelectorAll("[data-offer]").forEach(function (el) {
    var offer = offers[el.dataset.offer];
    if (!offer || el === document.body) return;
    var field = el.dataset.field;
    if (field && offer[field] != null) el.textContent = offer[field];
    if (el.dataset.link === "page") el.setAttribute("href", el.dataset.base + offer.url);
  });

  // Link do WhatsApp
  function whatsLink(text) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(text);
  }
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    if (!cfg.whatsapp) { a.hidden = true; return; }
    a.href = whatsLink(a.dataset.whatsapp);
  });

  // Formulários (aplicação da Black e cadastro das páginas de produto)
  var utm = {};
  new URLSearchParams(window.location.search).forEach(function (v, k) {
    if (k.indexOf("utm_") === 0 || k === "fbclid") utm[k] = v;
  });

  document.querySelectorAll("form.form").forEach(function (form) {
    // Máscara simples de WhatsApp
    var phone = form.querySelector('[name="whatsapp"]');
    if (phone) phone.addEventListener("input", function () {
      var d = phone.value.replace(/\D/g, "").slice(0, 11);
      if (d.length > 6) phone.value = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
      else if (d.length > 2) phone.value = "(" + d.slice(0, 2) + ") " + d.slice(2);
      else phone.value = d;
    });

    // Cadastro em etapas: valida a etapa atual antes de mostrar a próxima
    form.querySelectorAll("[data-step-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        var step = b.closest("[data-step]");
        var fields = step.querySelectorAll("input, select, textarea");
        for (var k = 0; k < fields.length; k++) { if (!fields[k].reportValidity()) return; }
        step.hidden = true;
        var next = step.nextElementSibling;
        while (next && !next.hasAttribute("data-step")) next = next.nextElementSibling;
        if (next) { next.hidden = false; var f = next.querySelector("input, select"); if (f) f.focus(); }
        if (window.fbq) window.fbq("trackCustom", "LeadEtapa1");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Campo pega-robô: pessoas não veem nem preenchem; robôs costumam preencher tudo
      var hp = form.querySelector('[name="hp_site"]');
      if (hp && hp.value) { showSuccess(form, {}); return; }
      if (!form.reportValidity()) return;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "Enviando…";

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "hp_site") data[k] = v; });
      data.produto = offers[pageOffer] ? offers[pageOffer].name : "MeetHub";
      data.tipo = form.dataset.lead ? "cadastro" : "aplicacao_black";
      data.pagina = window.location.pathname;
      data.enviado_em = new Date().toISOString();
      Object.keys(utm).forEach(function (k) { data[k] = utm[k]; });

      var send = cfg.formWebhook
        ? fetch(cfg.formWebhook, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita bloqueio de CORS
            body: JSON.stringify(data),
          }).catch(function () {})
        : Promise.resolve();

      send.then(function () {
        if (window.fbq) window.fbq("track", "Lead", { content_name: data.produto });
        showSuccess(form, data);
      });
    });
  });

  function showSuccess(form, data) {
    var box = form.parentElement.querySelector(".success");
    var next = box.querySelector("[data-next]");
    if (form.dataset.lead) {
      // Página de produto: oferece falar no WhatsApp, se configurado
      if (cfg.whatsapp) {
        next.href = whatsLink("Olá! Me cadastrei para saber mais sobre o " + data.produto + ". Sou " + data.nome + ", da " + data.empresa + ".");
      } else { next.hidden = true; }
    } else if (cfg.scheduleUrl) {
      next.href = cfg.scheduleUrl;
      next.textContent = "Escolher horário da reunião";
    } else if (cfg.whatsapp) {
      next.href = whatsLink(
        "Olá! Acabei de aplicar para a Black MeetHub (" + data.produto + "). " +
        "Sou " + data.nome + ", da " + data.empresa + ". Quero agendar minha reunião."
      );
      next.textContent = "Agendar reunião no WhatsApp";
    } else {
      next.hidden = true;
    }
    form.hidden = true;
    box.hidden = false;
    box.scrollIntoView({ block: "center" });
  }

  // Contagem regressiva (data-countdown="reveal" conta até a abertura da oferta; o padrão conta até o fim da Black)
  var end = new Date(cfg.endsAt).getTime();
  var reveal = new Date(cfg.revealAt).getTime();
  var clocks = document.querySelectorAll("[data-countdown]");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    clocks.forEach(function (c) {
      var isReveal = c.dataset.countdown === "reveal";
      var target = isReveal ? reveal : end;
      if (isNaN(target)) return;
      var diff = Math.max(0, target - Date.now());
      if (diff === 0) { c.textContent = isReveal ? "A oferta já abriu" : "Aplicações encerradas"; return; }
      var d = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      var m = Math.floor((diff % 36e5) / 6e4);
      var s = Math.floor((diff % 6e4) / 1e3);
      c.innerHTML =
        "<span><b>" + pad(d) + "</b>dias</span>" +
        "<span><b>" + pad(h) + "</b>horas</span>" +
        "<span><b>" + pad(m) + "</b>min</span>" +
        "<span><b>" + pad(s) + "</b>seg</span>";
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 1000); }

  // Data de abertura por extenso
  if (!isNaN(reveal)) {
    var rv = new Date(reveal - 3 * 36e5);
    var mesesR = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    document.querySelectorAll("[data-reveal-day]").forEach(function (el) { el.textContent = rv.getUTCDate(); });
    document.querySelectorAll("[data-reveal-month]").forEach(function (el) { el.textContent = mesesR[rv.getUTCMonth()]; });
    document.querySelectorAll("[data-reveal-long]").forEach(function (el) { el.textContent = rv.getUTCDate() + " de " + mesesR[rv.getUTCMonth()]; });
  }

  // Barra fixa aparece depois do topo e some quando o formulário está na tela
  var bar = document.querySelector(".sticky-cta");
  var hero = document.querySelector(".hero");
  var apply = document.querySelector("#aplicar");
  if (bar && hero && "IntersectionObserver" in window) {
    var heroVisible = true, applyVisible = false;
    var update = function () { bar.classList.toggle("is-visible", !heroVisible && !applyVisible); };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; update(); }).observe(hero);
    if (apply) new IntersectionObserver(function (en) { applyVisible = en[0].isIntersecting; update(); }).observe(apply);
  }

  // Data final por extenso (ex.: "30 de novembro")
  var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  if (!isNaN(end)) {
    var dt = new Date(end - 3 * 36e5); // horário de Brasília
    var curta = dt.getUTCDate() + " " + meses[dt.getUTCMonth()].slice(0, 3).toUpperCase();
    var longa = dt.getUTCDate() + " de " + meses[dt.getUTCMonth()];
    document.querySelectorAll("[data-end-short]").forEach(function (el) { el.textContent = curta; });
    document.querySelectorAll("[data-end-long]").forEach(function (el) { el.textContent = longa; });
    document.querySelectorAll("[data-end-day]").forEach(function (el) { el.textContent = dt.getUTCDate(); });
    document.querySelectorAll("[data-end-month]").forEach(function (el) { el.textContent = meses[dt.getUTCMonth()]; });
  }

  // Elementos aparecem ao rolar
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Pixel do Meta
  if (cfg.pixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", cfg.pixelId);
    window.fbq("track", "PageView");
    if (pageOffer && offers[pageOffer]) window.fbq("track", "ViewContent", { content_name: offers[pageOffer].name });
  }
})();
