class CalcController{

    constructor(){
        //usando this. permite o uso das variaveis em outros lugares
        //this._ significa que o atributo é privado
        
        //Pega os elementos do html e coloca nas variaveis
        this._locale = 'en-us';
        this._operation = [];
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
    }

    /*Tudo que acontece quando inicia a calculadora*/
    initialize(){
        //Responsavel pela data e hora
        this.setDisplayDateTime();
        setInterval(()=>{
            this.setDisplayDateTime();
        }, 1000);
        //Para o display começar exibindo o 0
        this.setLastNumberToDisplay();
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
        this._operation.push(value);

        if (this._operation.length > 3){

            this.calc();
        }
    }

    calc(){
        //pega o ultimo operador digitado
        let last = this._operation.pop();

        //.join("") faz o mesmo que o .toString mas sem adicionar , entre os elementos
        //eval fará a soma dos valores na string
        let result = eval(this._operation.join(""));

        if (last == '%'){

            result /= 100;

            this._operation = [result];

        }else{
            //atualiza o _operation com o valor do result(operação dos dois números já digitados) e adiciona
            //o último valor(operador) que estava no array, agora sobre a variavel last
            this._operation = [result, last];
        }

        //mostra no display o resultado
        this.setLastNumberToDisplay();
    }

    setLastNumberToDisplay(){
        let lastNumber;

        //Exemplo base do for:
        //for(i = 0; i <= 100; i++)   => i começa em 0, vai até 100, de um em um(i++)

        //verifica qual o número está por último no array para exibilo na tela
        for (let i = this._operation.length-1; i >=0; i--){
            //se a ultima coisa a ser digitada não for um operador, atribui o valor dela em lastNumber
            if (!this.isOperator(this._operation[i])){
                lastNumber = this._operation[i];
                break;
            }
        }

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
            }else if(isNaN(value)){
                console.log('outra coisa', value);
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
                this.setLastOperation(parseInt(newValue));
            
                this.setLastNumberToDisplay();
            }

        }
    }

    setError(){
        this.displayCalc = "Error";
    }

    execBtn(value){
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

                break;
            case 'ponto':
                this.addOperation('.');
                break;

            case '0':
                console.log(this._operation);
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
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}
