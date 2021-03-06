"use strict";

var s = null;
var t = null;
var algoStageName = "Show Aug Path";
var allNodes = [];
var allEdges = [];
var algoStates = [];
var currentStep = 1;
var isNodeClicked = false;
var isEdgeClicked = false;
var isEdgeHandled = false;
var isOuterClicked = false;
var edgePoint1 = null;
var edgePoint2 = null;
// Input for algorithm
var inputGraph = [];
var source = null, sink = null;
var cy1 = null;
var cy2 = null;
var cyStyle = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            'background-color': 'gray',
            label: 'data(id)',
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'black',
            "text-valign": "center",
            "text-halign": "center"
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'label': 'data(customLabel)',
            'text-background-color': '#a0c2cc',
            'text-background-opacity': 1,
            'width': '3px',
            'target-arrow-shape': 'triangle',
            'control-point-step-size': '70px'
        }
    },
    {
        selector: '.highlight',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'blue'
        }
    },
    {
        selector: '.unhighlight',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'lightblue'
        }
    },
    {
        selector: '.highlighted',
        style: {
            'background-color': '#5ebed6',
            'line-color': '#5ebed6',
            'target-arrow-color': '#5ebed6',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '1.0s'
        }
    }
]

var cyStyle2 = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            'background-color': 'gray',
            label: 'data(id)',
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'lightblue',
            "text-valign": "center",
            "text-halign": "center"
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'label': 'data(customLabel)',
            'text-background-color': 'lightgray',
            'text-background-opacity': 1,
            'width': '3px',
            'target-arrow-shape': 'triangle',
            'control-point-step-size': '70px'
        }
    },
    {
        selector: ':selected',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'blue'
        }
    },
    {
        selector: '.source',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': 'lightgreen'
        }
    },
    {
        selector: '.sink',
        style: {
            'border-width': 3,
            'border-style': 'solid',
            'border-color': '#ad1f15'
        }
    },
    {
        selector: '.highlighted',
        style: {
            'background-color': '#5ebed6',
            'line-color': '#5ebed6',
            'target-arrow-color': '#5ebed6',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '1.0s'
        }
    }
]

function getNode(id) {
    // console.log(allNodes.length);
    for (var i = 0; i < allNodes.length; i++) {
        if (allNodes[i].id == id) {
            return allNodes[i];
        }
    }
    return null;
}

function getEdge(id) {
    for (var i = 0; i < allEdges.length; i++) {
        // console.log(allEdges);
        if (allEdges[i].id == id) {
            return allEdges[i];
        }
    }
    return null;
}

// Creates a new node with new ID (incremented)
function createNode(position) {
    if (isEdgeClicked || isNodeClicked) return;
    var newID = allNodes[allNodes.length - 1] ? +(allNodes[allNodes.length - 1].id) + 1 : 0;
    var data = {
        id: newID.toString(),
        x: position.x,
        y: position.y
    };
    var node = new Node(data);
    allNodes.push(node);
    return node;
}

// Creates edge between provided 2 node points
function createEdge(node1, node2) {
    console.log(node1, node2);
    if (node1.id === node2.id) return null;
    var id = node1.id + "_" + node2.id.toString();
    var existingEdge = getEdge(id);
    if (existingEdge) return null;
    var data = {
        id: id,
        source: node1.id.toString(),
        target: node2.id.toString(),
    };
    var edge = new Edge(data);
    console.log(edge);
    allEdges.push(edge);
    return edge;
}

function clearEdgePoints() {
    edgePoint1 = edgePoint2 = null;
}

function getInput(msg = "", defaultValue = "") {
    var input = prompt(msg, defaultValue);
    // alertify.alert('Ready!');
    return (input ? input : "");
}

function clearListeners() {
    cy1.removeListener("vclick");
    cy1.removeListener("vclick", "node");
    cy1.removeListener("vclick", "edge");
}

