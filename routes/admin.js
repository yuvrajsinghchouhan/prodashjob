"use strict";

var jwt = require('jsonwebtoken');
var middlewares = require('../model/middlewares.js');
var CONFIG = require('../config/config');

function ensureAuthorized(req, res, next) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, CONFIG.SECRET_KEY, function (err, decoded) {
            if (err) {
                res.send('Unauthorized Access');
            } else {
                next();
            }
        });
    } else {
        res.send('Unauthorized Access');
    }
}

module.exports = function (app, io) {
    try {
        var admins = require('../controller/admin/admins.js')();
        var users = require('../controller/admin/users.js')();
        var taskers = require('../controller/admin/taskers.js')();
        var slider = require('../controller/admin/sliders.controller.js')(app);
        var emailTemplate = require('../controller/admin/email-template.js')(app);
        var pages = require('../controller/admin/pages.js')(app);
        var coupon = require('../controller/admin/coupon.js')();
        var categories = require('../controller/admin/categories.js')();
        var faq = require('../controller/admin/faq.js')(app);
        var postheader = require('../controller/admin/postheader.js')(app);
        var experience = require('../controller/admin/experience.js')(app);
        var question = require('../controller/admin/question.controller.js')(app);
        var settings = require('../controller/admin/settings.js')(app);
        var tools = require('../controller/admin/tools.js')(app);
        var newsletter = require('../controller/admin/newsletter.js')(app, io);
        var payment = require('../controller/admin/payment-gateway.js')(app);
        var images = require('../controller/admin/images.js')(app);
        var contact = require('../controller/admin/contact.js')(app);
        var tasks = require('../controller/admin/tasks.js')(app);
        var reviews = require('../controller/admin/reviews.js')(app);
        var cancellation = require('../controller/admin/cancellation.js')(app);
        var earnings = require('../controller/admin/earnings.js')(app);

        /** ROUTERS for admin **/
        app.post('/paymentGateway/list', ensureAuthorized, payment.list);
        app.post('/paymentGateway/edit', ensureAuthorized, payment.edit);
        app.post('/paymentGateway/save', ensureAuthorized, payment.save);

        app.post('/admins/getadmins', ensureAuthorized, admins.allAdmins);
        app.post('/admins/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).single('avatar'), admins.save);
        app.post('/admins/edit', ensureAuthorized, admins.edit);
        app.post('/admins/delete', ensureAuthorized, admins.delete);
        app.post('/admins/getusersrole', ensureAuthorized, admins.getusersrole);
        app.post('/admins/rolemanager', ensureAuthorized, admins.rolemanager);
        app.post('/admins/getsubadmins', ensureAuthorized, admins.allSubAdmins);
        app.post('/admins/currentuser', ensureAuthorized, admins.currentUser);

        app.post('/users/UserAddress', ensureAuthorized, users.UserAddress);
        app.post('/users/save', ensureAuthorized, users.save);
        // middlewares.commonUpload(CONFIG.DIRECTORY_USERS).single('avatar'),
        app.post('/users/edit', ensureAuthorized, users.edit);
        app.post('/users/transactionsList', ensureAuthorized, users.transactionsList);
        app.post('/users/getusers', ensureAuthorized, users.allUsers);
        app.post('/users/getdeletedusers', ensureAuthorized, users.getdeletedusers);
        app.get('/users/recentuser', ensureAuthorized, users.recentUser);
        app.post('/users/delete', ensureAuthorized, users.delete);
        app.post('/users/walletAmount', ensureAuthorized, users.walletAmount);
        app.post('/user/addaddress', ensureAuthorized, users.addaddress);
        app.post('/user/addressStatus', ensureAuthorized, users.addressStatus);
        app.post('/user/deleteUserAddress', ensureAuthorized, users.deleteUserAddress);

        app.get('/taskers/gettaskers', ensureAuthorized, taskers.allTaskers);
        app.post('/taskers/getDeletedTaskers', ensureAuthorized, taskers.getDeletedTaskers);
        app.post('/taskers/getrecenttasker', ensureAuthorized, taskers.getrecenttasker);
        app.post('/taskers/delete', ensureAuthorized, taskers.delete);
        app.post('/taskers/getChild', ensureAuthorized, taskers.getChild);
        app.post('/taskers/newavailability/mapsave', ensureAuthorized, taskers.mapsave);
        app.post('/taskers/saveprof', ensureAuthorized, taskers.saveprof);
        //app.post('/taskers/addtasker', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_TASKERS).single('avatar'), taskers.addtasker);
        app.post('/taskers/addtasker', ensureAuthorized, taskers.addtasker);
        //app.post('/taskers/addtaskergeneral', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_TASKERS).single('avatar'), taskers.save);
        app.post('/taskers/addtaskergeneral', ensureAuthorized,taskers.save);
        app.post('/taskers/savetaskerpassword', ensureAuthorized, taskers.savepassword);
        app.post('/taskers/saveNewTaskerPassword', ensureAuthorized, taskers.saveNewTaskerPassword);
        app.post('/taskers/savetaskerprofile', ensureAuthorized, taskers.savetaskerprofile);
        app.post('/taskers/edit', ensureAuthorized, taskers.edit);
        app.get('/taskers/plist', ensureAuthorized, taskers.getpendinglist);
        app.post('/taskers/get-question', ensureAuthorized, taskers.getQuestion);
        app.post('/taskers/saveNew-vehicle', ensureAuthorized, taskers.saveNewVehicle);
        app.post('/taskers/get-user-categories', ensureAuthorized, taskers.getusercategories);
        app.post('/taskers/gettaskercategory', ensureAuthorized, taskers.gettaskercategory);
        app.post('/taskers/getcategories', ensureAuthorized, taskers.getCategories);
        app.post('/taskers/addcategory', ensureAuthorized, taskers.addcategory);

        app.post('/taskers/addNewCategory', ensureAuthorized, taskers.addNewCategory);
        app.post('/taskers/getexperience', ensureAuthorized, taskers.getExperience);
        app.post('/taskers/category', ensureAuthorized, taskers.category);
        app.post('/taskers/availability/save', ensureAuthorized, taskers.saveAvailability);
        app.post('/taskers/deletecategory', ensureAuthorized, taskers.deleteCategory);
        app.post('/taskers/approvtaskercategory', ensureAuthorized, taskers.approvtaskercategory);
        app.post('/taskers/updateAvailability', ensureAuthorized, taskers.updateAvailability);
        app.post('/taskers/saveaccountinfo', ensureAuthorized, taskers.saveaccountinfo);

        app.post('/admin/slider/list', ensureAuthorized, slider.list);
        app.post('/slider/edit', ensureAuthorized, slider.edit);
        app.post('/slider/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_SLIDERS).single('image'), slider.save);
        app.post('/slider/deletebanner', ensureAuthorized, slider.deletebanner);

        app.post('/contact/list', ensureAuthorized, contact.list);
        app.post('/contact/edit', ensureAuthorized, contact.edit);
        app.post('/contact/save', ensureAuthorized, contact.save);
        app.post('/contact/sendMail', ensureAuthorized, contact.sendMail);
        app.post('/contact/deletecontact', ensureAuthorized, contact.deletecontact);

        app.get('/images/list', ensureAuthorized, images.list);
        app.post('/images/edit', ensureAuthorized, images.edit);
        app.post('/images/admin-Image', images.getImage);
        //app.post('/images/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).single('image'), images.save);
        // app.post('/images/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).fields([{ name: 'backgroundimage', maxCount: 1 }, { name: 'taskersignup', maxCount: 1 }]), images.save);
        app.post('/images/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).fields([{ name: 'backgroundimage', maxCount: 1 }, { name: 'taskersignup', maxCount: 1 }, { name: 'adminlogin', maxCount: 1 }, { name: 'loginpage', maxCount: 1 }, { name: 'taskerprofile', maxCount: 1 }]), images.save);
        app.post('/images/fixedHeaderSave', ensureAuthorized, images.fixedHeaderSave);
        app.post('/images/fixedAsideSave', ensureAuthorized, images.fixedAsideSave);
        app.post('/images/deleteimages', ensureAuthorized, images.deleteimages);

        app.post('/email-template/list', ensureAuthorized, emailTemplate.list);
        app.post('/email-template/edit', ensureAuthorized, emailTemplate.edit);
        app.post('/email-template/save', ensureAuthorized, emailTemplate.save);
        app.post('/email-template/delete', ensureAuthorized, emailTemplate.delete);
        app.get('/emailtemplate/getsubscripermail', ensureAuthorized, emailTemplate.getsubscripermail);
        // app.post('/emailtemplate/channgedetails', emailTemplate.channgedetails);

        app.get('/categories/list', ensureAuthorized, categories.list);
        app.post('/admin/categories/lists', ensureAuthorized, categories.allCategories);
        app.post('/admin/subCategories/lists', ensureAuthorized, categories.allSubCategories);
        app.get('/subcategories/list', ensureAuthorized, categories.subcategorylist);
        app.post('/categories/edit', ensureAuthorized, categories.edit);
        app.get('/categories/getcatlistdropdown', ensureAuthorized, categories.getcatlistdropdown);
        app.get('/categories/getsubcatlistdropdown', ensureAuthorized, categories.getsubcatlistdropdown);
        app.post('/categories/savecategory', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_CATEGORIES).fields([{ name: 'image', maxCount: 1 }, { name: 'marker', maxCount: 1 }, { name: 'icon', maxCount: 1 },{ name: 'activeicon', maxCount: 1 }]), categories.savecategory);
        app.post('/categories/savesubcategory', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_CATEGORIES).fields([{ name: 'image', maxCount: 1 }, { name: 'icon', maxCount: 1 }, { name: 'activeicon', maxCount: 1 }]), categories.savesubcategory);
        app.post('/category/deletecategory', ensureAuthorized, categories.deletepage);
        app.post('/category/deleteMaincategory', ensureAuthorized, categories.deleteMaincategory);
        app.get('/subcategories/getSetting', ensureAuthorized, categories.getSetting);

        app.post('/pages/submitmainpage', ensureAuthorized, pages.submitmainpage);
        app.post('/pages/getlist', ensureAuthorized, pages.getlist);
        app.post('/pages/editpage', ensureAuthorized, pages.editpage);
        app.get('/pages/translatelanguage', ensureAuthorized, pages.translatelanguage);
        app.post('/pages/deletepage', ensureAuthorized, pages.deletepage);
        app.get('/pages/getlistdropdown', ensureAuthorized, pages.getlistdropdown);
        app.post('/pages/getsublist', ensureAuthorized, pages.getsublist);

        app.post('/coupons/save', ensureAuthorized, coupon.save);
        app.post('/coupons/edit', ensureAuthorized, coupon.editcoupon);
        app.get('/coupons/userGet', ensureAuthorized, coupon.userGet);
        app.post('/coupons/list', ensureAuthorized, coupon.list);
        app.post('/coupons/deletecoupon', ensureAuthorized, coupon.deletecoupon);

        app.post('/faq/list', ensureAuthorized, faq.list);
        app.post('/faq/edit', ensureAuthorized, faq.edit);
        app.post('/faq/delete', ensureAuthorized, faq.deletefaq);
        app.post('/faq/save', faq.save);

        app.post('/postheader/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).single('image'), postheader.save);
        app.post('/postheader/edit', ensureAuthorized, postheader.edit);
        app.post('/postheader/list', ensureAuthorized, postheader.list);
        app.post('/postheader/deletepostheader', ensureAuthorized, postheader.deletepostheader);

        app.post('/experience/list', ensureAuthorized, experience.list);
        app.post('/experience/edit', ensureAuthorized, experience.edit);
        app.post('/experience/save', ensureAuthorized, experience.save);
        app.post('/experience/delete', ensureAuthorized, experience.delete);

        app.post('/question/list', ensureAuthorized, question.list);
        app.post('/question/edit', ensureAuthorized, question.edit);
        app.post('/question/save', ensureAuthorized, question.save);
        app.post('/question/deletequestion', ensureAuthorized, question.deletequestion);

        app.post('/tasks/list', ensureAuthorized, tasks.list);
        app.post('/tasks/deletedList', ensureAuthorized, tasks.deletedList);
        app.get('/tasks/recenttasklist', ensureAuthorized, tasks.recenttask);
        app.post('/tasks/edit', ensureAuthorized, tasks.edit);
        app.post('/tasks/save', ensureAuthorized, tasks.save);
        app.post('/tasks/deletequestion', ensureAuthorized, tasks.deletequestion);
        app.get('/tasks/firsttask', ensureAuthorized, tasks.firsttask);
        app.post('/tasks/getTransaction', ensureAuthorized, tasks.getTransaction);

        app.get('/tools/taskexport', tools.taskexport);
        app.post('/tools/taskexport', ensureAuthorized, tools.taskexportpost);
        app.get('/tools/exportuser', tools.userexport);
        app.post('/tools/exportuser', ensureAuthorized, tools.userexportpost);
        app.get('/tools/exporttasker', tools.taskerexport);
        app.post('/tools/exporttasker', ensureAuthorized, tools.taskerexportpost);
        app.get('/tools/exportTransactionData', tools.transactionexport);
        app.post('/tools/exportTransactionData', ensureAuthorized, tools.transactionexportpost);

        app.get('/settings/general', settings.general);
        app.get('/settings/themecolor', settings.themecolor);
        app.get('/settings/mobile/content', ensureAuthorized, settings.getmobile);
        app.get('/settings/general/timezones', ensureAuthorized, settings.timezones);
        app.post('/settings/walletSetting', ensureAuthorized, settings.walletSetting);
        app.post('/settings/categorySetting', ensureAuthorized, settings.categorySetting);
        app.post('/settings/cashSetting', ensureAuthorized, settings.cashSetting);
        app.post('/settings/referralStatus', ensureAuthorized, settings.referralStatus);
        app.post('/settings/general/save', ensureAuthorized, middlewares.commonUpload(CONFIG.DIRECTORY_OTHERS).fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), settings.save);
        app.post('/settings/currency/list', ensureAuthorized, settings.currencyList);
        app.post('/settings/currency/edit', ensureAuthorized, settings.currencyEdit);
        app.post('/settings/currency/save', ensureAuthorized, settings.currencySave);
        app.post('/settings/currency/delete', ensureAuthorized, settings.currencyDelete);
        app.post('/settings/mobilecontent/save', ensureAuthorized, settings.mobilesave);
        app.post('/settings/currency/default/save', ensureAuthorized, settings.currencyDefaultSave);
        app.post('/settings/currency/default', settings.currencyDefault);

        app.post('/settings/language/edit', ensureAuthorized, settings.languageedit);
        app.get('/settings/language/getlanguage/:id', ensureAuthorized, settings.languagegetlanguage);
        app.post('/settings/language/list', ensureAuthorized, settings.languagelist);
        app.post('/settings/language/delete', ensureAuthorized, settings.languagedelete);
        app.post('/settings/language/default', settings.languagedefault);
        app.post('/settings/language/default/save', ensureAuthorized, settings.languagedefaultsave);
        app.post('/settings/language/translation', ensureAuthorized, settings.languageTranslation);
        app.post('/settings/language/translation/save', ensureAuthorized, settings.languageSaveTranslation);
        app.get('/settings/language/translation/get', ensureAuthorized, settings.languageGetTranslation);
        app.post('/settings/language/manage', ensureAuthorized, settings.getlanguageDetails);

        app.post('/newsletter/subscriber/list', ensureAuthorized, newsletter.subscriberList);
        app.post('/newsletter/subscriber/delete', ensureAuthorized, newsletter.subscriberDelete);
        app.post('/newsletter/sendbulkmail', ensureAuthorized, newsletter.sendbulkmail);
        app.post('/newsletter/sendmessage', ensureAuthorized, newsletter.sendmessage);
        app.post('/newsletter/sendmessagemail', ensureAuthorized, newsletter.sendmessagemail);

        app.post('/notification/user/list', ensureAuthorized, newsletter.userList);
        app.post('/notification/tasker/list', ensureAuthorized, newsletter.taskerList);
        app.post('/notification/email-template/list', ensureAuthorized, newsletter.emailtemplatelist);
        app.post('/notification/email-template/edit', ensureAuthorized, newsletter.edittemplate);
        app.post('/notification/email-template/save', ensureAuthorized, newsletter.savemailnotification);
        app.post('/notification/message-template/save', ensureAuthorized, newsletter.savemessagenotification);
        app.post('/notification/deletenotification', ensureAuthorized, newsletter.deletenotification);
        app.get('/notification/email-template/getmailtemplate', ensureAuthorized, newsletter.getmailtemplate);
        app.get('/notification/email-template/getmessagetemplate', ensureAuthorized, newsletter.getmessagetemplate);

        app.get('/settings/seo', ensureAuthorized, settings.seo);
        app.post('/settings/seo/save', ensureAuthorized, settings.seosave);
        app.get('/settings/widgets', ensureAuthorized, settings.widgets);
        app.post('/settings/widgets/save', ensureAuthorized, settings.widgetssave);
        app.get('/settings/smtp', ensureAuthorized, settings.smtp);
        app.post('/settings/sms/save', ensureAuthorized, settings.smssave);
        app.get('/settings/sms', ensureAuthorized, settings.sms);
        app.post('/settings/smtp/save', ensureAuthorized, settings.smtpsave);
        app.get('/settings/social-networks', ensureAuthorized, settings.socialnetworks);
        app.post('/settings/social-networks/save', ensureAuthorized, settings.socialnetworkssave);

        app.post('/reviews/list', ensureAuthorized, reviews.list);
        app.post('/reviews/edit', ensureAuthorized, reviews.edit);
        app.post('/reviews/save', ensureAuthorized, reviews.save);
        app.post('/reviews/deletereviews', ensureAuthorized, reviews.deletereviews);

        app.post('/cancellation/list', ensureAuthorized, cancellation.list);
        app.post('/cancellation/edit', ensureAuthorized, cancellation.edit);
        app.post('/cancellation/save', ensureAuthorized, cancellation.save);
        app.post('/cancellation/deletecancellation', ensureAuthorized, cancellation.deletecancellation);

        app.get('/dashboard/getAllearnings', ensureAuthorized, taskers.getAllearnings);
        app.get('/dashboard/taskerlist', ensureAuthorized, taskers.gettaskerdetails);
        app.get('/dashboard/verified/taskerlist', ensureAuthorized, taskers.verifiedtaskerdetails);
        app.get('/dashboard/userlist', ensureAuthorized, taskers.getuserdetails);
        app.get('/dashboard/tasklist', ensureAuthorized, taskers.gettaskdetails);
        app.post('/dashboard/deleteUser', ensureAuthorized, taskers.deletuserdata);
        app.post('/dashboard/approvtasker', ensureAuthorized, taskers.approvetasker);
        app.post('/dashboard/forgotpass', ensureAuthorized, admins.forgotpass);
        app.post('/dashboard/forgotsave', ensureAuthorized, admins.forgotpassave);
        app.post('/dashboard/earningsDetails', ensureAuthorized, admins.earningsDetails);
        app.post('/earnings/list', ensureAuthorized, earnings.list);
        app.post('/earnings/paidserivce', ensureAuthorized, earnings.paidserivce);
        app.post('/tasker/edit/earning', ensureAuthorized, earnings.getearning);
        app.post('/tasker/edit/updatepayee', ensureAuthorized, earnings.updatepayee);
        app.get('/earnings/cyclelist', ensureAuthorized, earnings.cyclelist);
        app.get('/earnings/getcyclefirst', ensureAuthorized, earnings.getcyclefirst);

    } catch (e) {
        console.log('erroe in index.js---------->>>>', e);
    }
};
