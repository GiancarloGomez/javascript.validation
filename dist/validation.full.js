 // ----------------------------------------------------------------------------
 // Validation - A simple validation library that requires jQuery and Bootstrap Modal (2.3.3+)
 // v1.8.0 - released 2024-03-21 09:04
 // Added ability to force a message to not render as a list using asList option and flip cancel button location using cancelButtonLast option.
 // Licensed under the MIT license.
 // https://github.com/GiancarloGomez/javascript.validation#readme
 // ----------------------------------------------------------------------------
 // Copyright (C) 2013-2024 Giancarlo Gomez <giancarlo.gomez@gmail.com> (https://giancarlogomez.com/)
 // 
 // ----------------------------------------------------------------------------

var Validate = {
    date: function(value) {
        return !/Invalid|NaN/.test(new Date(value));
    },
    dateTime: function(value) {
        return !/Invalid|NaN/.test(new Date(value));
    },
    email: function(value) {
        return /^[_a-zA-Z0-9\-]+((\.[_a-zA-Z0-9\-]+)*|(\+[_a-zA-Z0-9\-]+)*)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*(\.[a-zA-Z]{2,})$/i.test(value);
    },
    "float": function(value) {
        return /^[\-+]?[0-9]*\.?[0-9]+$/.test(value);
    },
    integer: function(value) {
        return /^\d+$/.test(value);
    },
    slug: function(value) {
        return /^[a-z0-9]{3,}(?:(-|_)[a-z0-9]+)*$/.test(value);
    },
    slugWithPeriod: function(value) {
        return /^[a-z0-9]{2,}(?:(-|\.|_)[a-z0-9]+)*$/.test(value);
    },
    datepicker: function(value) {
        return Validate.date(value);
    },
    datetime: function(value) {
        return Validate.date(value);
    },
    number: function(value) {
        return Validate.integer(value);
    },
    time: function(value) {
        return Validate.dateTime(value);
    },
    timepicker: function(value) {
        return Validate.dateTime(value);
    },
    username: function(value) {
        return Validate.slugWithPeriod(value);
    }
};

var FormButtons = {
    process: "frmPrc",
    submit: "frmBtn"
};

