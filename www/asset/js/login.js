
(function (data, $) {

    $('#content').children().remove();

    $.get('/ui/login.js', function (code) {
        $view = $(eval(code)(data));
        getView($view);
    }); 

    var getView = function ($view) {
        $view.children('form').submit(function () {
            data.username = $('.username input').val();
            data.password = $('.password input').val();
            $.post('/login', {
                username: data.username,
                password: data.password
            }, function (user) {
                data.role = user.role;

                // Other operations
                window.location.hash = "#dashboard";
            })
            .fail(function () {
                // TODO Improve this implementation
                window.alert('错误的用户名或者密码');
            });
            return false;
        });
        $view.appendTo("#content");
    };

});
