/**
 * Simple JavaScript Validation
 * Supporting Bootstrap 2-5 and FontAwesome 3-5
 * If using Bootstrap 5, jQuery is still required for other functions in library
 * https://github.com/GiancarloGomez/javascript.validation
 *
 * @requires    jQuery, Bootstrap 2+ and FontAwesome 3+
 * @author      Giancarlo Gomez
 */

/**
* Global Validate object which can be used to validate a string to a specified format
*/
var Validate = {
    'date': function(value){
        return !(/Invalid|NaN/).test(new Date(value));
    },
    'dateTime': function(value){
        return !(/Invalid|NaN/).test(new Date(value));
    },
    'email': function(value){
        return (/^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,})$/i).test(value);
    },
    'float': function(value){
        return (/^[\-+]?[0-9]*\.?[0-9]+$/).test(value);
    },
    'integer': function (value){
        return (/^\d+$/).test(value);
    },
    'slug': function(value) {
        return (/^[a-z0-9]{3,}(?:(-|_)[a-z0-9]+)*$/).test(value);
    },
    'slugWithPeriod': function(value) {
        return (/^[a-z0-9]{2,}(?:(-|\.|_)[a-z0-9]+)*$/).test(value);
    },
    // links for class or type validation
    'datepicker': function(value){
        return Validate.date(value);
    },
    'datetime': function(value){
        return Validate.date(value);
    },
    'number': function (value){
        return Validate.integer(value);
    },
    'time': function(value){
        return Validate.dateTime(value);
    },
    'timepicker': function(value){
        return Validate.dateTime(value);
    },
    'username': function(value) {
        return Validate.slugWithPeriod(value);
    }
};

/**
* Global FormButtons object which defines the class or id used by the submit and processing button holders
*/
var FormButtons = {
        "process"   : "frmPrc",
        "submit"    : "frmBtn"
    };

/**
* Pass in a form and bind the submit event to the validation process (validateForm)
*/
function simpleValidation(form,doAlert){
    if (form === undefined)
        return false;

    if (doAlert === undefined)
        doAlert = false;

    // continue
    window.jQuery(form).submit(function () {
        var o = {
                message : '',
                err     : [],
                checks  : []
            },
            me = window.jQuery(this);
        // loop thru each input
        o = validateForm(this);
        // add any settings that might exists in the forms data attributes
        o = window.jQuery.extend( o, me.data() );
        // run extra validation if exists
        try{
            var e = window[me.data('extend-validation')];
            if(typeof(e) === 'function'){
                o = e(me,o);
            }
        }
        catch(a){/* ignore error */}
        // notification or submit
        if (o.err.length) {
            o.form = this;
            // blur an input that might be focused
            me.find('input:focus').blur();
            if (doAlert){
                window.alert('Attention:' + o.message.replace(/<li>/gm,'\n').replace(/<\/li>/gm,''));
            } else {
                openDialog(o);
            }
            return false;
        } else {
            // handle the form buttons show and hide functionality
            formButtons(true,this);
            // submit form
            return true;
        }
    });
}

