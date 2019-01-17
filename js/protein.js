// © Garima Kapila (gk347@cornell.edu)
/*
3DMol.js Citation:
Nicholas Rego and David Koes
3Dmol.js: molecular visualization with WebGL
Bioinformatics (2015) 31 (8): 1322-1324 doi:10.1093/bioinformatics/btu829
*/

alert('This is only a temporary website that showcases my frontend + design skills. Backend is disconnected and data is not accurate.')


/*
key pressed on spacebar, play pause
search_input.on('keyup', function (e) {
	if (e.keyCode == 13)
		search_clicked();
});
*/

var moused_on = new Set([]);
var clicked_indices = new Set([]);
var highlighted = new Set([]);


var chains = $('#chains');
init_chains();


var protein_info = $('#protein-info');
var protein_info_toggle = $('#protein-info-toggle');
protein_info_toggle.click(function() {
	protein_info.fadeToggle();
});

var models_toggle = $('#models-toggle');
var models = $('#models');
var models_caret = models_toggle.find('i');

var triangle_up = $('#triangle-up');
var seq_cell_description = $('#seq-cell-description');
//var microscope_triangle_up = $('#microscope-triangle-up');
//var sequence_microscope = $('#sequence-microscope');
seq_cell_description.css('display', 'none');
triangle_up.css('display', 'none');
//sequence_microscope.css('display', 'none');

/*---------------------- Parse URL String ----------------------*/

var protein_url = window.location.href;
query = protein_url.substring(protein_url.indexOf('?') + 1, protein_url.length);
var pairs = query.split('&');
var query_dict = {};
for (var i = 0; i < pairs.length; i++) {
	pair = pairs[i].split('=');
	query_dict[pair[0]] = pair[1];
}
var uniprot_ac;
var chains;
var selected;
if ('uniprot_ac' in args)
	uniprot_ac = query_dict['uniprot_ac']
if ('structure' in args)
	current_structure = args['structure']
if ('style' in args)
	current_style = args['style']

var link_copy = $('#link-copy');

var link_url = protein_url + 'style=' + current_structure
var link_copy_message = $('#link-copy-message');
link_copy.click(function() {
	link_copy_message.html('Link: ' + link_url);
	link_copy_message.fadeIn(1000);
})
$('#link-copy, #link-copy-message').mouseleave(function() {
	setTimeout(function() {
		link_copy_message.fadeOut(1000);
	}, 1500);
});


/*---------------------- Fetch Uniprot Info ----------------------*/

var protein_uniprot_name = $('#protein-uniprot-name');
//var menu_protein_title = $('#menu-protein-title');
var uniprot_sequence = "";
var pdbs;
var pfams;
var start;
var stop;
var is_preview = false;
var preview_start;
var preview_stop;

results = {"models": [{"model_type": "PDB", "model_id": "3GFT", "stop": "150", "coverage": 79.37, "start": "1"}, {"model_type": "PDB", "model_id": "4OBE", "stop": "189", "coverage": 99.47, "start": "1"}, {"model_type": "PDB", "model_id": "5UFE", "stop": "162", "coverage": 84.13, "start": "3"}, {"model_type": "PDB", "model_id": "5TAR", "stop": "150", "coverage": 78.84, "start": "2"}, {"model_type": "PDB", "model_id": "4DSN", "stop": "176", "coverage": 92.06, "start": "2"}, {"model_type": "PDB", "model_id": "4NMM", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "4QL3", "stop": "167", "coverage": 87.83, "start": "1"}, {"model_type": "PDB", "model_id": "4TQ9", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "5MLA", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "5O2S", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "5V71", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "5XCO", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "6CC9", "stop": "150", "coverage": 73.02, "start": "13"}, {"model_type": "PDB", "model_id": "5W22", "stop": "117", "coverage": 61.9, "start": "1"}, {"model_type": "PDB", "model_id": "6ASA", "stop": "150", "coverage": 61.9, "start": "34"}, {"model_type": "PDB", "model_id": "5WHB", "stop": "150", "coverage": 60.85, "start": "36"}, {"model_type": "PDB", "model_id": "4L8G", "stop": "167", "coverage": 51.85, "start": "70"}, {"model_type": "PDB", "model_id": "6BP1", "stop": "150", "coverage": 48.15, "start": "60"}, {"model_type": "PDB", "model_id": "6F76", "stop": "150", "coverage": 47.09, "start": "62"}, {"model_type": "PDB", "model_id": "5KYK", "stop": "150", "coverage": 45.5, "start": "65"}, {"model_type": "PDB", "model_id": "4WA7", "stop": "150", "coverage": 42.33, "start": "71"}, {"model_type": "PDB", "model_id": "4PZZ", "stop": "117", "coverage": 41.27, "start": "40"}], "uniprot_name": "GTPase KRas", "pfams": {"PF00071": {"pfam_id": "Ras", "pfam_stop": "165", "pfam_start": "5", "pfam_type": "D", "pfam_name": "Ras family"}}, "genes": ["KRAS", "KRAS2", "RASK2"], "sequence": "MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHHYREQIKRVKDSEDVPMVLVGNKCDLPSRTVDTKQAQDLARSYGIPFIETSAKTRQRVEDAFYTLVREIRQYRLKKISKEEKTPGCVKIKKCIIM"}