function addOptionsToSelect(selectID, options) {
    let selElem = document.getElementById(selectID);
    if (selElem) {
        for(let i = 0; i < selElem.options.length; i++) {
            selElem.removeChild(sel.options[i]);
        }
        options.forEach(e => {
            // create new option element
            let opt = document.createElement('option');

            // create text node to add to option element (opt)
            opt.appendChild( document.createTextNode(e) );

            // set value property of opt
            opt.value = e.toString(); 

            // add opt to end of select box (sel)
            selElem.appendChild(opt);
        });
    }
};

function setModalErrorMsg (modalErrorMsgID, msg) {
    let elem = document.getElementById(modalErrorMsgID);
    if (elem) {
        if (msg) {
            elem.innerHTML = msg;
            elem.visibility = "visible";
        } else {
            elem.innerHTML = "";
            elem.visibility = "hidden";
        }
    }
}

function doesSourceAndSinkExist() {
    var N = allNodes.length;
    var isValidSink = true;
    var validSinks = [];
    var isValidSource = true;
    var validSources = [];
    
    for(var i = 0; i < N; i++) {
        isValidSink = true;
        for(var j = 0; j < N; j++) {
            if(inputGraph[i][j] != 0) {
                isValidSink = false;
                break;
            }
        }
        if(isValidSink) {
            validSinks.push(i);
        }
    }

    for(var i = 0; i < N; i++) {
        isValidSource = true;
        for(var j = 0; j < N; j++) {
            if(inputGraph[j][i] != 0) {
                isValidSource = false;
                break;
            }
        }
        if(isValidSource) {
            validSources.push(i);
        }
    }
    if(validSources.length < 1 || validSinks.length < 1) return false;
    if(validSources.length == 1 && validSinks.length == 1 && validSources[0] == validSinks[0]) return false;
    return true;
}


