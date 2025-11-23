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

function setHeaderStatus(header, status) {
  // Remove any existing status class
  header.classList.remove(
    'status-nothing',
    'status-draft',
    'status-active',
    'status-change-detected',
    'status-unsaved-edit'
  );

  // Add the new status class
  header.classList.add(`status-${status}`);
}

// Wire Refresh button to importPostById (log and optionally apply)
$(document).on('click', '#RefreshPostButton', function () {
	const postId = ($('#postIdx').val() || null);
	if (!postId) return alert('No postId available to refresh from Blogger');
	importPostById(postId, { apply: true })
		.then(function (data) { console.log('Refresh applied for postId', postId); })
		.catch(function (err) { console.error('Refresh failed', err); alert('Failed to refresh post: ' + (err && err.message ? err.message : err)); });
});
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
 let exsistingPostData = null;
let originalEditData = null;

ready(function(){ // $(document).ready(function () {
	console.log("Page structure loaded!");
	$('select').selectpicker();

	// Ensure the RefreshPostButton exists in the Edit modal footer; create it if missing
	try {
		if (document.querySelector('#myModalx') && !document.getElementById('RefreshPostButton')) {
			const footer = document.querySelector('#myModalx .modal-footer');
			if (footer) {
				const btn = document.createElement('button');
				btn.type = 'button';
				btn.id = 'RefreshPostButton';
				btn.className = 'btn btn-secondary';
				btn.style.display = 'none';
				btn.textContent = 'Refresh Post';
				// insert before PublishButton if present
				const pub = footer.querySelector('#PublishButton');
				if (pub) footer.insertBefore(btn, pub);
				else footer.appendChild(btn);
			}
		}
	} catch (e) { console.error('Failed to ensure RefreshPostButton', e); }

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

	$(document).on('click', '#MoveToGlossaryButton', function() {
		const id = $("#idx").val();
		if (id) {
			if (confirm('Are you sure you want to move this entry to the main glossary?')) {
				$.ajax({
					url: '/api/move-to-glossary',
					type: 'POST',
					data: { id: id },
					success: function(response) {
						console.log(response.message);
						$('#myModalx').modal('hide');
						updateTable('');
					},
					error: function(xhr) {
						let msg = 'Error moving entry.';
						try { msg = JSON.parse(xhr.responseText).message; } catch (e) {}
						alert(msg);
					}
				});
			}
		} else {
			alert('Could not determine the ID of the entry to move.');
		}
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
					{ name: 'postStatus', hidden: true },					
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

	// Ensure header color is set correctly whenever the Edit modal is shown
	$('#myModalx').on('show.bs.modal', function () {
		try {
			const ps = ($('#postStatusx').val() || '').toString().trim().toUpperCase();
			const header = document.querySelector('#myModalx .modal-header');
			if (!header) return;
			if (ps === 'ACTIVE') setHeaderStatus(header, 'active');
			else if (ps === 'DRAFT') setHeaderStatus(header, 'draft');
			else setHeaderStatus(header, 'nothing');

			// Show/hide Publish / Set Draft buttons based on status
			try {
				const pubBtn = document.getElementById('PublishButton');
				const draftBtn = document.getElementById('SetDraftButton');
				if (ps === 'ACTIVE') {
					if (pubBtn) pubBtn.style.display = 'none';
					if (draftBtn) draftBtn.style.display = 'inline-block';
				} else {
					// DRAFT or empty -> show Publish, hide SetDraft unless explicitly ACTIVE
					if (pubBtn) pubBtn.style.display = 'inline-block';
					if (draftBtn) draftBtn.style.display = 'none';
				}
			} catch (e) { console.error('Error setting modal action buttons', e); }
		} catch (e) { console.error('Error setting modal header color on show', e); }

		// If the canonical note (`#notex`) contains raw HTML, convert it to markdown-safe text
		try {
			const notexEl = document.getElementById('notex');
			if (notexEl) {
				let val = (notexEl.value || '').toString();
				if (/[<>]/.test(val)) {
					console.log('myModalx: detected HTML in #notex, cleaning');
					let md = '';
					if (typeof htmlToMarkdown === 'function') {
						try { md = htmlToMarkdown(val); } catch (e) { md = ''; }
					}
					if (!md) {
						md = val.replace(/<\/(p|div|h[1-6])>/gi, '\n')
							.replace(/<br\s*\/?\s*>/gi, '\n')
							.replace(/<a[^>]*name=["']?more["']?[^>]*>\s*<\/a>/gi, '')
							.replace(/<[^>]+>/g, '')
							.replace(/&nbsp;/g, ' ')
							.trim();
					}
					try { if (typeof cleanSpacing === 'function') md = cleanSpacing(md); } catch (e) {}
					notexEl.value = md;
				}
			}
		} catch (e) { console.error('Error cleaning #notex on modal show', e); }
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
				$("#postStatusx").val(existingTermData.postStatus);				
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
				$("#postStatusx").val(previewedTermData.postStatus);
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
	        $('#updateTerm').css('display', 'flex');
	        $('#termPreview').hide();
	        $('#viewTermButton').show();
	        $('#backToEditButton').hide();
	        $('#UButton').show();
	        $('#DButton').show();
	        $('#PostFromEditButton').show();
	        //$('#MoveToGlossaryButton').show();
			$('#myModalx .modal-title').text('Edit Term');
		// Clear any header background color applied for postStatus
		try {
			const hdr = document.querySelector('#myModalx .modal-header');
			if (hdr) hdr.style.backgroundColor = '';
		} catch (e) { }
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
	            postStatus: $("#postStatusx").val(),				
				postId: $("#postIdx").val()
	        };

			if (entryData.postId && entryData.postId.length > 0) {
				console.log("Existing post detected");
			}
	        
	        displayTermPreview(entryData, '#termPreview');
	
	        document.getElementById('updateTerm').style.setProperty('display', 'none', 'important');
	        $('#termPreview').show();
	        $('#viewTermButton').hide();
	        $('#backToEditButton').show();
	        $('#UButton').show();
	        $('#DButton').show();
	        $('#PostFromEditButton').show();
	        $('#MoveToGlossaryButton').hide();
	    });
	    $('#backToEditButton').on('click', function() {	    
	    	$('#updateTerm').css('display', 'flex');	        
			$('#termPreview').hide();
	        $('#viewTermButton').show();
	        $('#backToEditButton').hide();
	        $('#UButton').show();
	        $('#DButton').show();
	        $('#PostFromEditButton').show();
	        //$('#MoveToGlossaryButton').show();
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
				postStatus: $("#postStatusx").val(),
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

	$("#import-legacy-btn").on("click", function (e) {
		e.preventDefault();
		$("#legacy-file-input").click();
	});

	$("#legacy-file-input").on("change", function (e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = function (e) {
			const content = e.target.result;
			try {
				const entries = atomParser(content);
				// console.log(entries);
				$.ajax({
					url: "/api/import-legacy",
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify({ entries: entries }),
					success: function (response) {
						alert(response.message);
						updateTable("");
					},
					error: function (xhr) {
						let msg = "Error importing legacy entries.";
						try {
							msg = JSON.parse(xhr.responseText).message;
						} catch (e) {}
						alert(msg);
					},
				});
			} catch (error) {
				alert("Error parsing XML file: " + error.message);
			}
		};
		reader.readAsText(file);
		// Reset the file input
		$(this).val("");
	});
	
		fillTemplate();

		// Maximize modal
		$(document).on('click', '.maximize-modal', function () {
			if ($(this).closest('.modal').find('.modal-dialog').hasClass('modal-lg')) {
				$(this).closest('.modal').find('.modal-dialog').removeClass('modal-lg').addClass('modal-xl');
			} else {
				$(this).closest('.modal').find('.modal-dialog').removeClass('modal-xl').addClass('modal-lg');
			}
			$(this).closest('.modal').find('.modal-dialog').toggleClass('modal-maximized');
			// Also toggle a class on the button to change the icon
			$(this).toggleClass('maximized');
			if ($(this).hasClass('maximized')) {
				$(this).html('&#x1F5D5;'); // Restore icon
				$(this).attr('aria-label', 'Restore');
			} else {
				$(this).html('&#x1F5D6;'); // Maximize icon
				$(this).attr('aria-label', 'Maximize');
			}
			$(this).blur();
		});
	
	
	    // Show/hide "Import Legacy Data" based on glossary visibility
	    $('#glossary').on('show.bs.collapse', function () {
	        $('#import-legacy-li').show();
	    });
	
	    $('#glossary').on('hide.bs.collapse', function () {
	        $('#import-legacy-li').hide();
	    });
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
					{ name: 'postStatus', hidden: true },
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
					{ name: 'postStatus', hidden: true },
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
			{ name: 'postStatus', hidden: true },
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

$(document).on('click', '#SwitchTable', function () {
    $.ajax({
        url: '/api/switch-table',
        type: 'GET',
        success: function (data) {
            const newTableName = data.tableName;
            const buttonText = `Switch to ${newTableName === 'glossary' ? 'Legacy' : 'Glossary'} Table`;
            $('#SwitchTable').text(buttonText);
            updateTable('');
        },
        error: function () {
            alert('Error switching tables.');
        }
    });
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

					// Show/hide Publish / SetDraft buttons in preview based on postStatus
					try {
						const ps = (entryData.postStatus || '').toString().trim().toUpperCase();
						const pubPrev = document.getElementById('PublishPreviewButton');
						const draftPrev = document.getElementById('SetDraftPreviewButton');
						if (ps === 'ACTIVE') {
							if (pubPrev) pubPrev.style.display = 'none';
							if (draftPrev) draftPrev.style.display = 'inline-block';
						} else {
							if (pubPrev) pubPrev.style.display = 'inline-block';
							if (draftPrev) draftPrev.style.display = 'none';
						}
						// set header color in preview modal
						try {
							const hdr = document.querySelector('#confirmationModal .modal-header');
							if (hdr) {
								if (ps === 'ACTIVE') setHeaderStatus(hdr, 'active');
								else if (ps === 'DRAFT') setHeaderStatus(hdr, 'draft');
								else setHeaderStatus(hdr, 'nothing');
							}
						} catch (e) {}
					} catch (e) { console.error('Error setting preview action buttons', e); }
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
	// Reset background colors
    $('#notex').css('background-color', '');
    $('#enx').css('background-color', '');
    $('#groupx').css('background-color', '');

    // Show/hide "Move to Glossary" button
    const switchButtonText = $('#SwitchTable').text();
    const moveButton = $('#MoveToGlossaryButton');
    if (switchButtonText.includes('Glossary')) { // Legacy table is active
        moveButton.show();
    } else {
        moveButton.hide();
    }

	existingPost = false;
	exsistingPostData = null;
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
	postStatus = cells[11]["data"];	
	postId = cells[12]["data"];
	id = cells[13]["data"];
	console.log("id:", id, "postId:", postId);
	if (postId != null && postId !== '') {
		existingPost = true;
		console.log("Existing post detected, fetching data...");
		$.ajax({
			url: `/api/get-blogger-post/${postId}`,
			type: 'GET',
			success: function (data) {
				exsistingPostData = data;
				console.log('Existing Blogger Post Data:', exsistingPostData);

				// If the blogger post returns a status, map it and update our local DB entry if needed
				try {
					const remoteStatusRaw = (exsistingPostData.status || '').toString().trim().toUpperCase();
					let mappedStatus = '';
					if (remoteStatusRaw === 'LIVE') mappedStatus = 'ACTIVE';
					else if (remoteStatusRaw === 'DRAFT') mappedStatus = 'DRAFT';
					if (mappedStatus) {
						// Only update if different from current table value
						const current = (postStatus || '').toString().trim().toUpperCase();
						if (current !== mappedStatus) {
							$.ajax({
								url: '/api/set-local-post-status',
								type: 'POST',
								contentType: 'application/json',
								data: JSON.stringify({ id: id, postId: postId, postStatus: mappedStatus })
							}).done(function (resp) {
								if (resp && resp.success) {
									// reflect in-modal fields and UI
									$('#postStatusx').val(mappedStatus);
									try {
									const hdr = document.querySelector('#myModalx .modal-header');
									setHeaderStatus(hdr, mappedStatus === 'ACTIVE' ? 'active' : 'draft');
									} catch (e) {}
									// toggle edit modal buttons
									try { document.getElementById('PublishButton').style.display = mappedStatus === 'ACTIVE' ? 'none' : 'inline-block'; } catch (e) {}
									try { document.getElementById('SetDraftButton').style.display = mappedStatus === 'ACTIVE' ? 'inline-block' : 'none'; } catch (e) {}
									updateTable('');
								}
							}).fail(function () {
								console.error('Failed to update local postStatus after fetching Blogger post');
							});
						}
					}
				} catch (e) { console.error('Error processing remote post status', e); }

				if (exsistingPostData) {
					const entryData = { en, ja, furigana, romaji, ja2, en2, context, type: typeStr, priority, group, note, id, postId, postStatus };
					
					$.ajax({
						url: '/api/create-glossary-page',
						type: 'POST',
						contentType: 'application/json',
						data: JSON.stringify(entryData)
					}).done(function(response) {
						const pageHtml = response.html;
						const prettyNote = prettifyHTML(pageHtml || '');
						const prettyContent = prettifyHTML(exsistingPostData.content || '');

						//console.log('Prettified Note for comparison:', prettyNote);
						//console.log('Prettified Content from Blogger:', prettyContent);

						if (prettyNote !== prettyContent) {
							console.log('Content is different.');
							$('#notex').css('background-color', '#FFE4E1');
							try { $('#RefreshPostButton').show(); } catch (e) {}
						}

						// Compare title
						if (en.trim() !== (exsistingPostData.title || '').trim()) {
							console.log('Title is different.');
							$('#enx').css('background-color', '#FFE4E1');
						}

						// Compare labels
						const modalLabels = group.split(',').map(s => s.trim()).filter(s => s).sort();
						const postLabels = (exsistingPostData.labels || []).sort();
						if (JSON.stringify(modalLabels) !== JSON.stringify(postLabels)) {
							console.log('Labels are different.');
							$('#groupx').css('background-color', '#FFE4E1');
						}
					}).fail(function() {
						console.error('Could not create post page for comparison.');
					});
				}
			},
			error: function (xhr) {
				let msg = 'Error fetching existing Blogger Post';
				try { msg = JSON.parse(xhr.responseText).error || JSON.parse(xhr.responseText).message; } catch (e) {}
				console.error(msg);
			}
		});
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
	document.getElementById("postStatusx").value = postStatus;
	if (document.getElementById("postIdx")) {
		document.getElementById("postIdx").value = postId;
		try {
			if (postId && postId.toString().length > 0) { try { $('#RefreshPostButton').css('display','inline-block'); } catch(e){} } else { try { $('#RefreshPostButton').css('display','none'); } catch(e){} }
		} catch (e) {}
	}
	const postButton = document.getElementById('PostFromEditButton');
	if (existingPost) {
		postButton.textContent = 'Update Post';
	} else {
		postButton.textContent = 'Post';
	}

	// This is now the single source of truth for the context menu.
	currentRowData = { en, ja, id };

	// Capture the original values shown in the edit modal so we can detect changes
	try {
		originalEditData = {
			en: (document.getElementById('enx').value || '').toString().trim(),
			ja: (document.getElementById('jax').value || '').toString().trim(),
			furigana: (document.getElementById('furiganax').value || '').toString().trim(),
			romaji: (document.getElementById('romajix').value || '').toString().trim(),
			ja2: (document.getElementById('ja2x').value || '').toString().trim(),
			en2: (document.getElementById('en2x').value || '').toString().trim(),
			context: (document.getElementById('contextx').value || '').toString().trim(),
			type: (document.getElementById('typex').value || '').toString(),
			priority: (document.getElementById('priorityx').value || '').toString(),
			group: (document.getElementById('groupx').value || '').toString().trim(),
			note: (document.getElementById('notex').value || '').toString().trim()
		};
		// Initialize Update button state
		try { checkUpdateButtonState(); } catch (e) {}
	} catch (e) {}

	// Color the modal header based on postStatus (ACTIVE -> lightgreen, DRAFT -> lemonchiffon) lightcoral
	try {
		const header = document.querySelector('#myModalx .modal-header');
		const ps = (postStatus || '').toString().trim().toUpperCase();
		if (header) {
			if (ps === 'ACTIVE') setHeaderStatus(header, 'active');
			else if (ps === 'DRAFT') setHeaderStatus(header, 'draft');
			else setHeaderStatus(header, 'nothing');;
		}
	} catch (e) { console.error('Failed to set modal header color', e); }

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

// Enable the Update button only when any field in the edit modal differs from the original values
function checkUpdateButtonState() {
	try {
		const btn = document.getElementById('UButton');
		if (!btn) return;
		if (!originalEditData) { btn.disabled = true; return; }
		const cur = {
			en: (document.getElementById('enx').value || '').toString().trim(),
			ja: (document.getElementById('jax').value || '').toString().trim(),
			furigana: (document.getElementById('furiganax').value || '').toString().trim(),
			romaji: (document.getElementById('romajix').value || '').toString().trim(),
			ja2: (document.getElementById('ja2x').value || '').toString().trim(),
			en2: (document.getElementById('en2x').value || '').toString().trim(),
			context: (document.getElementById('contextx').value || '').toString().trim(),
			type: (document.getElementById('typex').value || '').toString(),
			priority: (document.getElementById('priorityx').value || '').toString(),
			group: (document.getElementById('groupx').value || '').toString().trim(),
			note: (document.getElementById('notex').value || '').toString().trim()
		};

		// Compare fields
		let changed = false;
		for (const k of Object.keys(originalEditData)) {
			if ((originalEditData[k] || '') !== (cur[k] || '')) { changed = true; break; }
		}
		btn.disabled = !changed;
	} catch (e) { console.error('checkUpdateButtonState error', e); }
}

// Watch input changes inside the edit modal to toggle the Update button
$(document).on('input change', '#enx,#jax,#furiganax,#romajix,#ja2x,#en2x,#contextx,#typex,#priorityx,#groupx,#notex', function () {
	try { checkUpdateButtonState(); } catch (e) {}
});

// When the edit modal is hidden, disable the Update button
$('#myModalx').on('hidden.bs.modal', function () {
	try { document.getElementById('UButton').disabled = true; } catch (e) {}
});


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
  html = html.replace(/<!--more-->/g, "<a name='more'></a>");
  // Remove comments
  //html = html.replace(/<!--[\s\S]*?-->/g, '');

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

// Import a Blogger post by postId. If `apply` is true, populate the Edit modal
// with the fetched content (sanitized + converted). Returns a Promise that
// resolves with the fetched post object.
function importPostById(postId, options) {
	options = options || {};
	const apply = !!options.apply;
	return new Promise(function (resolve, reject) {
		if (!postId) return reject(new Error('postId is required'));
		$.ajax({ url: `/api/get-blogger-post/${postId}`, type: 'GET' })
		.done(function (data) {
			console.log('importPostById: fetched post', data);
			try {
				if (apply) {
					// Reuse the same logic as the Refresh handler: parse and sanitize
					const title = data.title || '';
					const content = data.content || '';
					const status = (data.status || '').toString().toUpperCase();
					const parser = new DOMParser();
					const doc = parser.parseFromString(content, 'text/html');

					// Title -> English
					$('#enx').val(title);

					// Japanese line parsing
					let ja = '', furigana = '', romaji = '';
					try {
						const h4 = doc.querySelector('h4.japanese.notranslate');
						if (h4) {
							const parts = h4.textContent.split('・').map(p => p.trim());
							ja = parts[0] || '';
							furigana = parts[1] || '';
							romaji = parts[2] || '';
						}
					} catch (e) {}
					$('#jax').val(ja);
					$('#furiganax').val(furigana);
					$('#romajix').val(romaji);

					// Populate group (labels) from Blogger post if available
					try {
						if (Array.isArray(data.labels) && data.labels.length > 0) {
							$('#groupx').val(data.labels.join(','));
						}
					} catch (e) {}

					// Populate context from any .tags/.tag elements in the post content or from labels prefixed with #
					try {
						let contexts = [];
						// Look for explicit tags container in the parsed HTML
						try {
							const tagsEl = doc.querySelector('.tags') || doc.querySelector('.tag') || doc.querySelector('.labels');
							if (tagsEl) {
								// extract words starting with # or comma/space separated tokens
								const txt = (tagsEl.textContent || '').trim();
								if (txt) {
									const found = txt.split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace(/^#/, ''));
									contexts = contexts.concat(found);
								}
							}
						} catch(e) {}
						// If none found, try labels as context fallback (omit labels already placed in group)
						if (contexts.length === 0 && Array.isArray(data.labels) && data.labels.length > 0) {
							// treat labels without spaces as contexts too
							contexts = data.labels.map(l => l.trim()).filter(Boolean);
						}
						if (contexts.length > 0) $('#contextx').val(contexts.join(','));
					} catch (e) {}

					// Extract and sanitize definition HTML
					let defHtml = '';
					try {
						const defEl = doc.querySelector('section.definition');
						if (defEl) {
							const tmp = document.createElement('div');
							tmp.innerHTML = defEl.innerHTML || '';
							const selectorsToRemove = ['.tags', '.tag', '.label', '.references', 'span.hidden', 'span[hidden]'];
							selectorsToRemove.forEach(sel => {
								try { tmp.querySelectorAll(sel).forEach(n => n.remove()); } catch (e) {}
							});
							tmp.querySelectorAll('span').forEach(s => { if (s.textContent.trim() === '') s.remove(); });
							defHtml = tmp.innerHTML.trim();
						}
					} catch (e) { defHtml = ''; }

					// Convert to markdown via server endpoint, fallback to client
					const applyDefMd = function (md) {
						// Preserve originalEditData (baseline) so change-detection can compare pre-refresh values
						let hadOriginal = !!originalEditData;
						try {
							// If we don't have a baseline, capture the current values before applying the refresh
							if (!hadOriginal) {
								originalEditData = {
									en: (document.getElementById('enx').value || '').toString().trim(),
									ja: (document.getElementById('jax').value || '').toString().trim(),
									furigana: (document.getElementById('furiganax').value || '').toString().trim(),
									romaji: (document.getElementById('romajix').value || '').toString().trim(),
									ja2: (document.getElementById('ja2x').value || '').toString().trim(),
									en2: (document.getElementById('en2x').value || '').toString().trim(),
									context: (document.getElementById('contextx').value || '').toString().trim(),
									type: (document.getElementById('typex').value || '').toString(),
									priority: (document.getElementById('priorityx').value || '').toString(),
									group: (document.getElementById('groupx').value || '').toString().trim(),
									note: (document.getElementById('notex').value || '').toString().trim()
								};
							}
						} catch (e) { console.error('applyDefMd: capture originalEditData error', e); }

						try { document.getElementById('notex').value = (md || ''); } catch (e) {}
						try { const mapped = (status === 'LIVE' || status === 'PUBLISHED') ? 'ACTIVE' : 'DRAFT'; $('#postStatusx').val(mapped); if (data.id) $('#postIdx').val(data.id); } catch (e) {}
						// After applying refreshed values, run change-detection against the preserved baseline
						try { checkUpdateButtonState(); } catch (e) {}
					};

					if (defHtml && defHtml.length > 0) {
						// Request server conversion; if it fails, fallback to a safe client-side converter
						try {
							console.log('importPostById: converting definition HTML via server');
							$.ajax({ url: '/api/convert-html-to-markdown', type: 'POST', contentType: 'application/json', data: JSON.stringify({ html: defHtml }) })
							.done(function (resp) {
								try {
									if (resp && resp.success && typeof resp.markdown === 'string') {
										console.log('importPostById: server returned markdown (len=' + resp.markdown.length + ')');
										// If server returned HTML-like content (conversion missed), fallback to client stripping
										if (/[<>{}]/.test(resp.markdown)) {
											console.warn('importPostById: server markdown contains HTML, falling back to client cleanup');
										} else {
											applyDefMd(resp.markdown);
											return;
										}
									}
									// fallback: prefer global htmlToMarkdown if available
									let md = '';
									if (typeof htmlToMarkdown === 'function') md = htmlToMarkdown(defHtml || '');
									else {
										// Minimal safe fallback: strip tags but preserve paragraphs and line breaks
										md = (defHtml || '')
											.replace(/<\/(p|div|h[1-6])>/gi, '\n')
											.replace(/<br\s*\/?\s*>/gi, '\n')
											.replace(/<[^>]+>/g, '')
											.replace(/&nbsp;/g, ' ')
											.trim();
									}
									try { if (typeof cleanSpacing === 'function') md = cleanSpacing(md); } catch (e) {}
									applyDefMd(md);
								} catch (e) { console.error('importPostById: error handling server response', e); applyDefMd(''); }
							})
							.fail(function (xhr) {
								console.warn('importPostById: server convert failed, using client fallback', xhr && xhr.status);
								try {
									let md = '';
									if (typeof htmlToMarkdown === 'function') md = htmlToMarkdown(defHtml || '');
									else {
										md = (defHtml || '')
											.replace(/<\/(p|div|h[1-6])>/gi, '\n')
											.replace(/<br\s*\/?\s*>/gi, '\n')
											.replace(/<[^>]+>/g, '')
											.replace(/&nbsp;/g, ' ')
											.trim();
									}
									try { if (typeof cleanSpacing === 'function') md = cleanSpacing(md); } catch (e) {}
									applyDefMd(md);
								} catch (e) { console.error('importPostById fallback error', e); applyDefMd(''); }
							});
						} catch (e) {
							console.error('importPostById: ajax error', e);
							try { applyDefMd(''); } catch (ee) {}
						}
					} else {
						applyDefMd('');
					}
				}
			} catch (e) { /* ignore apply errors but still resolve with data */ }
			resolve(data);
		})
		.fail(function (xhr) {
			let msg = 'Error fetching Blogger post';
			try { msg = JSON.parse(xhr.responseText).message || xhr.responseText; } catch (e) {}
			console.error('importPostById failed', msg);
			reject(new Error(msg));
		});
	});
}


function escapeTags(input) {
  // Escape full <div><a><img></a></div> structure
  input = input.replace(
    /<div\s+class="separator"\s+style="clear:\s*both;">\s*<a([^>]*)>\s*<img([^>]*)>\s*<\/a>\s*<\/div>/gi,
    (match, aAttrs, imgAttrs) =>
      `{div class="separator" style="clear: both;"}{a${aAttrs}}{img${imgAttrs}}{/a}{/div}`
  );

  // Escape standalone <a><img></a> (not already escaped)
  input = input.replace(
    /<a([^>]*)>\s*<img([^>]*)>\s*<\/a>/gi,
    (match, aAttrs, imgAttrs) =>
      `{a${aAttrs}}{img${imgAttrs}}{/a}`
  );

  return input;
}

function unescapeTags(input) {
  // Unescape full structure
  input = input.replace(
    /\{div class="separator" style="clear: both;"\}\{a([^}]*)\}\{img([^}]*)\}\{\/a\}\{\/div\}/gi,
    (match, aAttrs, imgAttrs) =>
      `<div class="separator" style="clear: both;"><a${aAttrs}><img${imgAttrs}></a></div>`
  );

  // Unescape standalone {a}{img}{/a}
  input = input.replace(
    /\{a([^}]*)\}\{img([^}]*)\}\{\/a\}/gi,
    (match, aAttrs, imgAttrs) =>
      `<a${aAttrs}><img${imgAttrs}></a>`
  );

  return input;
}





// Try initial placement after load and schedule a couple attempts to cover timing
setTimeout(placeRefreshInline, 200);
window.addEventListener('load', function () { setTimeout(placeRefreshInline, 300); });

// Helper to change postStatus via API and update UI
function changePostStatus({ id, postId, newStatus, onSuccess, onError }) {
	try {
		$.ajax({
			url: '/api/change-post-status',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({ id: id, postId: postId, postStatus: newStatus })
		}).done(function (data) {
			if (data && data.success) {
				if (typeof onSuccess === 'function') onSuccess(data);
			} else {
				if (typeof onError === 'function') onError(data);
				else alert('Failed to change status: ' + (data && data.message ? data.message : JSON.stringify(data)));
			}
		}).fail(function (xhr) {
			let msg = 'Error changing post status';
			try { msg = JSON.parse(xhr.responseText).message || xhr.responseText; } catch (e) {}
			if (typeof onError === 'function') onError({ message: msg });
			else alert(msg);
		});
	} catch (e) {
		console.error('changePostStatus error', e);
		if (typeof onError === 'function') onError(e);
	}
}

// Wire up buttons (edit modal)
$(document).on('click', '#PublishButton', function () {
	const id = $('#idx').val() || null;
	const postId = $('#postIdx').val() || null;
	changePostStatus({ id: id, postId: postId, newStatus: 'ACTIVE', onSuccess: function (resp) {
		// update local inputs and header, refresh table
		$('#postStatusx').val('ACTIVE');
		if (resp && resp.postId) $('#postIdx').val(resp.postId);
		try { setHeaderStatus(document.querySelector('#confirmationModal .modal-header'), 'active'); } catch (e) {}
		// toggle buttons
		try { document.getElementById('PublishButton').style.display = 'none'; } catch (e) {}
		try { document.getElementById('SetDraftButton').style.display = 'inline-block'; } catch (e) {}
		updateTable('');
	}});
});

$(document).on('click', '#SetDraftButton', function () {
	const id = $('#idx').val() || null;
	const postId = $('#postIdx').val() || null;
	changePostStatus({ id: id, postId: postId, newStatus: 'DRAFT', onSuccess: function (resp) {
		$('#postStatusx').val('DRAFT');
		if (resp && resp.postId) $('#postIdx').val(resp.postId);
		try { document.querySelector('#myModalx .modal-header').style.backgroundColor = 'var(--status-draft)'; } catch (e) {}
		// toggle buttons
		try { document.getElementById('PublishButton').style.display = 'inline-block'; } catch (e) {}
		try { document.getElementById('SetDraftButton').style.display = 'none'; } catch (e) {}
		updateTable('');
	}});
});

// Wire up buttons (preview modal)
$(document).on('click', '#PublishPreviewButton', function () {
	if (!previewedTermData) return alert('No entry selected');
	const id = previewedTermData.id || null;
	const postId = previewedTermData.postId || null;
	changePostStatus({ id: id, postId: postId, newStatus: 'ACTIVE', onSuccess: function (resp) {
		// update previewed data and UI
		previewedTermData.postStatus = 'ACTIVE';
		if (resp && resp.postId) previewedTermData.postId = resp.postId;
		try { setHeaderStatus(document.querySelector('#confirmationModal .modal-header'), 'active'); } catch (e) {}
		// toggle buttons
		try { document.getElementById('PublishPreviewButton').style.display = 'none'; } catch (e) {}
		try { document.getElementById('SetDraftPreviewButton').style.display = 'inline-block'; } catch (e) {}
		updateTable('');
	}});
});

$(document).on('click', '#SetDraftPreviewButton', function () {
	if (!previewedTermData) return alert('No entry selected');
	const id = previewedTermData.id || null;
	const postId = previewedTermData.postId || null;
	changePostStatus({ id: id, postId: postId, newStatus: 'DRAFT', onSuccess: function (resp) {
		previewedTermData.postStatus = 'DRAFT';
		if (resp && resp.postId) previewedTermData.postId = resp.postId;
		try { setHeaderStatus(document.querySelector('#confirmationModal .modal-header'), 'draft'); } catch (e) {}
		// toggle buttons
		try { document.getElementById('PublishPreviewButton').style.display = 'inline-block'; } catch (e) {}
		try { document.getElementById('SetDraftPreviewButton').style.display = 'none'; } catch (e) {}
		updateTable('');
	}});
});
