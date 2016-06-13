import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
  name: 'Routes.home',
  action() {
    BlazeLayout.render('Home', {});
  }
});

FlowRouter.route('/send', {
  name: 'Routes.send',
  action() {
    BlazeLayout.render('Send', {});
  }
});

FlowRouter.route('/deliver', {
  name: 'Routes.deliver',
  action() {
    BlazeLayout.render('Deliver', {});
  }
});

FlowRouter.route('/package/:_id', {
  name: 'Routes.package',
  action(params, queryParams) {
    // TODO throw error if not found
    BlazeLayout.render('PackageDetail', {})
  }
});

FlowRouter.route('/govern', {
  name: 'Routes.govern',
  action(params, queryParams) {
    BlazeLayout.render('DAOGovernance', {})
  }
});
