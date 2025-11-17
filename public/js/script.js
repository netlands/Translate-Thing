// console.log("connected");

function toTitleCase(str) {
	if (!str) return '';
	return str.replace(
		/\w\S*/g,
		function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}
function ready(fn) {
	// $(document).ready(function () { ... })
	if (document.readyState !== 'loading') {
	  fn();
	  return;
	}
	document.addEventListener('DOMContentLoaded', fn);
 }

 // This variable will hold the data of an existing term if found.
 let existingTermData = null;
 let previewedTermData = null;

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

	});

	// Execute SQL (SELECT only)
	$(document).on('click', '#ExecSQL', function () {
		const sql = document.getElementById('sqlQuery').value;
		if (!sql || sql.trim().length === 0) {
			alert('Please enter a SELECT SQL query');
			return;
		}
		$.ajax({
			url: '/api/execsql',
			type: 'POST',
			data: { sql: sql },
			success: function () {},
			error: function (xhr) { 
				let msg = 'Error executing SQL';
				try { msg = JSON.parse(xhr.responseText).error || JSON.parse(xhr.responseText).message; } catch (e) {}
				alert(msg);
			}
		}).done(function (data) {
			const resEl = document.getElementById('sqlResult');
			resEl.style.display = 'none';
			if (!data || !data.rows) {
				resEl.style.display = 'block';
				resEl.textContent = 'No rows';
				return;
			}
			// Render SQL result rows into the main table using GridJS (object mode)
			const rows = data.rows;
			// Update title fields (in case SQL returned glossary-like rows)
			try { updateTitleFields(rows); } catch (e) {}
			document.getElementById('table').innerHTML = '';
			const grid = new gridjs.Grid({
				sort: true,
				search: { enabled: true },
				pagination: { limit: 50 },
				fixedHeader: true,
				height: '400px',
				data: rows
			}).render(document.getElementById('table'));

			grid.updateConfig({
				columns: ["en", "ja", "furigana","romaji", "ja2", "en2", "context", "type", "priority", "group", "note",
					{ name: 'postId', hidden: true },
					{ name: 'id', hidden: true },
				],
				height: '500px'
			}).forceRender();

			addGridEventHandlers(grid);
				// show transformed SQL if provided by server, otherwise hide the element
				try {
					if (data && data.transformedSql) {
						$('#transformedSql').text(data.transformedSql).show();
					} else {
						$('#transformedSql').hide().text('');
					}
				} catch (e) {}
		});
	});

	$(document).on('click', '#ClearSQL', function() {
        $('#sqlQuery').val('');
        $('#transformedSql').hide().text('');
        $('#sqlResult').hide().text('');
        updateTable('');
    });

	$('#myModal').on('hidden.bs.modal', function () {
		// When the modal is closed, reset the form and hide the 'Display existing' button.
		// We will no longer clear existingTermData here to prevent race conditions.
		// It is cleared at the start of checkExistingTerm instead.
		$('#editTerm')[0].reset();
		$('#displayExistingBtn').hide();
	});

	// This function will run when the "Display existing entry" button is clicked.
	$('#displayExistingBtn').on('click', function() {
		console.log('"Display existing entry" button was clicked.');

		if (existingTermData) {
			if (existingTermData.postId && existingTermData.postId.length > 0) {
				console.log("Existing post detected");
			}
			// Use a one-time event listener to open the edit modal AFTER the add modal is fully closed.
			// This prevents modal conflicts.
			$('#myModal').one('hidden.bs.modal', function() {
				// Populate the "Edit" modal (#myModalx) with the existing data
				$("#enx").val(existingTermData.en);
				$("#jax").val(existingTermData.ja);
				$("#furiganax").val(existingTermData.furigana);
				$("#romajix").val(existingTermData.romaji);
				$("#ja2x").val(existingTermData.ja2);
				$("#en2x").val(existingTermData.en2);
				$("#contextx").val(existingTermData.context);
				$("#typex").val(existingTermData.type);
				$("#priorityx").val(existingTermData.priority);
				$("#groupx").val(existingTermData.group);
				$("#notex").val(existingTermData.note);
				$("#idx").val(existingTermData.id);
				if (document.getElementById("postIdx")) {
					document.getElementById("postIdx").value = existingTermData.postId;
				}

				const postButton = document.getElementById('PostFromEditButton');
				if (existingTermData.postId && existingTermData.postId.length > 0) {
					postButton.textContent = 'Update Post';
				} else {
					postButton.textContent = 'Post';
				}

				// Now, safely show the "Edit" modal.
				$('#myModalx').modal('show');
			});

			// After setting up the listener, trigger the 'Add' modal to close.
			$('#myModal').modal('hide');
		} else {
			console.log('No existing term data found.');
		}
	});

	$('#confirmationModal').on('hidden.bs.modal', function () {
		// Hide the Post and Edit buttons when the modal is closed
		$('#PostFromPreviewButton').hide();
		$('#editFromPreviewButton').hide();
	});

	$('#editFromPreviewButton').on('click', function() {
		if (previewedTermData) {
			if (previewedTermData.postId && previewedTermData.postId.length > 0) {
				console.log("Existing post detected");
			}
			$('#confirmationModal').one('hidden.bs.modal', function() {
				// Populate the "Edit" modal (#myModalx) with the previewed data
				$("#enx").val(previewedTermData.en);
				$("#jax").val(previewedTermData.ja);
				$("#furiganax").val(previewedTermData.furigana);
				$("#romajix").val(previewedTermData.romaji);
				$("#ja2x").val(previewedTermData.ja2);
				$("#en2x").val(previewedTermData.en2);
				$("#contextx").val(previewedTermData.context);
				$("#typex").val(previewedTermData.type);
				$("#priorityx").val(previewedTermData.priority);
				$("#groupx").val(previewedTermData.group);
				$("#notex").val(previewedTermData.note);
				$("#idx").val(previewedTermData.id);
				$("#postIdx").val(previewedTermData.postId);

				const postButton = document.getElementById('PostFromEditButton');
				if (previewedTermData.postId && previewedTermData.postId.length > 0) {
					postButton.textContent = 'Update Post';
				} else {
					postButton.textContent = 'Post';
				}

				// Now, safely show the "Edit" modal.
				$('#myModalx').modal('show');
			});

			// After setting up the listener, trigger the 'confirmation' modal to close.
			$('#confirmationModal').modal('hide');
		} else {
			console.log('No previewed term data found.');
		}
	});

	    $('#myModalx').on('hidden.bs.modal', function () {
	        // Reset the view to edit mode when the modal is closed
	        $('#updateTerm').show();
	        $('#termPreview').hide();
	        $('#viewTermButton').show();
	        $('#backToEditButton').hide();
	        $('#UButton').show();
	        $('#DButton').show();
			$('#myModalx .modal-title').text('Edit Term');
	    });
	
	    $('#viewTermButton').on('click', function() {
	        const entryData = {
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
	            id: $("#idx").val(),
				postId: $("#postIdx").val()
	        };

			if (entryData.postId && entryData.postId.length > 0) {
				console.log("Existing post detected");
			}
	        
	        displayTermPreview(entryData, '#termPreview');
	
	        $('#updateTerm').hide();
	        $('#termPreview').show();
	        $('#viewTermButton').hide();
	        $('#backToEditButton').show();
	        $('#UButton').hide();
	        $('#DButton').hide();
	    });
	
	    $('#backToEditButton').on('click', function() {
	        $('#updateTerm').show();
	        $('#termPreview').hide();
	        $('#viewTermButton').show();
	        $('#backToEditButton').hide();
	        $('#UButton').show();
	        $('#DButton').show();
			$('#myModalx .modal-title').text('Edit Term');
	    });

		// Event listener for the "Post" button in the Edit modal
		$('#PostFromEditButton').on('click', function() {
			const entryData = {
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
				id: $("#idx").val(),
				postId: $("#postIdx").val()
			};
			doPostToGlossary(entryData);
			$('#myModalx').modal('hide'); // Close the Edit modal
		});

		// Event listener for the "Post" button in the Preview/Confirmation modal
		$('#PostFromPreviewButton').on('click', function() {
			if (previewedTermData) {
				doPostToGlossary(previewedTermData);
			} else {
				alert('No term data available to post from preview.');
			}
		});
	
		fillTemplate();
	
	});
	
	function displayTermPreview(entryData, targetElement) {
	    if (!entryData) {
	        alert('Could not fetch entry data.');
	        return;
	    }
	
	    // Fetch both the HTML for the page and the CSS to style it
	    const getHtml = $.ajax({ url: '/api/create-glossary-page', type: 'POST', contentType: 'application/json', data: JSON.stringify(entryData) });
	    const getCss = $.get('/api/glossary-css');
	
	    $.when(getHtml, getCss).done(function(htmlResponse, cssResponse) {
	        const pageHtml = htmlResponse[0].html;
	        const glossaryCss = cssResponse[0];
	
	        const styleBlock = `<style>${glossaryCss}</style>`;
	
	        // Show the rendered HTML in the target element
	        $(targetElement).html(styleBlock + pageHtml);
			
					const termTitle = $(pageHtml).find('h3.english .en').text();
			        if (termTitle) {
			            $('#myModalx .modal-title').text(toTitleCase(termTitle));
			        }
					// Show the Post and Edit buttons for preview mode
					$('#PostFromPreviewButton').show();
					$('#editFromPreviewButton').show();
	    }).fail(function() {
	        let msg = 'Error creating glossary page.';
	        alert(msg);
	    });
	}