/*---------------------- Menu ----------------------*/

//menu_titles.next().not(':first').slideUp(1500);
//menu_titles.first().find('i').class('fa fa-chevron-down')
// change style options
$('.structure .menu-option').click(function() {
	current_structure = $(this).html();
	set_viewer_style();
	highlight_on_model();
});
$('.style .menu-option').click(function() {
	current_style = $(this).html();
	set_viewer_style();
	highlight_on_model();
});
// change style options

function menu_chains() {

}

/*---------------------- End Menu ----------------------*/

/*---------------------- Render ----------------------*/

var content_shift = $('.content-shift');
var protein_3D = $('#protein-3D');
var protein_1D = $('#protein-1D');
var viewer = $3Dmol.createViewer(protein_3D, {backgroundColor: 'black'});
var offsetY;
var offsetX;
var seq_cells = $("td.seq-cell");

var play_pause = $('#play-pause');
var spinning = true;
var spin_task;
var time_limit = 50;



$(window).resize(function() {
	update_view_size();
	set_protein_1D();
});
menu_toggle.click(function() {
	setTimeout(function() {
		viewer.resize();
		//alert($('#protein-header').width());
		protein_info.css('width', $('#protein-header').width());
		models.css('width', protein_1D.width() - 20);
		set_protein_1D();
	}, 501);
});


function set_protein_1D() {
	protein_1D_html = "";
	protein_1D.html(protein_1D_html);

	interval = 1 + parseInt(uniprot_sequence.length*3/protein_1D.width());
	for (var i = 0; i < uniprot_sequence.length; i += interval) {
		start_i = i;
		end_i = i + interval - 1;
		start_res = uniprot_sequence[start_i];
		end_res = uniprot_sequence[end_i];
		
		pfam_class = "";
		if (in_pfam_range(start_i, end_i))
			pfam_class = "pfam-cell";
		
		class_clicked = "";
		clicked_array = Array.from(clicked_indices);
		for (h in clicked_array) {
			res_h = clicked_array[h];
			if (start_i + 1 <= res_h && res_h <= end_i + 1)
				class_clicked = "seq-cell-clicked";
		}
		seq_cell_background_color = "#CCC";
		if (is_preview) {
			if (start_i >= preview_start - 1 && end_i < preview_stop)
				seq_cell_background_color = "#84CFE8";
		}
		else {
			if (start_i >= start - 1 && end_i < stop)
				seq_cell_background_color = "#84CFE8";
		}
		protein_1D_html += `
			<td class="seq-pfam-cell" height="30px">
				<table width="100%" class="no-table-border">
					<tr>
						<td height="35px" class="seq-cell ` + class_clicked + `"
							onmouseenter = seq_cells_mouseenter(this)
							onclick = seq_cells_click(this)
							onmousemove = seq_cells_mousemove(this)
							onmouseleave = seq_cells_mouseleave(this)
							start_i="` + start_i + `" 
							end_i="` + end_i + `"
							start_res="` + start_res + `" 
							end_res="` + end_res + ` "
							bgcolor="` + seq_cell_background_color + `"
						></td>
					</tr>
					<tr>
						<td height="15px" class="` + pfam_class + `"></td>
					</tr>
				</table>
			</td>
		`;
	}
	protein_1D.html(protein_1D_html);
	models_left_offset = parse_string_pixels(protein_1D.css('margin-left'));
	models.css('margin-left', models_left_offset - 9 + 'px');

	highlight_on_model();

}