/**
* The validation process bound by simpleValidation or calling directly, requires passing a form
*/
function validateForm(form){
    var o = {
            message : '',
            err     : [],
            checks  : [],
            form    : form
        };

    window.jQuery(form).addClass('validated').find('.required input,.required select,.required textarea,input.required, select.required, textarea.required, [required]').each(function () {
        // get the type and name
        var me          = window.jQuery(this),
            type        = me.attr('type'),
            name        = me.attr('name'),
            label       = me.parents('.control-group, .form-group').find('label'),
            value       = '',
            isValid     = true,
            keysAsType  = ['email','number']; // used in validate key loop
        // skip me if I am disabled or I have a parent chosen container (chosen js)
        if (this.disabled || me.parents('.chosen-container').length)
            return;
        // null value fixed in jQuery 3+
        // adding an additional fix here for multiple choice selects to set as empty string or join array into string
        if ( me.prop('multiple') === true )
            value = me.val() === null ? "" : me.val().join(",");
        else
            value = me.val() ? me.val().trim() : '';
        // handle tinymce
        if (me.hasClass('mceEditor') && window.tinyMCE !== undefined ){
            // auto save mceEditor value back to textarea
            window.tinyMCE.get(this.id).save();
            // check value of field again
            value  = me.val().trim();
        }

        // loop thru our Validate keys (removed several lines from below)
        for (var key in Validate){
            if (me.hasClass(key) || ( keysAsType.indexOf(key) >= 0 && type === key )){
                isValid = Validate[key](value);
                break;
            }
        }

        // handle validation
        if (
                !isValid ||
                ((type === 'checkbox' || type === 'radio') && !window.jQuery('input[name='+name+']').is(':checked') && o.checks.indexOf(name) < 0) ||
                value === '' ||
                (me.hasClass('match') && me.data('match') && value !== window.jQuery('#' + me.data('match')).val()) ||
                (me.hasClass('regex') && me.data('regex') && !this.value.match(new RegExp(me.data('regex'))))
        ){
            if (value !== '' && me.data('regex-title') && !this.value.match(new RegExp(me.data('regex')))){
                o.message += '<li>' + me.data('regex-title') + '</li>';
            }else if (value !== '' && me.hasClass('match') && me.data('match-title')){
                o.message += '<li>' + me.data('match-title') + '</li>';
            }else if (me.data('title')){
                o.message += '<li>' + me.data('title') + '</li>';
            }else if (me.attr('title')){
                o.message += '<li>' + me.attr('title') + '</li>';
            }else{
                o.message += '<li>' +  (label.length === 0 ? name : label.text()) + ' is a required field</li>';
            }
            o.err.push(me);
            // push to the checks array so we only evaluate once
            o.checks.push(name);
        }
    });
    return o;
}

/**
* Checks if a dialog div exists and if not it creates it
*/
function createDialog(o){
    var dialog, dl, created = false;
    // set defaults
    o = setDialogDefaults(o);
    // look for dialog
    dialog = document.getElementById(o.dialogid);
    // create if not exists
    if (dialog === null){
        created = true;
        window.jQuery('body').append('<div id="' + o.dialogid + '"></div>');
    }
    // re-create if already open
    else if (dialog.style.display === "block") {
        created = true;
        window.jQuery("body")
            .find("#" + o.dialogid + ", .modal-backdrop").remove().end()
            .append('<div id="' + o.dialogid + '"></div>');
    }
    // if created lets set all required classes
    if (created === true){
        dl = window.jQuery("#" + o.dialogid).addClass("modal");
        // add fade class if set to fade
        if (o.dofade === true)
            dl.addClass("fade");
        // add dialog class here if using bootstrap 2, bootstrap 3 sets this in parseForBootstrap()
        if (o.dialogclass !== "" && getBootstrapVersion() < 3)
            dl.addClass(o.dialogclass);
    }
}

function getDismissModalAttribute(){
    return getBootstrapVersion() >= 5 ? 'data-bs-dismiss="modal"' : 'data-dismiss="modal"';
}

/**
* Create dialog header
*/
function createDialogHeader(o){
    var headingTag      = '',
        closerBefore    = '<a href="#" class="close" ' + getDismissModalAttribute() + '>&times;</a>',
        closerAfter     = '',
        bsVersion       = getBootstrapVersion();

    switch ( bsVersion ){
        case 2:
            headingTag = 'h3';
            break;
        case 3:
            headingTag = 'h4';
            break;
        default:
            headingTag   = 'h5';
            closerBefore = '';
            closerAfter  = '<button type="button" class="' + ( bsVersion >= 5 ? 'btn-' : '' ) + 'close" ' + getDismissModalAttribute() + ' aria-label="Close">' +
                            ( bsVersion < 5 ? '<span aria-hidden="true">&times;</span>' : '') +
                            '</button>';
            break;
    }
    return (o.noheader === false ?
                '<div class="modal-header">' +
                    closerBefore +
                    '<'+ headingTag + ' class="modal-title">' +
                        (o.header || 'Attention') +
                    '</'+ headingTag + '>' +
                    closerAfter +
                '</div>'
            :'');
}

