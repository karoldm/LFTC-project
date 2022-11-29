
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

//grammar = {não-terminal: [derivações]}
//current = não-terminal sendo percorrido atualmente
//word = expressão a ser validada
function validExpression(grammar, current, word) {

  //Para cada possível derivação de um não terminal
  for (let i in grammar[current]) {

    /* Cada iteração que encontra um símbolo da expressão (word) decrementa esse símbolo
       Se a expressão tiver tamanho zero significa que todas os símbolos foram encontradas
       E se o atual não terminal for vazio, então chegamos ao final da gramática
       E a expressão foi validada 
    */

    if (word.length === 0 && grammar[current].includes('')) return true;

    //Como o for passa por cada derivação, ignoramos ''
    if (grammar[current][i] != '') {
      let result = grammar[current][i].split(''); //A gramática é GLUD, logo UM terminal seguido de um não terminal

      let terminal;
      let nonTerminal;

      //Armazenando o terminal e o não terminal
      if ((result.length === 2 && result[0] === result[0].toLowerCase())
        || (result.length === 1 && result[0] === result[0].toLowerCase())) {
        terminal = result[0];
        nonTerminal = result[1];
      }
      else {
        alert("Apenas gramáticas GLUD!");
        validExpressionInput.value = "";
        return -1;
      }

      if (!nonTerminal && terminal === word[0]) { //Se só possui um terminal, e o símbolo é igual a ele
        let word1 = word.substr(1); //decrementamos o símbolo e armazena em uma nova string 
        /*A String atual não pode ser modificada pois precisamos dela para testar todas as outras possibilidades*/
        if (word1.length === 0) return true; //se era o único símbolo na expressão então ela é validada
      }

      if (!terminal && nonTerminal) { //Se só possui um não terminal, apenas partimos para as derivações desse não terminal
        if (validExpression(grammar, nonTerminal, word)) return true;
      }

      if (terminal && nonTerminal && word[0] === terminal) { //Se terminal seguido de não terminal
        let word1 = word.substr(1); //decrementa o símbolo encontrada no inicio 
        if (validExpression(grammar, nonTerminal, word1)) return true; //validando o próxima símbolo
      }
    }
  }

  return false;
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

export { validExpression };