function finalizeGraph() {
    if(allEdges.length == 0) {
        Swal.fire("Input Network must have at least one edge");
        return; 
    }
    console.log(allNodes);
    console.log(allEdges);
    inputGraph = generateInputGraph();
    console.log(inputGraph);
    let error = "";
    if(!doesSourceAndSinkExist()) {
        Swal.fire("Network does not have valid source or/and sink! Please clear and create a new network");
        return;
    }
    let source_id = "";
    let sink_id = "";
    Swal.fire({
        title: '<strong>Source and Sink</strong>',
        icon: 'question',
        html: `
            <table style="width:100%;">
                <tr>
                    <th>Source ID</th>
                    <th>Sink ID</th>
                </tr>
                <tr>
                    <td>
                        <select id="selectedSourceID">
                        </select>
                    </td>
                    <td>
                        <select id="selectedSinkID">
                        </select>
                    </td>
                </tr>
            </table>
            <p id="modalErrorMsg"></p>
        `,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Confirm',
        confirmButtonAriaLabel: 'Confirm',
        cancelButtonText: 'Cancel',
        // cancelButtonAriaLabel: 'Thumbs down',
        preConfirm: () => {
            let inputs = [
                document.getElementById('selectedSourceID').value,
                document.getElementById('selectedSinkID').value
            ];
            console.log(inputs);
            source_id = inputs[0];
            sink_id = inputs[1];
            if (!error && source_id < 0) error = "Source node ID value should be positive";
            if (!error && sink_id < 0) error = "Sink node ID value should be positive";
            if (!error && !getNode(source_id)) error = "Invalid source node ID";
            if (!error && !getNode(sink_id)) error = "Invalid sink node ID";
            if (!error && !validateSourceAndSink(+source_id, +sink_id)) error = "Source/Sink should not have incoming/outgoing routes";
            return new Promise((resolve) => {
                // Validate                
                if (!error) {
                    resolve();
                }
                else {
                    setModalErrorMsg ("modalErrorMsg", error);
                    resolve(false);  // Cancels the modal close. Should manually show the error message
                }
            });
          },
        onOpen: () => {
            let nodeIDs = allNodes.map(obj => obj.id);
            addOptionsToSelect("selectedSourceID", nodeIDs);
            addOptionsToSelect("selectedSinkID", nodeIDs); // should be optimized
            setModalErrorMsg ("modalErrorMsg", "");
            // OnChange selection event
            document.getElementById('selectedSourceID').addEventListener("change", e => {
                let inputs = [
                    document.getElementById('selectedSourceID').value,
                    document.getElementById('selectedSinkID').value
                ];
                console.log(inputs);
            });
        }
    }).then(result => {
        console.log(result);
        if(result.dismiss) return;
        cy2 = cytoscape({
            container: document.getElementById('cy2'),
            elements: [],
            layout: {
                name: 'preset'
            },
            style: cyStyle2,
            wheelSensitivity: 0.5,
            userZoomingEnabled: true,
            minZoom: 0.1,
            maxZoom: 3,
        });

        allNodes.forEach(e => {
            var node = {
                group: "nodes",
                data: {
                    id: e.id.toString()
                },
                position: {
                    x: e.position.x,
                    y: e.position.y
                }
            };
            cy2.add(node);
        });

        allEdges.forEach(e => {
            var edge = {
                group: "edges",
                data: {
                    id: e.id.toString(),
                    source: e.source,
                    target: e.target,
                    customLabel: e.totalCapacity
                }
            };
            cy2.add(edge)
        });
        cy2.nodes().getElementById(source_id).addClass('source');
        cy2.nodes().getElementById(sink_id).addClass('sink');
        s = +source_id;
        t = +sink_id;
        var maxflow = edmonds_karp(inputGraph, s, t);
        if(algoStates.length == 1) {
            document.getElementById("finalStateMessage").style.visibility = "visible";
            return;
        }
        console.log(maxflow);
        console.log(algoStates);
        document.getElementsByClassName("cy2buttons")[0].style.visibility = "visible";
        clearListeners();
    }, error => {
        console.log(error);
    }).catch(error => {
        console.log(error);
    });
    // let source_id = "";
    // let sink_id = "";
    // Swal.fire({
    //     title: 'Source and Sink',
    //     input: 'text',
    //     inputPlaceholder: 'Enter source and sink node IDs',
    //     inputValue: "",

    //     inputValidator: (value) => {
    //         let error = "";
    //         let values = value.split(",");
    //         if (values.length !== 2) error = "Only two nodes are allowed!"
    //         source_id = values[0];
    //         sink_id = values[1];
    //         if (!error && source_id < 0) error = "Source node ID value should be positive";
    //         if (!error && sink_id < 0) error = "Sink node ID value should be positive";
    //         if (!error && !getNode(source_id)) error = "Invalid source node ID";
    //         if (!error && !getNode(sink_id)) error = "Invalid sink node ID";
    //         if (!error && !validateSourceAndSink(+source_id, +sink_id)) error = "Source/Sink should not have incoming/outgoing routes";
    //         return new Promise((resolve) => {
    //             if (error) {
    //                 resolve(error);
    //             } else {
    //                 resolve();
    //             }
    //         });
    //     },
    //     backdrop: true,
    //     showCancelButton: true,
    // }).then((result) => {
    //     console.log(result);
    //     if (result.dismiss) {
    //         return;
    //     }
    //     if (result.value) {
    //     }
    // });
}

function updateEdgeLabel(edgeId, label, cyObj = "cy1") {
    var elem = null;
    if (cyObj == "cy1") {
        elem = cy1.edges().getElementById(edgeId);
    }
    else {
        elem = cy2.edges().getElementById(edgeId);
    }
    elem.data().customLabel = label;
    elem.select();
    elem.unselect();
}

function addEdgeToGraph(edge) {
    var edgeData = {
        group: "edges",
        data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            customLabel: edge.totalCapacity
        }
    };
    cy2.add(edgeData);
}

