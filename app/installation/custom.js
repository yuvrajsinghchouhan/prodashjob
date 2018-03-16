jQuery(function () {

    $("#install").validate({
        rules: {
            site_url: "required",
            host_name: "required",
            port_number: "required",
            db_name: "required",
            site_name: "required",
            site_port: "required",
            admin_name: "required",
            admin_email: "required",
            admin_password: "required",
            confirmPassword: "required"

        },
        messages: {
            site_url: "Please enter your site url",
            host_name: "Please enter your host name",
            port_number: "Please enter port number",
            db_name: "Please enter a valid database name",
            site_name: "Please enter a valid site name",
            site_port: "Please enter a valid site port",
            admin_name: "Please enter a valid Admin Name",
            admin_email: "Please enter a valid Admin Email",
            admin_password: "Please enter a valid Password",
            confirmPassword: "Please enter a valid Password",
        }
    });

});
