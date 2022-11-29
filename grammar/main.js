
import validExpression from './validExpression.js';

let validButton = document.querySelector("#valid-button");
let addRowButton = document.querySelector("#add-row-button");
let containerInputs = document.querySelector("#inputs-container");
let validExpressionInput = document.querySelector("#valid-expression-input");
let clearButton = document.querySelector("#clear-button");

let inputCount = 0;

clearButton.addEventListener("click", () => {
  containerInputs.innerHTML = "";
  inputCount = 0;

  const htmlNewRow = document.createElement('div');
  htmlNewRow.className = 'input-container';
  htmlNewRow.innerHTML = //Adicionando nova linha de inputs 
    `<input id="left-input-${inputCount}" />
    <img src="../assets/right-arrow.png" alt="arrow right icon" />
    <input id="right-input-${inputCount}" />`;

  containerInputs.appendChild(htmlNewRow);

  validExpressionInput.value = "";
  validExpressionInput.style.backgroundColor = "white";

});

addRowButton.addEventListener("click", () => {
  inputCount++;

  const htmlNewRow = document.createElement('div');
  htmlNewRow.className = 'input-container';
  htmlNewRow.innerHTML = //Adicionando nova linha de inputs 
    `<input id="left-input-${inputCount}" />
    <img src="../assets/right-arrow.png" alt="arrow right icon" />
    <input id="right-input-${inputCount}" />`;

  containerInputs.appendChild(htmlNewRow);

});

function getGrammar() {
  let grammar = [];

  let left = document.querySelector(`#left-input-0`);
  const first = left.value;

  let right;

  for (let i = 0; i <= inputCount; i++) {
    left = document.querySelector(`#left-input-${i}`);
    if (left.value.trim() !== '') {
      grammar[left.value] = [];
    }
  }

  for (let i = 0; i <= inputCount; i++) {
    left = document.querySelector(`#left-input-${i}`);
    right = document.querySelector(`#right-input-${i}`);

    if (right.value.split('').length === 1 && right.value === right.value.toLowerCase()) {
      grammar[left.value].unshift(right.value)
    }

    else {
      if (grammar[left.value].includes('')) { //jogando símbolo vazio para o final do array
        grammar[left.value] = grammar[left.value].filter(e => e != '');
        grammar[left.value].push(right.value);
        grammar[left.value].push('');
      }
      else {
        grammar[left.value].push(right.value);
      }
    }
  }

  return { grammar, first };
}


validButton.addEventListener("click", () => {

  const word = validExpressionInput.value;

  if (word.trim() === '') { //verificando se a expressão a ser validada não é vazia
    alert('Insira uma expressão para ser validada!');
  }
  else {

    let { grammar, first } = getGrammar(); //get regras da gramática e não terminal inicial

    if (Object.keys(grammar).length == 0) { //nenhuma regra a ser validada
      validExpressionInput.style.backgroundColor = "green";
    }

    else {
      if (validExpression(grammar, first, word) !== -1)
        if (validExpression(grammar, first, word)) {
          validExpressionInput.style.backgroundColor = "green";
        }
        else {
          validExpressionInput.style.backgroundColor = "red";
        }
    }

  }

});