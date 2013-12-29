 // ----------------------------------------------------------------------------
 // Validation - A simple validation library that requires jQuery and Bootstrap Modal (2.3.3+)
 // v1.0.1 - released 2013-12-28 18:31
 // Licensed under the MIT license.
 // https://github.com/GiancarloGomez/javascript.validation
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2013 Giancarlo Gomez
 // http://giancarlogomez.com/
 // ----------------------------------------------------------------------------

$(function() {
    $("form.simple-validation").each(function() {
        simpleValidation(this, false);
    });
    $("form.simple-validation-alert").each(function() {
        simpleValidation(this, true);
    });
});

var Validate = {
    "float": function(value) {
        return /^[\-+]?[0-9]*\.?[0-9]+$/.test(value);
    },
    integer: function(value) {
        return /^\d+$/.test(value);
    },
    email: function(value) {
        return /^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,4})$/i.test(value);
    },
    dateTime: function(value) {
        return !/Invalid|NaN/.test(new Date(value));
    },
    date: function(value) {
        return /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)?\d\d$/.test(value);
    },
    slug: function(value) {
        return /[\w]{3,}[\-]?$/.test(value) && !/\s/.test(value) && !/\./.test(value);
    }
};

function simpleValidation(form, doalert) {
    if (form === undefined) return false;
    if (doalert === undefined) doalert = false;
    $(form).submit(function() {
        var o = {
            message: "",
            err: [],
            checks: []
        };
        formButtons(true, this);
        o = validateForm(this);
        try {
            var e = window[$(this).data("extend-validation")];
            if (typeof e === "function") {
                o = e($(this), o);
            }
        } catch (a) {}
        if (o.err.length) {
            o.form = this;
            if (doalert) {
                alert("Attention:" + o.message.replace(/<li>/gm, "\n").replace(/<\/li>/gm, ""));
                formButtons(false, this);
            } else {
                openDialog(o);
            }
            return false;
        } else {
            return true;
        }
    });
}

function validateForm(form) {
    var o = {
        message: "",
        err: [],
        checks: [],
        form: form
    };
    $(form).find(".required input,.required select,.required textarea,input.required, select.required, textarea.required").each(function() {
        var t = $(this).attr("type"), n = $(this).attr("name"), v = $(this).parents(".control-group, .form-group").find("label");
        if (this.disabled) return;
        if ($(this).hasClass("mceEditor")) tinyMCE.get(this.id).save();
        if ((t === "checkbox" || t === "radio") && !$("input[name=" + n + "]").is(":checked") && o.checks.indexOf(n) < 0 || $(this).hasClass("email") && !Validate.email($(this).val()) || $(this).hasClass("integer") && !Validate.integer($(this).val()) || $(this).hasClass("float") && !Validate.float($(this).val()) || $(this).hasClass("timepicker") && !Validate.dateTime($(this).val()) || $(this).hasClass("datepicker") && !Validate.date($(this).val()) || $(this).hasClass("slug") && !Validate.slug($(this).val()) || $(this).val() === "" || $(this).hasClass("match") && $(this).attr("data-match") && $(this).val() !== $("#" + $(this).attr("data-match")).val() || $(this).hasClass("regex") && $(this).attr("data-regex") && !this.value.match(new RegExp($(this).attr("data-regex")))) {
            if ($(this).val() !== "" && $(this).attr("data-regex-title") && !this.value.match(new RegExp($(this).attr("data-regex")))) {
                o.message += "<li>" + $(this).attr("data-regex-title") + "</li>";
            } else if ($(this).val() !== "" && $(this).hasClass("match") && $(this).attr("data-match-title")) {
                o.message += "<li>" + $(this).attr("data-match-title") + "</li>";
            } else if ($(this).attr("title")) {
                o.message += "<li>" + $(this).attr("title") + "</li>";
            } else {
                o.message += "<li>" + (v.length === 0 ? n : v.text()) + " is a required field</li>";
            }
            o.err.push($(this));
            o.checks.push(n);
        }
    });
    return o;
}

function createDialog() {
    if (document.getElementById("dialog") === null) $("body").append('<div class="modal fade" id="dialog"></div>');
}

function formButtons(a, b) {
    var runGlobal = false;
    if (b !== undefined) {
        if (b.id === "") b.id = "un_" + new Date().getTime();
        runGlobal = $("#" + b.id + " .frmPrc").length === 0;
        if (runGlobal === false) {
            if (a === true) showHide(b.id + " .frmPrc", b.id + " .frmBtn"); else showHide(b.id + " .frmBtn", b.id + " .frmPrc");
        }
    }
    if (runGlobal === true) {
        if (a === true) showHide("frmPrc", "frmBtn"); else showHide("frmBtn", "frmPrc");
    }
}

