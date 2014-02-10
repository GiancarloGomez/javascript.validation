/**
 * Simple JavaScript Validation
 * https://github.com/GiancarloGomez/javascript.validation
 *
 * @requires    jQuery and Bootstrap 2.3.2 or 3
 * @author      Giancarlo Gomez
 */

var Validate = {
    'float': function(value){
        return (/^[\-+]?[0-9]*\.?[0-9]+$/).test(value);
    },
    'integer' : function (value){
        return (/^\d+$/).test(value);
    },
    'email' : function(value){
        return (/^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,4})$/i).test(value);
    },
    'dateTime' : function(value){
        return !(/Invalid|NaN/).test(new Date(value));
    },
    'date' : function(value){
        return (/^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)?\d\d$/).test(value);
    },
    'slug' : function(value){
        // at least 3 alpha numerics no spaces and no periods
        return (/[\w]{3,}[\-]?$/).test(value) && !(/\s/).test(value) && !(/\./).test(value);
    }
};

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
        }catch(a){
            // console.log(a);
        }
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

// function validate the fields
function validateForm(form){
    var o = {
            message : '',
            err     : [],
            checks  : [],
            form    : form
        };

    $(form).find('.required input,.required select,.required textarea,input.required, select.required, textarea.required').each(function () {
        // get the type and name
        var t = $(this).attr('type'),
            n = $(this).attr('name'),
            v = $(this).parents('.control-group, .form-group').find('label');
        // skip me if I am disabled
        if (this.disabled)
            return;
        // handle tinymce
        if ($(this).hasClass('mceEditor'))
            tinyMCE.get(this.id).save(); // auto save any mceEditor value back to textarea
        if (
                ((t === 'checkbox' || t === 'radio') && !$('input[name='+n+']').is(':checked') && o.checks.indexOf(n) < 0) ||
                ($(this).hasClass('email') && !Validate.email($(this).val())) ||
                ($(this).hasClass('integer') && !Validate.integer($(this).val())) ||
                ($(this).hasClass('float') && !Validate.float($(this).val())) ||
                ($(this).hasClass('timepicker') && !Validate.dateTime($(this).val())) ||
                ($(this).hasClass('datepicker') && !Validate.date($(this).val())) ||
                ($(this).hasClass('slug') && !Validate.slug($(this).val())) ||
                $(this).val() === '' ||
                ($(this).hasClass('match') && $(this).attr('data-match') && $(this).val() !== $('#' + $(this).attr('data-match')).val()) ||
                ($(this).hasClass('regex') && $(this).attr('data-regex') && !this.value.match(new RegExp($(this).attr('data-regex'))))
        ){
            if ($(this).val() !== '' && $(this).attr('data-regex-title') && !this.value.match(new RegExp($(this).attr('data-regex')))){
                o.message += '<li>' + $(this).attr('data-regex-title') + '</li>';
            }else if ($(this).val() !== '' && $(this).hasClass('match') && $(this).attr('data-match-title')){
                o.message += '<li>' + $(this).attr('data-match-title') + '</li>';
            }else if ($(this).attr('title')){
                o.message += '<li>' + $(this).attr('title') + '</li>';
            }else{
                o.message += '<li>' +  (v.length === 0 ? n : v.text()) + ' is a required field</li>';
            }
            o.err.push($(this));
            // push to the checks array so we only evaluate once
            o.checks.push(n);
        }
    });
    return o;
}

// make sure dialog exists
function createDialog(dofade){
    if(dofade === undefined)
        dofade = true;
    if(document.getElementById('dialog') === null)
        $('body').append('<div class="modal' +(dofade === true ? ' fade':'') + '" id="dialog"></div>');
    else
        $('#dialog').each(function(){ if (dofade === true){$(this).addClass('fade');}else{$(this).removeClass('fade');}});
}

// handle form buttons display
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