// [{"en":"silk","ja":"正絹","furigana":"","romaji":"shouken","ja2":"","en2":"","context":"","type":"material","note":""},{"en":"silk","ja":"絹","furigana":"きぬ","romaji":"kinu","ja2":"","en2":"","context":"","type":"material","note":""}]

function updateTable(term) {
	// if duplicatesMode is enabled, fetch duplicates instead of full table
	if (window.duplicatesMode) {
		document.getElementById('table').innerHTML = '';
		$.ajax({ url: '/api/getduplicates' }).done(function (data) {
			const rows = data.rows || [];
			try { updateTitleFields(rows); } catch (e) {}
			const grid = new gridjs.Grid({
				sort: true,
				search: { enabled: true, keyword: term || '' },
				pagination: { limit: 50 },
				fixedHeader: true,
				height: '400px',
				data: rows
			}).render(document.getElementById('table'));
			grid.updateConfig({
				columns: ["en", "ja", "furigana","romaji", "ja2", "en2", "context", "type", "priority", "group", "note",
					{ name: 'postId', hidden: true },
					{ name: 'id', hidden: true },
				],
				height: '500px'
			}).forceRender();
			addGridEventHandlers(grid);
		});
		return;
	}
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

			addGridEventHandlers(grid);


			// hide id field
			grid.updateConfig({			
				columns: ["en", "ja", "furigana","romaji", "ja2", "en2", "context", "type", "priority", "group", "note",
					{ name: 'postId', hidden: true },
					{ name: "id",
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

/**
 * Checks if an English term already exists in the glossary.
 * This function is called by the onblur event of the English input field.
 * @param {string} term - The English term to check.
 */
function checkExistingTerm(term) {
    const displayBtn = $('#displayExistingBtn');
    const trimmedTerm = term ? term.trim() : '';

    // If the term being checked is the same one we already have data for, do nothing.
    if (existingTermData && existingTermData.en.toLowerCase() === trimmedTerm.toLowerCase()) {
        return;
    }
    
    // Always reset on a new check
    displayBtn.hide();
    existingTermData = null;

    if (trimmedTerm === '') {
        return; // Do nothing if the input is empty
    }

    $.ajax({
        url: `/api/glossary/check?en=${encodeURIComponent(trimmedTerm)}`,
        type: 'GET',
    }).done(function(data) {
        if (data.exists) {
            existingTermData = data.term; // Store the full term object for later use
            console.log(existingTermData)
			displayBtn.show(); // Show the button if the term exists
        }
    });
}

// duplicates toggle: when enabled, updateTable shows only duplicates
window.duplicatesMode = false;

// helper to render rows into the main grid
function renderGridFromRows(rows, term) {
	try { updateTitleFields(rows); } catch (e) {}
	document.getElementById('table').innerHTML = '';
	const grid = new gridjs.Grid({
		sort: true,
		search: { enabled: true, keyword: term || '' },
		pagination: { limit: 50 },
		fixedHeader: true,
		height: '400px',
		data: rows
	}).render(document.getElementById('table'));
	grid.updateConfig({
		columns: ["en", "ja", "furigana","romaji", "ja2", "en2", "context", "type", "priority", "group", "note",
			{ name: 'postId', hidden: true },
			{ name: 'id', hidden: true },
		],
		height: '500px'
	}).forceRender();
	addGridEventHandlers(grid);
	// force a repaint and reset scroll to ensure the new grid is visible
	try {
		grid.forceRender();
	} catch (e) {}
	const wrapper = document.getElementById('table').querySelector('.gridjs-wrapper');
	if (wrapper) {
		try { wrapper.scrollTop = 0; wrapper.scrollLeft = 0; } catch (e) {}
	}
	// dispatch a resize event and schedule a second render to avoid visual staleness
	try { window.dispatchEvent(new Event('resize')); } catch (e) {}
	setTimeout(function () { try { grid.forceRender(); } catch (e) {} }, 120);

	// ensure the inline refresh button is placed after rendering
	try { placeRefreshInline(); } catch (e) {}
}

$(document).on('click', '#ShowDuplicates', function () {
	window.duplicatesMode = !window.duplicatesMode;
	const btn = document.getElementById('ShowDuplicates');
	if (window.duplicatesMode) {
		btn.textContent = 'Show all terms';
		// fetch duplicates and render
		$.ajax({ url: '/api/getduplicates' }).done(function (data) {
			const rows = data.rows || [];
			// normalize/sort by en then ja so duplicates cluster
			rows.sort(function(a,b){
				const an = (a.en||'').toString().trim().toLowerCase();
				const bn = (b.en||'').toString().trim().toLowerCase();
				if (an < bn) return -1; if (an > bn) return 1;
				const aj = (a.ja||'').toString().trim().toLowerCase();
				const bj = (b.ja||'').toString().trim().toLowerCase();
				if (aj < bj) return -1; if (aj > bj) return 1; return 0;
			});
			renderGridFromRows(rows,'');
		});
	} else {
		btn.textContent = 'Show duplicate terms only';
		// fetch full table and render
		$.ajax({ url: '/api/gettable' }).done(function (data) {
			const rows = data.rows || [];
			renderGridFromRows(rows,'');
		});
	}
});

// Right-click context menu for glossary table
document.addEventListener('DOMContentLoaded', function () {
	const tableContainer = document.getElementById('table');
	const menu = document.getElementById('glossary-context-menu');
	const copySelectionItem = document.getElementById('context-copy-selection');
	const filterSelectionItem = document.getElementById('context-filter-selection');
	let currentRowData = { en: '', ja: '', id: '' };
	let currentSelectionText = ''; // Variable to hold the selected text
	let currentCellContent = ''; // Variable to hold the content of the right-clicked cell
	let contextMenuVisible = false;

	// Context menu on table
	tableContainer.addEventListener('contextmenu', function (e) {
		// find the clicked cell element
		let el = e.target;
		// gridjs uses td inside tr, try to find ancestor td
		while (el && el !== tableContainer && el.tagName !== 'TD') {
			el = el.parentElement;
		}
		if (!el || el === tableContainer) {
			return; // not on a cell
		}

		// Store the content of the right-clicked cell
		currentCellContent = el.innerText.trim();

		// find the clicked row element
		let rowEl = el;
		while (rowEl && rowEl !== tableContainer && rowEl.tagName !== 'TR') {
			rowEl = rowEl.parentElement;
		}
		if (!rowEl || rowEl === tableContainer) {
			return; // not on a row
		}

		// prevent default browser menu
		e.preventDefault();

		// The data is now set by the getFields (left-click) function.
		// We just need to read it here.
		// We also need to get the en/ja terms for the fallback logic.
		const tds = rowEl.querySelectorAll('td');
		if (tds && tds.length > 1) {
			currentRowData.en = tds[0].innerText.trim();
			currentRowData.ja = tds[1].innerText.trim();
		}

		// position and show menu
		menu.style.left = e.pageX + 'px';
		menu.style.top = e.pageY + 'px';
		menu.style.display = 'block';
		contextMenuVisible = true;

		// Show/hide the "Copy selection" item
		currentSelectionText = window.getSelection().toString().trim();
		if (copySelectionItem) {
			copySelectionItem.style.display = currentSelectionText ? 'block' : 'none';
		}
		// Also show/hide the "Filter on selection" item
		if (filterSelectionItem) {
			filterSelectionItem.style.display = currentSelectionText ? 'block' : 'none';
		}
	});

	// Menu item clicks
	menu.addEventListener('click', function (e) {
		// Stop the click from bubbling up to the document and closing the menu prematurely
		e.stopPropagation();

		// Hide the menu after an action is performed
		menu.style.display = 'none';
		contextMenuVisible = false;

		// Perform the action
		const action = e.target.getAttribute('data-action');
		const isCtrlClick = e.ctrlKey || e.metaKey; // metaKey for macOS

		if (!action) return;
		if (action === 'copy-cell') {
			if (currentCellContent) {
				navigator.clipboard.writeText(currentCellContent).then(function () {
					console.log('Copied cell content:', currentCellContent);
				});
			}
		} else if (action === 'copy-en') {
			// On normal click, copy to clipboard
			navigator.clipboard.writeText(currentRowData.en).then(function () {
				console.log('Copied EN:', currentRowData.en);
			});
		} else if (action === 'copy-ja') {
			// On normal click, copy to clipboard
			navigator.clipboard.writeText(currentRowData.ja).then(function () {
				console.log('Copied JA:', currentRowData.ja);
			});
		} else if (action === 'copy-selection') {
			if (currentSelectionText) {
				navigator.clipboard.writeText(currentSelectionText).then(function () {
					console.log('Copied selection:', currentSelectionText);
				});
			}
		} else if (action === 'filter-selection') {
			if (currentSelectionText) {
				const searchInput = document.querySelector('.gridjs-search-input');
				if (searchInput) {
					searchInput.value = currentSelectionText;
					// Dispatch an 'input' event to trigger Grid.js's search functionality
					searchInput.dispatchEvent(new Event('input', { bubbles: true }));
				}
			}
		} else if (action === 'create-page') {
			// Use the same robust ID-finding logic as the delete function.
			function doCreatePage(entryData) {
				if (!entryData) {
					alert('Could not fetch entry data.');
					return;
				}

				existingPost = false
				if (entryData.postId != null) {
				console.log("postId has a value:", entryData.postId);
					existingPost = true;
				} else {
					existingPost = false;
				}
				
				// Fetch both the HTML for the page and the CSS to style it
				const getHtml = $.ajax({ url: '/api/create-glossary-page', type: 'POST', contentType: 'application/json', data: JSON.stringify(entryData) });
				const getCss = $.get('/api/glossary-css');

				$.when(getHtml, getCss).done(function(htmlResponse, cssResponse) {
					const pageHtml = htmlResponse[0].html;
					const glossaryCss = cssResponse[0];

					$('#confirmationModal .modal-title').text(toTitleCase(entryData.en));
					const styleBlock = `<style>${glossaryCss}</style>`;

					// Show the rendered HTML in a modal dialog with inline styles
					previewedTermData = entryData;
					$('#confirmationModalBody').html(styleBlock + pageHtml);
					$('#confirmationModal').modal('show');

					const postButton = document.getElementById('PostFromPreviewButton');
					if (existingPost) {
						postButton.textContent = 'Update Post';
					} else {
						postButton.textContent = 'Post';
					}

					// Show the Post and Edit buttons for preview mode
					$('#PostFromPreviewButton').show();
					$('#editFromPreviewButton').show();
				}).fail(function() {
					let msg = 'Error creating glossary page.';
					alert(msg);
				});
			}

			// First, try to use the ID directly if it looks like a valid number.
			if (currentRowData.id && /^\d+$/.test(currentRowData.id)) {
				$.ajax({
					url: '/api/execsql',
					type: 'POST',
					data: { sql: `SELECT * FROM glossary WHERE id = ?`, params: [currentRowData.id] },
				}).done(function (data) {
					if (data && data.rows && data.rows.length > 0) {
						doCreatePage(data.rows[0]);
					} else {
						alert('Could not fetch entry data with the provided ID.');
					}
				});
			} else {
				// Fallback: Find the ID by matching 'en' and 'ja' terms, just like the delete function.
				$.ajax({
					url: '/api/getrows',
					data: { term: currentRowData.en },
				}).done(function (data) {
					const rows = data.rows || [];
					let foundEntry = null;
					for (let i = 0; i < rows.length; i++) {
						if (rows[i].en === currentRowData.en && rows[i].ja === currentRowData.ja) {
							foundEntry = rows[i];
							break;
						}
					}
					if (foundEntry) {
						doCreatePage(foundEntry);
					} else {
						alert('Could not find a matching entry in the database.');
					}
				});
			}
		        } else if (action === 'post-to-glossary') {
		            // Fetch the full entry data before posting
		            if (currentRowData.id && /^\d+$/.test(currentRowData.id)) {
		                $.ajax({
		                    url: '/api/execsql',
		                    type: 'POST',
		                    data: { sql: `SELECT * FROM glossary WHERE id = ?`, params: [currentRowData.id] },
		                }).done(function (data) {
		                    if (data && data.rows && data.rows.length > 0) {
		                        doPostToGlossary(data.rows[0]);
		                    }
		                    else {
		                        alert('Could not fetch entry data with the provided ID.');
		                    }
		                });
		            } else {
		                // Fallback: Find the ID by matching 'en' and 'ja' terms.
		                $.ajax({
		                    url: '/api/getrows',
		                    data: { term: currentRowData.en },
		                }).done(function (data) {
		                    const rows = data.rows || [];
		                    let foundEntry = rows.find(row => row.en === currentRowData.en && row.ja === currentRowData.ja);
		                    if (foundEntry) {
		                        doPostToGlossary(foundEntry);
		                    } else {
		                        alert('Could not find a matching entry in the database.');
		                    }
		                });
		            }		} else if (action === 'delete-entry') {
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
				menu.style.display = 'none';
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
	});

	// Hide builtin context menu when clicking outside
	document.addEventListener('contextmenu', function (e) {
		// If the click is inside our grid container, we've already handled it; otherwise let it be
		if (!tableContainer.contains(e.target)) return;
		e.preventDefault();
	});
});

	$(document).on('click', '#TestBloggerPost', function () {
		const postId = $('#bloggerPostId').val();
		if (!postId) {
			alert('Please enter a Blogger Post ID.');
			return;
		}

		console.log('Client-side postId:', postId, 'Type:', typeof postId);

		$.ajax({
			url: `/api/test-blogger-post/${postId}`,
			type: 'GET',
			success: function (data) {
				console.log('Blogger Post Data:', data);
				alert('Blogger Post Data fetched. Check console for details.');
			},
			error: function (xhr) {
				let msg = 'Error fetching Blogger Post';
				try { msg = JSON.parse(xhr.responseText).error || JSON.parse(xhr.responseText).message; } catch (e) {}
				console.error('Error fetching Blogger Post:', msg);
				alert(msg);
			}
		});
	});

	// Global function to handle posting to glossary
function doPostToGlossary(entryData) {
    if (!entryData) {
        alert('Could not fetch entry data to post.');
        return;
    }

    const isUpdate = entryData.postId && entryData.postId.length > 0;

    const confirmationMessage = isUpdate
        ? 'Are you sure you want to update this post on the glossary blog?'
        : 'Are you sure you want to post this to the glossary blog?';

    if (!confirm(confirmationMessage)) {
        return;
    }

    // Hide the Post and Edit buttons when showing confirmation message
    $('#PostFromPreviewButton').hide();
    $('#editFromPreviewButton').hide();

    const postingMessage = isUpdate ? 'Updating post on glossary...' : 'Posting to glossary...';
    // Show a temporary "posting..." message in the modal
    $('#confirmationModalBody').text(postingMessage);
    $('#confirmationModal').modal('show');

    const apiUrl = isUpdate ? '/api/update-post-on-blogger' : '/api/post-to-blogger';

    // Call the new backend endpoint with the entry data
    $.ajax({
        url: apiUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(entryData)
    }).done(function(response) {
        // Show a confirmation dialog with the post ID
        let successMsg = isUpdate ? 'Successfully updated post on glossary!' : 'Successfully posted to glossary!';
        if (response && response.result && response.result.id) {
            const postId = String(response.result.id);
            successMsg += ` (${postId})`;

            if (!isUpdate) {
                // Now, update the glossary entry with the new postId for new posts
                $.ajax({
                    url: '/api/update-post-id',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        id: entryData.id,
                        postId: postId
                    })
                }).done(function(updateResponse) {
                    if (updateResponse.success) {
                        console.log('Successfully updated postId for entry ' + entryData.id);
                        updateTable(''); // Refresh the table
                    } else {
                        alert('Failed to update postId in the database.');
                    }
                }).fail(function() {
                    alert('Error calling update-post-id API.');
                });
            } else {
                updateTable(''); // For updates, just refresh the table
            }
        }
        $('#confirmationModalBody').text(successMsg);
    }).fail(function(xhr) {
        // Check if this is an authentication error
        if (xhr.status === 401 && xhr.responseJSON && xhr.responseJSON.authUrl) {
            // Redirect the user to the authentication URL
            $('#confirmationModal').modal('hide');
            window.open(xhr.responseJSON.authUrl, '_blank');
        } else {
            let msg = isUpdate ? 'Failed to update post on glossary.' : 'Failed to post on glossary.';
            try { msg = JSON.parse(xhr.responseText).message; } catch (e) {}
            $('#confirmationModalBody').text(msg);
        }
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

let existingPost = false;

function getFields(row) {
	existingPost = false;
	// console.log(data);
	// row = JSON.parse(data);
	cells = row["cells"];
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
	postId = cells[11]["data"];
	id = cells[12]["data"];
	console.log("id:", id, "postId:", postId);
	if (postId != null && postId !== '') {
		existingPost = true;
		console.log("Existing post detected");
	}
	
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
	if (document.getElementById("postIdx")) {
		document.getElementById("postIdx").value = postId;
	}

	const postButton = document.getElementById('PostFromEditButton');
	if (existingPost) {
		postButton.textContent = 'Update Post';
	} else {
		postButton.textContent = 'Post';
	}

	// This is now the single source of truth for the context menu.
	currentRowData = { en, ja, id };
	$('#myModalx').modal('show'); 
}

function addGridEventHandlers(grid) {
    try {
		grid.on('rowClick', (e, row) => {
			if (window.getSelection().toString().trim() === '') {
				getFields(row);
			}
		});

		grid.on('cellClick', (e, cell) => {
			if (e.ctrlKey) {
				e.stopPropagation();
				const cellValue = cell.data;
				if (cellValue) {
					const searchInput = document.querySelector('.gridjs-search-input');
					if (searchInput) {
						searchInput.value = cellValue;
						searchInput.dispatchEvent(new Event('input', { bubbles: true }));
					}
				}
			}
		});
	} catch (e) {
		console.error("Error adding grid event handlers", e);
	}
}


// Insert a small refresh button next to GridJS search input. Use a MutationObserver
// to re-insert if GridJS replaces the search DOM on re-render.
function placeRefreshInline() {
	try {
		// Avoid creating multiple buttons
		if (document.getElementById('RefreshInline')) return;

		// GridJS search container can be inside .gridjs-search or next to the input
		const tableEl = document.getElementById('table');
		if (!tableEl) return;

		// Find a sensible attach point: first .gridjs-search element inside the table wrapper
		const wrapper = tableEl.querySelector('.gridjs-wrapper') || tableEl;
		let searchContainer = null;
		if (wrapper) searchContainer = wrapper.querySelector('.gridjs-search');

		// fallback: find input with class gridjs-search-input
		if (!searchContainer && wrapper) {
			const searchInput = wrapper.querySelector('.gridjs-search-input, .gridjs-input, input[type="search"]');
			if (searchInput) searchContainer = searchInput.closest('.gridjs-search') || searchInput.parentElement;
		}

		// if still not found, try globally
		if (!searchContainer) searchContainer = document.querySelector('.gridjs-search');

		// If we still can't find a search container, ensure observer is watching and bail
		if (!searchContainer) {
			ensureRefreshObserver();
			return;
		}

		// create container to right-align the button inside the search area
		const refreshContainer = document.createElement('div');
		refreshContainer.id = 'RefreshContainer';
		refreshContainer.style.display = 'inline-flex';
		refreshContainer.style.alignItems = 'center';

		
		const btn = document.createElement('button');
		btn.id = 'RefreshInline';
		btn.type = 'button';
		btn.title = 'Refresh table';
		btn.className = 'btn btn-light';
		btn.style.width = '40px';
		btn.style.height = '40px';
		btn.style.padding = '6px';
		btn.style.display = 'inline-flex';
		btn.style.alignItems = 'center';
		btn.style.justifyContent = 'center';
		btn.style.borderRadius = '6px';
		btn.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.05) inset';
		// ensure the icon color is visible on the light button
		btn.style.color = '#808080ff';

		// Outlined/stroke refresh icon (clear at small sizes)
		btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">'
			+ '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.39-.47 2.66-1.25 3.68l1.46 1.46C19.07 15.72 20 13.95 20 12c0-4.42-3.58-8-8-8zm-6.75.32L3.79 5.78C2.93 6.86 2 8.63 2 10.5c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.39.47-2.66 1.25-3.68z"/>'
			+ '</svg>';

		btn.addEventListener('click', function (e) {
			e.preventDefault();
			// same functionality as Update table
			try { updateTable(''); } catch (err) { console.error(err); }
		});

		refreshContainer.appendChild(btn);

		// append to searchContainer
		searchContainer.style.display = 'flex';
    	searchContainer.style.justifyContent = 'space-between';
 	    searchContainer.style.alignItems = 'center';
    	searchContainer.style.width = '100%';

		searchContainer.appendChild(refreshContainer);

		// Ensure an observer is watching a stable ancestor for DOM changes
		ensureRefreshObserver();
	} catch (err) {
		console.error('placeRefreshInline failed', err);
	}
}

function ensureRefreshObserver() {
	try {
		if (window._refreshObserver) return;
		// Observe a stable ancestor (table container or body) so we notice re-renders
		const root = document.getElementById('table') ? document.getElementById('table').parentElement || document.body : document.body;
		const observer = new MutationObserver(function (mutations) {
			for (const m of mutations) {
				// If nodes added include a search area, re-run placement
				for (const n of m.addedNodes) {
					if (n.nodeType !== 1) continue;
					if (n.classList && n.classList.contains('gridjs-search')) {
						setTimeout(placeRefreshInline, 60);
						return;
					}
					try {
						if (n.querySelector && n.querySelector('.gridjs-search')) {
							setTimeout(placeRefreshInline, 60);
							return;
						}
					} catch (e) {}
				}
				// If our RefreshInline was removed, try to re-insert
				for (const n of m.removedNodes) {
					if (n.nodeType !== 1) continue;
					if (n.querySelector && n.querySelector('#RefreshInline')) {
						setTimeout(placeRefreshInline, 60);
						return;
					}
				}
			}
		});
		observer.observe(root, { childList: true, subtree: true });
		window._refreshObserver = observer;
	} catch (err) {
		console.error('ensureRefreshObserver failed', err);
	}
}


function prettifyHTML(html) {
  const selfClosing = ['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'];
  const voidTag = tag => selfClosing.includes(tag.toLowerCase());

  // Normalize spacing between tags
  html = html.replace(/>\s+</g, '><');

  // Add line breaks between tags
  html = html.replace(/></g, '>\n<');

  // Split into lines and indent
  const lines = html.split('\n');
  let indent = 0;
  const indentChar = '  '; // 2 spaces

  return lines.map(line => {
    const trimmed = line.trim();

    if (trimmed.match(/^<\/\w/)) indent--; // closing tag
    const formatted = indentChar.repeat(indent) + trimmed;
    if (trimmed.match(/^<\w[^>]*[^/]?>/) && !voidTag(trimmed.match(/^<(\w+)/)?.[1])) indent++; // opening tag
    return formatted;
  }).join('\n');
}




// Try initial placement after load and schedule a couple attempts to cover timing
setTimeout(placeRefreshInline, 200);
window.addEventListener('load', function () { setTimeout(placeRefreshInline, 300); });
