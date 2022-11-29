
//grammar = {não-terminal: [derivações]}
//current = não-terminal sendo percorrido atualmente
//word = expressão a ser validada
export default function validExpression(grammar, current, word) {

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