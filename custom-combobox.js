(function ($) {
    'namespace customEditableCombobox';
    $.fn.customEditableCombobox = function (optionsDiv) {

        var setting = $.extend({
            placeholder: "Select Item",
            caption: "",
            is_editable: true,
        }, optionsDiv);


        //Select object
        var selectedObj = this;

        if (!$(this).is('select')) {
            //Already initialized
            return;
        }

        var customCombobox = {
            E: $(selectedObj),  //jQuery Select element
            select: '',
            placeholder: setting.placeholder,
            optionsDiv: '',
            comboboxInputControl: '',
            backdrop: '',
            is_opened: false,
            is_editable: setting.is_editable,

            //Function for creating elements
            createElements: function () {
                var element = this;
                element.E.wrap('<div class="custom-combobox">');
                element.select = element.E.parent();
                element.caption = $("<input type='text' readonly='readonly' />");
                element.comboboxInputControl = $('<p class="comboboxInputControl"><label><i></i></label></p>').addClass('custom-selectbox').attr('style', element.E.attr('style')).prepend(element.caption);
                element.select.append(element.comboboxInputControl);

                //Check if the control is disabled
                if (element.E.attr('disabled')) {
                    element.select.addClass('disabled');

                    element.caption.attr('readonly', 'readonly');
                }
                else {
                    //Check if it is editable
                    if (setting.is_editable) {
                        element.caption.removeAttr('readonly');
                    }
                }

                //Hide original Select element
                element.E.hide();

                //Create optionsDiv list
                element.optionsDiv = $('<div class="custom-combobox-options">');

                var ul = $('<ul class="options-elements">');
                element.optionsDiv.append(ul);

                //Loop over all optionsDiv
                $(element.E.children('option')).each(function (i, option) {
                    option = $(option);
                    element.createLiOption(option);
                });

                //Create element for closing on click out of control
                if (!$('.customComboboxCloseDiv').length) {
                    $('body').append('<div class="customComboboxCloseDiv">');
                }
                element.backdrop = $('.customComboboxCloseDiv');

                //Append options
                element.select.append(element.optionsDiv);

                element.basicEvents();
            },
            //Creates li element from option element at specific index
            createLiOption: function (opt, i) {
                var option = this;

                var li = $('<li data-value="' + opt.val() + '"><span>' + opt.text() + '</span></li>');

                //Check if the option is disabled
                if (opt.attr('disabled')) {
                    li.addClass('disabled');
                }
                else {
                    //Enable click event
                    option.optionClick(li);
                }

                //Check if it is selected
                if (opt.attr('selected')) {
                    li.addClass('selected');
                }

                //Add to the optionsDiv
                var ul = option.optionsDiv.children('ul.options-elements');
                if (typeof i == "undefined") {
                    ul.append(li);
                }
                else {
                    ul.children('li').eq(i).before(li);
                }

                //Return element
                return li;
            },
            //Show optionsDiv
            showOptions: function () {
                var option = this;
                if (option.E.attr('disabled')) {
                    //Dont open if the control is disabled
                    return;
                }
                option.is_opened = true;
                option.backdrop.show();
                option.select.addClass('focused');
                option.optionsDiv.addClass('open');

            },
            //Hide optionsDiv
            hideOptions: function () {
                var option = this;
                option.is_opened = false;
                option.backdrop.hide();
                option.select.removeClass('focused');
                option.optionsDiv.removeClass('open');
            },

            //Attach events
            basicEvents: function () {
                var option = this;

                option.comboboxInputControl.find('label').click(function (event) {
                    if (option.is_opened) {
                        option.hideOptions();
                    }
                    else {
                        option.showOptions();
                    }

                    option.E.trigger('click');
                });

                if (setting.is_editable) {
                    option.caption.focus(function () {
                        option.select.addClass('focused');
                    }).blur(function () {
                        option.select.removeClass('focused');

                        //Check if the new value is in the options
                        var newValue = option.getText();
                        var positionInOptions = option.optionInOptions(newValue);
                        if (positionInOptions > -1) {
                            //Select that new value
                            option.selectItem(positionInOptions)
                        }
                        else {
                            //Add new value and select it
                            //option.add(newValue, newValue, 0);
                            //option.selectItem(0);

                            //Remove selected class
                            option.optionsDiv.find('li').removeClass('selected');
                        }
                    });

                }

                //Backdrop click
                option.backdrop.click(function () {
                    option.hideOptions();
                });

                option.E.on('blur', function () {
                    option.select.removeClass('focused');
                    option.optionsDiv.removeClass('open');
                });
            },
            //Click on option event
            optionClick: function (li) {
                var option = this;
                li.click(function () {
                    var li = $(this);
                    var text = "";

                    //Remove previouly selected class
                    li.parent().find('li.selected').removeClass('selected');

                    //Add selected class to current li
                    li.toggleClass('selected');

                    //Set currently selected value
                    option.E.val(li.attr('data-value'));

                    //Set new text
                    option.setText();
                    option.E.trigger('change');

                    //Hide optionsDiv
                    option.hideOptions();
                });
            },

            setText: function () {
                var option = this;
                option.placeholder = "";

                option.placeholder = option.E.children(':selected').not(':disabled').text();

                var is_placeholder = false;
                if (!option.placeholder) {
                    is_placeholder = true;

                    option.placeholder = option.E.attr('placeholder');
                    if (!option.placeholder) {
                        option.placeholder = option.E.children('option:disabled:selected').text();
                    }
                }

                //Set from settings of default
                option.placeholder = option.placeholder ? option.placeholder : setting.placeholder;

                //Display text
                option.caption.val(option.placeholder);
                //option.caption.text(option.placeholder);

                //Add class placeholder if the text is just placeholder
                if (is_placeholder) {
                    option.caption.addClass('placeholder');
                }
                else {
                    option.caption.removeClass('placeholder');
                }

                return option.placeholder;
            },
            getText: function () {
                var option = this;

                return option.caption.val();
            },
            getSelectedValue: function () {
                var option = this;

                var currentText = option.getText();
                var positionInOptions = option.optionInOptions(currentText);
                if (positionInOptions > -1) {
                    return option.getSelected();
                }
                else {
                    return currentText;
                }
            },


            //Methods accessible from outside
            unload: function () {
                var option = this;
                option.select.before(option.E);
                option.E.removeClass('customComboboxSelect').show();

                option.select.remove();
                delete selectedObj.customEditableCombobox;
                return selectedObj;
            },
            add: function (value, text, i) {
                if (typeof value == "undefined") {
                    console.info('No value to add');
                    return;
                }

                var option = this;
                var options = option.E.children('option');
                if (typeof text == "number") {
                    i = text;
                    text = value;
                }
                if (typeof text == "undefined") {
                    text = value;
                }

                //New option
                var newOption = $("<option></option>").val(value).html(text);

                //Check if it is possible to add new option to i position
                if (options.length < i) {
                    throw "Index out of bounds"
                }

                //Check if it should be appended of inserted
                if (typeof i == "undefined" || options.length == i) {
                    option.E.append(newOption);
                }
                else {
                    options.eq(i).before(newOption);
                }
                option.createLiOption(newOption, i);

                return selectedObj;
            },
            getSelected: function () {
                var option = this;


                return option.E.val();
            },


            //Remove option at index
            remove: function (i) {
                var option = this.validateRange(i);
                option.E.children('option').eq(i).remove();

                option.optionsDiv.find('ul.options-elements li').eq(i).remove();
                option.setText();
            },
            selectItem: function (i) {
                this.changeSelected(true, i);
            },
            unselectItem: function (i) {
                this.changeSelected(false, i);
            },
            disableItem: function (i) {
                this.changeDisabled(true, i);
            },
            enableItem: function (i) {
                this.changeDisabled(false, i);
            },

            //Helper
            optionInOptions: function (text) {
                var option = this;
                var index = -1;
                $(option.E.children('option')).each(function (i, option) {
                    option = $(option);
                    if (option.text() == text) {
                        index = i;
                    }
                });

                return index;
            },
            validateRange: function (i) {
                var option = this;
                var options = option.E.children('option');
                if (options.length <= i || i < 0) {
                    throw "Index out of bounds"
                }
                return option;
            },
            changeSelected: function (selected, i) {
                var option = this.validateRange(i);
                var currentOption = option.E.children('option')[i];
                if (currentOption.disabled) {
                    //Can't be selected
                    return;
                }
                currentOption.selected = selected;
                option.optionsDiv.find('ul.options-elements li').eq(i).toggleClass('selected', selected);
                option.setText();
            },
            changeDisabled: function (disabled, i) {
                var option = this.validateRange(i);
                //Set disabled
                option.E.children('option')[i].disabled = disabled;

                option.optionsDiv.find('ul.options-elements li').eq(i).toggleClass('disabled', disabled);
                option.setText();
            },

            //Get and set disabled
            get disabled() {
                return this.E.attr('disabled') ? true : false;
            },
            set disabeled(value) {
                var option = this.
                option.select.toggleClass('disabled', value);
                if (value) {
                    option.E.attr('disabled', 'disabled');
                    option.caption.attr('disabled', 'disabled');
                }
                else {
                    option.E.removeAttr('disabled');
                    option.caption.removeAttr('disabled');
                }
            },

            //Initialization function
            init: function () {
                var option = this;
                option.createElements();
                option.setText();

                return option;
            }
        };

        customCombobox.init();


        //Return
        return customCombobox;
    };

}(jQuery));