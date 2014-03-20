 // ----------------------------------------------------------------------------
 // Validation - A simple validation library that requires jQuery and Bootstrap Modal (2.3.3+)
 // v1.0.1 - released 2014-03-20 14:17
 // Licensed under the MIT license.
 // https://github.com/GiancarloGomez/javascript.validation
 // ----------------------------------------------------------------------------
 // Copyright (C) 2010-2014 Giancarlo Gomez
 // http://giancarlogomez.com/
 // ----------------------------------------------------------------------------

var Validate = {
    date: function(value) {
        return /^(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)?\d\d$/.test(value);
    },
    dateTime: function(value) {
        return !/Invalid|NaN/.test(new Date(value));
    },
    email: function(value) {
        return /^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,4})$/i.test(value);
    },
    "float": function(value) {
        return /^[\-+]?[0-9]*\.?[0-9]+$/.test(value);
    },
    integer: function(value) {
        return /^\d+$/.test(value);
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
                window.alert("Attention:" + o.message.replace(/<li>/gm, "\n").replace(/<\/li>/gm, ""));
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
        var me = $(this), type = me.attr("type"), name = me.attr("name"), label = me.parents(".control-group, .form-group").find("label");
        if (this.disabled) return;
        if (me.hasClass("mceEditor") && window.tinyMCE !== undefined) window.tinyMCE.get(this.id).save();
        if ((type === "checkbox" || type === "radio") && !$("input[name=" + name + "]").is(":checked") && o.checks.indexOf(name) < 0 || me.hasClass("email") && !Validate.email(me.val()) || me.hasClass("integer") && !Validate.integer(me.val()) || me.hasClass("float") && !Validate.float(me.val()) || me.hasClass("timepicker") && !Validate.dateTime(me.val()) || me.hasClass("datepicker") && !Validate.date(me.val()) || me.hasClass("slug") && !Validate.slug(me.val()) || me.val() === "" || me.hasClass("match") && me.data("match") && me.val() !== $("#" + me.data("match")).val() || me.hasClass("regex") && me.data("regex") && !this.value.match(new RegExp(me.data("regex")))) {
            if (me.val() !== "" && me.data("regex-title") && !this.value.match(new RegExp(me.data("regex")))) {
                o.message += "<li>" + me.data("regex-title") + "</li>";
            } else if (me.val() !== "" && me.hasClass("match") && me.data("match-title")) {
                o.message += "<li>" + me.data("match-title") + "</li>";
            } else if (me.attr("title")) {
                o.message += "<li>" + me.attr("title") + "</li>";
            } else {
                o.message += "<li>" + (label.length === 0 ? name : label.text()) + " is a required field</li>";
            }
            o.err.push(me);
            o.checks.push(name);
        }
    });
    return o;
}

function createDialog(dofade) {
    if (dofade === undefined) dofade = true;
    if (document.getElementById("dialog") === null) $("body").append('<div class="modal' + (dofade === true ? " fade" : "") + '" id="dialog"></div>'); else $("#dialog").each(function() {
        if (dofade === true) {
            $(this).addClass("fade");
        } else {
            $(this).removeClass("fade");
        }
    });
}

function createDialogHeader(o) {
    return o.noheader === false ? '<div class="modal-header"><a href="#" class="close" data-dismiss="modal">&times;</a><h3>' + (o.header || "Attention") + "</h3></div>" : "";
}

function createDialogBody(o, aslist) {
    var str = '<div class="modal-body" style="max-height:100% !important;">';
    if (aslist === true && o.noerror === false) str += '<ul class="text-error bold">' + o.message + "</ul>"; else str += '<div class="' + (o.noerror === false ? "text-error bold" : "") + '">' + o.message + "</div>";
    str += "</div>";
    return str;
}

function createDialogFooter(o, withactions) {
    var str = '<div class="modal-footer">', fa = getFontAwesomePrefix();
    if (withactions === true) {
        str += '<div class="hide"><a href="#" class="btn btn-info nolink"><i class="' + fa.required + fa.prefix + "refresh " + fa.prefix + 'spin"></i> Processing Request</a></div><div class="show">';
        if (o.includeconfirmbtn === true) {
            str += '<a href="#" class="btn btn-confirm ' + o.confirmButtonColorClass + '">' + o.confirmButtonText + "</a>";
        }
        str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" data-dismiss="modal">' + o.cancelButtonText + "</a></div>";
    } else if (o.nofooter === false) {
        str += '<a href="#" class="btn ' + o.confirmButtonColorClass + '" data-dismiss="modal">OK</a>';
    }
    if (o.customfooter !== "") str += o.customfooter;
    str += "</div>";
    return str;
}