function simpleValidation(form, doAlert) {
    if (form === undefined) return false;
    if (doAlert === undefined) doAlert = false;
    window.jQuery(form).submit(function() {
        var o = {
            message: "",
            err: [],
            checks: []
        }, me = window.jQuery(this);
        o = validateForm(this);
        o = window.jQuery.extend(o, me.data());
        try {
            var e = window[me.data("extend-validation")];
            if (typeof e === "function") {
                o = e(me, o);
            }
        } catch (a) {}
        if (o.err.length) {
            o.form = this;
            me.find("input:focus").blur();
            if (doAlert) {
                window.alert("Attention:" + o.message.replace(/<li>/gm, "\n").replace(/<\/li>/gm, ""));
            } else {
                openDialog(o);
            }
            return false;
        } else {
            formButtons(true, this);
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
    window.jQuery(form).addClass("validated").find(".required input,.required select,.required textarea,input.required, select.required, textarea.required, [required]").each(function() {
        var me = window.jQuery(this), type = me.attr("type"), name = me.attr("name"), label = me.parents(".control-group, .form-group").find("label"), value = "", isValid = true, keysAsType = [ "email", "number" ];
        if (this.disabled || me.parents(".chosen-container").length) return;
        if (me.prop("multiple") === true) value = me.val() === null ? "" : me.val().join(","); else value = me.val() ? me.val().trim() : "";
        if (me.hasClass("mceEditor") && window.tinyMCE !== undefined) {
            window.tinyMCE.get(this.id).save();
            value = me.val().trim();
        }
        for (var key in Validate) {
            if (me.hasClass(key) || keysAsType.indexOf(key) >= 0 && type === key) {
                isValid = Validate[key](value);
                break;
            }
        }
        if (!isValid || (type === "checkbox" || type === "radio") && !window.jQuery("input[name=" + name + "]").is(":checked") && o.checks.indexOf(name) < 0 || value === "" || me.hasClass("match") && me.data("match") && value !== window.jQuery("#" + me.data("match")).val() || me.hasClass("regex") && me.data("regex") && !this.value.match(new RegExp(me.data("regex")))) {
            if (value !== "" && me.data("regex-title") && !this.value.match(new RegExp(me.data("regex")))) {
                o.message += "<li>" + me.data("regex-title") + "</li>";
            } else if (value !== "" && me.hasClass("match") && me.data("match-title")) {
                o.message += "<li>" + me.data("match-title") + "</li>";
            } else if (me.data("title")) {
                o.message += "<li>" + me.data("title") + "</li>";
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

function createDialog(o) {
    var dialog, dl, created = false;
    o = setDialogDefaults(o);
    dialog = document.getElementById(o.dialogid);
    if (dialog === null) {
        created = true;
        window.jQuery("body").append('<div id="' + o.dialogid + '"></div>');
    } else if (dialog.style.display === "block") {
        created = true;
        window.jQuery("body").find("#" + o.dialogid + ", .modal-backdrop").remove().end().append('<div id="' + o.dialogid + '"></div>');
    }
    if (created === true) {
        dl = window.jQuery("#" + o.dialogid).addClass("modal");
        if (o.dofade === true) dl.addClass("fade");
        if (o.dialogclass !== "" && getBootstrapVersion() < 3) dl.addClass(o.dialogclass);
    }
}

function getDismissModalAttribute() {
    return getBootstrapVersion() >= 5 ? 'data-bs-dismiss="modal"' : 'data-dismiss="modal"';
}

function createDialogHeader(o) {
    var headingTag = "", closerBefore = '<a href="#" class="close" ' + getDismissModalAttribute() + ">&times;</a>", closerAfter = "", bsVersion = getBootstrapVersion();
    switch (bsVersion) {
      case 2:
        headingTag = "h3";
        break;

      case 3:
        headingTag = "h4";
        break;

      default:
        headingTag = "h5";
        closerBefore = "";
        closerAfter = '<button type="button" class="' + (bsVersion >= 5 ? "btn-" : "") + 'close" ' + getDismissModalAttribute() + ' aria-label="Close">' + (bsVersion < 5 ? '<span aria-hidden="true">&times;</span>' : "") + "</button>";
        break;
    }
    return o.noheader === false ? '<div class="modal-header">' + closerBefore + "<" + headingTag + ' class="modal-title">' + (o.header || "Attention") + "</" + headingTag + ">" + closerAfter + "</div>" : "";
}

function createDialogBody(o) {
    var bodyClass = o.noerror === false ? "text-error mb-0" : "", bodyStyle = "", asList = o.asList && o.message.indexOf("<li>") !== -1 && o.message.indexOf("<ul>") === -1, tag = asList === true ? "ul" : "div", height = 0;
    if (o.noheader === false) height += 70;
    if (o.nofooter === false) height += 70;
    if (getBootstrapVersion() >= 3) {
        if (o.width !== 0) bodyStyle += "width:" + o.width + "px;";
        if (o.height !== 0) bodyStyle += "height:" + (o.height - height) + "px;";
    } else {
        if (o.maxheight === true) bodyStyle = "max-height:100% !important;";
        if (o.height !== 0) bodyStyle += "height:" + (o.height - height) + "px;";
    }
    if (bodyStyle !== "") bodyStyle = 'style="' + bodyStyle + '"';
    return '<div class="modal-body"' + bodyStyle + ">" + "<" + tag + ' class="' + bodyClass + '">' + o.message + "</" + tag + ">" + "</div>";
}

function createDialogFooter(o, withActions) {
    var str = "", fa = getFontAwesomePrefix(), bsVersion = getBootstrapVersion(), hideClass = bsVersion >= 4 ? "d-none" : "hide", buttonMargin = bsVersion >= 5 ? o.cancelButtonLast ? "me-1" : "ms-1" : bsVersion === 4 ? o.cancelButtonLast ? "mr-1" : "ml-1" : "";
    if (o.nofooter !== true) {
        str = '<div class="modal-footer">';
        if (o.customfooter !== "") {
            str += o.customfooter;
        } else if (withActions === true) {
            str += '<div class="' + hideClass + '"><button class="btn ' + o.confirmButtonColorClass + '" disabled="disabled"><i class="' + fa.required + fa.prefix + "spinner " + fa.prefix + 'spin"></i> Processing Request</button></div><div class="show">';
            if (!o.cancelButtonLast) str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" ' + getDismissModalAttribute() + ">" + o.cancelButtonText + "</a>";
            if (o.includeconfirmbtn) str += '<a href="#" class="btn btn-confirm ' + o.confirmButtonColorClass + " " + buttonMargin + '">' + o.confirmButtonText + "</a>";
            if (o.cancelButtonLast) str += '<a href="#" class="btn ' + o.cancelButtonColorClass + '" ' + getDismissModalAttribute() + ">" + o.cancelButtonText + "</a>";
            str += "</div>";
        } else {
            str += '<a href="#" class="btn ' + o.confirmButtonColorClass + '" ' + getDismissModalAttribute() + ">" + o.confirmText + "</a>";
        }
        str += "</div>";
    }
    return str;
}

function setDialogDefaults(o) {
    var defaults = {
        asList: true,
        background: "",
        backdrop: true,
        callback: null,
        cancelButtonColorClass: "btn-danger",
        cancelButtonText: "No",
        cancelButtonLast: false,
        confirmButtonColorClass: "btn-primary",
        confirmButtonText: "Yes",
        confirmText: "OK",
        customfooter: "",
        destroy: true,
        dialogclass: "",
        dialogid: "dialog",
        dofade: true,
        dostatic: false,
        err: [],
        form: null,
        header: null,
        height: 0,
        includeconfirmbtn: true,
        keyboard: false,
        maxheight: false,
        message: "",
        noerror: false,
        nofooter: false,
        noheader: false,
        parent: null,
        width: 0
    };
    return window.jQuery.extend(defaults, o);
}

function activateDialog(o, dl) {
    if (getBootstrapVersion() < 3) {
        if (o.width !== 0) dl.css({
            "max-width": o.width,
            width: o.width,
            "margin-left": -(o.width / 2)
        });
        if (o.height !== 0) dl.css({
            "max-height": o.height,
            height: o.height
        });
    } else if (o.width !== 0) {
        if (o.width !== 0) dl.find(".modal-dialog").css({
            "max-width": o.width,
            width: o.width
        });
    }
    var classCheck = getBootstrapVersion() >= 4 ? ".modal.show" : ".modal.in";
    var activeModal = document.querySelector(classCheck);
    if (activeModal) {
        dl.find(".modal-content").addClass("shadow-sm border");
        if (!activeModal.classList.contains("fade")) dl.removeClass("fade");
        o.dostatic = o.backdrop = false;
    }
    dl.modal({
        backdrop: o.dostatic === true ? "static" : o.backdrop,
        keyboard: o.keyboard
    });
    if (getBootstrapVersion() >= 5) dl.modal("show");
    if (o.background !== "") {
        if (getBootstrapVersion() >= 3) dl.find(".modal-backdrop").css("background-color", o.background); else dl.next().css("background-color", o.background);
    }
    dl.on(getBootstrapEvent("shown"), function() {
        if (window.innerHeight <= 480) window.jQuery(this).css({
            top: window.scrollY + 10
        });
    });
}

function formButtons(theState, theForm) {
    var runGlobal = false;
    if (theForm !== undefined) {
        if (theForm.id === "") theForm.id = "un_" + new Date().getTime();
        runGlobal = window.jQuery("#" + theForm.id + " ." + FormButtons.process).length === 0;
    }
    if (runGlobal === false && theForm !== undefined) {
        if (theState === true) showHide(theForm.id + " ." + FormButtons.process, theForm.id + " ." + FormButtons.submit); else showHide(theForm.id + " ." + FormButtons.submit, theForm.id + " ." + FormButtons.process);
    } else {
        if (theState === true) showHide(FormButtons.process, FormButtons.submit); else showHide(FormButtons.submit, FormButtons.process);
    }
}

function openActionDialog(o) {
    var d, dl;
    o = setDialogDefaults(o);
    createDialog(o);
    d = createDialogHeader(o) + createDialogBody(o) + createDialogFooter(o, true);
    dl = window.jQuery("#" + o.dialogid).html(parseForBootstrap(d, o, o));
    activateDialog(o, dl);
    if (o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
        window.jQuery(this).remove();
    });
    dl.find("a.btn-confirm").click(function() {
        var btnProcess = getBootstrapVersion() >= 4 ? dl.find(".modal-footer div.d-none") : dl.find(".modal-footer div.hide"), btnSubmit = dl.find(".modal-footer div.show");
        if (getBootstrapVersion() >= 4) {
            btnProcess.removeClass("d-none");
            btnSubmit.addClass("d-none");
        } else if (getBootstrapVersion() === 3) {
            btnProcess.removeClass("hide");
            btnSubmit.removeClass("show").addClass("hide");
        } else {
            btnProcess.show();
            btnSubmit.hide();
        }
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
        } else if (o.parent !== null) {
            formButtons(true);
            var frm = document[o.parent] || document.getElementById(o.parent);
            if (frm !== undefined) frm.submit();
        }
        return false;
    });
}

function openDialog(o) {
    var d, dl;
    o = setDialogDefaults(o);
    createDialog(o);
    d = createDialogHeader(o) + createDialogBody(o) + createDialogFooter(o, false);
    dl = window.jQuery("#" + o.dialogid).html(parseForBootstrap(d, o));
    activateDialog(o, dl);
    if (o.err.length > 0 && o.form !== null) {
        dl.on(getBootstrapEvent("hidden"), function() {
            formButtons(false, o.form);
            o.err[0].focus().select();
            if (o.destroy === true) window.jQuery(this).remove();
        });
    } else {
        if (o.destroy === true) dl.on(getBootstrapEvent("hidden"), function() {
            window.jQuery(this).remove();
        });
    }
}

function getFontAwesomePrefix() {
    var fa = {
        required: "",
        prefix: "icon-"
    };
    if (getFontAwesomeVersion() >= 4) fa = {
        required: "fa ",
        prefix: "fa-"
    };
    return fa;
}

function getBootstrapEvent(event) {
    if (getBootstrapVersion() >= 3) event += ".bs.modal";
    return event;
}

function parseForBootstrap(d, o) {
    if (getBootstrapVersion() >= 3) d = '<div class="modal-dialog ' + o.dialogclass + '"><div class="modal-content">' + d.replace("text-error", "text-danger") + "</div></div>";
    return d;
}

function showHide(a, b) {
    if (getBootstrapVersion() >= 4) {
        window.jQuery("#" + b).addClass("d-none");
        window.jQuery("#" + a).removeClass("d-none");
    } else if (getBootstrapVersion() === 3) {
        window.jQuery("#" + b).addClass("hide");
        window.jQuery("#" + a).removeClass("hide");
    } else {
        window.jQuery("#" + b).hide();
        window.jQuery("#" + a).show();
    }
}

function getBootstrapVersion() {
    return typeof BootstrapVersion === "number" ? BootstrapVersion : 3;
}

function getFontAwesomeVersion() {
    return typeof FontAwesomeVersion === "number" ? FontAwesomeVersion : 4;
}

window.jQuery(function() {
    window.jQuery("form.simple-validation").each(function() {
        simpleValidation(this, false);
    });
    window.jQuery("form.simple-validation-alert").each(function() {
        simpleValidation(this, true);
    });
});