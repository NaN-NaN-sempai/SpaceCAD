# SpaceCAD 👷 README em constrção 👷

**SpaceCAD** é um ambiente de modelagem e projeto 3D focado no design e desenvolvimento através de código, baseado no OpenSCAD.

Rodando em **Node.js** com interface gráfica em **Electron** e renderização via **Three.js**.

O SpaceCAD permite criar, carregar e parametrizar objetos 3D de forma simples através de código JavaScript otimizado.



## 🎨 Características Principais

* **JavaScript Dinâmico (`.spacecad.js`)**: Gere móveis e objetos 3D programaticamente com facilidade.
* **Sintaxe Inspirada no OpenSCAD**: Código em JavaScript nativo desenvolvido para suportar operações geométricas intuitivas, transformações e modelagem paramétrica de forma fluida.
* **Overloading de Operadores**: Suporte nativo a overload de operadores no JS para manipulação vetorial e matemática fluida no código dos projetos.
* **Sistema de Módulos Simples**: Crie classes reutilizáveis facilemente em outros arquivos:
```javascript
// arquivo A — salvando o modulo
class MeuModulo extends SpaceCAD.Object {
    //...
}
new MeuModulo(...);
MeuModulo.store(); // salva Modulo no servidor

// arquivo B — usando o modulo
const MeuModulo = SpaceCAD.module.MeuModulo.operator;
new MeuModulo(...);
```
* **Desktop Nativo**: Performance e flexibilidade de I/O rodando em Node.js com UI em Electron.

## 🛠️ Tecnogias Utilizadas
* **Node.js** — Ambiente de execução back-end/desktop.

* **Socket.io & Express.js** — Conversação entre back-end e browser.

* **Electron** — Framework para interface desktop.

* **Three.js** — Engine de renderização 3D.

* **Acorn & Astring** — Processamento de AST para o Overloading de operadores de nativo.

## 📦 Instalação e Execução
**Clone o repositório**:

```Bash
git clone https://github.com/NaN-NaN-sempai/SpaceCAD.git
cd spacecad
```
**Instale as dependências**:

```Bash
npm install
```

**Inicie a aplicação** (em desenvolvimento):

```Bash
npm run dev
```

## 📐 Exemplo de Uso (.spacecad.js)
```JavaScript
// Exemplo básico de criação de um módulo de móvel

// crie uma classe extendendo SpaceCAD.Object
class ArmarioPlanejado extends SpaceCAD.Object {
  constructor(props = {}) {
    // cria valores padrões de forma recursiva no objeto
    props = recursiveProxy(prop, {
        height: 15,
        width: 100,
        depth: 100,
    });

    const geometry = new THREE.BoxGeometry(...);
    const material = new THREE.MeshStandardMaterial(...);

    super(props, geometry, material);

    // o objeto será geralto altomaticamente no mundo

    // logica do seu armario...
  }
}

// Criando instancias
const meuArmario = new ArmarioPlanejado(80, 200, 50);
const meuArmario2 = new ArmarioPlanejado(80, 200, 50);


// Exemplo básico de Overloading de operadores
meuArmario.position.x = 10; 
meuArmario2.position = meuArmario.position * 2; // posiciona usando a posição de meuArmario * 2

console.log(meuArmario.position); //  Vector3 - 10, 0, 0 
console.log(meuArmario2.position); // Vector3 - 20, 0, 0 


// Exemplo básico de carregamento de modulo
ArmarioPlanejado.store(); // salva módulo no servidor para ser usado em outros arquivos

// em outro arquivo
const ArmarioPlanejado = SpaceCAD.module.ArmarioPlanejado.constructor;

const meuArmario = new ArmarioPlanejado(80, 200, 50);

```


## 🛠️ Bibliotecas/Recursos Criadas No SpaceCAD
* **SpaceCAD.js** — Biblioteca principal do projeto. `(browser)`

* **storage.js** — Equivalente ao `localStorage` para Node.js `(back-end)`

* **inputManager.js** — Gerenciador de inputs robusto. `(browser/back-end <- não implementado)`

* **loopManager.js** — Gerenciador de loops robusto. `(browser/back-end <- não implementado)`

* **mouseLock.js** — Gerenciador de trava do mouse. `(browser)`

* **overloadOperator.js** — Overloading de operadores no Javascript nativo. `(browser/back-end <- não implementado)`

* **logger.js** — Console customisado dentro da página. `(browser/back-end <- não implementado)` 

* **JSHON.js** — **JavaScript High Object Notation** - Traduz valores para string e visseversa, suporta setters e getters de objetos (alternativa mais robusta ao JSON stringify/parse) `(browser/back-end)` 


#

* **`watchFilePath / cancelWatch`** — Observa mudanças em um arquivo expecifico em qualquer localização. `(back-end)` 
* **`utils/recursiveProxy`** — Cria um objeto com valores padrões recursivamente. `(browser/back-end)` 

* **`utils/syncFetch`** — Equivalente ao fetch porem sem `Promise`. `(browser)`

* **`utils/createElement`** — Cria elementos HTML de forma simples e rápida. `(browser)` 

* **`utils/setupDropdown`** — Cria menus flutuantes de forma simples e rápida. `(browser)` 

* **`utils/class ObjectForm`** — Gerenciador de form HTML, trasnforma os valores do form em objeto de forma simples. `(browser)` 

* **`utils/class Modal`** — Cria Modals de forma dinamica. `(browser)` 

* **`utils/class Interval`** — Gerenciador de intervalos robusto. `(browser/back-end)` 

* **`{HTMLElement}.dropdown`** — Propriedade em Elementos HTML para usar o `setupDropdown`. `(browser)` 

* **`[Array].populate`** — Gera uma array populada entre os valores Int da array original. `(browser/back-end)` 

* **`{/* qualquer tipo */}` uteis**: `(browser)` 
  - `typeis` — `identificador.typeis()` retorna o tipo do identificador. `identificador.typeis.tipo` retorna true se o tipo igual a chave passada. Exemplo:
  ```javascript
  const meuItem = 2;
  meuItem.typeis.number // => true

  // ⚠️ undefined é primitivo e não possui propriedades
  // portanto acessar typeis causa erro em casos como:
  undefined.typeis // ⛔️ Cannot read properties of undefined
  (undefined).typeis // ⛔️ Cannot read properties of undefined 
  let semValor; 
  semValor.typeis // ⛔️ Cannot read properties of undefined
  ```
* **`{HTMLElement}` uteis**: `(browser)` 
  - `on` — Equivalente ao addEventListener mas mais robusto.
  - `query/all` — Simplifacação do querySelector/querySelectorAll.
  - `{FORM}.objectForm` — Maneira de acessar o ObjectForm no form.
  - `{FORM}.asObject` — Maneira de acessar os valores do form como objeto usando o ObjectForm.
  - `{element[modal]}.modal` — Maneira de acessar o Modal no elemento.
* **`{NodeList/HTMLCollection}` uteis**: `(browser)`
  - `// array operations` — `map`, `filter`, `forEach` e outros.
  - `on` — Executa `{HTMLElement}.on` em todos os elementos da lista.
  - `query` — Retorna a primeira instancia na lista.
  - `queryMap` — Retorna as primeiras instancias de todos os itens da lista.
  - `queryAll` — Retorna todas instancias de todos os itens da lista.

