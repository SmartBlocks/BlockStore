define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/block_edition.html',
    'text!../templates/custom_field_inputs.html',
    './tag_thumb'
], function ($, _, Backbone, tpl, custom_f_tpl, TagThumb) {
    var Tag = SmartBlocks.Blocks.BlockStore.Models.Tag;
    var View = Backbone.View.extend({
        tagName: "div",
        className: "block_edition",
        initialize: function () {
            var base = this;
        },
        init: function () {
            var base = this;

            base.render();
            base.registerEvents();
        },
        render: function () {
            var base = this;

            var template = _.template(tpl, {
                block: base.model
            });
            base.$el.html(template);

            base.description_editor = SmartBlocks.Blocks.Markdown.Main.getEditor();
            base.interface_editor = SmartBlocks.Blocks.Markdown.Main.getEditor();

            base.description_editor.init();
            base.interface_editor.init();

            base.$el.find(".description_editor_container").html(base.description_editor.$el);
            base.$el.find(".interface_editor_container").html(base.interface_editor.$el);

            base.description_editor.setContent(base.model.get('description'));
            base.interface_editor.setContent(base.model.get('interface_description'));


            base.setUpFields();
            base.renderTags();
        },
        renderTags: function () {
            var base = this;

            var tags = base.model.getTags();

            base.$el.find(".tags_list").html('');
            for (var k in tags.models) {
                var tag = tags.models[k];
                (function (tag) {
                    var tag_thumb = new TagThumb({
                        model: tag
                    });
                    base.$el.find(".tags_list").append(tag_thumb.$el);
                    tag_thumb.init();
                    tag_thumb.setAction('<i class="fa fa-minus"></i> Remove', function () {
                        base.model.removeTag(tag.get('name'));
                        base.renderTags();
                    });

                })(tag);

            }
        },
        addTag: function () {
            var base = this;
            var input = base.$el.find(".tag_input");
            var name = input.val();
            if (name != '') {
                base.model.addTag(name);
                input.val("");
                base.renderTags();
            }
        },
        setUpFields: function () {
            var base = this;
            var container = $('.btn btn-default');
            for (var k in base.model.attributes) {
                var attribute = base.model.attributes[k];
                if (k != 'name' && k != 'description' && k != 'id' && k !== "creator" &&  k != 'interface_description' &&k != "github_url" && typeof attribute === "string") {
                    base.addField(k, attribute);
                }
            }
        },
        addField: function (key, value) {
            var base = this;
            var template = _.template(custom_f_tpl, {
                key: key
            });
            var fields = $(template);
            var container = fields.find(".form-group");
            container.attr('data-key', key);
            fields.find('.custom_field_key').val(key);
            fields.find('.custom_field_value').val(value);
            console.log(container);
            base.$el.find('.form-group-container').append(fields);
            if (key != "") {
                fields.find(".custom_field_key").hide();
                fields.find(".solid_key").show();
            }
        },
        saveModel: function () {
            var base = this;
            base.$el.find(".loader").show();
            base.model.save({}, {
                success: function () {
                    base.$el.find(".loader").hide();
                    base.$el.find(".info").html("Saved");
                    base.$el.find(".info").fadeIn(200);
                    setTimeout(function () {
                        base.$el.find(".info").fadeOut(200);
                    }, 1000);

                }
            });
        },
        registerEvents: function () {
            var base = this;

            base.$el.delegate(".submit", 'click', function () {
                var form = $(this);
                base.model.set('name', form.find('#edition_form_block_name').val());
                base.model.set('description', base.description_editor.getMarkdown());
                base.model.set('interface_description', base.interface_editor.getMarkdown());

                var field_container = base.$el.find('.form-group-container');
                field_container.find('.form-group').each(function () {
                    var elt = $(this);
                    var key = elt.find('.custom_field_key').val();
                    var value = elt.find('.custom_field_value').val();
                    console.log(key, value);
                    if (key !== undefined && key != "" && value !== undefined) {
                        base.model.set(key, value);
                    }
                });
                base.$el.find(".loader").show();
                base.model.save({}, {
                    success: function () {
                        base.$el.find(".loader").hide();
                        base.$el.find(".info").html("Saved");
                        base.$el.find(".info").fadeIn(200);
                        setTimeout(function () {
                            base.$el.find(".info").fadeOut(200);
                        }, 1000);

                    }
                });
            });

            base.$el.delegate('.add_field_button', 'click', function () {
                base.addField("", "");
            });
            base.$el.delegate(".delete_custom_field", "click", function () {
                var a = $(this);
                var key = a.attr("data-key");
                base.model.set(key, undefined);
                a.parent().remove();
            });

            base.$el.delegate(".custom_field", "blur", function () {
                var elt = $(this);
                var key = elt.find(".custom_field_key").val();
                if (key !== "") {
                    elt.find(".custom_field_key").hide();
                    elt.find(".solid_key").html(key);
                    elt.find(".solid_key").show();
                }
            });

            base.$el.delegate('.add_tag_button', 'click', function () {
                base.addTag();
            });

            base.$el.delegate('.tag_input', 'keyup', function (e) {
                if (e.keyCode == 13) {
                    base.addTag();
                }
            });


        }
    });

    return View;
});