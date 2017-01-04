/**
 * Builds a graph.
 *
 * @param      {Array}   docs    The documents
 * @return     {Graph}  The graph. (has .edges and .nodes)
 */
function buildGraph(docs) {
    // Função auxiliar para encontrar elemento em array pela propriedade "name"
    function find(array, name) {
        for (let i = 0; i < array.length; i++)
            if (array[i].name === name)
                return array[i];
        return null;
    }
    // Variáveis de iteração
    const nameList = [];
    const nodeList = [];
    const edgeList = [];
    let id = 0;
    // Remover todas as entradas que não sejam controllers ou services ou types
    let newDocs = [];
    docs.forEach(
        (elem, index, array) => {
            if (/controller|service|type/.test(elem.ngdoc))
                newDocs.push(elem);
        }
    );
    docs = newDocs;
    newDocs = null;
    // Registrar os nós meus (controllers e services meus)
    docs.forEach(
        (elem, index, array) => {
            // Propriedades fáceis
            let name = elem.name;
            let label = elem.shortName;
            let group = elem.ngdoc;
            let title = name.split(".")[0]  // Module ao qual pertence
            nameList.push(name);
            nodeList.push({
                id: ++id,
                label: label,
                name: name,
                group: group,
                title: title
            });
        }
    );
    // Pesquisar as dependências, criando novos nós caso a dependência
    // não seja parte dos meus próprios services e controllers
    docs.forEach(
        (elem, index, array) => {
            if (!elem.requires) return;
            elem.requires.forEach(
                (dependency, depIndex, depArray) => {
                    // Se não existir na minha lista de nós, criar o novo nó
                    if (!nameList.includes(dependency.name)) {
                        nodeList.push({
                            id: ++id,
                            label: dependency.name,
                            name: dependency.name,
                            group: "unknown"
                        });
                        // Inserir a dependência na lista de nós, para evitar duplicatas
                        // (como inserir duas vezes o "$q" na lista de nós)
                        nameList.push(dependency.name);
                    }
                    // Ligar a dependência ao dependente (neste sentido)
                    edgeList.push({
                        from: find(nodeList, dependency.name).id,
                        to: find(nodeList, elem.name).id,
                        group: find(nodeList, dependency.name).group + " " + find(nodeList, elem.name).group
                    });
                }
            );
        }
    );
    return {
        nodes: nodeList,
        edges: edgeList
    };
}