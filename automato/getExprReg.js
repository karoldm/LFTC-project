/**
 * 
 * @param {number} currState 
 * @param {String[]} expressions 
 * @param {Link[]} nextStates 
 * @param {String} exprStr 
*/
export default function getExprReg(currState, expressions, nextStates, exprStr, linksVisited, finalNodes, linkDataArray) {
    let exprArray = ["("];
    linksVisited.push(currState);

    //estados com fechamento neles próprios
    let statesWithClosure = nextStates.filter((link) => link.to === currState);
    if (statesWithClosure.length > 0) {
        linksVisited.push(currState);
        for (let i in statesWithClosure) {
            exprArray.push(statesWithClosure[i].text === "" ? "ɛ" : statesWithClosure[i].text);
            exprArray.push('|');
        }
        exprArray.pop();
        exprArray.push(")*");

        exprStr += exprArray.join("");
        exprArray = ["("];

        //eliminando estados já tratados 
        nextStates = nextStates.filter((link) => link.to !== currState);
    }

    //se o estado atual é final, inserimos e espressão e retornamos
    if (finalNodes.includes(currState)) {
        expressions.push(exprStr);
    }

    //tratamento de loop 
    //verificar se existe algum nextStates que esta em linksVisited
    //se sim, fazer o tratamento (contar parenteses e inserir fechamento)
    //após isso, se o nextState verificado por final (incluir em expressions e remover esse caminho)
    //se ele não for final, pular para ele e tentar achar um estado final
    //seguir busca no currState para achar um estado final
    let loop = false;
    let statesLoops = [];
    nextStates.forEach((next) => {
        if (linksVisited.includes(next.to)) {
            statesLoops.push(next)
            loop = true;
        }
    });

    while (loop) {
        let nextState = statesLoops[0];

        let back = Math.abs((linksVisited.length - 1) - linksVisited.indexOf(nextState.to));

        let exprCopy = exprStr;
        //voltar back quantidades de pares de parenteses em exprStr
        let aux = "";
        let exprSepareted = [];

        for (let i = 0; i < exprCopy.length; i++) {
            aux += exprCopy[i];
            if (aux.includes(")")) {
                if (exprCopy[i + 1] === "*") {
                    aux += exprCopy[i + 1];
                    i++;
                }
                exprSepareted.push(aux);
                aux = "";
            }
        }
        exprSepareted[exprSepareted.length - back] = `(${exprSepareted[exprSepareted.length - back]}`;
        exprSepareted.push(`(${nextState.text == "" ? "ɛ" : nextState.text}))*`);

        //se o estado que leva ao loop é final, inserimos a expressão obtida
        if (finalNodes.includes(nextState.to)) {
            exprStr = exprSepareted.join("");
            expressions.push(exprStr);
        }
        //se o estado atual é final, atualizamos a expressão atual
        else if (finalNodes.includes(currState)) {
            expressions.push(exprStr + exprSepareted.join(""));
        }
        //se nenhum dos dois é final
        else {
            exprStr = exprSepareted.join("");
            expressions.push(exprStr);
        }
        //eliminando esse estado
        statesLoops = statesLoops.filter((link) => link.to !== nextState.to);
        if (statesLoops.length === 0) {
            loop = false;
        }
    }

    while (nextStates.length > 0) {
        let nextState = nextStates[0];

        let nextStatesEqual = nextStates.filter((link) => link.to === nextState.to);
        //Para todos os estados tal que currState --s1,s2,s2--> nextState inserimos s1,s2,s3
        //na expressão como caminhos possíveis: s1|s2|s3...
        for (let l in nextStatesEqual) {
            exprArray.push(nextStatesEqual[l].text === "" ? "ɛ" : nextStatesEqual[l].text);
            exprArray.push("|");
        }

        exprArray.pop();
        exprArray.push(")");
        let newExprStr = exprStr + exprArray.join("");
        exprArray = ["("];

        //percorrendo o próximo estado de nextState
        let newCurrState = nextState.to;
        if (!linksVisited.includes(newCurrState)) {
            let newNextStates = linkDataArray.filter((link) => link.from === newCurrState);
            getExprReg(newCurrState, expressions, newNextStates, newExprStr, linksVisited, finalNodes, linkDataArray);
        }

        //eliminando esse estado pq já chegamos ao final dele
        nextStates = nextStates.filter((link) => link.to !== nextState.to);
        linksVisited.pop();

    }


}