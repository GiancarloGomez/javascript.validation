/**
 * Simple JavaScript Validation
 * https://github.com/GiancarloGomez/javascript.validation
 *
 * @requires    jQuery and Bootstrap 2.3.2 or 3
 * @author      Giancarlo Gomez
 */

// !Validate
/**
* @hint Global Validate object which can be used to validate a string to a specified format
*/
var Validate = {
    'date': function(value){
        return !(/Invalid|NaN/).test(new Date(value));
    },
    'dateTime': function(value){
        return !(/Invalid|NaN/).test(new Date(value));
    },
    'email': function(value){
        return (/^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,4})$/i).test(value);
    },
    'float': function(value){
        return (/^[\-+]?[0-9]*\.?[0-9]+$/).test(value);
    },
    'integer': function (value){
        return (/^\d+$/).test(value);
    },
    'slug': function(value){
        // at least 3 alpha numerics no spaces and no periods
        return (/[\w]{3,}[\-]?$/).test(value) && !(/\s/).test(value) && !(/\./).test(value);
    }
};

/**
* @hint Pass in a form and bind the submit event to the validation process (validateForm)
*/
function simpleValidation(form,doalert){
    if (form === undefined)
        return false;

    if (doalert === undefined)
        doalert = false;

    // continue
    $(form).submit(function () {
        var o = {
            message : '',
            err     : [],
            checks  : []
        };
        // handle the form buttons show and hide functionality
        formButtons(true,this);
        // loop thru each input
        o = validateForm(this);
        // run extra validation if exists
        try{
            var e = window[$(this).data('extend-validation')];
            if(typeof(e) === 'function'){
                o = e($(this),o);
            }
        }
        catch(a){/* ignore error */}
        // notification or submit
        if (o.err.length) {
            o.form = this;
            // focus and select on required field
            if (doalert){
                window.alert('Attention:' + o.message.replace(/<li>/gm,'\n').replace(/<\/li>/gm,''));
                formButtons(false,this);
            } else {
                openDialog(o);
            }
            return false;
        } else {
            // submit form
            return true;
        }
    });
}

