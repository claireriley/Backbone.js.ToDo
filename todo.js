'use strict'; // strict mode prevents certain actions from being taken, throws more exceptions, prevents/throws errors, disables confusing/poorly-thought-out features


var app = {}; // create namespace for our app

// Models
// ToDo Model Creation
app.Todo = Backbone.Model.extend({
  defaults: { // base vals
    title: '',
    completed: false
  },
  toggle: function(){
    this.save({ completed: !this.get('completed')});
  }
});

// Collections
app.TodoList = Backbone.Collection.extend({
  model: app.Todo,
  localStorage: new Store("backbone-todo"),
  completed: function() {
    return this.filter(function( todo ) {
      return todo.get('completed');
    });
  },
  remaining: function() {
    return this.without.apply( this, this.completed() );
  }      
});

// instance of the Collection
app.todoList = new app.TodoList();

// Views
// renders individual todo items list
app.TodoView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),
  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this; // enables chained calls
  },
  initialize: function(){
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this); // remove: Convenience Backbone's function for removing the view from the DOM.
  },      
  events: {
    'dblclick label' : 'edit',
    'keypress .edit' : 'updateOnEnter',
    'blur .edit' : 'close',
    'click .toggle': 'toggleCompleted',
    'click .destroy': 'destroy'
  },
  edit: function(){
    this.$el.addClass('editing');
    this.input.focus();
  },
  close: function(){
    var value = this.input.val().trim();
    if(value) {
      this.model.save({title: value});
    }
    this.$el.removeClass('editing');
  },
  updateOnEnter: function(e){
    if(e.which == 13){
      this.close();
    }
  },
  toggleCompleted: function(){
    this.model.toggle();
  },
  destroy: function(){
    this.model.destroy();
  }      
});

// renders the full list of todo items calling TodoView for each
app.AppView = Backbone.View.extend({
  el: '#todoapp',
  initialize: function () {
    this.input = this.$('#new-todo');
    app.todoList.on('add', this.addAll, this);
    app.todoList.on('reset', this.addAll, this);
    app.todoList.fetch(); // loads list from local storage
  },
  events: {
    'keypress #new-todo': 'createTodoOnEnter'
  },
  createTodoOnEnter: function(e){
    if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
      return;
    }
    app.todoList.create(this.newAttributes()); // creates new todo list
    this.input.val(''); // refreshes input box
  },
  addOne: function(todo){
    var view = new app.TodoView({model: todo});
    $('#todo-list').append(view.render().el); // renders view with appended items
  },
  addAll: function(){
    this.$('#todo-list').html(''); // clean the todo list
    // filter todo item list
    switch(window.filter){
      case 'pending':
        _.each(app.todoList.remaining(), this.addOne);
        break;
      case 'completed':
        _.each(app.todoList.completed(), this.addOne);
        break;            
      default:
        app.todoList.each(this.addOne, this);
        break;
    }
  },
  newAttributes: function(){
    return {
      title: this.input.val().trim(), // title of item
      completed: false // item initialized as not completed or false
    }
  }
});

// Routers

app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params) {
    console.log('app.router.params = ' + params);
    window.filter = params.trim() || '';
    app.todoList.trigger('reset');
  }
});     

// Initializers

app.router = new app.Router();
Backbone.history.start();    
app.appView = new app.AppView(); 
