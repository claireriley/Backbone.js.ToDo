'use strict';// strict mode prevents certain actions from being taken, throws more exceptions, prevents/throws errors, disables confusing/poorly-thought-out features

var app = {}; // create namespace for our app

// Models
// ToDo Model Creation
app.Todo = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  }
});
