// © Garima Kapila (gk347@cornell.edu)

var menu_url = window.location.href;
query = menu_url.substring(menu_url.indexOf('?') + 1, menu_url.length);
var pairs = query.split('&');
var args = {};
for (var i = 0; i < pairs.length; i++) {
	pair = pairs[i].split('=');
	args[pair[0]] = pair[1];
}

var current_structure = 'ribbon';
var current_highlight = '';
var current_style = 'spectrum';
var current_chains = '';


if ('structure' in args)
	current_structure = args['structure']
if ('style' in args)
	current_style = args['style']
if ('highlight' in args)
	current_highlight = args['highlight']
if ('chains' in args)
	current_chains = args['chains']

menu_content = $('#menu-content');
menu_content.css('max-height', ($(window).height() - 145) + 'px');
$(window).resize(function() {
	menu_content.css('max-height', ($(window).height() - 145) + 'px');
});

// change style options
var structures = $('.structure .menu-option');
structures.click(function() {
	var target = $(this);
	structures.removeClass('menu-option-clicked');
	target.addClass('menu-option-clicked');
});

// change color options
var styles = $('.style .menu-option');
styles.click(function() {
	var target = $(this);
	styles.removeClass('menu-option-clicked');
	target.addClass('menu-option-clicked');
})

// slide up or down sub-menu
var menu_titles = $('.menu-title');
menu_titles.click(function(event) {
	event.preventDefault();
	target = $(this);
	var caret = target.find('i');
	change_caret(caret);
	var options = target.next();
	change_slide(options);
});

// highlight box
var highlight_box = $('#highlight-box');
var highlight_clear = $('#highlight-clear');
highlight_clear.click(function() {
	highlight_box.val('');
});

/*
var color_palette = $('#');
var colors = $('.color');
colors.click(function() {
	target = $(this);
	
});

*/

// toggle menu: shift left and right
var menu_toggle = $('#menu-toggle');
var menu = $('#menu');
menu.css('height', $(window).height());
$(window).resize(function() { 
	menu.css('height', $(window).height());
});
var content_shift = $('.content-shift');
var menu_width = menu.css('width');
menu_toggle.click(function() {
	if (menu.offset().left == 0) {
		menu.css('left', '-' + menu_width);
		content_shift.css('margin-left', '0px');
		menu_toggle.css('width', '25px');
		$('#logo').css('padding-left', '65px');
	}
	else {
		menu.css('left', '0px');
		content_shift.css('margin-left', menu_width);
		menu_toggle.css('width', '189px');
		$('#logo').css('padding-left', '25px');
	}
});

init_menu();

function init_menu() {
	menu_titles.each(function() {
		curr = $(this).html()
		$(this).html(
			`<table class="menu-table">
				<tr>
					<th style="font-weight:400;">` + curr + `</th>` + `
					<th width=15px;><i class="fa fa-chevron-up"></i>` + `</th>
				</tr>
			</table>`
		)
	});
	structures.each(function() {
		if ($(this).html().toLowerCase() == current_structure.toLowerCase()) {
			$(this).addClass('menu-option-clicked');
		}
	});
	init_highlight_box();
	styles.each(function() {
		if ($(this).html().toLowerCase() == current_style.toLowerCase()) {
			$(this).addClass('menu-option-clicked');
		}
	});
}

function init_highlight_box() {
	let highlight_box_attrs = [
		['rows', '5'],
		['placeholder', 'Ex. 1-3, 10, 11-12:blue, 20:#F00'],
		['onkeyup', 'highlight()']
	];
	for (var i = 0; i < highlight_box_attrs.length; i++) {
		attrs = highlight_box_attrs[i]
		highlight_box.attr(attrs[0], attrs[1]);
	}
	highlight_box.val(current_highlight);
}

function change_caret(caret) {
	if (caret.hasClass('fa fa-chevron-down')) {
		caret.removeClass('fa fa-chevron-down');
		caret.addClass('fa fa-chevron-up');
	}
	else {
		caret.removeClass('fa fa-chevron-up');
		caret.addClass('fa fa-chevron-down');
	}
}

function change_slide(sliding) {
	if (sliding.css('display') == 'none')
		sliding.slideDown();
	else
		sliding.slideUp();
}

var color_spectrum = function(atom) {
	if (atom.resi % 6 == 0)
		return 'red'
	if ((atom.resi + 1) % 6 == 0)
		return 'orange'
	if ((atom.resi + 2) % 6 == 0)
		return 'yellow'
	if ((atom.resi + 3) % 6 == 0)
		return 'green'
	if ((atom.resi + 4) % 6 == 0)
		return 'blue'
	if ((atom.resi + 5) % 6 == 0)
		return 'violet'
};