/**
* Create dialog body
*/
function createDialogBody(o){
    var bodyClass   = (o.noerror === false ? 'text-error mb-0' :''),
        bodyStyle   = "",
        asList      = o.asList && o.message.indexOf('<li>') !== -1 && o.message.indexOf('<ul>') === -1,
        tag         = asList === true ? 'ul' : 'div',
        height      = 0;

    if (o.noheader === false)
        height += 70;
    if (o.nofooter === false)
        height += 70;

    // check for width/ height settings
    if (getBootstrapVersion() >= 3){
        // bs 3 the height and width is on the modal-body
        if (o.width !== 0)
            bodyStyle += 'width:' + o.width + 'px;';
        if (o.height !== 0)
            bodyStyle += 'height:' + (o.height - height) + 'px;';
    }
    else{
        if (o.maxheight === true)
            bodyStyle = "max-height:100% !important;";
        if (o.height !== 0)
            bodyStyle += 'height:' + (o.height - height) + 'px;';
    }

    if (bodyStyle !== '')
        bodyStyle = 'style="' + bodyStyle + '"';

   return  '<div class="modal-body"' + bodyStyle + '>' +
            '<'+ tag + ' class="' + bodyClass +'">' +
                o.message +
            '</' + tag + '>' +
            '</div>';
}

/**
* Create dialog footer
*/
function createDialogFooter(o,withActions){
    var str = '',
        fa  = getFontAwesomePrefix(),
        bsVersion = getBootstrapVersion(),
        hideClass =  bsVersion >= 4 ? 'd-none' : 'hide',
        buttonMargin =  bsVersion >= 5 ? ( o.cancelButtonLast ? 'me-1' : 'ms-1' ) :
                        bsVersion === 4 ? ( o.cancelButtonLast ? 'mr-1' : 'ml-1' ) :
                        '';

    if (o.nofooter !== true){
        str = '<div class="modal-footer">';
        // custom footer
        if (o.customfooter !== ''){
            str += o.customfooter;
        }
        else if (withActions === true)
        {
            str +=  '<div class="' + hideClass + '"><button class="btn ' + o.confirmButtonColorClass + '" disabled="disabled"><i class="'+ fa.required + fa.prefix + 'spinner ' + fa.prefix + 'spin"></i> Processing Request</button></div><div class="show">';
            // cancel button
            if ( !o.cancelButtonLast )
                str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" ' + getDismissModalAttribute() + '>' + o.cancelButtonText + '</a>';
            // include confirm button
            if ( o.includeconfirmbtn )
                str +='<a href="#" class="btn btn-confirm ' + o.confirmButtonColorClass + ' ' + buttonMargin + '">' + o.confirmButtonText + '</a>';
            if ( o.cancelButtonLast )
                str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" ' + getDismissModalAttribute() + '>' + o.cancelButtonText + '</a>';
            str += '</div>';
        }
        else
        {
            str += '<a href="#" class="btn ' + o.confirmButtonColorClass + '" ' + getDismissModalAttribute() + '>' + o.confirmText + '</a>';
        }
        str += '</div>';
    }
    return str;
}

/**
* Set dialog defaults required
*/
function setDialogDefaults(o){

    var defaults = {
            asList                  : true,             // this is used in createDialogBody to overwrite if the message should be a list regardless of content check
            background              : '',               // background color applied to modal-backdrop
            backdrop                : true,             // bs modal backdrop property - dostatic takes priority if sent in as true
            callback                : null,             // function to run on Action Dialog close
            cancelButtonColorClass  : 'btn-danger',     // Default class for Cancel Button
            cancelButtonText        : 'No',             // Default text for Cancel Button
            cancelButtonLast        : false,            // Set to true to place Cancel Button last
            confirmButtonColorClass : 'btn-primary',    // Default class for Confirmation Button
            confirmButtonText       : 'Yes',            // Default text for Confirmation Button on Action Dialog
            confirmText             : 'OK',             // Default text for Confirmation Button on Regular Dialog
            customfooter            : '',               // Custom Footer
            destroy                 : true,             // destroys div when closed
            dialogclass             : '',               // class that gets added to dialog div on BS2 and in modal-dialog on BS3+
            dialogid                : 'dialog',         // defines the id for the dialog
            dofade                  : true,             // animate when open
            dostatic                : false,            // modal - must close with click to button
            err                     : [],               // holds an array of the fields with errors
            form                    : null,             // holds the form element of the form currently being validated
            header                  : null,             // custom header string
            height                  : 0,                // height of dialog - applied differently depending on version
            includeconfirmbtn       : true,             // include confirm button on Action Dialog
            keyboard                : false,            // keyboard events
            maxheight               : false,            // bs version 2 property used with height
            message                 : '',               // message to display in modal
            noerror                 : false,            // If message is error - true sets text to red
            nofooter                : false,            // Remove footer
            noheader                : false,            // Remove header
            parent                  : null,             // Parent of element that called, can be self or id of a parent
            width                   : 0
        };

    return window.jQuery.extend( defaults, o );
}