/*---------------------- End Render ----------------------*/

/*---------------------- protein_1D Sequence Mouse ----------------------*/

function seq_cells_mouseenter(sender) {
	sender = $(sender);

	offsetY = protein_1D.offset().top - 64;
	seq_cell_description.css('top', offsetY);
	triangle_up.css('top', offsetY + 49);

	seq_cell_description.css('display', '');
	start_i = parseInt(sender.attr("start_i"));
	res = sender.attr("start_res");
	seq_cell_description.html(`
		<div style="text-align: center; margin-top: 8px; font-family: Roboto; color: white; font-weight: bold">`
			+ start_i + `</div>
		<div style="text-align: center; font-family: Roboto; color: white; font-weight: bold">` + res + `</div>
	`);
	triangle_up.css('display', '');

	if (sender.hasClass('seq-cell-clicked')) {
		seq_cell_description.css('background-color', 'red')
		triangle_up.css('border-top', '16px solid red');
	}
	else {
		seq_cell_description.css('background-color', '#444')
		triangle_up.css('border-top', '16px solid #444');
	}
	moused_on.add(start_i);
	highlight_on_model();
}

function seq_cells_click(sender) {
	sender = $(sender);
	//offsetY = protein_1D.offset().top - 64;
	//sequence_microscope.css('top', offsetY);
	//offsetX = protein_1D.offset().left;
	//seq_cell_description.css('margin-left', event.pageX - offsetX - 22);
	//triangle_up.css('margin-left', event.pageX - offsetX + 8 - 15);
	//sequence_microscope.css('margin-left', event.pageX - offsetX);
	start_i = parseInt(sender.attr("start_i"));
	end_i = parseInt(sender.attr("end_i"));

	if (sender.hasClass('seq-cell-clicked')) {
		sender.removeClass('seq-cell-clicked');

		/*if (start_i < end_i) {
			//seq_cell_description.css('display', 'none');
			//triangle_up.css('display', 'none');
			//sequence_microscope.css('display', '');
		}
		else {*/
			seq_cell_description.css('background-color', '#444');
			triangle_up.css('border-top', '16px solid #444');
		//}
		clicked_indices.delete(start_i);
		highlight_on_model();
	}
	else {
		
		/*if (start_i < end_i) {
			seq_cell_description.css('display', 'none');
			triangle_up.css('display', 'none');
			sequence_microscope.css('display', '');
			fill_microscope_seq_cells(start_i, end_i);
		}
		else {*/
			seq_cell_description.css('background-color', '#444');
			triangle_up.css('border-top', '16px solid #444');
		//}

		sender.addClass('seq-cell-clicked');
		seq_cell_description.css('background-color', 'red');
		triangle_up.css('border-top', '16px solid red');
		clicked_indices.add(start_i);
		highlight_on_model();
	}
}

function seq_cells_mousemove(sender) {
	sender = $(sender);
	seq_cell_description.css('left', event.pageX - 22);
	triangle_up.css('left', event.pageX - 6);
	//triangle_up.css('margin-left', event.pageX - offsetX + 15);
}

function seq_cells_mouseleave(sender) {
	seq_cell_description.css('display', 'none');
	triangle_up.css('display', 'none');
	start_i = $(this).attr("start_i");
	moused_on.delete(start_i);
	highlight_on_model();
}

function highlight() {
	highlight_string = highlight_box.val();
	alert(highlight_string)
	highlight_string = highlight_string.split(',');
	for (var h in highlight_string) {
		highlight = highlight_string[h];
		highlight = parseInt(highlight);
		highlighted.add(highlight);
	}
	highlight_on_model();
}

/*
function fill_microscope_seq_cells(start_i, end_i) {
	sequence_microscope_html = "";
	for (var i = start_i - 1; i < end_i; i++) {
		sequence_microscope_html += `
			<td class="seq-cell"
				onmouseenter = seq_cells_mouseenter(this)
				onclick = seq_cells_click(this)
				onmousemove = seq_cells_mousemove(this)
				onmouseleave = seq_cells_mouseleave(this)
				res_i="` + i + `"
				res="` + uniprot_sequence.substring(i, i+1) +
			`">`+ i + `</td>
		`;
	}
	sequence_microscope.html(sequence_microscope_html);
}
*/

