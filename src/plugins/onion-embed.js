// Stubbing out some drawer functionality for demo purposes.

function openDrawer(type) {
	$("#embed-panel").addClass("open");
}

$("#embed-panel-close").click(function() {
	$("#embed-panel").removeClass("open");
});

function populateDrawer(id) {
	$("#embed-panel-contents").html($("#" + id).html());
}