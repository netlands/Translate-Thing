// console.log("connected");

function ready(fn) {
	// $(document).ready(function () { ... })
	if (document.readyState !== 'loading') {
	  fn();
	  return;
	}
	document.addEventListener('DOMContentLoaded', fn);
 }

ready(function(){ // $(document).ready(function () {
	console.log("Page structure loaded!");
	$('select').selectpicker();

	$("#HButton").on("click", function () {
		// console.log("Hello there!");
		var original = $("#original").val();
		$.ajax({
				url: "/api/translate",
				data: {
					original: original
				},
				success: function () {
					console.log('Successfully connected to the server');
				},
				error: function () {
					console.log('Something went wrong');
				}
			})
			.done(function (data) {
				console.log("returned data:", data);
				$('#translation').html(data.translation);
				updateTitleValues(data)
			});
	});

	function updateTitleValues(data) {
		
		const reg = /^([　\s]*)(.+?)([　\s]*)$/g;
		titleJapanese = data.ja.age + "　" + data.ja.category + "　" + data.ja.type.join(" ") + "　" + data.ja.color.join(" ") + "　" + data.ja.material.join(" ") + "　" + data.ja.pattern.join(" ") + "　" + data.ja.technique.join(" ");
		titleJapanese = titleJapanese.replace(reg, "$2");
		document.getElementById("titleTranslated").value = titleJapanese;

		jQuery("#titleAge option").filter(function () {
			return $(this).text().trim() == data.en.age
		}).prop('selected', true);
		jQuery("#titleCategory option").filter(function () {
			return $(this).text().trim() == data.en.category
		}).prop('selected', true);
		data.en.type.forEach(function callbackFn(element) {
			jQuery("#titleType option").filter(function () {
				return $(this).text().trim() == element
			}).prop('selected', true);
		})
		data.en.color.forEach(function callbackFn(element) {
			jQuery("#titleColor option").filter(function () {
				return $(this).text().trim() == element
			}).prop('selected', true);
		})			
		data.en.material.forEach(function callbackFn(element) { 		
			jQuery("#titleMaterial option").filter(function () {
				return $(this).text().trim() == element
			}).prop('selected', true);
		})
		data.en.pattern.forEach(function callbackFn(element) { 
			jQuery("#titlePattern option").filter(function () {
				return $(this).text().trim() == element
			}).prop('selected', true);
		})
		data.en.technique.forEach(function callbackFn(element) { 
			jQuery("#titleTechnique option").filter(function () {
				return $(this).text().trim() == element
			}).prop('selected', true);
		})		
		$('.selectpicker').selectpicker('refresh');
	}

	$("#TButton").on("click", function () {
		var termdata = "'" + $("#en").val() + "','" + $("#ja").val() + "','" + $("#furigana").val() + "','" + $("#romaji").val() + "','" + $("#ja2").val() + "','" + $("#en2").val() + "','" + $("#context").val() + "','" + $("#type").val() + "','" + $("#priority").val() + "','" + $("#group").val() + "','" + $("#note").val() + "'";
		$.ajax({
				url: "/api/addterm",
				data: {
					en: $("#en").val(),
					ja: $("#ja").val(),
					furigana: $("#furigana").val(),
					romaji: $("#romaji").val(),
					ja2: $("#ja2").val(),
					en2: $("#en2").val(),
					context: $("#context").val(),
					type: $("#type").val(),
					priority: $("#priority").val(),
					group: $("#group").val(),
					note: $("#note").val()
				},
				success: function () {
					console.log('Successfully connected to the server');
				},
				error: function () {
					console.log('Something went wrong');
				}
			})
			.done(function (data) {
				console.log("returned data:", data);
				if (data.message = "term added") {
					$('#myModal').modal('hide');
					$('#addTerm')[0].reset();
					updateTable("");
				};
			});

	});

	$("#UButton").on("click", function () {
		$.ajax({
				url: "/api/updateterm",
				data: {
					en: $("#enx").val(),
					ja: $("#jax").val(),
					furigana: $("#furiganax").val(),
					romaji: $("#romajix").val(),
					ja2: $("#ja2x").val(),
					en2: $("#en2x").val(),
					context: $("#contextx").val(),
					type: $("#typex").val(),
					priority: $("#priorityx").val(),
					group: $("#groupx").val(),
					note: $("#notex").val(),
					id: $("#idx").val() 
				},
				success: function () {
					console.log('Successfully connected to the server');
				},
				error: function () {
					console.log('Something went wrong');
				}
			})
			.done(function (data) {
				console.log("returned data:", data);
				if (data.message = "term updated") {
					$('#myModalx').modal('hide');
					$('#editTerm')[0].reset();
					updateTable("");
				};
			});
	});

	$("#DButton").on("click", function () {
		const id = $("#idx").val();
		if (!id) {
			alert('No term selected to delete');
			return;
		}
		if (!confirm('Are you sure you want to delete this term? This action cannot be undone.')) {
			return;
		}
		$.ajax({
			url: "/api/deleteterm",
			data: { id: id },
			success: function () {
				console.log('Successfully connected to the server');
			},
			error: function () {
				console.log('Something went wrong');
			}
		})
		.done(function (data) {
			console.log("returned data:", data);
			if (data.message === "term deleted") {
				$('#myModalx').modal('hide');
				updateTable("");
			} else {
				alert('Delete failed: ' + (data.message || JSON.stringify(data)));
			}
		});
	});


	$(document).on('show.bs.modal', '#myModal', function () {
		// Use try & catch for unsupported browser
		var text = document.getElementById("original");
		var t = text.value.substr(text.selectionStart, text.selectionEnd - text.selectionStart);
		if (t.trim().length == 0) {
			text = document.getElementById("translation");
			t = text.value.substr(text.selectionStart, text.selectionEnd - text.selectionStart);
		}

		if (t.trim().length != 0) {
			console.log(t)
			document.getElementById("en").value = t.trim();
		}

		/* try {
			// The important part (copy selected text)
			var ok = document.execCommand('copy');

			if (ok) console.log('Copied!');
			else    console.log('Unable to copy!');
		} catch (err) {
			console.log('Unsupported Browser!');
		} */

		$('#myModal').show();
	});

	$('#myModal').on('hidden.bs.modal', function () {
		$("#addTerm").trigger("reset"); // Reset form
	});

	fillTemplate();

});

