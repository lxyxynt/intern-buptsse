(function (data, $) {

    $("#dashboard .sidebar ul li").removeClass('active');
    $("#dashboard .sidebar ul li#nav-home").addClass('active');

    $("#task-panel").children().remove();

    $.get('/ui/dashboard/home.js', function (code) {
        $view = $(eval(code)(data));
        getView($view);
    });

    var getView = function ($view) {
        $view.appendTo("#task-panel");
    };

});