/**
* @hint The validation process bound by simpleValidation or calling directly, requires passing a form
*/
function validateForm(form){
    var o = {
            message : '',
            err     : [],
            checks  : [],
            form    : form
        };

    $(form).find('.required input,.required select,.required textarea,input.required, select.required, textarea.required').each(function () {
        // get the type and name
        var me      = $(this),
            type    = me.attr('type'),
            name    = me.attr('name'),
            label   = me.parents('.control-group, .form-group').find('label');
        // skip me if I am disabled
        if (this.disabled)
            return;
        // handle tinymce
        if (me.hasClass('mceEditor') && window.tinyMCE !== undefined )
            window.tinyMCE.get(this.id).save(); // auto save any mceEditor value back to textarea
        if (
                ((type === 'checkbox' || type === 'radio') && !$('input[name='+name+']').is(':checked') && o.checks.indexOf(name) < 0) ||
                (me.hasClass('email') && !Validate.email(me.val())) ||
                (me.hasClass('integer') && !Validate.integer(me.val())) ||
                (me.hasClass('float') && !Validate.float(me.val())) ||
                ((me.hasClass('timepicker') || me.hasClass('time')) && !Validate.dateTime(me.val())) ||
                ((me.hasClass('datepicker') || me.hasClass('date') || me.hasClass('datetime')) && !Validate.date(me.val())) ||
                (me.hasClass('slug') && !Validate.slug(me.val())) ||
                me.val() === '' ||
                (me.hasClass('match') && me.data('match') && me.val() !== $('#' + me.data('match')).val()) ||
                (me.hasClass('regex') && me.data('regex') && !this.value.match(new RegExp(me.data('regex'))))
        ){
            if (me.val() !== '' && me.data('regex-title') && !this.value.match(new RegExp(me.data('regex')))){
                o.message += '<li>' + me.data('regex-title') + '</li>';
            }else if (me.val() !== '' && me.hasClass('match') && me.data('match-title')){
                o.message += '<li>' + me.data('match-title') + '</li>';
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
* @hint Checks if a dialog div exists and if not it creates it
*/
function createDialog(o){
    // create if not exists
    if(document.getElementById('dialog') === null)
        $('body').append('<div id="dialog"></div>');
    // get it so we can add it and remove all classes to make sure we start fresh
    var dl = $('#dialog').removeClass().addClass('modal');
    // handle if fade on
    if (o.dofade === true)
        dl.addClass('fade');
    // handle if extra class
    if (o.dialogclass !== '')
        dl.addClass(o.dialogclass);
}

/**
* @hint Create dialog header
*/
function createDialogHeader(o){
    return (o.noheader === false ? '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || 'Attention') + '</h3></div>' : '');
}

/**
* @hint Create dialog body
*/
function createDialogBody(o,aslist){
    var str =  '<div class="modal-body" style="' + (o.maxheight === true ? 'max-height:100% !important;' : '') + '">';
    if (aslist === true && o.noerror === false)
        str += '<ul class="text-error bold">' + o.message + '</ul>';
    else
        str += '<div class="' + (o.noerror === false ? 'text-error bold' :'') +'">' + o.message + '</div>';
    str += '</div>';
    return str;
}

/**
* @hint Create dialog footer
*/
function createDialogFooter(o,withactions){
    var str = '<div class="modal-footer">',
        fa  = getFontAwesomePrefix();

    if (withactions === true)
    {
        str +=  '<div class="hide"><a href="#" class="btn btn-info nolink"><i class="'+ fa.required + fa.prefix + 'refresh ' + fa.prefix + 'spin"></i> Processing Request</a></div><div class="show">';
        // include confirm button
        if (o.includeconfirmbtn === true) {
            str +='<a href="#" class="btn btn-confirm ' + o.confirmButtonColorClass + '">' + o.confirmButtonText + '</a>';
        }
        // cancel button
        str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" data-dismiss="modal">' + o.cancelButtonText + '</a></div>';
    }
    else if (o.nofooter === false)
    {
        str += '<a href="#" class="btn ' + o.confirmButtonColorClass + '" data-dismiss="modal">OK</a>';
    }
    // custom footer
    if (o.customfooter !== '')
        str += o.customfooter;
    str += '</div>';
    return str;
}

/**
* @hint Set dialog defaults required
*/
function setDialogDefaults(o){

    var defaults = {
            background              : '',
            callback                : null,
            cancelButtonColorClass  : 'btn-danger',
            cancelButtonText        : 'No',
            confirmButtonColorClass : 'btn-primary',
            confirmButtonText       : 'Yes',
            customfooter            : '',
            destroy                 : true,
            dialogclass             : '',
            dofade                  : true,
            dostatic                : false,
            err                     : [],
            form                    : null,
            height                  : 0,
            includeconfirmbtn       : true,
            keyboard                : false,
            maxheight               : false,
            message                 : '',
            noerror                 : false,
            nofooter                : false,
            noheader                : false,
            parent                  : null,
            width                   : 0
        };

    return $.extend( defaults, o );
}

/**
* @hint Activates the dialog - all requirements and then opens
*/
function activateDialog(o,dl){
    // overwrite dimensions if passed
    if (o.width !== 0)
        dl.css({'max-width': o.width,'width': o.width,'margin-left':-(o.width/2)});
    if (o.height !== 0)
        dl.css({'max-height':o.height,'height':o.height,'margin-top':-(o.height/2)});
    // open modal
    if (o.dostatic === true)
        dl.modal({backdrop:'static',show:true,keyboard:o.keyboard});
    else
        dl.modal({backdrop:true,show:true,keyboard:o.keyboard});
    // change color
    if (o.background !== '')
        dl.next().css('background-color',o.background);
    // fix for iphone view
    dl.on(getBootstrapEvent('shown'),function(){
        if (window.innerHeight <= 480)
            $(this).css({top:window.scrollY+10});
    });
}

/**
* @hint Show/Hide form process
*/
function formButtons(a,b){
    var runGlobal = false;
    // this allows us to pass in and search for items with the class name instead (multiple forms in page way)
    if (b !== undefined) {
        // auto assign id if blank
        if (b.id === '')
            b.id = 'un_' + (new Date().getTime());
        runGlobal = $('#' + b.id + ' .frmPrc').length === 0;
        if (runGlobal === false) {
            if (a === true)
                showHide(b.id + ' .frmPrc', b.id + ' .frmBtn');
            else
                showHide(b.id + ' .frmBtn', b.id + ' .frmPrc');
        }
    }
    if (runGlobal === true) {
        if (a === true)
            showHide('frmPrc', 'frmBtn');
        else
            showHide('frmBtn', 'frmPrc');
    }
}

/**
* @hint Open a dialog with actions
*/
function openActionDialog(o){
    var d,dl;
    // set globals
    o = setDialogDefaults(o);
    // create dialog
    createDialog(o);
    // create dialog text
    d = createDialogHeader(o) + createDialogBody(o,false) + createDialogFooter(o,true);
    // insert dialog text
    dl = $('#dialog').html(parseForBootstrap(d));
    // activate the dialog
    activateDialog(o,dl);

    // CUSTOM PROPERTIES FOR THIS TYPE

    // add destroy on close
    if (o.destroy === true)
        dl.on(getBootstrapEvent('hidden'),function(){$(this).remove();});

    // confirm button action
    dl.find('a.btn-confirm').click(function(){
        // hide/show buttons
        dl.find('.modal-footer div.show').hide();
        dl.find('.modal-footer div.hide').show();
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
        }else if (o.parent !== null && document[o.parent] !== 'undefined'){
            formButtons(true);
            document[o.parent].submit();
        }
        return false;
    });
}

/**
* @hint Open a dialog
*/
function openDialog(o){
    var d,dl;
    // set globals
    o = setDialogDefaults(o);
    // create dialog
    createDialog(o);
    // create dialog text
    d = createDialogHeader(o) + createDialogBody(o,true) + createDialogFooter(o,false);
    // insert dialog text
    dl = $('#dialog').html(parseForBootstrap(d));
    // activate the dialog
    activateDialog(o,dl);

    // CUSTOM PROPERTIES FOR THIS TYPE

    if (o.err.length > 0 && o.form !== null){
        dl.on(getBootstrapEvent('hidden'),function(){
            formButtons(false,o.form);
            o.err[0].focus().select();
            if (o.destroy === true)
                $(this).remove();
        });
    } else {
        // add destroy on close
        if (o.destroy === true)
            dl.on(getBootstrapEvent('hidden'),function(){$(this).remove();});
    }
}

/**
* @hint Gets the Font Awesome icon prefix to use 
*/
function getFontAwesomePrefix(){
    var fa = {required:'',prefix:'icon-'};
    if (typeof(FontAwesomeVersion) === 'number' && FontAwesomeVersion >= 4)
        fa = {required:'fa ',prefix:'fa-'};
    return fa;
}

/**
* @hint Gets the event to listen for depending on Bootstrap Version
*/
function getBootstrapEvent(event){
    if (typeof(BootstrapVersion) === 'number' && BootstrapVersion >= 3)
       event += '.bs.modal';
    return event;
}

/**
* @hint Prepares a modal depending on Bootstrap Version
*/
function parseForBootstrap(d){
// check if we define a bootstrap version and it is higher than or equal to 3
    if (typeof(BootstrapVersion) === 'number' && BootstrapVersion >= 3)
        d = '<div class="modal-dialog"><div class="modal-content">' + d.replace('text-error','text-danger') + '</div></div>';
    return d;
}

/**
* @hint Show/Hide elements - pass 2 elements and there view state will be toggled
*/
function showHide(a, b) { $('#' + b).hide(); $('#' + a).show(); }

// !Initialize
$(function(){
    // !Simple form validation with modal
    $('form.simple-validation').each(function(){
        simpleValidation(this,false);
    });
    // !Simple form validation with alert
    $('form.simple-validation-alert').each(function(){
        simpleValidation(this,true);
    });
});
