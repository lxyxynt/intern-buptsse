(function (data, $) {

    $("#dashboard .sidebar ul li").removeClass('active');
    $("#dashboard .sidebar ul li#nav-student").addClass('active');

    var createView = function () {
        $("#task-panel").children().remove();
        $.get('/ui/dashboard/student.js', function (code) {
            $view = $(eval(code)(data));
            getView($view);
            loadStudentList();
        });
    };

    var loadStudentList = function () {
        $.get('/ui/dashboard/student-items.js', function (code) {
            var template = eval(code);
            data.student.forEach(function (student) {
                $view = $(template({ i: student }));
                $view.appendTo("#table-student");
                $view.click(function () {
                    getDetail(student);
                });
            });
        });
    };

    var getDetail = function (student) {
        $("#task-panel").children().remove();
        $.get('/ui/dashboard/intern.js', function (code) {
            $view = $(eval(code)({
                role: data.role,
                phase: data.phase,
                student: student
            }));
            getView($view);
            $('button.btn-large', $view).click(createView);
        });
        return false;
    };

    createView();

    var getView = function ($view) {
        $view.appendTo("#task-panel");
    };

});