function nextStep() {
    if (currentStep == algoStates.length) {
        return;
    }
    var current_state = algoStates[currentStep];
    var flows = current_state[0];
    var res = current_state[1];
    var parent_map = current_state[2];
    var prev_res = algoStates[currentStep - 1][1];
    var path = getBfsPath(parent_map);
    if(algoStageName == "Show Aug Path") {
        animate(path, 0);
        algoStageName = "Update Flows";
    }
    else if(algoStageName == "Update Flows") { 
        for (var i = 0; i < path.length - 1; i++) {
            let u = path[i];
            let v = path[i + 1];
            if (inputGraph[u][v] > 0) updateEdgeLabel(u + "_" + v, flows[u][v] + "/" + inputGraph[u][v]);
            if (inputGraph[v][u] > 0) updateEdgeLabel(v + "_" + u, flows[v][u] + "/" + inputGraph[v][u]);
        }
        algoStageName = "Update Residual Graph";
    }
    else {
        for (var i = 0; i < path.length - 1; i++) {
            let u = path[i];
            let v = path[i + 1];
            let uv = cy2.edges().getElementById(u + "_" + v);
            let vu = cy2.edges().getElementById(v + "_" + u);
            uv.removeClass("highlighted");
            if (res[u][v] == 0) uv.remove();
            else {
                updateEdgeLabel(u + "_" + v, "" + res[u][v], "cy2");
            }
            if (prev_res[v][u] > 0) updateEdgeLabel(v + "_" + u, res[v][u], "cy2");
            else {
                let edge = createEdge(getNode("" + v), getNode("" + u));
                edge.totalCapacity = "" + res[v][u];
                addEdgeToGraph(edge);
            }
        }
        currentStep++;
        algoStageName = "Show Aug Path";
        if(currentStep == algoStates.length) {
            document.getElementsByClassName("cy2buttons")[0].style.visibility = "hidden";
            document.getElementById("finalStateMessage").style.visibility = "visible";
            finalState();
        }
    }
    document.getElementById('algoStateButton').innerHTML = algoStageName;
}

function finalState() {
    console.log(document.getElementById("finalStateMessage").style.visibility);
    cy2.edges().remove();
    console.log(cy2.edges());
    var finalState = algoStates[algoStates.length - 1];
    var final_flows = finalState[0];
    var final_res = finalState[1];
    allEdges = [];
    for (var i = 0; i < allNodes.length; i++) {
        for (var j = 0; j < allNodes.length; j++) {
            if (final_res[i][j] > 0) {
                var e = createEdge(getNode("" + i), getNode("" + j));
                var edge = {
                    group: "edges",
                    data: {
                        id: e.id.toString(),
                        source: e.source,
                        target: e.target,
                        customLabel: final_res[i][j]
                    }
                };
                cy2.add(edge);
            }
        }
    }
    for (var i = 0; i < allNodes.length; i++) {
        for (var j = 0; j < allNodes.length; j++) {
            if (inputGraph[i][j] > 0) {
                updateEdgeLabel(i + "_" + j, final_flows[i][j] + "/" + inputGraph[i][j], "cy1");
            }
        }
    }
    document.getElementsByClassName("cy2buttons")[0].style.visibility = "hidden";
    Swal.fire({
        title: "Final Residual Graph",
        text: "There are no more Augmenting Paths",
        icon: "success",
        button: "Finish",
      });
    document.getElementById("finalStateMessage").style.visibility = "visible";
}

function validateSourceAndSink(sourceNode, sinkNode) {
    console.log(sourceNode, sinkNode);
    for (var i = 0; i < allNodes.length; i++) {
        if (inputGraph[i][sourceNode] > 0) return false;
    }
    for (var j = 0; j < allNodes.length; j++) {
        if (inputGraph[sinkNode][j] > 0) return false;
    }
    return true;
}

