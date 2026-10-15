# Calculadora Simples

Calculadora web com as quatro operações, feita com HTML, CSS e JavaScript puro, sem frameworks nem bibliotecas.

## Funcionalidades

- Soma, subtração, multiplicação e divisão, com encadeamento de operações (2 + 3 × 4 é calculado passo a passo)
- Vírgula decimal, porcentagem e inversão de sinal
- Números formatados no padrão brasileiro (1.234,56)
- Tratamento de divisão por zero
- Correção de erros de ponto flutuante (0,1 + 0,2 = 0,3)
- Suporte ao teclado: números, `+ - * /`, `Enter`, `Backspace` e `Esc`
- Tema claro e escuro automático, conforme o sistema
- Layout responsivo e acessível (rótulos para leitores de tela e foco visível)

## Como usar

Baixe ou clone o repositório e abra o arquivo `index.html` no navegador. Não precisa instalar nada.

## Estrutura

```
calculadora/
├── index.html   # estrutura da página
├── style.css    # estilos e temas
└── script.js    # lógica da calculadora
```

## O que aprendi

- Controlar o estado de uma interface sem usar `eval`
- Lidar com precisão de números decimais em JavaScript
- Organizar eventos com um único listener para vários botões
- Montar um tema claro e escuro com variáveis CSS