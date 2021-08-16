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




$(document).ready(function(){
    $(document).on('show.bs.modal','#myModal', function () {
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
			resizable: true,
			search: true,
			pagination: {
				limit: 50
				},
			fixedHeader: true,
			height: '400px',  
			data:  rows	  }).render(document.getElementById("wrapper"));

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