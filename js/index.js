// © Garima Kapila (gk347@cornell.edu)
/*
3DMol.js Citation:
Nicholas Rego and David Koes
3Dmol.js: molecular visualization with WebGL
Bioinformatics (2015) 31 (8): 1322-1324 doi:10.1093/bioinformatics/btu829
*/

$('#home').css('font-weight', '800');

/*---------------------- Parse URL String ----------------------*/

var window_url = window.location.href;
query = window_url.substring(window_url.indexOf('?') + 1, window_url.length);
var pairs = query.split('&');
var args = {};
for (var i = 0; i < pairs.length; i++) {
	pair = pairs[i].split('=');
	args[pair[0]] = pair[1];
}
var query = '';
var query_option = '';
var page = "1";

if ('query' in args)
	query = args['query']
if ('query_option' in args)
	query_option = args['query_option']
if ('page' in args)
	page = args['page']
if ('structure' in args)
	current_structure = args['structure']
if ('style' in args)
	current_style = args['style']


/*---------------------- Title ----------------------*/


var sub_title = $('#sub-title');
var sub_title_i = -1;
let phrases = [
	'Visualize 3D Structures',
	'Highlight Features',
	'View Interaction Networks'
];
sub_title_loop();

function sub_title_loop() {
	sub_title_i = (sub_title_i + 1) % phrases.length;
	sub_title.html(phrases[sub_title_i])
	.fadeIn(3000)
	.delay(2000)
	.fadeOut(800, sub_title_loop);
}


/*---------------------- Search Bar ----------------------*/

var search_form = $('#search-option');
var search_bar = $('#search-bar');
var search_options_wrapper = $('#search-options');
var search_options = $('.search-option');
var current_search_option = $('#current-search-option');
var search_caret = $('#search-caret');
var search_button = $('#search-button');
var search_result = $('.search-result');
var search_input = $('#search-input');

search_bar.css('margin-top', '20px');

// Show/hide search options
search_form.click(function() {
	if (search_options_wrapper.css('display') == 'none')
		search_options_wrapper.css('display', 'block');
	else
		search_options_wrapper.css('display', 'none');
	change_caret(search_caret);
});

// Update search option at click
search_options.click(function(){
	current_search_option.html($(this).html());
});

// At click away, close search options
$(document).click(function(e) {
	var target = e.target;		
	if (!$(target).is(search_caret) && !$(target).is(search_form)
		&& !$(target).is(current_search_option)) {
		if (search_options_wrapper.css('display') == 'block') {
			search_options_wrapper.css('display', 'none');
			change_caret(search_caret);
		}
	}
});

if (query != '')
	search_input.val(query);
if (query_option != '') {
	search_options.each(function() {
		if (format($(this).html()) == query_option)
			current_search_option.html($(this).html());
	});
}

search_input.on('keyup', function (e) {
	if (e.keyCode == 13)
		search_clicked();
});

function search_clicked() {
	animate_search_button();
	query = search_input.val();
	query_option = format(current_search_option.html());
	new_url = window_url
	if (window_url.indexOf('?') > -1)
		new_url = window_url.substring(0, window_url.indexOf('?'));
	new_url += "?query=" + query + "&query_option=" + query_option;
	new_url += "&structure=" + current_structure + "&style=" + current_style;
	window.location = new_url;
}

search_button.mouseover(function() {
	search_button.css('background-color', '#268');
});
search_button.mouseout(function() {
	search_button.css('background-color', '#2F9EB9');
});
function animate_search_button() {
	search_button.css('background-color', '#012');
	setTimeout(function() {
		search_button.css('background-color', '#2F9EB9');
	}, 150);
}



/*---------------------- Menu ----------------------*/

// change style options
$('.structure .menu-option').click(function() {
	current_structure = $(this).html();
	change_pdb_style();
});
$('.style .menu-option').click(function() {
	current_style = $(this).html();
	change_pdb_style();
});