function generateInputGraph() {
    var N = allNodes.length;
    var graph = new Array(N);

    for (var i = 0; i < graph.length; i++) graph[i] = new Array(N);

    for (var i = 0; i < N; i++)
        for (var j = 0; j < N; j++)
            graph[i][j] = 0;

    for (var i = 0; i < allEdges.length; i++) {
        var edge = allEdges[i];
        var source = parseInt(edge.id[0], 10);
        var target = parseInt(edge.id[2], 10);
        graph[source][target] = edge.totalCapacity;
    }
    return graph;
}

function graphClick(event) {
    console.log("Cy object clicked");
    if (event.target !== cy1) return; // return, if the clicked position is not the graph region itself.
    console.log("Cy object processing...");
    if (isEdgeClicked) {
        console.log("Cancelling Cy processing as EDGE is clicked");
        isEdgeClicked = false;
        return;
    }
    if (isNodeClicked) {
        console.log("Cancelling Cy processing as NODE is clicked");
        isNodeClicked = false;
        cy1.nodes().getElementById(edgePoint1.id).removeClass('highlight');
        clearEdgePoints();
        return;
    }
    console.log(event);
    clearEdgePoints();
    console.log("Position: ", event.position.x, ",", event.position.y);
    var node1 = createNode(event.position);
    if (node1) {
        var node1Data = {
            group: "nodes",
            data: {
                id: node1.id.toString()
            },
            position: {
                x: node1.position.x,
                y: node1.position.y
            }
        };
        var n = cy1.add(node1Data);
        console.log(n);
    }
}

function nodeClick(event) {
    console.log("Node clicked");
    console.log(edgePoint1, edgePoint2);
    var id = event.target.data().id;
    var elem = cy1.nodes().getElementById(id);
    elem.addClass('highlight');
    console.log(event, elem);
    if (event.target !== elem) return; // return, if the clicked position is not in Node element
    console.log("Node processing...");
    isNodeClicked = true;
    isEdgeClicked = false;
    // Sets first and second node
    if (edgePoint1 == null)  {
        edgePoint1 = getNode(id);
    }
    else {
        if (edgePoint2 == null) {
            edgePoint2 = getNode(id);
            var newEdge = createEdge(edgePoint1, edgePoint2);
            console.log(newEdge);
            /*if (edgePoint1.id === edgePoint2.id) {
                console.log("Edge cannot be created for same nodes.");
                edgePoint2 = null;
                return;
            }*/
            var capacity = "1"; // getInput("Capacity", 1);
            if (!capacity || capacity === "0" || capacity[0] === "-") capacity = 1;
            if (newEdge) {
                var edgeData = {
                    group: "edges",
                    data: {
                        id: newEdge.id,
                        source: newEdge.source,
                        target: newEdge.target,
                        customLabel: capacity ? "0/" + capacity : newEdge.customLabel
                    }
                };
                cy1.add(edgeData);
                isNodeClicked = false;
            }
            cy1.nodes().getElementById(edgePoint1.id).removeClass('highlight');
            cy1.nodes().getElementById(edgePoint2.id).removeClass('highlight');
            clearEdgePoints();
            /*cy1.nodes().forEach(element => {
                element.unselect();
            });*/
        } else {
            // resetting for new edge creation
            edgePoint2 = null;
            edgePoint1 = getNode(id);
        }
    }
    console.log(cy1.nodes());
    console.log(edgePoint1, edgePoint2);
}

