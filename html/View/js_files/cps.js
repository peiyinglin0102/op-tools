/* 說明:放置系統共用需要載入的js */
/*global jQuery*/
/*jslint browser: true, devel: true, regexp: true, plusplus: true */
jQuery(document).ready(function ($) {
    'use strict';
    /* 左側選單滑動顯示 */
    var MenuWidth = '220px';
    $('#menu-toggle').css({'left': MenuWidth});
    $('#menu-toggle').click(function () {
        if ($(this).data('status') === 'show') { /* 收起 */
            $('#side-menu').addClass('hidden');
            $(this).prop('title', '展开').animate({"left": "-=" + MenuWidth}, "slow").data('status', 'hide');
            $("#page-wrapper").animate({"margin-left": "-=" + MenuWidth}, "slow");
        } else { /* 展開 */
            $(this).prop('title', '收起').animate({"left": "+=" + MenuWidth}, "slow").data('status', 'show');
            $("#page-wrapper").animate({"margin-left": "+=" + MenuWidth}, "slow", function () {
                $('#side-menu').removeClass('hidden');
            });
        }
    });

    /* 左側選單JS */
    $('#side-menu').metisMenu();

    /* 調整瀏覽器大小 */
    $(window).bind("load resize", function () {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            $('#menu-toggle').addClass('hidden').prop('title', '展开').data('status', 'hide');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
            $('#menu-toggle').removeClass('hidden').prop('title', '收起').data('status', 'show');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) {
            height = 1;
        }
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", height + "px");
            $("#menu-toggle").css("min-height", $("#page-wrapper").height() + "px");
        }
    });

    /* 展開目前對應的功能下拉清單 */
    var url = window.location;
    var element = $('ul.nav a').filter(function () {
        return this.href === url || url.href.indexOf(this.href) === 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        $('.nav-second-level').removeClass('hide');
        element.addClass('active');
    }
});