/*---------------------- Search Results ----------------------*/

let search_result_colors = [
	"#F0FAFF, #F0FAFF, #96D5DF",
	"#F0FAFF, #F0FAFF, #B6F5FF",
	"#F0FAFF, #F0FAFF, #C0DADF",
	"#C6F5FF, #C6F5FF, #F0FAFF",
	"#C0FADF, #C0FADF, #F0FAFF",
	"#C0FABF, #C0FABF, #F0FAFF",
	"#F0FAFF, #F0FAFF, #C0FADF",
	"#96D5DF, #96D5DF, #F0FAFF",
	"#D0EAEF, #D0EAEF, #F0FAFF",
];


var results;
var uniprots;
var uniprot_acs;
var sample_models;
var sample_models_types;
var num_pages = 0;
var pages = $('#pages');
var page_numbers = $('.page');
var pages_array = [];
var viewers = [];

function get_results() {
	$("#loading").show();
	$("html, body").animate({ scrollTop: 0 }, "medium");
	data = {"results": 
				{"num_pages": 2249, 
				"uniprot_acs": ["A0A024RBG1", "A0A075B6H9", "A0A075B6I0", "A0A075B6I1", "A0A075B6I4", "A0A075B6I9", "A0A075B6J1", "A0A075B6J6", "A0A075B6J9"], 
				"data": {"models": ["4XHP", "5WLG", "5NQK", "4ZAK", "5E9D", "5WLG", "4ZAK", "5NHT", "NONE"], "A0A075B6J1": {"uniprot_name": "Immunoglobulin lambda variable 5-37", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "123", "pfam_start": "24", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV5-37"]}, "A0A075B6I9": {"uniprot_name": "Immunoglobulin lambda variable 7-46", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "116", "pfam_start": "24", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV7-46"]}, "A0A075B6H9": {"uniprot_name": "Immunoglobulin lambda variable 4-69", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "119", "pfam_start": "25", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV4-69"]}, "A0A024RBG1": {"uniprot_name": "Diphosphoinositol polyphosphate phosphohydrolase NUDT4B", "pfams": {}, "gene_names": ["NUDT4B"]}, "A0A075B6J9": {"uniprot_name": "Immunoglobulin lambda variable 2-18", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "118", "pfam_start": "24", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV2-18"]}, "A0A075B6I1": {"uniprot_name": "Immunoglobulin lambda variable 4-60", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "120", "pfam_start": "26", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV4-60"]}, "A0A075B6I0": {"uniprot_name": "Immunoglobulin lambda variable 8-61", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "122", "pfam_start": "29", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV8-61"]}, "A0A075B6J6": {"uniprot_name": "Immunoglobulin lambda variable 3-22", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "115", "pfam_start": "24", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV3-22"]}, "A0A075B6I4": {"uniprot_name": "Immunoglobulin lambda variable 10-54", "pfams": {"PF07686": {"pfam_id": "V-set", "pfam_stop": "116", "pfam_start": "24", "pfam_type": "D", "pfam_name": "Immunoglobulin V-set domain"}}, "gene_names": ["IGLV10-54"]}}}, "success": true}
	uniprots = data["results"]["data"];
	uniprot_acs =  data["results"]["uniprot_acs"];
	num_pages = data["results"]["num_pages"];
	sample_models = uniprots["models"];
	sample_models_types = uniprots["model_types"];
	fill_pages();
	search_results_html();
	$("#loading").hide();
}


/*---------------------- Search Pages ----------------------*/

var left_page = $('#left-page');
var right_page = $('#right-page');

left_page.click(function() {change_page(parseInt(page) - 1)});
right_page.click(function() {change_page(parseInt(page) + 1)});


function fill_pages() {
	page = parseInt(page)
	pages_string = ''
	var start_page = page;
	if (page > 5) start_page = page - 5;
	else start_page = 1
	for (var p = start_page; p < start_page + 10; p++) {
		pages_string += `<span class="page" onclick="change_page(`
			+ p + `)">` + p + `</span>, `;
	}
	pages_string = pages_string.substring(0, pages_string.length - 3);
	pages.html(pages_string);
	bold_current_page();
	if (page == 1) left_page.css('display', 'none');
	else left_page.css('display', '');
	if (page == num_pages) right_page.css('display', 'none');
	else right_page.css('display', '');
}

function bold_current_page() {
	$('.page').each(function() {
		$(this).removeClass("bold")
		if($(this).html() == page)
			$(this).addClass("bold")
	});
}


/*---------------------- Search Results ----------------------*/


function search_results_html() {

	var uniprot_i = 0;
	search_result.each(function() {

		color_gradient = search_result_colors[uniprot_i];
		$(this).attr("style", "background-image: linear-gradient(" 
			+ color_gradient + ")");
		background_color = color_gradient.split(', ')[0];

		uniprot_ac = uniprot_acs[uniprot_i];
		uniprot = uniprots[uniprot_ac];
		uniprot_name = camelCase(uniprot['uniprot_name']);
		gene_names = uniprot['gene_names'];
		pfams_list = uniprot['pfams'];

		gene_names_string = gene_names.join(", ");
		genes_string_title = "Gene";
		if (gene_names.length > 1)
			genes_string_title = 'Genes';
		if (gene_names.length == 0)
			gene_names_string = '---';

		pfams_string = "";
		for (var pfam_ac in pfams_list) {
			pfam = pfams_list[pfam_ac];
			pfam_id = format_pfam_id(pfam['pfam_id']);
			pfam_name = camelCase(pfam['pfam_name']);
			pfam_type = pfam['pfam_type'];
			start = pfam['pfam_start'];
			stop = pfam['pfam_stop'];
			pfams_string += '<div class="pfams_string">' + pfam_name 
				+ " (" + pfam_id + ") #" + pfam_ac + pfam_type + '</div>';
		}
		if (pfams_string == "")
			pfams_string = '<div class="pfams_string">---</div>';
		

		uniprot_link = 'https://www.uniprot.org/uniprot/' + uniprot_ac

		sample_model = sample_models[uniprot_i];

		let element = $('#container-0' + (uniprot_i + 1));

		if (sample_model != "NONE") {
			let config = { backgroundColor: background_color};
			let viewer = $3Dmol.createViewer( element, config );
			let pdbUri = 'https://files.rcsb.org/download/' + sample_model + '.pdb';
			
			jQuery.ajax( pdbUri, { 
				success: function(data) {
					viewer.addModel( data, "pdb" );
					set_viewer_style(viewer);
					viewer.zoomTo();
					viewer.render();
					$("#loading").hide();
				},
				error: function(hdr, status, err) {
					console.log(error);
				},
			});
		}
		else {
			element.html('<div class="no-model">No model to display</div>')
		}

		$(this).find('.search-result-info').html(`
			<a href="protein.html?uniprot_ac=` + uniprot_ac + `" class="search-title">
			<div class="search-uniprot-name" title="UniProt Name: ` 
				+ uniprot_name + `">` + uniprot_name+ `</div>
			<hr class="search-uniprot">
			<div class="search-uniprot-ac" title="UniProt Accession: ` 
				+ uniprot_ac + `">#` + uniprot_ac + `</div>
			<div class="genes_string_title">` + genes_string_title + `</div>
			<div class="genes_string">` + gene_names_string + `</div>
			<div class="pfams_string_title">` + "Pfam" + `</div>
			<div class="pfams_string_container">` + pfams_string + `</div>
			</a>
		`);
		uniprot_i++;
	});

}


/*---------------------- Render Preview ----------------------*/


function change_pdb_style() {
	current_structure = current_structure.toLowerCase();
	current_style = current_style.toLowerCase();

	var uniprot_i = 0;
	search_result.each(function() {

		color_gradient = search_result_colors[uniprot_i];
		background_color = color_gradient.split(', ')[0];
		sample_model = sample_models[uniprot_i];

		let element = $('#container-0' + (uniprot_i + 1));

		if (sample_model != "NONE") {
			let config = { backgroundColor: background_color};
			let viewer = $3Dmol.createViewer( element, config );
			let pdbUri = 'https://files.rcsb.org/download/' + sample_model + '.pdb';
			
			jQuery.ajax( pdbUri, { 
			success: function(data) {
				let v = viewer;
				v.addModel( data, "pdb" );
				set_viewer_style(v);
				v.zoomTo();
				v.render();
				$("#loading").hide();
			},
			error: function(hdr, status, err) {
				console.log(error);
			},
		});
		}
		
		uniprot_i++;
	});
}

function set_viewer_style(viewer) {
	$("#loading").show();

	if (current_structure == 'ribbon') {
		if (current_style == 'default')
			viewer.setStyle({cartoon: {color: 'blue'}});
		if (current_style == 'spectrum')
			viewer.setStyle({cartoon: {color: 'spectrum'}});
		if (current_style == 'chain')
			viewer.setStyle({cartoon: {colorscheme: 'chain'}});
	}
	if (current_structure == 'line') {
		if (current_style == 'default')
			viewer.setStyle({line: {}});
		if (current_style == 'spectrum')
			viewer.setStyle({line: {colorfunc: color_spectrum}});
		if (current_style == 'chain')
			viewer.setStyle({line: {colorscheme: 'chain'}});
	}
	if (current_structure == 'sphere') {
		if (current_style == 'default')
			viewer.setStyle({sphere: {radius: 0.8}});
		if (current_style == 'spectrum')
			viewer.setStyle({sphere: {radius: 0.8, colorfunc: color_spectrum}});
		if (current_style == 'chain')
			viewer.setStyle({sphere: {radius: 0.8, colorscheme: 'chain'}});
	}
	if (current_structure == 'stick') {
		if (current_style == 'default')
			viewer.setStyle({stick: {}});
		if (current_style == 'spectrum')
			viewer.setStyle({stick: {colorfunc: color_spectrum}});
		if (current_style == 'chain')
			viewer.setStyle({stick: {colorscheme: 'chain'}});
	}
}


/*---------------------- General ----------------------*/

function shuffle(a) {
	for (var i = a.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

// Ex. word1 word2 word3 = Word1 Word2 Word3
function camel_case(word) {
	replaces = ['-', '_', '#']
	for(var i = 0; i < replaces.length; i++)
		word = word.replace(replaces[i], '');
	word = word.replace(' ', '_');
	word = word.toLowerCase();
	return word;
}

// Ex. Wor-d 1 #Wor_d2 # = word_1_word2
function format(word) {
	replaces = ['-', '_', '#']
	for(var i = 0; i < replaces.length; i++)
		word = word.replace(replaces[i], '');
	word = word.replace(' ', '_');
	word = word.toLowerCase();
	return word;
}

function camelCase(phrase) {
	words = phrase.split(' ');
	camelCased = "";
	for (var i = 0; i < words.length; i++) {
		word = words[i];
		word = word.substring(0, 1).toUpperCase() + word.substring(1, word.length)
		camelCased += word + ' ';
	}
	return camelCased.substring(0, camelCased.length - 1);
}

function format_pfam_id(pfam_id) {
	var new_string = "";
	for (var i = 0; i < pfam_id.length; i++) {
		c = pfam_id.substring(i, i+1);
		if (c == "_")
			c = " ";
		new_string += c;
	}
	return new_string;
}

function change_page(new_page) {
	new_url = window_url
	if (window_url.indexOf('?') > -1)
		new_url = window_url.substring(0, window_url.indexOf('?'));
	new_url += "?query=" + query + "&query_option=" + query_option + 
		"&structure=" + current_structure + "&style=" + current_style + 
		"&page=" + new_page;
	window.location = new_url;
}

pages.html(page);
get_results();