// open a dialog with actions
function openActionDialog(o){
    if(o.dofade === undefined)
        o.dofade = true;
    createDialog(o.dofade);
    // new globals
    if (o.includeconfirmbtn === undefined)
        o.includeconfirmbtn = true;
    if (o.noheader === undefined)
        o.noheader = false;
    // create dialog text
    var d = (o.noheader === false ? '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || 'Attention') + '</h3></div>' : '')+
            '<div class="modal-body"><div class="' + ((o.noerror === undefined || o.noerror === false) ? 'text-error bold' :'') +'">' + o.message + '</div></div>' +
            '<div class="modal-footer"><div class="hide"><a href="#" class="btn btn-info nolink"><i class="icon-refresh icon-spin"></i> Processing Request</a></div>' +
            '<div class="show">';
    if (o.includeconfirmbtn) {
        d +='<a href="#" class="btn btn-confirm ' + (o.confirmButtonColorClass === undefined ? 'btn-primary': o.confirmButtonColorClass) + '">' +
            (o.confirmButtonText === undefined ? 'Yes' : o.confirmButtonText) +
            '</a>';
    }
    d += '<a href="#" class="btn btn-danger" data-dismiss="modal">' +
         (o.cancelButtonText === undefined ? 'No' : o.cancelButtonText) +
         '</a></div></div>';
    // open dialog
    var dl = $('#dialog').html(parseForBootstrap(d));
    // overwrite dimensions if passed
    if (o.width !== undefined)
        dl.css({'max-width': o.width,'width': o.width,'margin-left':-(o.width/2)});
    if (o.height !== undefined)
        dl.css({'max-height':o.height,'height':o.height,'margin-top':-(o.height/2)});
    // open modal
    dl.modal({backdrop:true,show:true,keyboard:true});
    // add destroy on close
    if (o.destroy === undefined || o.destroy === true)
        dl.on(getBootstrapEvent('hidden'),function(){$(this).remove();});

    dl.find('a.btn-confirm').click(function(){
        // hide/show buttons
        dl.find('.modal-footer div.show').hide();
        dl.find('.modal-footer div.hide').show();
        // is function
        if (o.callback && typeof(o.callback) === 'function'){
                o.callback(o.parent || dl);
        // is link
        }else if (typeof(o.parent) === 'object' && o.parent.href !== 'undefined'){
            if(o.parent.target.indexOf('blank') >= 0 || o.parent.target.indexOf('new') >= 0){
                var newWindow = window.open(o.parent.href, '_blank');
                newWindow.focus();
                dl.modal('hide');
            }else{
                window.location=o.parent.href;
            }
        // is form
        }else if (document[o.parent] !== 'undefined'){
            formButtons(true);
            document[o.parent].submit();
        }
        return false;
    });
}

// open regular dialog
function openDialog(o){
    if(o.dofade === undefined)
        o.dofade = true;
    createDialog(o.dofade);
    // new globals
    if (o.noheader === undefined)
        o.noheader = false;
    // create dialog text
    var d = (o.noheader === false ? '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || 'Attention') + '</h3></div>' : '');
    if (o.noerror === undefined || o.noerror === false)
        d += '<div class="modal-body"><ul class="text-error bold">' + o.message + '</ul></div>';
    else
        d += '<div class="modal-body" style="max-height:100% !important;">' + o.message + '</div>';
    if ((o.nofooter === undefined && o.customfooter === undefined) || o.nofooter === false)
        d += '<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal">OK</a></div>';
    if (o.customfooter !== undefined)
        d += '<div class="modal-footer">' + o.customfooter + '</div>';
    // open dialog
    var dl = $('#dialog')
            .html(parseForBootstrap(d));
    // overwrite dimensions if passed
    if (o.width !== undefined)
        dl.css({'max-width': o.width,'width': o.width,'margin-left':-(o.width/2)});
    if (o.height !== undefined)
        dl.css({'max-height':o.height,'height':o.height,'margin-top':-(o.height/2)});
    // open modal
    dl.modal({backdrop:true,show:true,keyboard:true});
    // fix for iphone view
    dl.on(getBootstrapEvent('shown'),function(){
        if (window.innerHeight <= 480)
            $(this).css({top:window.scrollY+10});
    });
    if (o.err && o.form)
        dl.on(getBootstrapEvent('hidden'),function(){
            formButtons(false,o.form);
            o.err[0].focus().select();
            if (o.destroy === undefined || o.destroy === true)
            $(this).remove();
        });
    else{
        // add destroy on close
        if (o.destroy === undefined || o.destroy === true)
            dl.on(getBootstrapEvent('hidden'),function(){$(this).remove();});
    }
}

function getBootstrapEvent(event){
    if (typeof(BootstrapVersion) === 'number' && BootstrapVersion >= 3)
       event += '.bs.modal';
    return event;
}

function parseForBootstrap(d){
// check if we define a bootstrap version and it is higher than or equal to 3
    if (typeof(BootstrapVersion) === 'number' && BootstrapVersion >= 3)
        d = '<div class="modal-dialog"><div class="modal-content">' + d.replace('text-error','text-danger') + '</div></div>';
    return d;
}

// showHide function - pass 2 id's and there view state will be toggled
function showHide(a, b) { $('#' + b).hide(); $('#' + a).show(); }

// initialize
$(function(){
    // simple form validation
    $('form.simple-validation').each(function(){
        simpleValidation(this,false);
    });
    $('form.simple-validation-alert').each(function(){
        simpleValidation(this,true);
    });
});