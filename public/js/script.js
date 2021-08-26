// console.log("connected");

$(document).ready(function () {
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
			return $.trim($(this).text()) == data.en.age
		}).prop('selected', true);
		jQuery("#titleCategory option").filter(function () {
			return $.trim($(this).text()) == data.en.category
		}).prop('selected', true);
		data.en.type.forEach(function callbackFn(element) {
			jQuery("#titleType option").filter(function () {
				return $.trim($(this).text()) == element
			}).prop('selected', true);
		})
		data.en.color.forEach(function callbackFn(element) {
			jQuery("#titleColor option").filter(function () {
				return $.trim($(this).text()) == element
			}).prop('selected', true);
		})			
		data.en.material.forEach(function callbackFn(element) { 		
			jQuery("#titleMaterial option").filter(function () {
				return $.trim($(this).text()) == element
			}).prop('selected', true);
		})
		data.en.pattern.forEach(function callbackFn(element) { 
			jQuery("#titlePattern option").filter(function () {
				return $.trim($(this).text()) == element
			}).prop('selected', true);
		})
		data.en.technique.forEach(function callbackFn(element) { 
			jQuery("#titleTechnique option").filter(function () {
				return $.trim($(this).text()) == element
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
				};
			});
	});



});


$(document).ready(function () {

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

});

// [{"en":"silk","ja":"正絹","furigana":"","romaji":"shouken","ja2":"","en2":"","context":"","type":"material","note":""},{"en":"silk","ja":"絹","furigana":"きぬ","romaji":"kinu","ja2":"","en2":"","context":"","type":"material","note":""}]

function updateTable(term) {
	// console.log(term);
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
				search: true,
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
				height: '680px'
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
