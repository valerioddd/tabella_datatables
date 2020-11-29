
var dt;
$(document).ready(function () {

	dt = $('#tabella').DataTable(
		{
			"ajax": {
				url: "https://random-data-api.com/api/beer/random_beer?size=5",
				type: "GET",
				cache: false,
				contentType: "text/json, application/json",
				dataType: 'json',
				crossDomain: true,
				dataSrc: function (json) {
					$.each(json, function (i) {
						this.id_inc = i + 1;
					});

					return json;
				}
			},
			dom: 'Btr',
			rowReorder: { dataSrc: 'id_inc' },
			ordering: true,
			paging: false,
			columns: [
				{ title: "#", data: "id_inc", className: "font-weight-bold" },
				{ title: "ID", data: "id" },
				{ title: "BRAND", data: "brand" },
				{ title: "NOME", data: "name" },
				{ title: "TIPOLOGIA", data: "style" },
				{ title: "GRADAZIONE", data: "alcohol" }
			],
			language: {
				"emptyTable": "Nessun dato disponibile.",
				"loadingRecords": "Caricamento...",
			},
			buttons: [
				{
					text: 'Ricarica',
					name: 'ricarica',
					className: "btn btn-success",
					action: function (e, dt, node, config) {
						dt.ajax.reload();
					}
				}
			]
		}
	);
	dt.buttons().containers().appendTo("#generaDati");

	//Cattura l'evento del riordinamento per permettere il click sulla riga
	dt.on('row-reorder', function (e, diff, edit) {
		if (diff.length == 0) {

			var _trSelected = $("#tabella tbody tr:hover")[0];
			if ($(_trSelected).hasClass('selected')) {
				$(_trSelected).removeClass('selected');
			}
			else {
				$(_trSelected).addClass('selected');
			}

			abilita_pulsanti();
		}
	});

	$("#btn-color").on("click", function () {
		var _color = $("#input-color").val();
		//Calcola bianco / nero per il testo in base al colore di sfondo
		var _text_color = (
				(0.2126 * parseInt("0x" + _color.slice(1, 3)) + 
				0.7152 * parseInt("0x" + _color.slice(3, 5)) +
				0.0722 * parseInt("0x" + _color.slice(5, 7))
				) < 128) ? "white" : "black";


		$("#tabella tbody tr.selected").each(function () {
			$(this).removeClass('selected');

			$(this).css("background", _color);
			$(this).css("color", _text_color);
		});

		abilita_pulsanti();
	});

	$("#btn-elimina").on("click", function () {
		$("#tabella tbody tr.selected").each(function () {
			dt.row(this).remove().draw();
		});

		calc_id();

		abilita_pulsanti();
	});

	$("#btn-export").on("click", function () {
		download_XML()
	});
});

//Ricalcolo l'id incrementale in caso di cancellazioni
function calc_id() {
	$("#tabella tbody tr").each(function (i) {
		var _data = dt.row(this).data();
		_data.id_inc = i + 1;
		dt.row(this).data(_data);
	});

	dt.draw();
}

function abilita_pulsanti() {
	var _disabilita = $("#tabella tbody tr.selected").length == 0;
	$("#input-color").attr("disabled", _disabilita);
	$("#btn-color").attr("disabled", _disabilita);

	$("#btn-elimina").attr("disabled", _disabilita);

	$("#btn-export").attr("disabled", $("#tabella tbody tr").length == 0);
}

function download_XML() {
	//Costruisce il testo
	var text = "<?xml version='1.0'?>\n<table>\n\t<head>";

	$("#tabella thead th").each(function (i) {
		if (i != 0) {
			text += "\n\t\t<th col='" + i + "' value='" + $(this).text() + "' />";
		}
	});
	text += "\n\t</head>\n<body>";

	if (dt.row().length != 0) {
		$("#tabella tbody tr").each(function (i) {
			text += "\n\t\t<tr row='" + i + "' color='" + rgb_to_hex($(this).css("background")) + "'>";

			$(this).children("td").each(function (index) {
				if (index != 0) {
					text += "\n\t\t\t<td col='" + index + "' value='" + $(this).text() + "' />"
				}
			});

			text += "\n\t\t</tr>"
		});
    }
	text += "\n\t</body>\n</table>"

	//Costruisce il file e il link per scaricarlo
	var _date = new Date();
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', 'export_' + _date.getUTCFullYear() + _date.getUTCMonth() + _date.getUTCDate() + "_" + _date.getUTCHours() + _date.getUTCMinutes() + _date.getUTCSeconds() + ".xml");

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

//converte rgb in hex
function rgb_to_hex(rgb) {

	var colorsOnly = rgb.substring(rgb.indexOf('(') + 1, rgb.lastIndexOf(')')).split(/,\s*/),
		red = colorsOnly[0],
		green = colorsOnly[1],
		blue = colorsOnly[2];

	return "#" + ("0" + parseInt(red).toString(16)).slice(-2) +
		("0" + parseInt(green).toString(16)).slice(-2) +
		("0" + parseInt(blue).toString(16)).slice(-2);;
}
