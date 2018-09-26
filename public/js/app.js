
$(".save-btn").on("click", function(event) {
    event.preventDefault();
    var articleId = $(this).attr("data-id")
    $.ajax({
        method: "POST",
        url: "/save/" + articleId
    }).done(function(data){})
})

$(".delete-btn").on("click", function(event) {
    event.preventDefault();
    var articleId = $(this).attr("data-id")
    $.ajax({
        method: "POST",
        url: "/saved/delete/" + articleId
    }).done(function(data){})
})

// $("#add-note-btn").on("click", function(event) {
//     event.preventDefault();
//     var articleId = $(this).attr("data-id")
//     $.ajax({
//         method: "GET",
//         url: "/saved/" + articleId
//     }).then(function(data){

//     })
// })

$(".save-note-btn").on("click", function(event) {
    event.preventDefault();
    var noteId = $(this).attr("data-id")
    $.ajax({
        method: "POST",
        url: "saved/" + noteId,
        data: { body: $("#note-text" + noteId).val()}
    }).then(function(data) {
        console.log(data)
    })
    $("#note-text" + noteId).val("")
    $("#noteModal" + noteId).modal("hide")
    window.location.href="/saved"
})

$(".delete-note-btn").on("click", function(event) {
    event.preventDefault();
    var noteId = $(this).attr("data-id")
    $.ajax({
        method: "DELETE",
        url: "saved/" + noteId,
    }).then(function(data) {
        console.log(data)
    })
    $("#noteModal" + noteId).modal("hide")
    window.location.href = "/saved"
})