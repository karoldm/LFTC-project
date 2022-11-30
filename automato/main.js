import validExpression from "../grammar/validExpression.js";

function init() {

    let initialNode = null;
    let finalNodes = [];

    // Create the Diagram's Model:
    var nodeDataArray = [];
    var linkDataArray = [];

    const expressionButtonAf = document.querySelector("#expression-button-af");
    const expressionInputAf = document.querySelector("#expression-input-af");

    expressionButtonAf.addEventListener("click", () => {
        const expression = expressionInputAf.value;

        if (!expression.trim()) {
            alert("Insira uma expressão para ser validad!");
        }
        else {
            let grammar = {};

            for (let i in nodeDataArray) {
                const node = nodeDataArray[i];
                grammar[node.text] = [];
            }

            //se C é um estado final, então C -> "" (vazio)
            for (let i in finalNodes) {
                const node = nodeDataArray.filter(e => e.key === finalNodes[i]);
                console.log(node);
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

            console.log(grammar);
            // validExpression(grammar, initial, expression);
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
            myDiagram.model.setDataProperty(data, "color", "white");
            myDiagram.commitTransaction("makeInitial");
            initialNode = data.key;

            return;
        }

        //Só pode haver um estado inicial então fazer o atual deixar de ser
        else if (initialNode) {
            const currentInitialNode = myDiagram.findNodeForKey(initialNode);
            myDiagram.startTransaction("makeInitial");
            const data = currentInitialNode.data;
            myDiagram.model.setDataProperty(data, "color", "white");
            myDiagram.commitTransaction("makeInitial");
        }

        myDiagram.startTransaction("makeInitial");
        const data = node.data
        myDiagram.model.setDataProperty(data, "color", "rgb(77, 255, 77)");
        myDiagram.commitTransaction("makeInitial");
        initialNode = data.key;
    }

    function makeFinal(node) {
        const data = node.data;
        if (finalNodes.includes(data.key)) {
            myDiagram.startTransaction("makeFinal");
            myDiagram.model.setDataProperty(data, "color", "white");
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
            { locationSpot: go.Spot.Center },
            $(go.Shape, "Circle",
                {
                    fill: "white", // the default fill, if there is no data bound value
                    portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                    // allow all kinds of links from and to this port
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
                },
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