function setupDom(docs) {
    console.log("Setting up DOM");
    let graph = buildGraph(docs);
    let data = {
        nodes: graph.nodes,
        edges: graph.edges
    };
    console.log("Accessing container");
    let container = document.getElementById("mynetwork");
    let options = {
        edges: {
            arrows: "to",
            color: {
                hover: "yellow",
                color: "black",
                highlight: "yellow"
            },
            smooth: true
                //dashes: true
        },
        layout: {
            hierarchical: {
                enabled: false,
                direction: "LR",
                sortMethod: "directed",
                levelSeparation: 200
            },
            improvedLayout: true,
            randomSeed: 350456
        },
        nodes: {
            shape: "box",
            shadow: true
        },
        groups: {
            controller: {
                color: "#2fe05e"
            },
            service: {
                color: "#f74a67"
            },
            type: {
                color: "rgb(242,107,245)"
            },
            interface: {
                color: "#abef23"
            },
            directive: {
                color: "#7083c1"
            },
            unknown: {
                //Nada
            }
        },
        interaction: {
            //dragView: false,
            hover: true,
            navigationButtons: true,
            keyboard: true,
            multiselect: true,
            tooltipDelay: 0
        },
        configure: {
            // mostra todas as opções numa GUI ótima
            enabled: false
        }
    };

    return {
        container: container,
        data: data,
        options: options
    };

    /*
    network.clustering.cluster({
        joinCondition: (nodeOptions) => {
            return nodeOptions.group === "controller";
        },
        clusterEdgeProperties: options.edges,
        clusterNodeProperties: {
        	label: "Controllers"
        }
    });
    */
}