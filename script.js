"use strict";

(function () {
  const valueEl = document.getElementById("value");
  const historyEl = document.getElementById("history");
  const clearKey = document.getElementById("k-clear");
  const opKeys = document.querySelectorAll("[data-op]");

  const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  // Estado da calculadora
  let cur = "0";      // número que está sendo digitado (texto, com ponto decimal)
  let prev = null;    // primeiro operando
  let op = null;      // operação pendente
  let fresh = false;  // o próximo dígito começa um número novo
  let error = false;

  // Faz a conta. Retorna null em caso de divisão por zero.
  function compute(a, b, o) {
    let r;
    if (o === "+") r = a + b;
    else if (o === "-") r = a - b;
    else if (o === "*") r = a * b;
    else if (o === "/") {
      if (b === 0) return null;
      r = a / b;
    }
    // Evita erros de ponto flutuante, como 0,1 + 0,2 = 0,30000000000000004
    return parseFloat(r.toPrecision(12));
  }

  // Formata para o padrão brasileiro: 1.234,56
  function fmt(str) {
    if (str === "Erro" || /e/i.test(str)) return str.replace(".", ",");
    const neg = str.charAt(0) === "-";
    if (neg) str = str.slice(1);
    const parts = str.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const out = intPart + (parts.length > 1 ? "," + parts[1] : "");
    return (neg ? "-" : "") + out;
  }

  function render() {
    const text = fmt(cur);
    valueEl.textContent = text;
    valueEl.className = "value" + (text.length > 14 ? " sm" : text.length > 9 ? " md" : "");
    clearKey.textContent = (cur === "0" && prev === null && !error) ? "AC" : "C";
    opKeys.forEach((k) => {
      k.classList.toggle("active", op === k.dataset.op && fresh);
    });
  }

  function setHistory(text) {
    historyEl.textContent = text;
  }

  function reset() {
    cur = "0";
    prev = null;
    op = null;
    fresh = false;
    error = false;
    setHistory("");
  }

  function showError() {
    cur = "Erro";
    prev = null;
    op = null;
    fresh = true;
    error = true;
    setHistory("Divisão por zero");
  }

  function digit(d) {
    if (error) reset();
    if (fresh) {
      cur = d;
      fresh = false;
    } else if (cur.replace(/[-.]/g, "").length < 15) {
      cur = cur === "0" ? d : cur + d;
    }
    render();
  }

  function decimal() {
    if (error) reset();
    if (fresh) {
      cur = "0.";
      fresh = false;
    } else if (cur.indexOf(".") === -1) {
      cur += ".";
    }
    render();
  }

  function setOp(o) {
    if (error) return;
    if (op !== null && !fresh) {
      // Encadeia: 2 + 3 + ... calcula 2 + 3 antes de continuar
      const r = compute(prev, parseFloat(cur), op);
      if (r === null) {
        showError();
        render();
        return;
      }
      cur = String(r);
      prev = r;
    } else if (op === null) {
      prev = parseFloat(cur);
    }
    op = o;
    fresh = true;
    setHistory(fmt(String(prev)) + " " + SYMBOLS[o]);
    render();
  }

  function equals() {
    if (error || op === null) return;
    const b = parseFloat(cur);
    const r = compute(prev, b, op);
    if (r === null) {
      showError();
      render();
      return;
    }
    setHistory(fmt(String(prev)) + " " + SYMBOLS[op] + " " + fmt(String(b)) + " =");
    cur = String(r);
    prev = null;
    op = null;
    fresh = true;
    render();
  }

  function clear() {
    // "C" limpa só o número atual; "AC" limpa tudo
    if (cur !== "0" && !fresh && !error && prev !== null) {
      cur = "0";
      render();
      return;
    }
    reset();
    render();
  }

  function negate() {
    if (error || cur === "0") return;
    cur = cur.charAt(0) === "-" ? cur.slice(1) : "-" + cur;
    render();
  }

  function percent() {
    if (error) return;
    const n = parseFloat(cur);
    // Em somas e subtrações, a porcentagem é calculada sobre o primeiro número
    const r = (prev !== null && (op === "+" || op === "-")) ? prev * n / 100 : n / 100;
    cur = String(parseFloat(r.toPrecision(12)));
    fresh = false;
    render();
  }

  function backspace() {
    if (error) {
      reset();
      render();
      return;
    }
    if (fresh) return;
    const short = cur.length > 1 && !(cur.length === 2 && cur.charAt(0) === "-");
    cur = short ? cur.slice(0, -1) : "0";
    render();
  }

  // Cliques nas teclas (um único listener para todos os botões)
  document.querySelector(".keys").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.digit !== undefined) digit(btn.dataset.digit);
    else if (btn.dataset.op) setOp(btn.dataset.op);
    else {
      const a = btn.dataset.action;
      if (a === "decimal") decimal();
      else if (a === "equals") equals();
      else if (a === "clear") clear();
      else if (a === "negate") negate();
      else if (a === "percent") percent();
    }
  });

  // Suporte ao teclado físico
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    let sel = null;

    if (/^[0-9]$/.test(k)) {
      digit(k);
      sel = '[data-digit="' + k + '"]';
    } else if (k === "," || k === ".") {
      decimal();
      sel = '[data-action="decimal"]';
    } else if (k === "+" || k === "-" || k === "*" || k === "/") {
      e.preventDefault();
      setOp(k);
      sel = '[data-op="' + k + '"]';
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      equals();
      sel = '[data-action="equals"]';
    } else if (k === "Backspace") {
      backspace();
    } else if (k === "Escape") {
      reset();
      render();
      sel = '[data-action="clear"]';
    } else if (k === "%") {
      percent();
      sel = '[data-action="percent"]';
    }

    // Efeito visual de tecla pressionada
    if (sel) {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add("pressed");
        setTimeout(() => el.classList.remove("pressed"), 110);
      }
    }
  });

  render();
})();