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

    //se o estado não é final, continuamos o caminho até um estado final
    while (nextStates.length > 0) {
        let nextState = nextStates[0];

        //tratando loop no AF
        //se o estado atual é um estado já visitado
        if (linksVisited.includes(nextState.to)) {
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

            //se o estado atual é final, inserimos e espressão e retornamos
            if (finalNodes.includes(currState)) {
                expressions.push(exprStr + exprSepareted.join(""));
            }


            else if (finalNodes.includes(nextState.to)) {
                exprStr = exprSepareted.join("");
                expressions.push(exprStr);
            }

            else {
                exprStr = exprSepareted.join("");
                expressions.push(exprStr);
            }

            //eliminando esse estado
            nextStates = nextStates.filter((link) => link.to !== nextState.to);

        }

        if (nextStates.length > 0) {
            nextState = nextStates[0];
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
            let newNextStates = linkDataArray.filter((link) => link.from === newCurrState);

            getExprReg(newCurrState, expressions, newNextStates, newExprStr, linksVisited, finalNodes);

            //eliminando esse estado pq já chegamos ao final dele
            nextStates = nextStates.filter((link) => link.to !== nextState.to);
            linksVisited.pop();
        }

    }

}