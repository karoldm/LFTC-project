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