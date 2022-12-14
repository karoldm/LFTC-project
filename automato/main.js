import validExpression from "../grammar/validExpression.js";
import getExprReg from "./getExprReg.js";

function init() {

    let initialNode = null;
    let finalNodes = [];

    // Create the Diagram's Model:
    var nodeDataArray = [];
    var linkDataArray = [];

    const expressionButtonAf = document.querySelector("#expression-button-af");
    const expressionInputAf = document.querySelector("#expression-input-af");

    const convertToGR = document.querySelector("#convert-af-to-gr");
    const convertToER = document.querySelector("#convert-af-to-er");

    const convertContent = document.querySelector("#convert-content");

    const getGrammar = () => {
        let grammar = {};

        /**
         * Como a função para validar gramática só aceita inputs da forma: aA 
         * (termina seguido de não terminal) precisamos converter o texto dos estados inseridos 
         * pelo usuário (que podem ser literalmente qualquer text) para alguma letra maiscula 
         * do alfabeto. 
         * Vale lembrar que a gramáica também só aceita 1 terminal, desse modo as transições não
         * podem ter mais de uma letra/digito
        */

        //verificando transições
        for (let i in linkDataArray) {
            const link = linkDataArray[i];
            if (link.text.length > 1) {
                alert("As transições só podem conter um único caractere!");
                return;
            }
        }

        //convertendo para letra do alfabeto
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


        for (let i in nodeDataArray) {
            const node = nodeDataArray[i];
            node.text = alphabet[i];
        }

        //iniciando estrutura para armazenar a gramática
        for (let i in nodeDataArray) {
            const node = nodeDataArray[i];
            grammar[node.text] = [];
        }

        //se C é um estado final, então C -> "" (vazio)
        for (let i in finalNodes) {
            const node = nodeDataArray.filter(e => e.key === finalNodes[i]);
            grammar[node[0].text].push("");
        }

        for (let i in linkDataArray) {
            const link = linkDataArray[i];

            //recuperar estado que contem key = link.from
            const nodeA = nodeDataArray.filter(e => e.key === link.from);
            //recuperar estado que contem key = link.to
            //como pode haver um estado q0 (from) indo para vários estados (to) percorremos cada um deles
            //nodeB pode ser um array com size > 1
            const nodeB = nodeDataArray.filter(e => e.key === link.to);

            //se o a transição é vazia então um não terminal A deriva em um não terminal B sem um terminal
            if (link.text === "") {
                grammar[nodeA[0].text].push(nodeB[0].text);
            }
            //se a transição é não vazia, então um não terminal A deriva em um terminal a seguido de um 
            //não terminal B (GLUD: A -> aB)
            else {
                grammar[nodeA[0].text].push(`${link.text}${nodeB[0].text}`);
            }

        }


        const initial = nodeDataArray.filter(e => e.key === initialNode)

        return {
            initial: initial,
            grammar: grammar,
        }
    }

    convertToER.addEventListener("click", () => {
        if (!initialNode || finalNodes.length === 0) {
            alert("Defina um estado inicial e pelo menos um estado final!");
            return;
        }

        /**
        * ER correspondente. Passos:
        * 1. Encontrar a ER para cada estado
        * 2. Encontrar, a partir da união de todas as ER’s, uma ER que vai do estado inicial para o estado final
        * 3. Caso tenha mais de um estado final, a ER resultante será a união das ER’s obtidas no passo 2
        */

        let expressions = [];
        let currState = initialNode;
        let nextStates = linkDataArray.filter((link) => link.from == currState);
        let linksVisited = [];

        getExprReg(currState, expressions, nextStates, "", linksVisited, finalNodes, linkDataArray);

        convertContent.innerHTML = "";
        const htmlNewRow = document.createElement('div');

        for (let i in expressions) {
            if (expressions[i] === "") {
                expressions[i] = 'ɛ';
            }
        }

        if (expressions.length < 2)
            htmlNewRow.innerHTML = expressions;
        else
            htmlNewRow.innerHTML = expressions.join("+");

        convertContent.appendChild(htmlNewRow);

    });

    convertToGR.addEventListener("click", () => {
        if (!initialNode || finalNodes.length === 0) {
            alert("Defina um estado inicial e pelo menos um estado final!");
            return;
        }

        convertContent.innerHTML = "";

        const { grammar, initial } = getGrammar();

        convertContent.innerHTML = `<p>Inicial: ${initial[0].text}</p></br>`;

        for (let G in grammar) {
            for (let g in grammar[G]) {
                const htmlNewRow = document.createElement('div');
                htmlNewRow.innerHTML =
                    `<p>
                    ${G}  
                    <img src="../assets/right-arrow.png" alt="arrow right icon" /> 
                    ${grammar[G][g] ? grammar[G][g] : 'ε'}
                    <p/>
                    </br>`;

                convertContent.appendChild(htmlNewRow);
            }
        }

    });


    expressionButtonAf.addEventListener("click", () => {
        const expression = expressionInputAf.value;

        if (!expression.trim()) {
            alert("Insira uma expressão para ser validad!");
        }
        else {

            const { grammar, initial } = getGrammar();

            if (validExpression(grammar, initial[0].text, expression)) {
                expressionInputAf.style.backgroundColor = "#67d658";
            }
            else {
                expressionInputAf.style.backgroundColor = "#fc5142";
            }
        }
    });


    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    let myDiagram =
        $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
            {
                // allow double-click in background to create a new node
                "clickCreatingTool.archetypeNodeData": { text: "q0", color: "yellow" },

                // enable undo & redo
                "undoManager.isEnabled": true
            });

    //Function to define initial node
    function makeInitial(node) {
        //Se o estado selecionado já for inicial então fazemos ele deixar de ser
        if (initialNode && initialNode === node.data.key) {
            myDiagram.startTransaction("makeInitial");
            const data = node.data;
            myDiagram.model.setDataProperty(data, "fig", "Circle");
            myDiagram.commitTransaction("makeInitial");
            initialNode = data.key;

            return;
        }

        //Só pode haver um estado inicial então fazer o atual deixar de ser
        else if (initialNode) {
            const currentInitialNode = myDiagram.findNodeForKey(initialNode);
            myDiagram.startTransaction("makeInitial");
            const data = currentInitialNode.data;
            myDiagram.model.setDataProperty(data, "fig", "Circle");
            myDiagram.commitTransaction("makeInitial");
        }

        myDiagram.startTransaction("makeInitial");
        const data = node.data
        myDiagram.model.setDataProperty(data, "fig", "RoundedRectangle");
        myDiagram.commitTransaction("makeInitial");
        initialNode = data.key;
    }

    function makeFinal(node) {
        const data = node.data;
        if (finalNodes.includes(data.key)) {
            myDiagram.startTransaction("makeFinal");
            myDiagram.model.setDataProperty(data, "color", "yellow");
            myDiagram.commitTransaction("makeFinal");

            finalNodes = finalNodes.filter(e => e !== data.key);
        }
        else {
            myDiagram.startTransaction("makeFinal");
            myDiagram.model.setDataProperty(data, "color", "rgb(255, 26, 26)");
            myDiagram.commitTransaction("makeFinal");

            finalNodes.push(data.key);
        }
    }

    // Define the appearance and behavior for Nodes:

    // First, define the shared context menu for all Nodes, Links, and Groups.

    // To simplify this code we define a function for creating a context menu button:
    function makeButton(text, action, visiblePredicate) {
        return $("ContextMenuButton",
            $(go.TextBlock, text),
            { click: action },
            // don't bother with binding GraphObject.visible if there's no predicate
            visiblePredicate ? new go.Binding("visible", "", (o, e) => o.diagram ? visiblePredicate(o, e) : false).ofObject() : {});
    }

    // a context menu is an Adornment with a bunch of buttons in them
    var partContextMenu =
        $("ContextMenu",
            makeButton("Copy",
                (e, obj) => e.diagram.commandHandler.copySelection(),
                o => o.diagram.commandHandler.canCopySelection()),
            makeButton("Paste",
                (e, obj) => e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint),
                o => o.diagram.commandHandler.canPasteSelection(o.diagram.toolManager.contextMenuTool.mouseDownPoint)),
            makeButton("Initial",
                (e, obj) => makeInitial(obj.part.adornedObject)),
            makeButton("Final",
                (e, obj) => makeFinal(obj.part.adornedObject)),
        );

    function nodeInfo(d) {  // Tooltip info for a node data object
        var str = "Node " + d.key + ": " + d.text + "\n";
        if (d.group)
            str += "member of " + d.group;
        else
            str += "top-level node";
        return str;
    }

    // These nodes have text surrounded by a rounded rectangle
    // whose fill color is bound to the node data.
    // The user can drag a node by dragging its TextBlock label.
    // Dragging from the Shape will start drawing a new link.
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            { desiredSize: new go.Size(50, 50) },
            { locationSpot: go.Spot.Center },
            $(go.Shape, "Circle",
                {
                    fill: "yellow", // the default fill, if there is no data bound value
                    portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                    // allow all kinds of links from and to this port
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
                },
                new go.Binding("figure", "fig"),
                new go.Binding("fill", "color")),
            $(go.TextBlock,
                {
                    font: "bold 14px sans-serif",
                    stroke: '#333',
                    margin: 6,  // make some extra space for the shape around the text
                    isMultiline: false,  // don't allow newlines in text
                    editable: true  // allow in-place editing by user
                },
                new go.Binding("text", "text").makeTwoWay()),  // the label shows the node data's text
            { // this tooltip Adornment is shared by all nodes
                toolTip:
                    $("ToolTip",
                        $(go.TextBlock, { margin: 4 },  // the tooltip shows the result of calling nodeInfo(data)
                            new go.Binding("text", "", nodeInfo))
                    ),
                // this context menu Adornment is shared by all nodes
                contextMenu: partContextMenu
            }
        );

    // Define the appearance and behavior for Links:

    function linkInfo(d) {  // Tooltip info for a link data object
        return "Link:\nfrom " + d.from + " to " + d.to;
    }

    // The link shape and arrowhead have their stroke brush data bound to the "color" property
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            {
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, relinkableTo: true,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            $(go.Shape,  // the link shape
                { strokeWidth: 1.5 },
                new go.Binding('stroke', 'progress', progress => progress ? "#52ce60" /* green */ : 'black'),
                new go.Binding('strokeWidth', 'progress', progress => progress ? 2.5 : 1.5)),
            $(go.Shape,  // the arrowhead
                { toArrow: "standard", stroke: null },
                new go.Binding('fill', 'progress', progress => progress ? "#52ce60" /* green */ : 'black')),
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial",
                            { 0: "rgb(245, 245, 245)", 0.7: "rgb(245, 245, 245)", 1: "rgba(245, 245, 245, 0)" }),
                        stroke: null
                    }),
                $(go.TextBlock, "transition",  // the label text
                    {
                        textAlign: "center",
                        font: "9pt helvetica, arial, sans-serif",
                        margin: 4,
                        editable: true  // enable in-place editing
                    },
                    // editing the text automatically updates the model data
                    new go.Binding("text").makeTwoWay())
            )
        );

    // Define the behavior for the Diagram background:

    function diagramInfo(model) {  // Tooltip info for the diagram's model
        return "Model:\n" + model.nodeDataArray.length + " nodes, " + model.linkDataArray.length + " links";
    }

    // provide a tooltip for the background of the Diagram, when not over any Part
    myDiagram.toolTip =
        $("ToolTip",
            $(go.TextBlock, { margin: 4 },
                new go.Binding("text", "", diagramInfo))
        );

    // provide a context menu for the background of the Diagram, when not over any Part
    myDiagram.contextMenu =
        $("ContextMenu",
            makeButton("Paste",
                (e, obj) => e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint),
                o => o.diagram.commandHandler.canPasteSelection(o.diagram.toolManager.contextMenuTool.mouseDownPoint)),
            makeButton("Undo",
                (e, obj) => e.diagram.commandHandler.undo(),
                o => o.diagram.commandHandler.canUndo()),
            makeButton("Redo",
                (e, obj) => e.diagram.commandHandler.redo(),
                o => o.diagram.commandHandler.canRedo())
        );

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

window.addEventListener('DOMContentLoaded', init);