function edgeClick(event) {
    // var capacity = getInput("Capacity", 1);
    // swal
    console.log("Edge clicked");
    console.log(cy1.nodes('.highlight'));
    cy1.nodes('.highlight').removeClass("highlight");
    cy1.nodes('.highlight').unselect();
    edgePoint1 = edgePoint2 = null; // click on node, edge (update label) then again node should not consider the click for edge creation.
    var id = event.target.data().id;
    var elem = cy1.edges().getElementById(id);
    console.log(event, elem);
    if (event.target !== elem) return; // return, if the clicked position is not in Edge element
    console.log("Edge processing...");
    isEdgeClicked = true;
    isNodeClicked = false;
    var e = getEdge(id);
    Swal.fire({
        title: 'Capacity',
        input: 'text',
        inputPlaceholder: 'Enter Capacity',
        inputValue: e.totalCapacity,

        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (!value || value <= 0 || isNaN(value)) {
                    resolve('Please enter positive integer value!');
                } else {
                    resolve();
                }
            });
        },
        backdrop: true,
        showCancelButton: true,
    }).then((result) => {
        console.log(result);
        if (result.dismiss) {
            elem.unselect();
            return;
        }
        if (result.value) {
            if (e.totalCapacity != result.value) {
                console.log(elem.data());
                e.totalCapacity = parseInt(result.value, 10);
                e.customLabel = e.usedCapacity + "/" + e.totalCapacity;
                elem.data().customLabel = e.customLabel;
                console.log(e);
                console.log(elem.data());
                elem.unselect();
            }
        }
    });
}

function nodeDrag(event) {
    var node = getNode(event.target.data().id);
    var newPos = event.target.position();
    node.position.x = newPos.x;
    node.position.y = newPos.y;
    console.log(allNodes);
}

function resetGraph() {

    allNodes = [];
    allEdges = [];
    algoStates = [];
    currentStep = 1;
    isNodeClicked = false;
    isEdgeClicked = false;
    isEdgeHandled = false;
    isOuterClicked = false;
    edgePoint1 = null;
    edgePoint2 = null;
    // Input for algorithm
    inputGraph = [];
    source = null, sink = null;
    let elem = document.getElementsByClassName("cy2buttons")[0].style;
    elem.visibility = "hidden";
    clearListeners();
    cy1.on("vclick", graphClick);
    cy1.on("vclick", "node", nodeClick);
    cy1.on("vclick", "edge", edgeClick);
    cy1.elements().remove();
    if (cy2) {
        cy2.nodes().remove();
    }
    document.getElementById("finalStateMessage").style.visibility = "hidden";
}

function displayInstructions() {
    Swal.fire({
        icon: 'info',
        title: 'Instructions',
        html: `
        <ul>
            <li style = "text-align: left">Use the left half to define any graph of your choice</li>
            <li style = "text-align: left">The right half displays the residual graph</li>
            <li style = "text-align: left">Add nodes by clicking</li>
            <li style = "text-align: left">Add edges with default capacity by clicking on a source node followed by a target node</li>
            <li style = "text-align: left">Click on edges to change capacity</li>
            <li style = "text-align: left">Click on the background to deselect a selected node</li>
            <li style = "text-align: left">Clicking the Finalize Graph button will prompt you to enter a source and sink</li>
            <li style = "text-align: left">The clear graph button can be used to start from scratch</li>
            <li style = "text-align: left">The Show Augmenting Path button animates the current augmenting path in the residual graph</li>
            <li style = "text-align: left">The Update Flows button adds updates the flows in the original network</li>
            <li style = "text-align: left">The Update Residual Graph button updates the residual graph for the next iteration</li>
            <li style = "text-align: left">At any stage, the Final State button can be used to skip to the end state</li>
        </ul>`,
      })
      return;
}

document.addEventListener("DOMContentLoaded", function () {
    cy1 = cytoscape({
        container: document.getElementById('cy1'), // container to render in 
        elements: allNodes,
        layout: {
            name: 'preset'
        },
        style: cyStyle,
        wheelSensitivity: 0.5,
        userZoomingEnabled: true,
        minZoom: 0.1,
        maxZoom: 3,
    });

    // Click event on Graph (ie.,. entire region used by cy1)
    cy1.on("vclick", graphClick);

    // Click event on Node element
    cy1.on("vclick", "node", nodeClick);

    // Click event on Edge element
    cy1.on("vclick", "edge", edgeClick);

    cy1.on("dragfree", "node", nodeDrag);

    displayInstructions();

});