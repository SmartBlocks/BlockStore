define([
    'jquery',
    'underscore',
    'backbone',
    'text!../templates/block_lister.html',
    './line_thumb'
], function ($, _, Backbone, template, LineThumb) {
    var View = Backbone.View.extend({
        tagName: "div",
        className: "block_lister",
        initialize: function () {
            var base = this;
            base.current_page = 1;
            base.page_size = 10;
            base.page_count = 0;
        },
        init: function () {
            var base = this;


            base.render();
            base.launchSearch();
            base.registerEvents();
        },
        launchSearch: function (page) {
            var base = this;
            var search_bar = base.$el.find('.search_input');

            if (page != undefined && page <= base.page_count && page > 0) {
                base.current_page = page;
            }

            base.blocks_list = SmartBlocks.Blocks.BlockStore.Data.bundle_blocks.filter(function (block) {
                return (!base.selected_tag || block.hasTag(base.selected_tag)) && (search_bar.val() === "" || _.some(block.attributes, function (a) {
                    var words_array = search_bar.val().split(/\s/);
                    console.log(words_array);
                    var value_found = false;
                    for (var k in words_array) {
                        if (typeof  a === "string") {
                            value_found = value_found || a.toLowerCase().indexOf(words_array[k].toLowerCase()) !== -1;
                        }
                    }
                    return value_found;
                }));
            });
            base.page_count = Math.ceil(base.blocks_list.length / base.page_size);
            var blocks = _.rest(base.blocks_list, (base.current_page - 1) * base.page_size);

            blocks = _.first(blocks, base.page_size);

            //pager buttons :
            var pager = base.$el.find(".pagination");
            pager.find(".page_button").parent().remove();
            for (var i = 1; i <= base.page_count; i++) {
                var a = $(document.createElement('a'));
                a.attr('href', 'javascript:void(0);');
                a.addClass('page_button');
                a.attr('data-page', i);
                a.html(i);

                var li = $(document.createElement('li'));
                li.html(a);
                pager.find(".next_page_button").parent().before(li);
            }
            ;


            base.$el.find(".list").html("");
            for (var k in blocks) {
                var block = blocks[k];

                var thumb = new LineThumb({
                    model: block
                });
                var li = $(document.createElement('li'));
                li.html(thumb.$el);
                base.$el.find(".list").append(li);
                thumb.init();
            }
        },
        render: function () {
            var base = this;

            var t = _.template(template, {});
            base.$el.html(t);
            base.renderTags();
        },
        renderTags: function () {
            var base = this;
            var tags = SmartBlocks.Blocks.BlockStore.Data.tags.filter(function (tag) {
                return SmartBlocks.Blocks.BlockStore.Data.bundle_blocks.find(function (block) {
                    return block.hasTag(tag);
                }) !== undefined;
            });
            base.$el.find('.tags_list').html('');
            for (var k in tags) {
                var tag = tags[k];
                base.$el.find('.tags_list').append('<li><a href="javascript:void(0);" ' +
                    'class="filter_by_tag_button" ' +
                    'data-id="' + tag.get('id') + '">' + tag.get('name') + '</a></li>');
            }
            console.log("added filters", tags);
        },
        registerEvents: function () {
            var base = this;

            var search_timer = 0;
            base.$el.delegate('.search_input', 'keyup', function (e) {
                clearTimeout(search_timer);
                search_timer = setTimeout(function () {
                    base.launchSearch();
                }, 500);
            });

            base.$el.delegate('.page_button', 'click', function () {
                var elt = $(this);
                base.launchSearch(elt.attr('data-page'));
            });

            base.$el.delegate('.previous_page_button', 'click', function () {
                base.launchSearch(base.current_page - 1);
            });

            base.$el.delegate('.next_page_button', 'click', function () {
                base.launchSearch(base.current_page + 1);
            });

            base.$el.delegate('.filter_by_tag_button', 'click', function () {
                var $elt = $(this);
                var id = $elt.attr('data-id');
                var tag = SmartBlocks.Blocks.BlockStore.Data.tags.get(id);
                if (tag && (!base.selected_tag || base.selected_tag.get('id') != tag.get('id'))) {
                    base.$el.find('.selected').removeClass('selected');
                    $elt.parent().addClass('selected');
                    base.selected_tag = tag;
                    base.launchSearch();
                } else {
                    base.$el.find('.selected').removeClass('selected');
                    base.selected_tag = undefined;
                    base.launchSearch();
                }
            });
        }
    });

    return View;
});