# JavaScript.Validation
A simple validation library that requires jQuery, Bootstrap 2+ (w/ Modal JS) and FontAwesome 3+

## Specifying Bootstrap and FontAwesome Versions
The library references two global variables which it uses to build the modal and rendering icons. The variables are `BootstrapVersion` which defaults to 3 and `FontAwesomeVersion` which defaults to 4. If using an earlier versions simply create the global variables in your document as follows.
```javascript
   var BootstrapVersion = 2,
       FontAwesomeVersion = 3;
```

## How to use
You can add validation to any form by adding either of the following classes.
* `simple-validation` => opens a modal
* `simple-validation-alert` => opens an alert

The form looks for input fields with a `required` class or if it is a child of a container with a `required` class. The example below shows a required email field. I tend to use the `required` class in the parent element as it allows be to style the `label` as I choose using CSS but this would also work if you simply added the `required` class to the input. Also, since the type of the field is `email`, the library will know to validate as an email (this can also be done on text elements by adding a class of `email`).
```html
<div class="form-group required">
	<label for="emailaddress" class="control-label">Email</label>
	<input type="email" class="form-control" id="emailaddress" placeholder="Enter email" data-title="Please enter a valid Email">
</div>
```

## Modals
The library also includes some modal building functions that will create a regular modal and an action modal that can contain a call back based on the user's response. These functions are `openDialog` and `openActionDialog`. Below are some simple examples on how to use.
```javascript
// a simple dialog
openDialog({
	message:'Hello World'
});
// an action dialog with a callback
openActionDialog({
    noerror     : true,
    message     : 'Are you sure you want to process the callback?',
 	callback : function(theModal){
    	alert('Something could happen in here.');
    	theModal.modal('hide');
  }
});
```

## Example @ CodePen
You can play with this [CodePen](http://codepen.io/GiancarloGomez/pen/PZBvBN)

## Support
I know my read me does not give much insight to the library as a whole but it is quite easy to read thru the code and see what it can and can not do. Regardless, if you have a question feel free to contact me.