/**
* Activates the dialog - all requirements and then opens
*/
function activateDialog(o,dl){
    // overwrite dimensions if passed (only bs2)
    if ( getBootstrapVersion() < 3 ){
        if (o.width !== 0)
            dl.css({'max-width': o.width,'width': o.width,'margin-left':-(o.width/2)});
        if (o.height !== 0)
            dl.css({'max-height':o.height,'height':o.height});
    }
    else if (o.width !== 0){
        if (o.width !== 0)
            dl.find('.modal-dialog').css({'max-width': o.width,'width': o.width});
    }

    // before opening modal lets check if there is another modal open
    // and if so overwrite the options to not have a backdrop
    var classCheck  = getBootstrapVersion() >= 4 ? '.modal.show' : '.modal.in';
    var activeModal = document.querySelector( classCheck );

    if ( activeModal ){
        // lets add a border to the dialog content to help show better
        // if stacked on top
            dl.find('.modal-content').addClass('shadow-sm border');
        // remove modal animation if existing one does not have it
        if ( !activeModal.classList.contains('fade') )
            dl.removeClass('fade');
        o.dostatic =
        o.backdrop = false;
    }

    // open modal
    dl.modal({
        backdrop    : o.dostatic === true ? 'static' : o.backdrop,
        keyboard    : o.keyboard
    });

    if ( getBootstrapVersion() >= 5 )
        dl.modal('show');

    // change color
    if (o.background !== ''){
        if (getBootstrapVersion() >= 3)
            dl.find(".modal-backdrop").css("background-color", o.background);
        else
            dl.next().css('background-color',o.background);
    }
    // fix for iphone view
    dl.on(getBootstrapEvent('shown'),function(){
        if (window.innerHeight <= 480)
            window.jQuery(this).css({top:window.scrollY+10});
    });
}

/**
* Show/Hide form process
*/
function formButtons(theState,theForm){
    var runGlobal = false;
    // this allows us to pass in and search for items with the class name instead (multiple forms in page way)
    if (theForm !== undefined) {
        // auto assign id if blank
        if (theForm.id === '')
            theForm.id = 'un_' + (new Date().getTime());
        runGlobal = window.jQuery('#' + theForm.id + ' .' + FormButtons.process).length === 0;
    }

    if (runGlobal === false && theForm !== undefined) {
        if (theState === true)
            showHide(theForm.id + ' .' + FormButtons.process, theForm.id + ' .' + FormButtons.submit);
        else
            showHide(theForm.id + ' .' + FormButtons.submit, theForm.id + ' .' + FormButtons.process);
    } else {
        if (theState === true)
            showHide(FormButtons.process, FormButtons.submit);
        else
            showHide(FormButtons.submit, FormButtons.process);
    }
}