// [{"en":"silk","ja":"正絹","furigana":"","romaji":"shouken","ja2":"","en2":"","context":"","type":"material","note":""},{"en":"silk","ja":"絹","furigana":"きぬ","romaji":"kinu","ja2":"","en2":"","context":"","type":"material","note":""}]

function updateTable(term) {
	searchTerm = term; 
	try {
		searchTerm = document.querySelector(".gridjs-search-input").value;
	} catch {
		// searchTerm = "";
	}	
	// console.log(searchTerm);
	document.getElementById("table").innerHTML = '';
	$.ajax({
			url: "/api/gettable",
			data: {
				table: "glossary"
			},
			success: function () {
				console.log('Successfully connected to the server');
			},
			error: function () {
				console.log('Something went wrong');
			}
		})
		.done(function (data) {
			rows = data.rows;
			// console.log(rows);
			updateTitleFields(rows);

			const grid = new gridjs.Grid({
				sort: true,
				search: {
					enabled: true,
					keyword: searchTerm
				},	
				pagination: {
					limit: 50
				},
				fixedHeader: true,
				height: '400px',		
				data: rows
			}).render(document.getElementById("table"));

			//grid.on('rowClick', (...args) => console.log('row: ' + JSON.stringify(args), args));
			//grid.on('cellClick', (...args) => console.log('cell: ' + JSON.stringify(args), args));
			grid.on('rowClick', (...args) =>  getFields(JSON.stringify(args)));


			// hide id field
			grid.updateConfig({			
				columns: ["en", "ja", "furigana","romaji", "ja2", "en2", "context", "type", "priority", "group", "note",
					{ name : "id",
					hidden: true },
				],
				height: '500px'
			}).forceRender();

		});

		$(".translate .selectpicker").on("change", function (value) {
		var This = $(this);
		var selectedD = $(this).val();
		// console.log(selectedD);
		var titleAge = $("#titleAge").val().toString().replaceAll(",", " ");
		var titleCategory = $("#titleCategory").val().toString().replaceAll(",", " ");
		var titleType = $("#titleType").val().toString().replaceAll(",", " ");
		var titleColor = $("#titleColor").val().toString().replaceAll(",", " ");
		var titleMaterial = $("#titleMaterial").val().toString().replaceAll(",", " ");
		var titlePattern = $("#titlePattern").val().toString().replaceAll(",", " ");
		var titleTechnique = $("#titleTechnique").val().toString().replaceAll(",", " ");
		var titleTranslated = (titleAge + "　" + titleCategory + "　" + titleType + "　" + titleColor + "　" + titleMaterial + "　" + titlePattern + "　" + titleTechnique).replace(/^[　 ]*(.+?)[　 ]*$/, "$1").replace(/(　){2,}/g, "　");
		document.getElementById("titleTranslated").value = titleTranslated;
	});

}

