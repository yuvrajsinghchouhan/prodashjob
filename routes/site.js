"use strict";

var jwt = require('jsonwebtoken');
var middlewares = require('../model/middlewares.js');
var CONFIG = require('../config/config.js');

function ensureAuthorized(req, res, next) {
    /*
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, CONFIG.SECRET_KEY, function (err, decoded) {
            if (err) {
                res.status(401).send('Unauthorized Access');
            } else {
                next();
            }
        });
    } else {
        res.status(401).send('Unauthorized Access');
    }
    */
    next(); //Safari
}

module.exports = function (app, io) {
    try {
        /** ROUTERS for site **/
        var siteUsers = require('../controller/site/users.js')(app);
        var landing = require('../controller/site/landing.js')(app);
        var category = require('../controller/site/category.js')(app);
        var pages = require('../controller/site/pages.js')(app);
        var task = require('../controller/site/task.js')(io, app);
        var account = require('../controller/site/account.js')(io);
        var dashboard = require('../controller/site/dashboard.js')(app);
        var messages = require('../controller/site/messages.js')(app);
        var notifications = require('../controller/site/notifications.js')(app);
        var contactus = require('../controller/site/contactus.js')(app);
        var common = require('../controller/site/common.js')(app);

        app.get('/sitemap.xml', common.sitemap);

        app.get('/site/users/getusers', siteUsers.getusers);
        app.post('/site/users/checkEmail', siteUsers.checkEmail);
        app.post('/site/users/addnewuser', siteUsers.addnewuser);
        app.post('/site/users/currentUser', siteUsers.currentUser);
        app.post('/site/users/currentTasker', siteUsers.currentTasker);
        app.post('/site/users/save', siteUsers.save);
        app.post('/site/users/edit', siteUsers.edit);
        app.get('/site/users/allUsers', siteUsers.allUsers);
        app.post('/site/users/delete', siteUsers.delete);
        app.post('/site/users/changePassword', siteUsers.changePassword);
        app.post('/site/users/checkreferal', siteUsers.checkreferal);
        app.post('/site/users/facebooksiteregister', siteUsers.facebooksiteregister);
        app.post('/site/users/checkemail', siteUsers.checkemail);
        app.post('/site/users/checktaskeremail', siteUsers.checktaskeremail);
        // app.post('/site/users/taskerRegister', middlewares.commonUpload(CONFIG.DIRECTORY_TASKERS).single('avatars'), siteUsers.taskerRegister);
        app.post('/site/users/taskerRegister', siteUsers.taskerRegister);
        app.post('/site/otpsave', siteUsers.otpsave);
        app.post('/site/otpverifications', siteUsers.otpverifications);
        app.post('/site/getuserdata', siteUsers.getuserdata);
        app.post('/site/resendotp', siteUsers.resendotp);
        app.post('/site/activateUserAccount', siteUsers.activateUserAccount);

        /* Slider page*/
        app.get('/slider/list', landing.list);
        app.post('/site/main', landing.getMainData);

        /** Landing Page  **/
        app.post('/site/landing/landingdata', landing.getlandingdata);
        app.post('/site/landing/getmorecategory', landing.getmorecategory);
        app.post('/site/landing/search-suggestions', landing.searchSuggestions);
        app.post('/site/landing/search-childSuggestions', landing.childSuggestions);
        app.post('/site/landing/subscription', landing.subscription);
        app.get('/site/landing/getLanguage', landing.getLanguage);
        app.get('/site/landing/getBgimage', landing.getBgimage);
        app.get('/site/landing/gettaskersignupimage', landing.gettaskersignupimage);
        app.get('/site/landing/getsetting', landing.getSetting);
        app.get('/site/landing/getDefaultLanguage', landing.getDefaultLanguage);
        app.get('/site/landing/getSocialNetworks', landing.getSocialNetworks);
        app.get('/site/landing/getDefaultCurrency', landing.getDefaultCurrency);
        app.get('/site/landing/getCurrency', landing.getCurrency);
        app.get('/site/landing/getseosetting', landing.getseosetting);
        app.get('/site/landing/getwidgets', landing.getwidgets);
        app.post('/site/landing/getTransalatePage', landing.getTransalatePage);

        app.post('/site/category/getcategory', category.getsubcategory);
        app.get('/site/category/getCategoryList', category.getcategorylist);
        app.post('/site/category/getsubcategory', category.getsubcategoryfordropdown);

        /** Footer Page**/
        app.post('/site/pages/getpage', pages.getpage);
        app.get('/site/faq/getfaq', pages.getfaq);

        /** Dashboard Page  **/
        app.post('/site/dashboard/dashboarddata', dashboard.dashboarddata);

        /** Task Step Page  **/
        app.post('/site/task/taskbaseinfo', task.taskbaseinfo);
        app.get('/site/task/taskeravailabilitybyWorkingArea', task.taskerAvailabilitybyWorkingArea);
        app.get('/site/task/taskeravailabilitybyWorkingAreaMap', task.taskerAvailabilitybyWorkingAreaMap);
        app.get('/site/task/taskerAvailabilitybyWorkingAreaCount', task.taskerAvailabilitybyWorkingAreaCount);
        app.post('/site/task/gettaskuser', task.gettaskuser);
        app.post('/site/task/taskprofileinfo', task.taskprofileinfo);
        app.post('/site/task/taskerreviews', task.taskerreviews);
        app.post('/site/task/taskerprofile', task.taskerprofile);
        app.post('/site/task/search-tasker', task.searchTasker);
        app.post('/site/task/addnewtask', task.addnewtask);
        app.post('/site/task/gettaskdetailsbyid', task.gettaskdetailsbyid);
        app.post('/site/task/confirmtask', task.confirmtask)
        app.post('/site/task/deleteaddress', task.deleteaddress);
        app.post('/site/task/addaddress', task.addaddress);
        app.post('/site/task/getaddressdata', task.getaddressdata);
        app.post('/site/task/getuserdata', task.getuserdata);
        app.post('/site/task/addressStatus', task.addressStatus);
        app.get('/site/task/taskerCount', task.taskerCount);

        /** Account Page  **/
        //app.post('/site/account/settings/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_USERS).single('avatar'), account.saveAccount);
        app.post('/site/account/settings/save', ensureAuthorized, account.saveAccount);
        app.post('/site/account/password/save', ensureAuthorized, account.savePassword);
        app.post('/site/account/availability/save', ensureAuthorized, account.saveAvailability);
        app.post('/site/account/availability/update', ensureAuthorized, account.updateAvailability);
        app.post('/site/account/updatetaskstatus', ensureAuthorized, account.updatetaskstatus);
        app.post('/site/account/updatetaskstatuscash', account.updatetaskstatuscash);
        app.post('/site/account/categories/get', account.getCategories);
        app.post('/site/account/categories/getchild', account.getchild);
        app.post('/site/account/categories/get-experience', account.getExperience);
        app.post('/site/account/getwalletdetails', ensureAuthorized, account.getwalletdetails);
        app.post('/site/account/getmaincatname', ensureAuthorized, account.getmaincatname);
        app.post('/site/account/paybywallet', account.paybywallet);
        app.post('/site/account/couponCompletePayment', account.couponCompletePayment);
        app.get('/site/account/question/getQuestion', account.getQuestion);
        app.post('/site/account/getsettings', account.getsettings);
        app.post('/site/account/updateprofiledetails', ensureAuthorized, account.updateprofiledetails);
        app.post('/site/account/getTaskList', account.getTaskList);
        app.post('/site/account/getTaskDetailsByStaus', account.getTaskDetailsByStaus);
        app.post('/site/account/getUserTaskDetailsByStaus', account.getUserTaskDetailsByStaus);
        app.post('/site/account/getTaskDetailsBytaskid', account.getTaskDetailsBytaskid);
        app.post('/site/account/getcategoriesofuser', account.getusercategories);
        app.post('/site/account/updateTask', ensureAuthorized, account.updateTask);
        app.post('/site/account/updateTaskcompletion', account.updateTaskcompletion);
        app.post('/site/account/insertaskerReview', account.insertaskerReview);
        app.post('/site/account/transcationhis', ensureAuthorized, account.transcationhis);
        app.post('/site/account/usertranscation', ensureAuthorized, account.usertranscation);
        app.post('/site/account/gettaskreview', account.gettaskreview);
        app.post('/site/account/edit', ensureAuthorized, account.edit);
        app.post('/site/account/taskinfo', account.taskinfo);
        app.post('/site/account/gettaskbyid', account.gettaskbyid);
        app.post('/site/account/confirmtask', ensureAuthorized, account.confirmtask);

        app.post('/site/account/paypalPayment', ensureAuthorized, account.paypalPayment);
        app.post('/site/account/paymentmode', ensureAuthorized, account.paymentmode);
        app.get('/site/account/paypal-execute', ensureAuthorized, account.paypalExecute);
        app.get('/site/account/downloadPdf', ensureAuthorized, account.downloadPdf);
        app.get('/site/account/userdownloadPdf', ensureAuthorized, account.userdownloadPdf);

        app.post('/site/account/taskerconfirmtask', ensureAuthorized, account.taskerconfirmtask);
        app.post('/site/account/apply-coupon', ensureAuthorized, account.applyCoupon);
        app.post('/site/account/remove-coupon', ensureAuthorized, account.removeCoupon);
        app.post('/site/account/getcancelreason', ensureAuthorized, account.getcancelreason);
        app.post('/site/account/disputeupdateTask', ensureAuthorized, account.disputeupdateTask);

        /** Account Page Tasker  **/
        //app.post('/site/account/tasker/settings/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_TASKERS).single('avatar'), account.saveTaskerAccount);
        app.post('/site/account/tasker/settings/save', ensureAuthorized, account.saveTaskerAccount);
        app.post('/site/account/tasker/password/save', ensureAuthorized, account.saveTaskerPassword);
        app.post('/site/account/deactivateTaskertAccount', ensureAuthorized, account.deactivateTasker);

        app.post('/site/account/usercanceltask', ensureAuthorized, account.usercanceltask);
        app.post('/site/account/ignoreTask', ensureAuthorized, account.ignoreTask);
        app.post('/site/account/updatecategoryinfo', ensureAuthorized, account.updateCategory);
        app.post('/site/account/deleteCategory', ensureAuthorized, account.deleteCategory);
        app.post('/site/account/deactivateAccount', ensureAuthorized, account.deactivate);
        app.post('/site/account/getReview', account.getReview);
        app.post('/site/account/getuserReview', account.getuserReview);
        app.post('/site/account/addReview', account.addReview);
        app.post('/site/account/getTaskDetails', account.getTaskDetails);

        app.post('/site/account/saveaccountinfo', ensureAuthorized, account.saveaccountinfo);
        app.post('/site/account/updatewalletdata', ensureAuthorized, account.updatewalletdata);
        app.post('/site/account/updatewalletdatapaypal', account.updatewalletdatapaypal);
        app.get('/site/account/walletpaypal-execute', account.walletpaypalExecute);

        /** Messages Page **/
        app.post('/site/chat/save', ensureAuthorized, messages.save);
        app.post('/site/chat/getmessage', ensureAuthorized, messages.getmessage);
        app.post('/site/chat/unreadmsg', ensureAuthorized, messages.unreadmsg);
        app.post('/site/chat/deleteConversation', ensureAuthorized, messages.deleteConversation);
        app.post('/site/chat/chathistory', ensureAuthorized, messages.chathistory);
        app.post('/site/chat/msgcount', ensureAuthorized, messages.msgcount);
        app.post('/site/contact/savecontactusmessage', contactus.save);
        app.post('/site/saveforgotpasswordinfo', account.saveforgotpasswordinfo);
        app.post('/site/saveforgotpwduser', account.saveforgotpassworduser);
        app.post('/site/forgotpwdmailuser', account.saveforgotpwdusermail);
        app.post('/site/forgotpwdmailtasker', account.saveforgotpwdtaskermail);
        app.post('/site/notifications/count', notifications.getCount);
        app.post('/site/notifications/list', notifications.getList);

    } catch (e) {
        console.log('Error On Site', e);
    }
};