/**
* Open a dialog with actions
*/
function openActionDialog(o){
    var d,dl;
    // set globals
    o = setDialogDefaults(o);
    // create dialog
    createDialog(o);
    // create dialog text
    d = createDialogHeader(o) + createDialogBody(o) + createDialogFooter(o,true);
    // insert dialog text
    dl = window.jQuery("#" + o.dialogid).html(parseForBootstrap(d,o,o));
    // activate the dialog
    activateDialog(o,dl);

    // CUSTOM PROPERTIES FOR THIS TYPE

    // add destroy on close
    if (o.destroy === true)
        dl.on(getBootstrapEvent('hidden'),function(){window.jQuery(this).remove();});

    // confirm button action
    dl.find('a.btn-confirm').click(function(){
        // hide/show buttons
        var btnProcess = getBootstrapVersion() >= 4 ?
                            dl.find('.modal-footer div.d-none') :
                            dl.find('.modal-footer div.hide'),
            btnSubmit  = dl.find('.modal-footer div.show');

        if (getBootstrapVersion() >= 4){
            btnProcess.removeClass('d-none');
            btnSubmit.addClass('d-none');
        }
        else if (getBootstrapVersion() === 3){
            btnProcess.removeClass('hide');
            btnSubmit.removeClass('show').addClass('hide');
        } else {
            btnProcess.show();
            btnSubmit.hide();
        }
        // is function
        if (o.callback && typeof(o.callback) === 'function'){
            o.callback(o.parent || dl);
        // is link
        }else if (o.parent !== null && typeof(o.parent) === 'object' && o.parent.href !== 'undefined'){
            if(o.parent.target.indexOf('blank') >= 0 || o.parent.target.indexOf('new') >= 0){
                var newWindow = window.open(o.parent.href, '_blank');
                newWindow.focus();
                dl.modal('hide');
            }else{
                window.location=o.parent.href;
            }
        // is form
        }else if (o.parent !== null){
            formButtons(true);
            var frm = document[o.parent] || document.getElementById(o.parent);
            if (frm !== undefined)
                frm.submit();
        }
        return false;
    });
}

/**
* Open a dialog
*/
function openDialog(o){
    var d,dl;
    // set globals
    o = setDialogDefaults(o);
    // create dialog
    createDialog(o);
    // create dialog text
    d = createDialogHeader(o) + createDialogBody(o) + createDialogFooter(o,false);
    // insert dialog text
    dl = window.jQuery("#" + o.dialogid).html(parseForBootstrap(d,o));
    // activate the dialog
    activateDialog(o,dl);

    // CUSTOM PROPERTIES FOR THIS TYPE
    if (o.err.length > 0 && o.form !== null){
        dl.on(getBootstrapEvent('hidden'),function(){
            formButtons(false,o.form);
            o.err[0].focus().select();
            if (o.destroy === true)
                window.jQuery(this).remove();
        });
    } else {
        // add destroy on close
        if (o.destroy === true)
            dl.on(getBootstrapEvent('hidden'),function(){window.jQuery(this).remove();});
    }
}

/**
* Gets the Font Awesome icon prefix to use
*/
function getFontAwesomePrefix(){
    var fa = {required:'',prefix:'icon-'};
    if (getFontAwesomeVersion() >= 4)
        fa = {required:'fa ',prefix:'fa-'};
    return fa;
}

/**
* Gets the event to listen for depending on Bootstrap Version
*/
function getBootstrapEvent(event){
    if (getBootstrapVersion() >= 3)
       event += '.bs.modal';
    return event;
}

/**
* Prepares a modal depending on Bootstrap Version
*/
function parseForBootstrap(d,o){
    // check if we define a bootstrap version and it is higher than or equal to 3
    if (getBootstrapVersion() >= 3)
        d = '<div class="modal-dialog ' + o.dialogclass + '"><div class="modal-content">' + d.replace('text-error','text-danger') + '</div></div>';
    return d;
}

/**
* Show/Hide elements - pass 2 elements and there view state will be toggled
*/
function showHide(a, b){
    if (getBootstrapVersion() >= 4){
        window.jQuery('#' + b).addClass('d-none'); window.jQuery('#' + a).removeClass('d-none');
    }
    else if (getBootstrapVersion() === 3){
        window.jQuery('#' + b).addClass('hide'); window.jQuery('#' + a).removeClass('hide');
    }
    else{
        window.jQuery('#' + b).hide(); window.jQuery('#' + a).show();
    }
}

/**
* Return Bootstrap Version defined by global variable BootstrapVersion
* defaults to 3
*/
function getBootstrapVersion(){
    return (typeof(BootstrapVersion) === 'number' ? BootstrapVersion : 3);
}

/**
* Return FontAwesome Version defined by global variable FontAwesomeVersion
* defaults to 4
*/
function getFontAwesomeVersion(){
    return (typeof(FontAwesomeVersion) === 'number' ? FontAwesomeVersion : 4);
}

window.jQuery(function(){
    // Simple form validation with modal
    window.jQuery('form.simple-validation').each(function(){
        simpleValidation(this,false);
    });
    // Simple form validation with alert
    window.jQuery('form.simple-validation-alert').each(function(){
        simpleValidation(this,true);
    });
});