// Right-click context menu for glossary table
document.addEventListener('DOMContentLoaded', function () {
	const tableContainer = document.getElementById('table');
	const menu = document.getElementById('glossary-context-menu');
	let currentRowData = { en: '', ja: '' };

	// Helper to hide menu
	function hideMenu() {
		if (menu) menu.style.display = 'none';
	}

	// Click anywhere hides the menu
	document.addEventListener('click', function (e) {
		hideMenu();
	});

	// Context menu on table
	tableContainer.addEventListener('contextmenu', function (e) {
		// find the clicked row element
		let el = e.target;
		// gridjs uses td inside tr, try to find ancestor tr
		while (el && el !== tableContainer && el.tagName !== 'TR') {
			el = el.parentElement;
		}
		if (!el || el === tableContainer) {
			return; // not on a row
		}

		// prevent default browser menu
		e.preventDefault();

		// get cells: en, ja and id (if present in a hidden column)
		const tds = el.querySelectorAll('td');
		if (!tds || tds.length < 2) {
			return;
		}
		const en = tds[0].innerText.trim();
		const ja = tds[1].innerText.trim();
		// try to get id from last cell
		const idCell = tds[tds.length - 1];
		let rowId = '';
		if (idCell) {
			rowId = idCell.innerText.trim();
		}
		currentRowData = { en: en, ja: ja, id: rowId };

		// position and show menu
		menu.style.left = e.pageX + 'px';
		menu.style.top = e.pageY + 'px';
		menu.style.display = 'block';
	});

	// Menu item clicks
	menu.addEventListener('click', function (e) {
		const action = e.target.getAttribute('data-action');
		if (!action) return;
		if (action === 'copy-en') {
			navigator.clipboard.writeText(currentRowData.en).then(function () {
				console.log('Copied EN:', currentRowData.en);
			});
		} else if (action === 'copy-ja') {
			navigator.clipboard.writeText(currentRowData.ja).then(function () {
				console.log('Copied JA:', currentRowData.ja);
			});
		} else if (action === 'delete-entry') {
			// confirm and call delete API. If id is missing in the DOM, try to find it via /api/gettable
			function doDelete(idToDelete) {
				if (!idToDelete) {
					alert('No id found for this row');
					return;
				}
				$.ajax({
					url: '/api/deleteterm',
					data: { id: idToDelete },
					success: function () { console.log('Delete requested'); },
					error: function () { console.log('Delete request failed'); }
				}).done(function (data) {
					console.log('delete response', data);
					if (data && data.message === 'term deleted') {
						updateTable('');
					} else {
						alert('Delete failed: ' + (data && data.message ? data.message : JSON.stringify(data)));
					}
				});
			}

			if (!confirm('Delete this entry? This cannot be undone.')) {
				hideMenu();
				return;
			}

			if (currentRowData.id && /^\d+$/.test(currentRowData.id)) {
				// looks numeric; assume it's a valid id
				doDelete(currentRowData.id);
			} else {
				// fetch rows matching the English term and try to locate the exact row by ja
				$.ajax({
					url: '/api/getrows',
					data: { term: currentRowData.en },
					success: function () {},
					error: function () { console.log('Failed to fetch rows for id lookup'); }
				}).done(function (data) {
					try {
						const rows = data.rows || [];
						let foundId = null;
						for (let i = 0; i < rows.length; i++) {
							const r = rows[i];
							// r is an object returned from the DB (en, ja, ... , id)
							if (r.en === currentRowData.en && r.ja === currentRowData.ja) {
								foundId = r.id;
								break;
							}
						}
						if (foundId) {
							doDelete(foundId);
						} else {
							alert('Could not find matching id for this row');
						}
					} catch (err) {
						console.error(err);
						alert('Error finding id: ' + err.message);
					}
				});
			}
		}
		hideMenu();
	});

	// Hide builtin context menu when clicking outside
	document.addEventListener('contextmenu', function (e) {
		// If the click is inside our grid container, we've already handled it; otherwise let it be
		if (!tableContainer.contains(e.target)) return;
		e.preventDefault();
	});
});

window.onload = function () {
	console.log("Done loading!");
	init();
};

function init() {
	updateTable('');
	var input = document.getElementById('furigana');
	wanakana.bind(input);
	$.fn.autoKana('#ja', '#furigana', {
		katakana: false
	});
}