/*---------------------- End protein_1D Pfam Mouse ----------------------*/





function update_view_size() {
	height = $(window).height();
	height -= ($('#protein-header').height() + $('#protein-1D').height() + 4);
	protein_3D.css('height', height);
	protein_3D.css('width', '100%');
	protein_info.css('width', $('#protein-header').width());
	models.css('width', protein_1D.width() + 10);
}


function set_viewer_style() {

	viewer.removeAllSurfaces();

	current_structure = current_structure.toLowerCase();
	current_style = current_style.toLowerCase();

	if (current_structure == 'ribbon') {
		if (current_style == 'default')
			viewer.setStyle({cartoon: {}});
		if (current_style == 'spectrum')
			viewer.setStyle({cartoon: {color: 'spectrum'}});
		if (current_style == 'chain')
			viewer.setStyle({cartoon: {colorscheme: 'chain'}});
	}
	if (current_structure == 'surface') {
		viewer.setStyle({cartoon: {color: 'black'}});
		if (current_style == 'default') 
			viewer.addSurface($3Dmol.SurfaceType.SAS, {opacity:1.0});
		if (current_style == 'spectrum')
			viewer.addSurface($3Dmol.SurfaceType.SAS, {opacity:1.0, colorfunc: color_spectrum});
		if (current_style == 'chain')
			viewer.addSurface($3Dmol.SurfaceType.SAS, {opacity:1.0, colorscheme:'chain'});
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

	viewer.render();
}


// Ex. '123px' -> 123
function parse_string_pixels(string_pixels) {
	return parseInt(string_pixels.substring(0, string_pixels.length - 2));
}




models_toggle.click(function() {
	if (models.css('display') == 'none') {
		models_toggle.css('margin-top', '-' + (50 + models.height()) + 'px');
	}
	else {
		models_toggle.css('margin-top', '-31px');
	}
	models.slideToggle();
	change_caret(models_caret);
});

function init_chains() {
	chains.html(`
		<input type="checkbox" value="A" class="chain" checked> Chain A<br>
	`)
}


function update_chains() {
	
}

function highlight_on_model() {
	set_viewer_style();
	viewer.setStyle({resi:Array.from(clicked_indices)},{sphere:{color: "red"}});
	viewer.setStyle({resi:Array.from(moused_on)},{sphere:{color: "yellow"}});
    //viewer.setStyle({resi:Array.from(highlighted)},{sphere:{color: "red"}});//{cartoon:{color:"red",thickness:1.0}});                  
	viewer.render();
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

play_pause.click(function(event) {
	if (play_pause.hasClass("fa fa-play")) {
		play_pause.removeClass("fa fa-play");
		play_pause.addClass("fa fa-pause");
		spinning = true;
		time_limit = 50;
		spin();
	}
	else {
		play_pause.removeClass("fa fa-pause");
		play_pause.addClass("fa fa-play");
		spinning = false;
		time_limit = 0;
		spin_task.stop();
	}
});

function spin() {
	if (spinning) {
		viewer.rotate(1, 'y', time_limit);
		spin_task = setTimeout(spin, time_limit);
	}
}


















function set_models(models_list) {
	var models_html = "";
	model_width = protein_1D.width() - 1;
	for (model_i in models_list) {
		model = models_list[model_i];
		model_id = model['model_id'];
		model_type = model['model_type'];
		start = model['start'];
		stop = model['stop'];
		coverage = model['coverage'];
		models_html +=
			`
			<div class="model"
			 onclick="set_model(this)"
			 onmouseover="preview_model(this)"
			 onmouseleave="unpreview_model()"
			 start=` + start + `
			 stop=` + stop + `
			 model_type=` + model_type + `
			 model_id=` + model_id + `
			>
				<div>` + 
					model_type + ': ' + 
					model_id + ' | ' + 
					'Coverage: ' + coverage + '% • ' +
					'Start: ' + start + ' • ' + 
					'Stop: ' + stop + 
				`</div>
				<svg class="pdb_rect" width="` + model_width + `
				 " height="20" style="background-color:#BBB">
					<rect width="` + model_width*coverage/100 + 
					 `" x="` + (start - 1)/uniprot_sequence.length*model_width + 
					 `" height="100" style="fill:rgba(100,175,200,0.8);"/>
				</svg>
			</div>
			`
	}
	model = models_list[0];
	start = model['start'];
	stop = model['stop'];
	models.html(models_html);
}

function init_model_setup(model) {
	start = model['start'];
	stop = model['stop'];
	model_id = model['model_id'];
	let pdbUri = 'https://files.rcsb.org/download/' + model_id + '.pdb';
	jQuery.ajax( pdbUri, { 
		success: function(data) {
			viewer = $3Dmol.createViewer(protein_3D, {backgroundColor: 'black'});
			viewer.render();
			viewer.addModel( data, "pdb" );
			set_viewer_style();
			viewer.zoomTo();
			viewer.render();
			model_3D_hoverable();
		},
		error: function(hdr, status, err) {
			alert( "Failed to load PDB " + pdbUri + ": " + err );
		},
	});
}

function set_model(sender) {
	new_model = $(sender);
	models_toggle.trigger('click');
	protein_info_toggle.trigger('click');
	start = new_model.attr('start')
	stop = new_model.attr('stop')
	model_id = new_model.attr('model_id');
	let pdbUri = 'https://files.rcsb.org/download/' + model_id + '.pdb';
	viewer = $3Dmol.createViewer(protein_3D, {backgroundColor: 'black'});
	jQuery.ajax( pdbUri, { 
		success: function(data) {
			viewer.addModel( data, "pdb" );
			set_viewer_style();
			viewer.zoomTo();
			viewer.render();
			model_3D_hoverable();
		},
		error: function(hdr, status, err) {
			alert( "Failed to load PDB " + pdbUri + ": " + err );
		},
	});
	set_protein_1D();
}

function preview_model(sender) {
	sender = $(sender);
	preview_start = sender.attr('start');
	preview_stop = sender.attr('stop');
	is_preview = true;
	set_protein_1D();

}

function unpreview_model() {
	is_preview = false;
	set_protein_1D();
}

function in_pfam_range(start_i, end_i) {
	for (pfam_i in pfams) {
		pfam = pfams[pfam_i];
		pfam_start = pfam['pfam_start'];
		pfam_stop = pfam['pfam_stop'];
		if (start_i + 1 >= pfam_start && end_i + 1 <= pfam_stop)
			return true;
	}
	return false;
}


function model_3D_hoverable() {
	viewer.setHoverable(
		{},
		true,
		function(atom,viewer,event,container) {
			if(!atom.label) {
				atom.label = viewer.addLabel(atom.resn+":"+atom.atom,{position: atom, backgroundColor: 'mintcream', fontColor:'black'});
				clicked_indices.add(atom.resi);
			}
		},
		function(atom) { 
			if(atom.label) {
				viewer.removeLabel(atom.label);
				delete atom.label;
				clicked_indices.delete(atom.resi);
			}
		}
	);
	viewer.render();
	highlight_on_model();
	set_protein_1D();
}

function model_3D_clickable() {
	viewer.setClickable(
		{},
		true,
		function(atom,viewer,event,container) {
			if(!atom.label) {
				atom.label = viewer.addLabel(atom.resn+":"+atom.atom,{position: atom, backgroundColor: 'mintcream', fontColor:'black'});
			}
		},
		function(atom) { 
			if(atom.label) {
				viewer.removeLabel(atom.label);
				delete atom.label;
			}
		}
	);
	viewer.render();
	highlight_on_model();
	set_protein_1D();
}


update_view_size();
viewer.resize();
spin();
set_protein_1D();
uniprot_name = camelCase(results['uniprot_name']);
protein_uniprot_name.html(uniprot_name);
//menu_protein_title.html(uniprot_name)
uniprot_sequence = results["sequence"];
set_models(results['models']);
init_model_setup(results['models'][0]);
//pdbs = data["pdbs"];
pfams = results["pfams"];
set_protein_1D();
setTimeout(function() {
	protein_info.fadeOut( 2000 );
}, 4000);