function setDialogDefaults(o) {
    var defaults = {
        background: "",
        callback: null,
        cancelButtonColorClass: "btn-danger",
        cancelButtonText: "No",
        confirmButtonColorClass: "btn-primary",
        confirmButtonText: "Yes",
        customfooter: "",
        destroy: true,
        dofade: true,
        dostatic: false,
        err: [],
        form: null,
        height: 0,
        includeconfirmbtn: true,
        message: "",
        noerror: false,
        nofooter: false,
        noheader: false,
        parent: null,
        width: 0
    };
    return $.extend(defaults, o);
}

function activateDialog(o, dl) {
    if (o.width !== 0) dl.css({
        "max-width": o.width,
        width: o.width,
        "margin-left": -(o.width / 2)
    });
    if (o.height !== 0) dl.css({
        "max-height": o.height,
        height: o.height,
        "margin-top": -(o.height / 2)
    });
    if (o.dostatic === true) dl.modal({
        backdrop: "static",
        show: true,
        keyboard: false
    }); else dl.modal({
        backdrop: true,
        show: true,
        keyboard: true
    });
    if (o.background !== "") dl.next().css("background-color", o.background);
    dl.on(getBootstrapEvent("shown"), function() {
        if (window.innerHeight <= 480) $(this).css({
            top: window.scrollY + 10
        });
    });
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
    var d, dl;
    o = setDialogDefaults(o);
    createDialog(o.dofade);
    d = createDialogHeader(o) + createDialogBody(o, false) + createDialogFooter(o, true);
    dl = $("#dialog").html(parseForBootstrap(d));
    activateDialog(o, dl);
    if (o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
        $(this).remove();
    });
    dl.find("a.btn-confirm").click(function() {
        dl.find(".modal-footer div.show").hide();
        dl.find(".modal-footer div.hide").show();
        if (o.callback && typeof o.callback === "function") {
            o.callback(o.parent || dl);
        } else if (o.parent !== null && typeof o.parent === "object" && o.parent.href !== "undefined") {
            if (o.parent.target.indexOf("blank") >= 0 || o.parent.target.indexOf("new") >= 0) {
                var newWindow = window.open(o.parent.href, "_blank");
                newWindow.focus();
                dl.modal("hide");
            } else {
                window.location = o.parent.href;
            }
        } else if (o.parent !== null && document[o.parent] !== "undefined") {
            formButtons(true);
            document[o.parent].submit();
        }
        return false;
    });
}

function openDialog(o) {
    var d, dl;
    o = setDialogDefaults(o);
    createDialog(o.dofade);
    d = createDialogHeader(o) + createDialogBody(o, true) + createDialogFooter(o, false);
    dl = $("#dialog").html(parseForBootstrap(d));
    activateDialog(o, dl);
    if (o.err.length > 0 && o.form !== null) {
        dl.on(getBootstrapEvent("hidden"), function() {
            formButtons(false, o.form);
            o.err[0].focus().select();
            if (o.destroy === true) $(this).remove();
        });
    } else {
        if (o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
            $(this).remove();
        });
    }
}

function getFontAwesomePrefix() {
    var fa = {
        required: "",
        prefix: "icon-"
    };
    if (typeof FontAwesomeVersion === "number" && FontAwesomeVersion >= 4) fa = {
        required: "fa ",
        prefix: "fa-"
    };
    return fa;
}

function getBootstrapEvent(event) {
    if (typeof BootstrapVersion === "number" && BootstrapVersion >= 3) event += ".bs.modal";
    return event;
}

function parseForBootstrap(d) {
    if (typeof BootstrapVersion === "number" && BootstrapVersion >= 3) d = '<div class="modal-dialog"><div class="modal-content">' + d.replace("text-error", "text-danger") + "</div></div>";
    return d;
}

function showHide(a, b) {
    $("#" + b).hide();
    $("#" + a).show();
}

$(function() {
    $("form.simple-validation").each(function() {
        simpleValidation(this, false);
    });
    $("form.simple-validation-alert").each(function() {
        simpleValidation(this, true);
    });
});