function addRomaji(hiragana,targetId) {
	document.getElementById(targetId).value = wanakana.toRomaji(hiragana);
}

function fillTemplate() {
	$.ajax({
		url: "/api/template",
		data: {
			msg : ""
		},
		success: function () {
			console.log('Successfully connected to the server');
		},
		error: function () {
			console.log('Something went wrong');
		}
	})
	.done(function (data) {
		console.log("returned data:", data);
		// $('#original').val(data[Object.keys(data)[0]]); // if key is unknown
		$('#original').val(data.template);
	});
}



function updateTitleFields(data) {
	$('.selectpicker').children().remove().end();
	for (let i = 0; i < data.length; i++) {
		// console.log(i + " " + data[i].en + " " + data[i].type);
		if (data[i].type !== undefined) {
			switch (data[i].type.toLowerCase()) {
				case "color":
					$('#titleColor').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				case "material":
					$('#titleMaterial').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				case "type":
					$('#titleType').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				case "category":
					$('#titleCategory').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				case "pattern":
					$('#titlePattern').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				case "technique":
					$('#titleTechnique').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;					
				case "age":
					$('#titleAge').append('<option value="' + data[i].ja + '">' + data[i].en + '</option>');
					break;
				default:
					// nothing to do
			}
		}
	}

	$('#titleAge').selectpicker({
		noneSelectedText: 'Age'
	});
	$('#titleCategory').selectpicker({
		noneSelectedText: 'Category'
	});
	$('#titleType').selectpicker({
		noneSelectedText: 'Type'
	});
	$('#titleColor').selectpicker({
		noneSelectedText: 'Color(s)'
	});
	$('#titleMaterial').selectpicker({
		noneSelectedText: 'Material(s)'
	});
	$('#titlePattern').selectpicker({
		noneSelectedText: 'Pattern/Design'
	});
	$('#titleTechnique').selectpicker({
		noneSelectedText: 'Technique(s)'
	});
	$('.selectpicker').selectpicker('refresh');
}

/*
crappyJSON = 'row: [{"isTrusted":true},{"_id":"bdbae77e-f5f3-48b6-951d-692a58859aed","_cells":[{"_id":"26997b69-5036-4b2b-9e78-2009eed90cf5","data":"age"},{"_id":"3343d507-dd51-4f15-85cf-25c83671d37a","data":"年代"},{"_id":"a57a682b-fe4b-4013-8652-528446c58abb","data":"ねんだい"},{"_id":"ff00c337-7267-47bd-874f-ed9289c8b732","data":"nendai"},{"_id":"7c1089fa-895f-46db-8691-2ae9bea22e75","data":""},{"_id":"db962084-c809-42cf-a3ad-e3cc7c6c7703","data":""},{"_id":"2c1cee4e-76f5-4649-9425-b16c293d01de","data":""},{"_id":"b9e806d7-a599-410f-be7c-42d0fd12678f","data":"property"},{"_id":"508da64a-b961-44ed-8734-d0efd4e603c5","data":""}]}]' 
var fixedJSON = "{" + crappyJSON.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ') + "}"; 
data = JSON.parse(fixedJSON);

cells  = data["row"][1]["_cells"];
result = cells.length + "\n";
for (let i = 0; i < cells.length; i++) {
	result = result + "\n" + cells[i]["data"]
}
alert(result); 
*/



function getFields(data) {
	// console.log(data);
	row = JSON.parse(data);
	cells = row[1]["_cells"];
	en = cells[0]["data"];
	ja = cells[1]["data"];
	furigana = cells[2]["data"];
	romaji = cells[3]["data"];
	ja2 = cells[4]["data"];
	en2 = cells[5]["data"]; 
	context = cells[6]["data"]; 
	typeStr = cells[7]["data"]; 
	priority = cells[8]["data"]; 
	group = cells[9]["data"]; 
	note = cells[10]["data"]; 
	id = cells[11]["data"];
	console.log(id);

	document.getElementById("enx").value = en;
	document.getElementById("jax").value = ja;
	document.getElementById("furiganax").value = furigana;
	document.getElementById("romajix").value = romaji;
	document.getElementById("ja2x").value = ja2;
	document.getElementById("en2x").value = en2;
	document.getElementById("contextx").value = context;
	document.getElementById("typex").value = typeStr;
	document.getElementById("priorityx").value = priority;
	document.getElementById("groupx").value = group;
	document.getElementById("notex").value = note;
	document.getElementById("idx").value = id;

	$('#myModalx').modal('show'); 
}