function openActionDialog(o) {
    createDialog();
    var d = '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || "Attention") + "</h3></div>" + '<div class="modal-body"><div class="' + (o.noerror === undefined || o.noerror === false ? "text-error bold" : "") + '">' + o.message + "</div></div>" + '<div class="modal-footer"><div class="hide"><a href="#" class="btn btn-info nolink"><i class="icon-refresh icon-spin"></i> Processing Request</a></div>' + '<div class="show"><a href="#" class="btn btn-confirm ' + (o.confirmButtonColorClass === undefined ? "btn-primary" : o.confirmButtonColorClass) + '">' + (o.confirmButtonText === undefined ? "Yes" : o.confirmButtonText) + '</a><a href="#" class="btn btn-danger" data-dismiss="modal">' + (o.cancelButtonText === undefined ? "No" : o.cancelButtonText) + "</a></div></div>";
    var dl = $("#dialog").html(parseForBootStrap(d));
    if (o.width !== undefined) dl.css({
        "max-width": o.width,
        width: o.width,
        "margin-left": -(o.width / 2)
    });
    if (o.height !== undefined) dl.css({
        "max-height": o.height,
        height: o.height,
        "margin-top": -(o.height / 2)
    });
    dl.modal({
        backdrop: true,
        show: true,
        keyboard: true
    });
    if (o.destroy === undefined || o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
        $(this).remove();
    });
    dl.find("a.btn-confirm").click(function() {
        dl.find(".modal-footer div.show").hide();
        dl.find(".modal-footer div.hide").show();
        if (o.callback && typeof o.callback === "function") {
            o.callback(o.parent || dl);
        } else if (typeof o.parent === "object" && o.parent.href !== "undefined") {
            if (o.parent.target.indexOf("blank") >= 0 || o.parent.target.indexOf("new") >= 0) {
                var newWindow = window.open(o.parent.href, "_blank");
                newWindow.focus();
                dl.modal("hide");
            } else {
                location = o.parent.href;
            }
        } else if (document[o.parent] !== "undefined") {
            formButtons(true);
            document[o.parent].submit();
        }
        return false;
    });
}

function openDialog(o) {
    createDialog();
    var d = '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || "Attention") + "</h3></div>";
    if (o.noerror === undefined || o.noerror === false) d += '<div class="modal-body"><ul class="text-error bold">' + o.message + "</ul></div>"; else d += '<div class="modal-body" style="max-height:100% !important;">' + o.message + "</div>";
    if (o.nofooter === undefined && o.customfooter === undefined || o.nofooter === false) d += '<div class="modal-footer"><a href="#" class="btn btn-primary" data-dismiss="modal">OK</a></div>';
    if (o.customfooter !== undefined) d += '<div class="modal-footer">' + o.customfooter + "</div>";
    var dl = $("#dialog").html(parseForBootstrap(d));
    if (o.width !== undefined) dl.css({
        "max-width": o.width,
        width: o.width,
        "margin-left": -(o.width / 2)
    });
    if (o.height !== undefined) dl.css({
        "max-height": o.height,
        height: o.height,
        "margin-top": -(o.height / 2)
    });
    dl.modal({
        backdrop: true,
        show: true,
        keyboard: true
    });
    dl.on(getBootstrapEvent("shown"), function() {
        if (window.innerHeight <= 480) $(this).css({
            top: window.scrollY + 10
        });
    });
    if (o.err && o.form) dl.on(getBootstrapEvent("hidden"), function() {
        formButtons(false, o.form);
        o.err[0].focus().select();
        if (o.destroy === undefined || o.destroy === true) $(this).remove();
    }); else {
        if (o.destroy === undefined || o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
            $(this).remove();
        });
    }
}

function getBootstrapEvent(event) {
    if (typeof BootstrapVersion == "number" && BootstrapVersion >= 3) event += ".bs.modal";
    return event;
}

function parseForBootstrap(d) {
    if (typeof BootstrapVersion == "number" && BootstrapVersion >= 3) d = '<div class="modal-dialog"><div class="modal-content">' + d.replace("text-error", "text-danger") + "</div></div>";
    return d;
}

function showHide(a, b) {
    $("#" + b).hide();
    $("#" + a).show();
}