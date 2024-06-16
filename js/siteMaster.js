// Initializers
$(function() {
    $('.submit').click(function() {
        return (validateForm());
    });
    /////// Since there are no labels used for textboxes, these line are commented! When implemented, change the #main lock appropriately 
    //      $('#main ? span').html("Error! " + $('#main > span').html());       // works with both 1. #main > span and 2. #main span
    //      $('#main > label').css({ fontWeight: 'bold', textAlign: 'right', width: '250' });
    //      $('#main > label').after("<span class='error'>* </span>");          // works with both 1. #main > label and 2. #main label
    //////////////////////////////////

    /// Remove following lines if direct keying is not required
    /*            $('.namename,.namecode,.codename,.codecode').click(function() {
    currentObj = this.id,
    getValues(this.id);
    }); */
    // Add the watermark to each of the text field with the field name
    $('.namename,.namecode,.codename,.codecode').each(function(index, value) {
        $(this).watermark(
                $(this).attr('id').substring($(this).attr('id').indexOf('txt') + 3) +
                ': Please use arrow next to select available values');
    });
    // Add an image after the text field for single/ multi selection
    $('.namename,.namecode,.codename,.codecode').each(function(index, value) {
        $(this).after(String.format(
            "<img name='{0}' id='{0}' src='../images/black_8x11.gif' style='border:0;margin-top:-2px;padding-top:-2px;' " +
            "alt='Click to select categor(ies)' class='imgmulti' />",
            this.id)
        );
    });
    // Add alternate text to each of the image added with the field name 
    $('.imgmulti').each(function(index, value) {
        $(this).attr('alt', 'Click to select ' +
                $(this).prev().attr('id').substring($(this).prev().attr('id').indexOf('txt') + 3));
    });
    // Add a click method to get the selection 
    $('.imgmulti').click(function() {
        currentObj = $(this).prev().attr("id"),
                getValues($(this).prev().attr("id"))
    });
    // Add red asterik before each of the required field and also
    // Add watermark to each of the required field with field name
    $('.required').each(function(index, value) {
        $(this).parent().prev().html($(this).parent().prev().html() + "<span class='tdError'>*&nbsp;</span>");
        $(this).watermark(
                    $(this).attr('id').substring($(this).attr('id').indexOf('txt') + 3) +
                        ': Mandatory field! Please use arrow next to select available values');
    });
    // Hide the labels also for hidden textboxes 
    $('.hidden').each(function(index, value) {
        $('#' + $(this).attr('id').replace('txt', 'lbl')).addClass('hidden');
    });
    // Add validation method to each of the required field
    $('.required').blur(function() { validateElement(this.id); });
    // readonly - field is locked for both direct input as well as through dropdown, image will not be available 
    $('.readonly').focus(function() {
        alert('Readonly field!'),
                this.blur();
    });
    // noedit - field is locked for direct input, image may be available next to control for dropdown 
    $('.noedit').focus(function() {
        alert('Readonly field! Use the arrow next to select the values from the list'),
                this.blur();
    });
    // noeditlast - last field if readonly, gets locked! To disable the lock, only display message 
    $('.noeditlast').focus(function() {
        alert('Readonly field! Use the arrow next to select the values from the list')  // Last child locks itself on blur(), so eliminate
    });
    // read - field is simply ignores any input and blurs! No alert message
    $('.read').focus(function() {
        this.blur();
    });
    // Attach a calendar to the datepicker control
    /*$('.ui-calendar').datepicker({
        //showOtherMonths: true,
        //selectOtherMonths: true
        changeMonth: true,
        changeYear: true,
        dateFormat: 'd-M-yy'
    });*/
});
// This is the generic function for string.format like asp.net, args should be array of strings. Should be moved to generics
String.prototype.format = function(args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

// Form validation 
function validateForm() {
    var allvalid = true;
    $('.required').each(function(index, value) {
        var valid = validateElement(this.id);
        if (!valid) allvalid = false;
    });
    if (!allvalid)
        alert("Form validation failed! Please review errors marked with red and resubmit");
    return allvalid;
}
function validateElement(elem) {
    var valid = true
    if ($('#' + elem).val() == '') {
        $('#' + elem).addClass('errortextbox');
        valid = false;
    } else {
        $('#' + elem).removeClass('errortextbox');
    }
    return valid
}

// Call web method, display panelCommon, getValues and setValues
var currentObj = '';
var elem = 0;
function getValues(sType) {     // Called by image button, get the values of drop downs
    var sValue = $('#' + sType).val();
    var sClass = $('#' + sType).attr('class');
    PageMethods.getValues(sType, sValue, sClass, setValues, onFailure);
}
function setValues(result) {    // Called by web method on successfull completion, set the values of drop downs
    if (!result) return;
    if (result.length == 0) return;
    var title = result[0];                              // Now the result[0] contains the title: Categoy/ Project/ System ...
    title = '<h3>' +
                title.substring(title.lastIndexOf("_") + 1).replace('txt', '')
                .toLowerCase().replace(/\b[a-z]/g, function(letter) {
                    return letter.toUpperCase();
                }) + '</h3>';
    var content = makeSelectionBox(result);
    content = '<div id="panelCommon' + elem + '" class="dialog" title="' + title + '">' + content + '</div>';
    $(content).appendTo($('#popup'));
    var panelCommon = "panelCommon" + elem;
    try {
        $('#panelCommon' + elem).dialog({
            open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
            autoOpen: true,
            modal: true,
            buttons: {
                "Select": function() {
                    selected(panelCommon);
                },
                "Cancel": function() {
                    $(this).dialog('close');
                    $('#' + panelCommon).parent()[0].outerHTML = "";
                }
            }
        });
        elem++;
    }
    catch (ex) {
    }
}
function onFailure(error) {                                     // Called from web method, in case of failed
    alert(error.get_message());
}
function selected(currentPanel) {                                           // Local function
    try {
        var svalue = getselection(currentPanel, currentObj, "value");
        if (svalue == '') {
            if (confirm('No item selected! Do you want to cancel')) {   // If none is selected, confirm for cancellation
                $('#' + currentPanel).dialog('close');
                $('#' + currentPanel).parent()[0].outerHTML = '';
                elem--;
            }
        } else {
            $('#' + currentObj).val(svalue);                            // If any item is selected, put it in the textbox
            var scode = getselection(currentPanel, currentObj, "code");
            var sname = getselection(currentPanel, currentObj, "name");
            if ($('#' + currentObj).hasClass('hdcode'))
                $('#' + currentObj.replace('txt', 'hd')).val(scode);
            if ($('#' + currentObj).hasClass('hdname'))
                $('#' + currentObj.replace('txt', 'hd')).val(sname);
            $('#' + currentObj).removeClass('watermark');   // Also, remove the watermark class
            $('#' + currentPanel).dialog('close');
            $('#' + currentPanel).parent()[0].outerHTML = '';
            elem--;
            if ($('#' + currentObj).hasClass('autopostback'))
                document.forms[0].submit();
        }
    } catch (ex) {
        alert(ex.message);
    }
}
function getselection(currentPanel, currentObj, type) {             // Global generic function, will be moved outside
    try {
        var currentValue = '', currentCode = '', currentName = '';
        var val = $('#' + currentPanel + ' :input');
        var lbl = $('#' + currentPanel + ' > label');
        for (i = 0; i < val.length; i++) {
            if (val[i].checked) {
                if ($('#' + currentObj).hasClass('namename')) {
                    currentValue += (currentValue == '' ? '' : ', ') + lbl[i].innerHTML;    // Name was shown, Code to go in textbox
                    currentCode += (currentCode == '' ? '' : ', ') + val[i].value;          // Hidden field, if any, may take Code
                    currentName += (currentName == '' ? '' : ', ') + lbl[i].innerHTML;      // Hidden field, if any, may take Name
                } else if ($('#' + currentObj).hasClass('namecode')) {
                    currentValue += (currentValue == '' ? '' : ', ') + val[i].value;        // Name was shown, Code to go in textbox
                    currentCode += (currentCode == '' ? '' : ', ') + val[i].value;          // Hidden field, if any, may take Code
                    currentName += (currentName == '' ? '' : ', ') + lbl[i].innerHTML;      // Hidden field, if any, may take Name
                } else if ($('#' + currentObj).hasClass('codecode')) {
                    currentValue += (currentValue == '' ? '' : ', ') + lbl[i].innerHTML;    // Name was shown, Name to go in textbox
                    currentCode += (currentCode == '' ? '' : ', ') + lbl[i].innerHTML;      // Hidden field, if any, may take Code
                    currentName += (currentName == '' ? '' : ', ') + val[i].value;          // Hidden field, if any, may take Name
                } else if ($('#' + currentObj).hasClass('codename')) {
                    currentValue += (currentValue == '' ? '' : ', ') + val[i].value;        // Name was shown, Name to go in textbox
                    currentCode += (currentCode == '' ? '' : ', ') + lbl[i].innerHTML;      // Hidden field, if any, may take Code
                    currentName += (currentName == '' ? '' : ', ') + val[i].value;          // Hidden field, if any, may take Name
                }
            }
        }
        if (currentValue != '') {
            if (type == 'value')
                return currentValue;
            else if (type == 'code')
                return currentCode;
            else if (type == 'name')
                return currentName;
            else
                return "";
        } else
            return "";
    } catch (ex) {
        alert(ex.message);
    }
}
function makeSelectionBox(result) {         // Gets the result and make radio/ checkboxes out of it and returns the string
    try {
        // Does not work when declare or set the value in the current context.
        // currentObj = result[0];     // First element is the current object who has invoked this method, find the element
        var aText = result;
        var innerText = "";
        var inp, lbl, toCompare = "txt";
        var prevValue = result[1];                          // result[1] contains the values passed 
        var className = result[2];                          // result[2] contains class like multi/single, codecode...
        var checkType = className.indexOf('multi') > -1 ? 'checkbox' : 'radio';
        var aObj = prevValue.split(', ');

        for (i = 3; i < aText.length; i++) {
            var txt = '', val = '';
            if (className.indexOf('namecode') > -1 || className.indexOf('namename') > -1) {
                txt = aText[i].split('++')[1]; // Show name, keep code hidden (Commonly used)
                val = aText[i].split('++')[0]; // Item delimiter ++
                toCompare = (className.indexOf('namename') > -1 ? "txt" : "val");
            } else if (className.indexOf('codecode') > -1 || className.indexOf('codename') > -1) {
                txt = aText[i].split('++')[0];  // Show code, keep name hidden (Rarely used)
                val = aText[i].split('++')[1];
            }
            found = false;
            for (j = 0; j < aObj.length; j++) {             // Check for each value previously selected present in total list
                if (aObj[j] == (toCompare == "txt" ? txt : val)) {
                    found = true;
                    break;
                }
            }
            if (found)                                      // If selected previously, append checked='checked'
                inp = "<input type='{0}' id='chkCommon_{1}' name='chkCommon${2}' value='{3}' checked='checked' style='border:none' />"
                            .format([checkType, i - 2, (checkType == 'checkbox' ? i - 2 : 0), val]); // if multi, multi selection allowed thru checkbox
            else                                                                    // if single, single selection allowed thru radio
            // if single, name should not be different
                inp = "<input type='{0}' id='chkCommon_{1}' name='chkCommon${2}' value='{3}' style='border:none' />"
                            .format([checkType, i - 2, (checkType == 'checkbox' ? i - 2 : 0), val]);
            lbl = "<label for='chkCommon_{0}'>{1}</label><br />".format([i, txt]);
            innerText += inp + lbl;
        }
        if (prevValue != '') {
            total = i;
            innerText2 = '';
            for (i = 0; i < aObj.length; i++) {
                found = false;
                var sText = '';
                for (j = 3; j < aText.length; j++) {    // Find non standard items what user has keyed in
                    sText += aText[j] + ',';
                    if (aObj[i] == aText[j].split(',')[0]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {                           // If any user items are found, append to the list. They were already selected
                    if (sText.indexOf(aObj[i]) < 0) {
                        inp = "<input type='{0}' id='chkCommon_{1}' name='chkCommon${2}' value='{3}' checked='checked' style='border:none' />"
                                    .format([checkType, total + i, (checkType == 'checkbox' ? total + i : 0), aObj[i]]);
                        lbl = "<label for='chkCommon_{0}'>{1}</label><br />".format([total + i, aObj[i]]);
                        innerText2 += inp + lbl;
                    }
                }
            }
            if (innerText2 != '')
                innerText += "<hr>" + innerText2;
        }
        return innerText;
    } catch (ex) {
        alert(ex.message);
    }
}
