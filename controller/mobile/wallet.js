"use strict";

module.exports = function (io) {

	var async = require("async");
	var moment = require("moment");
	var stripe = require('stripe')('sk_test_1aQzKO9htQAEqlFPvigo717t');
	var paypal = require('paypal-rest-sdk');
	var objectID = require('mongodb').ObjectID;
	var mail = require('../../model/mail.js');
	var mailcontent = require('../../model/mailcontent.js');
	var mongoose = require("mongoose");
	var push = require('../../model/pushNotification.js')(io);
	var db = require('../adaptor/mongodb.js');
	var CONFIG = require('../../config/config');

	var controller = {};

	controller.settings = function (req, res) {
		var data = {};
		data.status = '0';
		db.GetOneDocument('settings', { "alias": "general" }, { 'settings.wallet': 1 }, {}, function (err, wallet) {
			if (err || !wallet.settings.wallet.amount.minimum || !wallet.settings.wallet.amount.maximum) {
				data.response = 'Wallet Money Settings are not Available, Please try Again Later.';
				res.send(data);
			} else {
				data.status = '1';
				data.wallter_money = { 'wallet_min_amount': wallet.settings.wallet.amount.minimum, 'wallet_max_amount': wallet.settings.wallet.amount.maximum };
				res.send(data);
			}
		});
	};

	controller.payform = function (req, res) {

		var data = {};
		data.status = '0';
		req.checkQuery('user_id', 'User ID is Required').notEmpty();
		req.checkQuery('total_amount', 'Total Amount is Required').notEmpty();
		var errors = req.validationErrors();

		if (errors) { data.response = errors[0].msg; res.send(data); return; }

		req.sanitizeQuery('user_id').trim();
		req.sanitizeQuery('total_amount').trim();

		var request = {};
		request.user_id = req.query.user_id.replace(/^"(.*)"$/, '$1');
		request.total_amount = req.query.total_amount;

		async.waterfall([
			function (callback) {
				db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
					callback(err, settings);
				});
			},
			function (settings, callback) {
				db.GetOneDocument('users', { '_id': request.user_id }, {}, {}, function (err, user) {
					callback(err, settings, user);
				});
			},
			function (settings, user, callback) {
				var transaction = {
					'user': request.user_id,
					'type': 'wallet',
					'amount': request.total_amount,
					'status': 1
				};
				db.InsertDocument('transaction', transaction, function (err, transaction) {
					callback(err, settings, user, transaction);
				});
			}
		], function (err, settings, user, transaction) {
			if (err) {
				res.render('mobile/payment-failed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
			} else {
				var pug = {};
				pug.transaction = transaction;
				pug.site_url = settings.settings.site_url;
				res.render('mobile/wallet-stripe-payment-card', pug);
			}
		});
	}

	controller.stripeProcess = function (req, res) {
		var data = {};
		data.status = '0';

		req.checkBody('user_id', 'User ID is Required').notEmpty();
		req.checkBody('transaction_id', 'Transaction ID is Required').optional();
		req.checkBody('stripeEmail', 'Stripe Email is Required').optional();
		req.checkBody('stripeToken', 'Stripe Token is Required').optional();
		req.checkBody('total_amount', 'Total Amount is Required').notEmpty();

		req.checkBody('card_number', 'card_number ID is Required').optional();
		req.checkBody('exp_month', 'exp_month  is Required').optional();
		req.checkBody('exp_year', 'exp_year  is Required').optional();
		req.checkBody('cvc_number', 'cvc_number  is Required').optional();

		errors = req.validationErrors();
		var errors = req.validationErrors();
		if (errors) { data.response = errors[0].msg; res.send(data); return; }

		req.sanitizeBody('user_id').trim();
		//req.sanitizeBody('job_id').trim();
		req.sanitizeBody('transaction_id').trim();
		req.sanitizeBody('stripeEmail').trim();
		req.sanitizeBody('stripeToken').trim();
		req.sanitizeBody('total_amount').trim();
		req.sanitizeBody('card_number').trim();
		req.sanitizeBody('exp_month').trim();
		req.sanitizeBody('exp_year').trim();
		req.sanitizeBody('cvc_number').trim();

		var request = {};
		request.user_id = req.body.user_id.replace(/^"(.*)"$/, '$1');
		//request.job_id = req.body.job_id;
		request.total_amount = req.body.total_amount;
		//request.transaction_id = req.body.transaction_id;
		request.stripeEmail = req.body.stripeEmail;
		request.stripeToken = req.body.stripeToken;
		request.card = {};
		request.card.number = req.body.card_number;
		request.card.exp_month = req.body.exp_month;
		request.card.exp_year = req.body.exp_year;
		request.card.cvc = req.body.cvc_number;

		db.GetOneDocument('users', { '_id': request.user_id }, {}, {}, function (err, user) {
			if (err || !user) {
				res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
			} else {
				request.stripeEmail = request.stripeEmail ? request.stripeEmail : user.email;
				//request.stripe_customer_id = user.stripe.customer;
				async.waterfall([
					function (callback) {
						db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
							callback(err, settings.settings);
						});
					},
					function (settings, callback) {
						if (!request.transaction_id) {
							var transaction = {
								'user': user._id,
								'type': 'wallet',
								'amount': request.total_amount,
								'status': 1
							};
							db.InsertDocument('transaction', transaction, function (err, transaction) {
								request.transaction_id = transaction._id;
								request.trans_id = transaction._id;
								request.trans_date = transaction.createdAt;
								request.avail_amount = transaction.amount;
								request.credit_type = transaction.type;
								callback(err, settings);
							});
						} else {
							callback(null, settings);
						}
					}, function (settings, callback) {
						if (!request.stripeToken ) {
							stripe.tokens.create({ card: request.card }, function (err, token) {
								callback(err, settings, token);
							});
						} else {
							callback(null, settings, null);
						}
					},
					function (settings, token, callback) {
						var charge = {};
						charge.amount = request.total_amount * 100;
						charge.currency = 'usd';
						charge.source = token.id;
						charge.description = 'Wallet Recharge';
						stripe.charges.create(charge, function (err, charges) {
							callback(err, settings, charges);
						});
					}, function (settings, charges, callback) {
						if (request.transaction_id) {
							var transactions = [{
								'gateway_response': charges
							}];
							db.UpdateDocument('transaction', { '_id': request.transaction_id }, { 'transactions': transactions }, {}, function (err, transaction) {
								callback(err, settings, charges);
							});
						} else {
							callback(null, settings, null);
						}
					}, function (settings, charges, callback) {
						db.GetOneDocument('walletReacharge', { "user_id": request.user_id }, {}, {}, function (err, wallet) {
							callback(err, settings, charges, wallet);
						});
					}
				], function (err, settings, charges, wallet) {
					if (err) {
						res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
					} else {
						var transactions = {
							'trans_id': request.trans_id,
							'trans_date': request.trans_date,
							'trans_amount': request.avail_amount,
							'avail_amount': 0,
							'type': 'CREDIT'
						};
						var dataToUpdate = {};
						dataToUpdate = { 'task.invoice.status': 0 };
						if (charges.status == 'succeeded') {
							dataToUpdate = { 'task.invoice.status': 1, 'payment_gateway_response': charges };

							if (wallet) {
								transactions.avail_amount = parseInt(wallet.total) + parseInt(request.total_amount);
								db.UpdateDocument('walletReacharge', { 'user_id': request.user_id }, { total: transactions.avail_amount, $push: { 'transactions': transactions } }, {}, function (err, docdata) {
									if (err || charges.status != 'succeeded') {
										res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
									} else {
										var payment = {};
										payment.user = request.user_id;
										payment.transaction = request.transaction_id;
										payment.charge = charges.id;
										payment.image = settings.site_url + 'app/mobile/images/success.png';
										res.redirect("http://" + req.headers.host + '/mobile/payment/pay-completed/bycard');
									}
								});
							} else {
								transactions.avail_amount = request.total_amount;
								var insertdata = {};
								insertdata.user_id = request.user_id;
								insertdata.total = request.total_amount;
								insertdata.transactions = [];
								insertdata.transactions.push(transactions);
								db.InsertDocument('walletReacharge', insertdata, function (err, docdata) {
									if (err || charges.status != 'succeeded') {

										res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
									} else {
										var payment = {};
										payment.user = request.user_id;
										payment.transaction = request.transaction_id;
										payment.charge = charges.id;
										payment.image = settings.site_url + 'app/mobile/images/success.png';
										res.redirect("http://" + req.headers.host + '/mobile/payment/pay-completed/bycard');
									}
								});

							}
						}
					}
				});
			}
		});
	}

	controller.payCancel = function (req, res) {
		db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
			res.render('mobile/payment-return', { site_url: settings.settings.site_url });
		});
	}

	controller.walletrechargefailed = function (req, res) {
		db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
			res.render('mobile/payment-failed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
		});
	}

	controller.settings = function (req, res) {
		db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
			if (err || !currencies) {
				res.send({
					"status": 0,
					"message": 'Error'
				});
			}
			else {
				db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
					if (err || !settings.settings.wallet) {
						res.send({
							'status': '0',
							'message': 'wallet money settings are not available, Please try again later.',
							'response': 'wallet money settings are not available, Please try again later.'
						});
					} else {
						if (settings.settings.wallet.amount.minimum && settings.settings.wallet.amount.maximum) {
							res.send({
								'status': '1',
								'wallter_money': {
									'wallet_min_amount': (settings.settings.wallet.amount.minimum * currencies.value).toFixed(2),
									'wallet_max_amount': (settings.settings.wallet.amount.maximum * currencies.value).toFixed(2)
								}
							});
						} else {
							res.send({
								'status': '0',
								'message': 'wallet money settings are not available, Please try again later.',
								'response': 'wallet money settings are not available, Please try again later.'
							});
						}
					}
				});
			}
		});
	}

	controller.mobpaypalPayment = function mobpaypalPayment(req, res) {
		console.log(req.body);

		var data = {};
		data.status = '1';
		req.checkBody('user', 'User ID is Required').notEmpty();
		req.checkBody('task', 'Task ID is Required').notEmpty();
		errors = req.validationErrors();
		var errors = req.validationErrors();
		if (errors) { data.response = errors[0].msg; res.send(data); return; }

		var request = {};
		request.task = req.body.task;
		request.user = req.body.user;


		req.sanitizeBody('user').trim();
		req.sanitizeBody('task').trim();


		db.GetOneDocument('users', { '_id': request.user }, {}, {}, function (err, user) {
			if (err || !user) {
				res.send({
					"status": "0",
					"message": "Invalid user ID, Please try Again Later.!"
				});
			}
			else {
				var options = {};
				options.populate = 'user category tasker';
				db.GetOneDocument('task', { '_id': request.task, 'status': 6 }, {}, options, function (err, task) {
					if (err || !task) {
						res.send({
							"status": "0",
							"message": "Invalid task ID, Please try Again Later.!"
						});
					} else {
						async.waterfall([
							function (callback) {
								db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'paypal' }, {}, {}, function (err, paymentgateway) {
									if (err || !paymentgateway) {
										res.send({
											"status": "0",
											"message": "Error, Please try Again Later.!"
										});
									} else {
										callback(err, paymentgateway);
									}

								});
							},
							function (paymentgateway, callback) {
								var transaction = {};
								transaction.user = task.user;
								transaction.tasker = task.tasker;
								transaction.task = request.task;
								transaction.type = 'paypal';
								if (transaction.amount = task.invoice.amount.balance_amount) {
									transaction.amount = task.invoice.amount.balance_amount;
								} else {
									transaction.amount = task.invoice.amount.grand_total;
								}
								transaction.amount = task.invoice.amount.balance_amount;
								transaction.task_date = task.createdAt;
								transaction.status = 1
								db.InsertDocument('transaction', transaction, function (err, transaction) {
									request.transaction_id = transaction._id;
									request.trans_date = transaction.createdAt;
									request.avail_amount = transaction.amount;
									request.credit_type = transaction.type;
									callback(err, paymentgateway, transaction);
								});
							},
							function (paymentgateway, transaction, callback) {
								db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
									if (err || !settings) {
										res.send({
											"status": "0",
											"message": "Configure your website settings.!"
										});
									}
									else { callback(err, paymentgateway, transaction, settings.settings); }
								});
							},
							function (paymentgateway, transaction, settings, callback) {
								db.GetOneDocument('emailtemplate', { name: { $in: ['PaymentDetailstoAdmin', 'PaymentDetailstoTasker', 'PaymentDetailstoUser'] }, 'status': { $eq: 1 } }, {}, {}, function (err, template) {
									if (err || !template) {
										res.send({
											"status": "0",
											"message": "Unable to get email template.!"
										});
									}
									else { callback(err, paymentgateway, transaction, settings, template); }
								});
							}
						], function (err, paymentgateway, transaction, settings, template) {
							if (err) {
								res.send({
									"status": "0",
									"message": "Error, Please try Again Later.!"
								});
							} else {
								db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
									if (err || !currencies) {
										res.send({
											"status": "0",
											"response": 'Data Not available'
										});
									}
									else {
										paypal.configure({
											'mode': 'sandbox',
											'client_id': paymentgateway.settings.client_id,
											'client_secret': paymentgateway.settings.client_secret
										});

										var json = {
											"intent": "sale",
											"payer": {
												"payment_method": "paypal"
											},
											"redirect_urls": {},
											"transactions": [{
												"item_list": {
													"items": []
												},
												"amount": {
													"currency": currencies.code,
													"details": {}
												},
												"description": "This is the payment description."
											}]
										};
										var item = {};
										item.name = settings.site_title;
										item.price = task.invoice.amount.grand_total;
										item.currency = currencies.code;
										item.quantity = 1;
										json.transactions[0].item_list.items.push(item);

										json.transactions[0].amount.details.subtotal = task.invoice.amount.grand_total;
										json.transactions[0].amount.details.tax = 0.00;
										json.transactions[0].amount.total = task.invoice.amount.grand_total;
										json.transactions[0].amount.currency = currencies.code;

										json.redirect_urls.return_url = "http://" + req.headers.host + "/mobile/app/payment/paypal-execute?task=" + task._id + "&transaction=" + transaction._id;
										json.redirect_urls.cancel_url = "http://" + req.headers.host + "/checkout/payment/paypal/cancel?task=" + task._id + "&transaction=" + transaction._id;

										paypal.payment.create(json, function (error, payment) {
											if (error) {
												res.send({
													"status": "0",
													"message": "Unable to get email template.!"
												});
											} else {
												for (var i = 0; i < payment.links.length; i++) {
													var link = payment.links[i];
													if (link.method === 'REDIRECT') {
														data.redirectUrl = link.href;
													}
												}
												data.payment_mode = 'paypal';
												res.send(data);
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}

	controller.mobpaypalExecute = function mobpaypalPayment(req, res) {

		var data = {};
		data.status = '1';

		var request = {};
		request.task = req.query.task;
		request.transaction = req.query.transaction;
		request.paymentId = req.query.paymentId;
		request.token = req.query.token;
		request.PayerID = req.query.PayerID;

		var options = {};
		options.populate = 'tasker user task';
		db.GetOneDocument('transaction', { _id: request.transaction }, {}, options, function (err, transaction) {

			if (err || !transaction) {
				res.send({
					"status": "0",
					"message": "Error, Please try Again Later.!"
				});
			} else {
				async.waterfall([
					function (callback) {
						db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'paypal' }, {}, {}, function (err, paymentgateway) {
							if (err || !paymentgateway) {
								res.send({
									"status": "0",
									"message": "Configure your website settings.!"
								});
							}
							else {
								callback(err, paymentgateway);
							}
						});
					},
					function (paymentgateway, callback) {
						db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
							if (err || !settings) {
								res.send({
									"status": "0",
									"message": "Configure your website settings.!"
								});
							}
							else { callback(err, paymentgateway, settings.settings); }
						});
					},
					function (paymentgateway, settings, callback) {
						db.GetDocument('emailtemplate', { name: { $in: ['PaymentDetailstoAdmin', 'PaymentDetailstoTasker', 'PaymentDetailstoUser'] }, 'status': { $ne: 0 } }, {}, {}, function (err, template) {
							if (err || !template) {
								res.send({
									"status": "0",
									"message": "Unable to get email template.!"
								});
							}
							else { callback(err, paymentgateway, settings, template); }
						});
					}
				], function (err, paymentgateway, settings, template) {
					if (err) {
						res.send({
							"status": "0",
							"message": "Configure your website settings.!"
						});
					} else {
						paypal.configure({
							'mode': 'sandbox',
							'client_id': paymentgateway.settings.client_id,
							'client_secret': paymentgateway.settings.client_secret
						});

						paypal.payment.execute(request.paymentId, { "payer_id": request.PayerID }, function (err, result) {
							if (err) {
								res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
							} else {
								if (result.transactions[0].related_resources[0].sale.state != 'completed') {
									data.response = 'Transaction Failed';
									res.redirect("mobile/payment-failed");
								} else {
									var dataToUpdate = {};
									dataToUpdate.status = 7;
									dataToUpdate.invoice = transaction.task.invoice;
									dataToUpdate.invoice.status = 1;
									dataToUpdate.payee_status = 0;
									dataToUpdate.invoice.amount.balance_amount = parseFloat(transaction.task.invoice.amount.balance_amount) - parseFloat(transaction.task.invoice.amount.balance_amount);
									dataToUpdate.payment_type = 'paypal';

									var transactionsData = [{
										'gateway_response': result
									}];

									db.UpdateDocument('transaction', { '_id': request.transaction }, { $push: { 'transactions': transactionsData } }, {}, function (err, transactionUpdate) {

										if (err) {
											res.status(400).send(err);
										} else {

											db.UpdateDocument('task', { _id: transaction.task._id }, dataToUpdate, function (err, docdata) {
												if (err) {
													res.status(400).send(err);
												} else {
													db.UpdateDocument('task', { _id: transaction.task._id }, { 'history.job_closed_time': new Date() }, {}, function (err, history) {
														if (err) {
															res.status(400).send(err);
														} else {
															var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
															var options = { 'job_id': transaction.task.booking_id, 'provider_id': transaction.task.tasker };
															push.sendPushnotification(transaction.task.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
															push.sendPushnotification(transaction.task.tasker, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });
															res.redirect("http://" + req.headers.host + '/mobile/mobile/paypalsucess');
															//start mail
															db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
																if (err) {
																	res.status(400).send(err);
																} else {
																	var options = {};
																	options.populate = 'tasker user categories';
																	db.GetOneDocument('task', { _id: request.task }, {}, options, function (err, maildocdata) {
																		if (err) {
																			res.status(400).send(err);
																		} else {

																			db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
																				if (err) {
																					res.send(err);
																				} else {
																					var MaterialFee, CouponCode, DateTime, BookingDate;
																					if (maildocdata.invoice.amount.extra_amount) {
																						MaterialFee = (maildocdata.invoice.amount.extra_amount).toFixed(2);
																					} else {
																						MaterialFee = '0.00';
																					}
																					if (maildocdata.invoice.amount.coupon) {
																						CouponCode = maildocdata.invoice.amount.coupon;
																					} else {
																						CouponCode = 'Not assigned';
																					}
																					DateTime = moment(maildocdata.history.job_started_time).format('DD/MM/YYYY - HH:mm');
																					BookingDate = moment(maildocdata.history.booking_date).format('DD/MM/YYYY');
																					var mailData = {};
																					mailData.template = 'PaymentDetailstoAdmin';
																					mailData.to = settings.settings.email_address;
																					mailData.html = [];
																					mailData.html.push({ name: 'mode', value: maildocdata.payment_type });
																					mailData.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
																					mailData.html.push({ name: 'coupon', value: CouponCode });
																					mailData.html.push({ name: 'datetime', value: DateTime });
																					mailData.html.push({ name: 'bookingdata', value: BookingDate });
																					mailData.html.push({ name: 'site_url', value: settings.settings.site_url });
																					mailData.html.push({ name: 'site_title', value: settings.settings.site_title });
																					mailData.html.push({ name: 'logo', value: settings.settings.logo });
																					mailData.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username +")" });
																					mailData.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
																					mailData.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
																					mailData.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
																					mailData.html.push({ name: 'bookingid', value: maildocdata.booking_id });
																					mailData.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username +")" });
																					mailData.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
																					mailData.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
																					mailData.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
																					mailData.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
																					mailData.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + (maildocdata.hourly_rate).toFixed(2) });
																					mailData.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
																					mailData.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total).toFixed(2) });
																					mailData.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
																					mailData.html.push({ name: 'amount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission).toFixed(2) });
																					mailData.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - MaterialFee).toFixed(2) });
																					mailData.html.push({ name: 'adminamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.admin_commission).toFixed(2) });
																					mailData.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
																					mailData.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
																					//mailData.html.push({ name: 'senderemail', value: template[0].sender_email });
																					mailData.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
																					//	mailData.html.push({ name: 'email', value: req.body.email });
																					mailcontent.sendmail(mailData, function (err, response) { });

																					var mailData2 = {};
																					mailData2.template = 'PaymentDetailstoTasker';
																					mailData2.to = maildocdata.tasker.email;
																					mailData2.html = [];
																					mailData2.html.push({ name: 'mode', value: maildocdata.payment_type });
																					mailData2.html.push({ name: 'coupon', value: CouponCode });
																					mailData2.html.push({ name: 'bookingdata', value: BookingDate });
																					mailData2.html.push({ name: 'datetime', value: DateTime });
																					mailData2.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
																					mailData2.html.push({ name: 'site_url', value: settings.settings.site_url });
																					mailData2.html.push({ name: 'site_title', value: settings.settings.site_title });
																					mailData2.html.push({ name: 'logo', value: settings.settings.logo });
																					mailData2.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username +")" });
																					mailData2.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
																					mailData2.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
																					mailData2.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
																					mailData2.html.push({ name: 'bookingid', value: maildocdata.booking_id });
																					mailData2.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username +")" });
																					mailData2.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
																					mailData2.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
																					mailData2.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
																					mailData2.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
																					mailData2.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
																					mailData2.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
																					mailData2.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.service_tax).toFixed(2) });
																					mailData2.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
																					    mailData2.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - maildocdata.invoice.amount.service_tax).toFixed(2) });
																					// mailData2.html.push({ name: 'adminamount', value: maildocdata.invoice.amount.admin_commission});
																					mailData2.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
																					mailData2.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
																					mailData2.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
																					//	mailData2.html.push({ name: 'senderemail', value: template[0].sender_email });
																					mailData2.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
																					mailData2.html.push({ name: 'email', value: req.body.email });
																					mailcontent.sendmail(mailData2, function (err, response) { });
																					var mailData3 = {};
																					mailData3.template = 'PaymentDetailstoUser';
																					mailData3.to = maildocdata.user.email;
																					mailData3.html = [];
																					mailData3.html.push({ name: 'mode', value: maildocdata.payment_type });
																					mailData3.html.push({ name: 'datetime', value: DateTime });
																					mailData3.html.push({ name: 'bookingdata', value: BookingDate });
																					mailData3.html.push({ name: 'coupon', value: CouponCode });
																					mailData3.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
																					mailData3.html.push({ name: 'site_url', value: settings.settings.site_url });
																					mailData3.html.push({ name: 'site_title', value: settings.settings.site_title });
																					mailData3.html.push({ name: 'logo', value: settings.settings.logo });
																					mailData3.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username +")" });
																					mailData3.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
																					mailData3.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
																					mailData3.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
																					mailData3.html.push({ name: 'bookingid', value: maildocdata.booking_id });
																					mailData3.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username +")" });
																					mailData3.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
																					mailData3.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
																					mailData3.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
																					mailData3.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
																					mailData3.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
																					mailData3.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
																					mailData3.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + maildocdata.invoice.amount.grand_total.toFixed(2) });
																					mailData3.html.push({ name: 'total', value: currencies.symbol + ' ' + maildocdata.invoice.amount.total.toFixed(2) });
																					mailData3.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total - maildocdata.invoice.amount.grand_total).toFixed(2) });
																					mailData3.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
																					mailData3.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
																					mailData3.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
																					//mailData3.html.push({ name: 'senderemail', value: template[0].sender_email });
																					mailData3.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
																					mailData3.html.push({ name: 'email', value: req.body.email });
																					mailcontent.sendmail(mailData3, function (err, response) { });
																				}
																			});
																		}
																	});// mail end
																}
															});// setting end			
														}
													});
												}
											});
										}
									});
								}
							}
						});
					}
				});
			}
		});
	}
	controller.applyCoupontest = function (req, res) {

		var status = '0';
		var response = {};
		req.checkBody('user_id', 'User ID is Required').notEmpty();
		req.checkBody('code', 'Coupon code is Required').notEmpty();
		req.checkBody('booking_id', 'Booking_id is Required').notEmpty();

		var data = {};
		data.user_id = req.body.user_id;
		data.code = req.body.code;
		data.reach_date = req.body.pickup_date;
		data.booking = req.body.booking_id;

		var errors = [];
		errors = req.validationErrors();
		if (errors) {
			res.send({
				"status": "0",
				"response": errors[0].msg
			});
			return;
		}

		var request = {};
		var date = new Date();
		var isodate = date.toISOString();//new Date("2016-08-30T18:30:00.0Z");;
		request.task = req.body.taskid;
		db.GetDocument('coupon', { status: { $ne: 0 }, code: req.body.code }, {}, {}, function (err, coupondata) {
			if (err || coupondata.length == 0) {
				res.send({ "status": "0", "response": "Invalid Coupon" });
			}
			else {
				db.GetDocument('coupon', { status: { $ne: 0 }, code: req.body.code, "expiry_date": { "$gte": isodate }, "valid_from": { "$lte": isodate } }, {}, {}, function (err, data) {
					if (err || data.length == 0) {
						res.send({ "status": "0", "response": "Coupon Code Date Expired" });
					}
					else {
						db.GetAggregation('task', [
							{ $match: { 'invoice.coupon': req.body.code } },
							{ $group: { _id: "$invoice.coupon", total: { $sum: 1 } } },
						], function (err, taskdata) {

							if (err || !taskdata) {
								res.send({ "status": "0", "response": "Coupon Code Date Expired" });
							} else {
								db.GetDocument('coupon', { status: { $ne: 0 }, code: req.body.code }, {}, {}, function (err, couponlimit) {
									if (err || couponlimit.length == 0) {
										res.send({ "status": "0", "response": "Coupon Code Limit Exceed" });
									} else {
										db.GetAggregation('task', [
											{ $match: { user: new mongoose.Types.ObjectId(req.body.user_id), 'status': 7, 'invoice.status': 1, 'invoice.coupon': req.body.code } },
											{ $group: { _id: "$user", total: { $sum: 1 } } },
										], function (err, usagedata) {
											if (err || !usagedata) {
												res.send({ "status": "0", "response": "Coupon Code Limit Exceed" });
											} else {
												var usage = 0;
												if (usagedata[0]) {
													if (usagedata[0].total) {
														usage = usagedata[0].total;
													}
												}
												db.GetDocument('coupon', { status: { $ne: 0 }, code: req.body.code, 'usage.per_user': { '$gte': usage }, 'usage.total_coupons': { '$gte': 1 } }, {}, {}, function (err, usagelimit) {
													if (err || !usagelimit || usagelimit.length == 0) {
														res.send({ "status": "0", "response": "Coupon Code Limit Exceed" });
													} else {
														db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
															if (err || !currencies) {
																res.send({
																	"status": 0,
																	"message": 'Error'
																});
															}
															else {
																db.GetDocument('task', { 'booking_id': req.body.booking_id }, {}, {}, function (err, taskdata) {
																	if (err || !taskdata || taskdata.length == 0) {
																		res.send({ "status": "0", "response": "Error In booking_id " });
																	} else {
																		var invoice = {};
																		invoice.amount = {};
																		var discount = 0.00;
																		if (couponlimit[0].discount_type == 'Percentage') {
																			discount = parseInt(taskdata[0].invoice.amount.grand_total * couponlimit[0].amount_percentage) / 100;
																		}
																		else {
																			discount = parseInt(couponlimit[0].amount_percentage);
																		}

																		if (discount >= taskdata[0].invoice.amount.grand_total) {
																			discount = taskdata[0].invoice.amount.grand_total;
																		}

																		var grand_total = parseInt(taskdata[0].invoice.amount.grand_total) - discount;
																		var balance_amount = parseInt(taskdata[0].invoice.amount.balance_amount) - discount;



																		if (grand_total <= 0) {
																			grand_total = 0;
																		}

																		if (balance_amount <= 0) {
																			balance_amount = 0;
																		}
																		var update = { 'invoice.amount.coupon': discount, 'invoice.coupon': req.body.code, 'invoice.amount.discount': discount, 'invoice.amount.grand_total': grand_total, 'invoice.amount.balance_amount': balance_amount };

																		db.UpdateDocument('task', { _id: new mongoose.Types.ObjectId(taskdata[0]._id) }, update, function (err, result) {
																			if (err || result.nModified == 0) {
																				res.send({ "status": "0", "response": "Error In Coupon updation" });
																			}
																			else {
																				var usagelimits = couponlimit[0].usage.total_coupons;
																				var result = usagelimits - 1;
																				if (result <= 0) {
																					result = 0;
																				}
																				db.UpdateDocument('coupon', { status: { $ne: 0 }, code: req.body.code }, { 'usage.total_coupons': result }, function (err, result) {
																					if (err || result.nModified == 0) {
																						res.send({ "status": "0", "response": "Error In Coupon updation" });
																					}
																					else {

																						res.send({ "status": "1", "response": "Coupon used successfully", "discount": (discount * currencies.value).toFixed(2) });
																					}
																				});
																			}
																		});
																	}
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}





	controller.updatewalletdatapaypal = function updatewalletdatapaypal(req, res) {

		var data = {};
		data.status = '1';

		req.checkBody('user_id', 'User ID is Required').notEmpty();
		req.checkBody('total_amount', 'Total Amount is Required').notEmpty();

		var errors = req.validationErrors();
		if (errors) { data.response = errors[0].msg; res.send(data); return; }

		req.sanitizeQuery('user_id').trim();
		req.sanitizeQuery('total_amount').trim();

		var request = {};
		request.user = req.body.user_id;
		request.amount = req.body.total_amount;

		db.GetOneDocument('users', { '_id': request.user }, {}, {}, function (err, user) {
			if (err || !user) {
				res.send({
					"status": "0",
					"message": "Invalid user ID, Please try Again Later.!"
				});
			} else {
				async.waterfall([
					function (callback) {
						db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'paypal' }, {}, {}, function (err, paymentgateway) {
							callback(err, paymentgateway);
						});
					},
					function (paymentgateway, callback) {
						var transaction = {
							'user': request.user_id,
							'type': 'wallet',
							'amount': request.amount,
							'status': 1
						};
						db.InsertDocument('transaction', transaction, function (err, transaction) {
							request.transaction_id = transaction._id;
							request.trans_id = transaction._id;
							request.trans_date = transaction.createdAt;
							request.avail_amount = transaction.amount;
							request.credit_type = transaction.type;
							callback(err, paymentgateway, transaction);
						});
					},
					function (paymentgateway, transaction, callback) {
						db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
							if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
							else { callback(err, paymentgateway, transaction, settings.settings); }
						});
					},
					function (paymentgateway, transaction, settings, callback) {
						db.GetDocument('emailtemplate', { name: { $in: ['PaymentDetailstoAdmin', 'PaymentDetailstoTasker', 'PaymentDetailstoUser'] }, 'status': { $ne: 0 } }, {}, {}, function (err, template) {
							if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
							else { callback(err, paymentgateway, transaction, settings, template); }
						});
					}
				], function (err, paymentgateway, transaction, settings, template) {
					if (err) {
						res.send({
							"status": "0",
							"message": "Invalid Error, Please try Again Later.!"
						});
					} else {
						paypal.configure({
							'mode': paymentgateway.settings.mode,
							'client_id': paymentgateway.settings.client_id,
							'client_secret': paymentgateway.settings.client_secret
						});

						var json = {
							"intent": "sale",
							"payer": {
								"payment_method": "paypal"
							},
							"redirect_urls": {},
							"transactions": [{
								"item_list": {
									"items": []
								},
								"amount": {
									"currency": "USD",
									"details": {}
								},
								"description": "This is the payment description."
							}]
						};

						var item = {};
						item.name = settings.site_title;
						item.price = request.amount;
						item.currency = 'USD';
						item.quantity = 1;
						json.transactions[0].item_list.items.push(item);
						json.transactions[0].amount.total = request.amount;
						json.transactions[0].amount.currency = 'USD';
						json.redirect_urls.return_url = "http://" + req.headers.host + "/mobile/app/wallet-recharge/mob-execute?user=" + request.user + "&transaction=" + transaction._id;
						json.redirect_urls.cancel_url = "http://" + req.headers.host + "/checkout/payment/paypal/cancel?user=" + request.user + "&transaction=" + transaction._id;
						paypal.payment.create(json, function (error, payment) {
							if (error) {
								res.send({
									"status": "0",
									"message": "Unable to get email template.!"
								});

							} else {
								for (var i = 0; i < payment.links.length; i++) {
									var link = payment.links[i];
									if (link.method === 'REDIRECT') {
										data.redirectUrl = link.href;
									}
								}
								data.payment_mode = 'paypal';
								res.send(data);
							}
						});

					}
				});
			}
		});
	}

	controller.walletpaypalExecute = function updatewalletdatapaypal(req, res) {

		var data = {};
		data.status = '1';
		var request = {};
		request.transaction = req.query.transaction;
		request.paymentId = req.query.paymentId;
		request.token = req.query.token;
		request.PayerID = req.query.PayerID;
		request.user = req.query.user;

		db.GetOneDocument('transaction', { _id: request.transaction }, {}, {}, function (err, transaction) {
			if (err) {
				res.send({
					"status": "0",
					"message": "Invalid Error, Please try Again Later.!!"
				});
			} else {
				async.waterfall([
					function (callback) {
						db.GetOneDocument('paymentgateway', { status: { $ne: 0 }, alias: 'paypal' }, {}, {}, function (err, paymentgateway) {
							callback(err, paymentgateway);
						});
					},
					function (paymentgateway, callback) {
						db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
							if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
							else { callback(err, paymentgateway, settings.settings); }
						});
					},
					function (paymentgateway, settings, callback) {
						db.GetDocument('emailtemplate', { name: { $in: ['PaymentDetailstoAdmin', 'PaymentDetailstoTasker', 'PaymentDetailstoUser'] }, 'status': { $ne: 0 } }, {}, {}, function (err, template) {
							if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
							else { callback(err, paymentgateway, settings, template); }
						});
					}
				], function (err, paymentgateway, settings, template) {
					if (err) {
						res.send({
							"status": "0",
							"message": "Invalid Error, Please try Again Later.!!"
						});
					} else {
						paypal.configure({
							'mode': 'sandbox',
							'client_id': paymentgateway.settings.client_id,
							'client_secret': paymentgateway.settings.client_secret
						});

						paypal.payment.execute(request.paymentId, { "payer_id": request.PayerID }, function (err, result) {
							if (err) {
								res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
							} else {
								if (result.transactions[0].related_resources[0].sale.state != 'completed') {
									data.response = 'Transaction Failed';
									res.redirect("mobile/payment-failed");
								} else {
									db.GetOneDocument('walletReacharge', { "user_id": request.user }, {}, {}, function (err, docdata) {
										if (err || !docdata) {
											var transactions = [{
												'gateway_response': result
											}];
											db.UpdateDocument('transaction', { '_id': request.transaction }, { 'transactions': transactions }, {}, function (err, transaction) {
												if (err) {
													res.send({
														"status": "0",
														"message": "Invalid Error, Please try Again Later.!!"
													});
												} else {
													db.GetOneDocument('transaction', { _id: request.transaction }, {}, {}, function (err, doctransaction) {
														db.InsertDocument('walletReacharge', {
															'user_id': request.user,
															"total": doctransaction.amount,
															'type': 'wallet',
															"transactions": [{
																'type': 'CREDIT',
																'ref_id': '',
																'avail_amount': doctransaction.amount,
																'trans_amount': doctransaction.amount,
																'trans_date': Date.now(),
																'trans_id': mongoose.Types.ObjectId()
															}]
														}, function (err, result) {
															if (err) {
																res.status(400).send(err);
															} else {
																res.redirect("http://" + req.headers.host + '/mobile/mobile/paypalsucess');
															}
														});
													});
												}
											});
										} else {
											var charge = {};
											charge.amount = transaction.amount * 100;
											charge.currency = 'usd';
											charge.source = request.token;
											charge.description = 'Wallet Recharge';
											var transactions = [{
												'gateway_response': result
											}];
											db.UpdateDocument('transaction', { '_id': request.transaction }, { 'transactions': transactions }, {}, function (err, transaction) {
												if (err) {
													res.send({
														"status": "0",
														"message": "Invalid Error, Please try Again Later.!!"
													});
												} else {
													db.GetOneDocument('walletReacharge', { "user_id": request.user }, {}, {}, function (err, wallet) {
														if (err) {
															res.send({
																"status": "0",
																"message": "Invalid Error, Please try Again Later.!!"
															});
														} else {
															db.GetOneDocument('transaction', { _id: request.transaction }, {}, {}, function (err, doctransaction) {
																var transactions = {
																	'trans_id': request.transaction,
																	'trans_date': doctransaction.createdAt,
																	'avail_amount': parseInt(wallet.total) + parseInt(doctransaction.amount),
																	'trans_amount': doctransaction.amount,
																	'type': 'CREDIT'
																};
																db.UpdateDocument('walletReacharge', { 'user_id': request.user }, { total: parseInt(wallet.total) + parseInt(doctransaction.amount), $push: { 'transactions': transactions } }, {}, function (err, docdata) {
																	if (err) {
																		res.status(400).send(err);
																	} else {
																		res.redirect("http://" + req.headers.host + '/mobile/mobile/paypalsucess');
																	}
																});
															});
														}
													});
												}
											});
										}
									});
								}
							}
						});
					}
				});
			}
		});
	}


	return controller;
};
