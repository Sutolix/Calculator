class CalcController{

    constructor(){
        //usando this. permite o uso das variaveis em outros lugares
        //this._ significa que o atributo é privado
        
        //Pega os elementos do html e coloca nas variaveis
        this._audioOnOff = false;
        this._audio = new Audio('click.mp3');
        this._lastOperator = '';
        this._lastNumber = '';

        
        this._locale = 'en-us';
        this._operation = [];
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    pasteFromClipboard(){
        //capitura o evento de teclado ctrl+v
        document.addEventListener('paste', e =>{
            //guarda em text o valor copiado
            let text = e.clipboardData.getData('text');
            //transforma em número
            text = parseFloat(text);
            //coloca esse número no display
            this.displayCalc = text;
            //coloca o número no array para que possa fazer operações com ele
            this.pushOperation(text);
        })

    }

    copyToClipboard(){
        //cria um input
        let input = document.createElement('input');
        //define seu valor como o do display
        input.value = this.displayCalc;
        //faz ele aparecer na tela para poder ser selecionado
        document.body.appendChild(input);
        //seleciona o input
        input.select();
        //copia seu valor (por base do evento de teclado ctrl+c)
        document.execCommand("Copy");
        //remove o input da tela
        input.remove();
    }

    /*Tudo que precisa ser iniciado junto da calculadora*/
    initialize(){
        //Responsavel pela data e hora
        this.setDisplayDateTime();
        setInterval(()=>{
            this.setDisplayDateTime();
        }, 1000);
        //Para o display começar exibindo o 0
        this.setLastNumberToDisplay();
        //Para ficar ouvindo um possivel ctrl+v
        this.pasteFromClipboard();

        //duplo click para ativar e desativar o som
        document.querySelectorAll('.btn-ac').forEach(btn=>{
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            });
        });
    }

    toggleAudio(){
        /*Interruptor do audio - caso ligado desliga, caso desligado liga*/
        //ele é igual ao contrario dele mesmo
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){
        //executa o audio caso esteja ligado
        if (this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyboard(){
        document.addEventListener('keyup', e=>{
            
            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot('.');
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                    
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    /*Fasemos isso para facilitar a adição de multiplos eventos*/
    //Pegamos o element(btn), seus eventos(click e drag) e a função a ser executada
    //(presente no initButtonsEvents)
    addEventListenerAll(element, events, fn){
        //pega o 'click drag' que é lido como string e o transforma em array usando split.
        //Após isso o forEach percorre o array (que tem os eventos click e drag) e adiciona o
        //addEventListener pra cada element(botão)
        events.split(' ').forEach(event => {
            //O false serve para que ele execute somente sobre o ato de uma função, ou seja,
            //não dispare duas vezes por ter aticado duas funções limitando ao ativamento de somente uma
            element.addEventListener(event, fn, false);
        });
    }

    clearAll(){
        //apaga tudo
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        //atualiza o display
        this.setLastNumberToDisplay();
    }

    clearEntry(){
        //apaga o ultimo elemento no array (ultima entrada na calculadora)
        this._operation.pop();
        //atualiza o display
        this.setLastNumberToDisplay();
    }

    getLastOperation(){
        //pega o ultimo elemento do array
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value){
        //troca o ultimo elemento do array
        this._operation[this._operation.length-1] = value;
    }

    pushOperation(value){
        //coloca o value recebido no array
        this._operation.push(value);
        //para que sempre que passar de 3 itens digitados (3 + 2, por exemplo), chamar a função de calcular
        if (this._operation.length > 3){
            this.calc();
        }
    }

    getResult(){

        try{
        //transforma o array operation em string sem espaços por usar join ao inves de toString e
        //calcula seu valor por meio do aval
        return eval(this._operation.join(""));
        
        }catch(e){
            //timeout para que o erro apareça depois do 0 que o outro metódo poria
            setTimeout(()=>{
                this.setError();
            }, 1);
        }
    }

    calc(){
        //operador
        let last = '';

        this._lastOperator = this.getLastItem();
        
        //para que o operador não seja perdido nas repetições ao apertar = mais de uma vez
        if (this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        //para sempre fazer as operações aos pares. (2 + 2 => 3 digitos)
        //ele soma os dois e só depois aceita novas operações
        if (this._operation.length > 3){
            //pega o ultimo operador digitado
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        //else if para não sobreescrever a variavel. Se cair em um não cai no outro
        }else if (this._operation.length == 3){
            this._lastNumber = this.getLastItem(false);
        }

        //.join("") faz o mesmo que o .toString mas sem adicionar , entre os elementos
        //eval fará a operação dos valores na string (criada pelo join)
        let result = this.getResult();

        //para porcentagem
        if (last == '%'){
            //igual a ele mesmo divido por 100
            result /= 100;
            //atualiza os dados do operation
            this._operation = [result];

        }else{
            //atualiza o operation com o valor do result(operação dos dois números já digitados)
            this._operation = [result];
            //adiciona o último valor(operador) que estava no array de volta pro array
            if (last) this._operation.push(last);
        }

        //mostra no display o resultado
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true){
        let lastItem;

        //Exemplo base do for:
        //for(i = 0; i <= 100; i++)   => i começa em 0, vai até 100, de um em um(i++)

        
        //verifica qual o número está por último no array para exibilo na tela
        for (let i = this._operation.length-1; i >=0; i--){
            //se a ultima coisa a ser digitada não for um operador, atribui o valor dela em lastNumber
            if (this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }
        }

        //Mantem o ultimo operador ou numero que está na memória caso não encontre nenhum
        if (!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);

        //Para que inicie sempre com 0
        if(!lastNumber) lastNumber = 0;
        //exibe no display o ultimo numero digitado
        this.displayCalc = lastNumber;
    }

    isOperator(value){
        //indexOf vai percorrer o array comparando o value com o que temos dentro do array
        //Caso ache, irá retornar seu index(posição dentro do array)
        //Se não achar nada, retorna -1
        //Nessa expressão verificamos se o resultado é maior que -1, se sim, retorna true, se não, false
        return (['+','-','*','%','/'].indexOf(value) > -1);
    }

    addOperation(value){
        //se o ultima coisa digitada não for um número
        if (isNaN(this.getLastOperation())){
            if (this.isOperator(value)){
                //sendo o ultimo item no array for um operador e o valor(value) atual for um operador também
                //subistituimos o que está no array pelo value, trocando assim os operadores(- por +, por exemplo)
                this.setLastOperation(value);
            }else{
                //adiciona o valor ao array
                this.pushOperation(value);
                //para exibir no display desde a primeira vez que clicar em um número
                this.setLastNumberToDisplay();
            }

        //sendo um numero
        } else {
            if(this.isOperator(value)){
                //atualiza o valor
                this.pushOperation(value);
            }else{
                //converte tanto o numero como o value em string para fazer deles um só numero e não
                //varios numeros. Exemplo: Ao inves de ao digitar 9 duas vezes ele retornar 9 e depois 9, ele irá
                //retornar 99
                let newValue = this.getLastOperation().toString() + value.toString();
                //adiciona novo dado ao array e converte ele de string para numero
                this.setLastOperation(newValue);
            
                this.setLastNumberToDisplay();
            }

        }
    }

    setError(){
        this.displayCalc = "Error";
    }

    addDot(){

        let lastOperation = this.getLastOperation();

        /*Impede que sejam digitados mais que 1 ponto */
            //verifica se o lastOperation é uma string e da um split nela(separa os elementos em array)
            //da um indexOf pra ver se há um ponto nesse array. Caso haja, vai retornar algo igual ou maior a 0
            //porém, nesse caso verificamos se não há, por isso esperamos que retorne -1
            //assim colocamos somente um return para que nada seja feito, ou seja, não adicione outro ponto
            //pois já existe um
        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        /*Faz o . funcionar sem problemas*/
        //caso digite o . sem ter digitado nenhum número antes
        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        //caso já tenha digitado um número, o transforma em string para adicionar o .
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }

    execBtn(value){
        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot('.');
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            
            default:
                this.setError();
                break;
            
        }
    }

    initButtonsEvents(){
        //querySelectorAll trás todos que forem encontrados, se usasse só querySelector ele retornaria
        //só o primeiro que encontrasse
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        buttons.forEach((btn, index)=>{
            //drag é o evento de arrastar
            this.addEventListenerAll(btn, 'click drag', e=> {
                let textBtn = btn.className.baseVal.replace("btn-", "");
            
                this.execBtn(textBtn);
            
            });
            //adiciona cursor pointer
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });

    }


    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

//Sempre que criar um atributo privado é necessario criar um get(pra recuperar/exibir) e set(pra definir um novo valor) dele
//innerHTML pega o objeto e coloca uma informação lá dentro no formato html
    get displayTime(){
        return this._timeEl.innerHTML;
    }
    
    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }
    
    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){
        //para limitar a quantidade de caracteres no display
        if (value.toString().length > 10){
            this.setError();
            return
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}
