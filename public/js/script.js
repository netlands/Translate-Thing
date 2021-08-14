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
                $('#translation').html(data.message);
            });
    });
});