var budgetContorller = (function () {

  var Expense = function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage=function(totalIncome){
    if (totalIncome>0) {
      this.percentage = Math.round((this.value / totalIncome)*100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id,description,value){
    this.id=id;
    this.description=description;
    this.value=value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum+=cur.value;
    });
    data.totals[type]=sum;
  };

  var data = {
    allItems:{
      exp:[],
      inc:[]
    },
    totals:{
      exp:0,
      inc:0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type,des,val){

      var newItem,ID;

      //create new ID
      if (ID=data.allItems[type].length>0) {
        ID=data.allItems[type][data.allItems[type].length-1].id + 1;
      }else{
        ID=0;
      }


      //create new item based on type('exp'or'inc')
      if(type==='exp'){
        newItem = new Expense(ID,des,val);
      }
      else if (type==='inc') {
        newItem = new Income(ID,des,val);
      }

      //push into data object
      data.allItems[type].push(newItem);

      //return newly created element
      return newItem;
    },

    deleteItem:function(type,id){
      var ids,index;
    ids = data.allItems[type].map(function(current){
      return current.id;
    });

    index = ids.indexOf(id);

    if (index!==-1) {
      data.allItems[type].splice(index,1);
    }
    },

    calculateBudget:function(){
      //calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the percentage of income that we spent
      if (data.totals.inc>0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }else {
        data.percentage= -1;
      }

    },

    calculatePercentages:function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages:function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget:function(){
      return {
        budget:data.budget,
        totalInc:data.totals.inc,
        totalExp:data.totals.exp,
        percentage:data.percentage

      }
    },

    testing:function(){
      console.log(data);
    }
  }

})();




var UIController = (function(){

  var DOMstrings = {
    type:".add__type",
    description:".add__description",
    value:".add__value",
    add:".add__btn",
    incomeContainer:'.income__list',
    expensesContainer:'.expenses__list',
    budgetLabel:'.budget__value',
    incomeLabel:'.budget__income--value',
    expensesLabel:'.budget__expenses--value',
    percentageLabel:'.budget__expenses--percentage',
    container:'.container',
    expensesPercLabel:'.item__percentage'
  };

  //loops over a nodelist like a foreach loop
  var nodeListForEach = function(list,callback){
    for (var i = 0; i < list.length; i++) {
      callback(list[i],i);
    }
  };

  return {
    getInput:function () {
      return {
        type:document.querySelector(DOMstrings.type).value,
        description:document.querySelector(DOMstrings.description).value,
        value:parseFloat(document.querySelector(DOMstrings.value).value)
      }
    },

    changedType:function(){
      var changedItems = document.querySelectorAll(DOMstrings.type + ',' + DOMstrings.description + ',' + DOMstrings.value);
      nodeListForEach(changedItems,function(cur){
        cur.classList.toggle('red-focus');
      })
      document.querySelector(DOMstrings.add).classList.toggle('red');
    },

    addListItem:function(obj,type){
      var html,newHtml,element;
      //create html string with placeholder text

      if(type==='inc'){
        element=DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      else if (type==='exp') {
        element=DOMstrings.expensesContainer;
        html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace the placeholder text with actual data from the object
      newHtml=html.replace('%id%',obj.id);
      newHtml=newHtml.replace('%description%',obj.description);
      newHtml=newHtml.replace('%value%',obj.value);
      //insert the html to the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
    },

    deleteListItem:function(selectorID){
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields:function(){
    var fields,fieldsArr;

    fields =  document.querySelectorAll(DOMstrings.description + ", " + DOMstrings.value);
    fieldsArr = Array.prototype.slice.call(fields);
    fieldsArr.forEach(function(current,index,array){
      current.value="";
    });
    fieldsArr[0].focus();
    },

    displayBudget:function(obj){
      document.querySelector(DOMstrings.budgetLabel).textContent=obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent=obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent=obj.totalExp;
      if (obj.percentageLabel>0) {
        document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + '%';
      }
      else {
        document.querySelector(DOMstrings.percentageLabel).textContent='---';
      }

    },

    displayPercentages:function(percentages){
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields,function(current,index){
        if (percentages[index]>0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = "---";
        }

      });
    },

    formatNumber:function(num,type){
      /*
      + or - before the number
      2 decimal points
      comma separating the thousands
      */
    },

    //returns all the classes from the html that we need instead of repeating it all the time in the code
    getDOMstrings: function(){
      return DOMstrings;
    }

  };

})();




var controller = (function(budgetCtrl,UICtrl){


  var setupEventListeners = function () {

    var DOM = UIController.getDOMstrings();

    document.querySelector(DOM.add).addEventListener('click',ctrlAddItem);

    document.addEventListener('keypress',function(e){
      if (e.wich==13||e.keyCode==13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(DOM.type).addEventListener('change',UICtrl.changedType);
  };


  var updateBudget = function(){
    //calculate the budget
    budgetCtrl.calculateBudget();
    //return the budget
    var budget = budgetCtrl.getBudget();
    //display the budget on the ui
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    //calculate percentages
    budgetCtrl.calculatePercentages();
    //read percentages from the controller
    var percentages = budgetCtrl.getPercentages();
    //update the ui with the percentages
    UICtrl.displayPercentages(percentages);
    console.log(percentages);
  };

  var ctrlAddItem = function (){
    var input,newItem;
    //get input data
    input = UIController.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value!==0) {
      //add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type,input.description,input.value);
      //add item to the UI
      UICtrl.addListItem(newItem,input.type);
      //clear the fields
      UICtrl.clearFields();
      //calculate and update budget
      updateBudget();
      //calculate and update percentages
      updatePercentages();
    }

  };

  var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    //inc-1
    if (itemID) {
      splitID = itemID.split('-');
      type=splitID[0];
      ID=parseInt(splitID[1]);
    }
    //delete the item from the data object
    budgetCtrl.deleteItem(type,ID)
    //delete the item from the UI
    UICtrl.deleteListItem(itemID);
    //update and show the new budget
    updateBudget();
    //calculate and update percentages
    updatePercentages();
  };

  return {
    init: function(){
      UICtrl.displayBudget({
        budget:0,
        totalInc:0,
        totalExp:0,
        percentage:-1
      });
      setupEventListeners();
    }
  }

})(budgetContorller,UIController);

controller.init();
