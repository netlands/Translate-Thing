console.log("connected");

$(document).ready(function () {
	$("#HButton").on("click", function () {
		console.log("Hello there!");
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
			});
	});

	$("#TButton").on("click", function () {
		var termdata = "'" + $("#en").val() + "','" + $("#ja").val() + "','" + $("#furigana").val() + "','" + $("#romaji").val() + "','" + $("#ja2").val() + "','" + $("#en2").val() + "','" + $("#context").val() + "','" + $("#type").val() + "','" + $("#note").val() + "'";
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
	console.log(term);
	document.getElementById("wrapper").innerHTML = '';
	$.ajax({
			url: "/api/getrows",
			data: {
				term: term
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
			console.log(rows);

			const grid = new gridjs.Grid({
				sort: true,
				search: true,
				pagination: {
					limit: 50
				},
				fixedHeader: true,
				height: '400px',
				data: rows
			}).render(document.getElementById("wrapper"));

			grid.on('rowClick', (...args) => console.log('row: ' + JSON.stringify(args), args));
			grid.on('cellClick', (...args) => console.log('cell: ' + JSON.stringify(args), args));

			/* grid.updateConfig({
				sort: true,
				resizable: true,
				search: true,
				pagination: {
					limit: 50
					},
				fixedHeader: true,
				height: '400px',		
				data: rows
			}).forceRender(); */
		});

}

window.onload = function () {
	console.log("Done loading!");
	init();
};

function init() {
	updateTable('');
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

const stmt = db.prepare('UPDATE glossary SET en = ?, ja = ?, furigana = ?, romaji = ?, ja2 = ?, en2 = ?, context = ?, type = ?, note = ? WHERE en = ? AND ja = ? AND furigana = ? AND romaji = ? AND ja2 = ? AND en2 = ? AND context = ? AND type = ? AND note = ?'); 
const updates = stmt.run(enNew, jaNew, furiganaNew, romajiNew, ja2New, en2New, contextNew, typeNew, noteNew, enOld, jaOld, furiganaOld, romajiOld, ja2Old, en2Old, contextOld, typeOld, noteOld);
*/