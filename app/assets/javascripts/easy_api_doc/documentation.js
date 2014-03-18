// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

// Disables all fields in the API example, (convenience so that not all are needed to be disabled one at a time to update just one field)
$(document).ready(function () {
  $.cookie.defaults = Object({ path: '/' });
  if ($.cookie("auth_hidden") == false) {
    $('*[data-group="authentication_details"]').show();
    $('.show-authentication-section').hide();
    $('.clear-authentication-section').show();
    $('.hide-authentication-section').show();
  } else {
    $('*[data-group="authentication_details"]').hide();
    $('.show-authentication-section').show();
    $('.clear-authentication-section').hide();
    $('.hide-authentication-section').hide();
  }
  var auth_settings = {};

  $('.disable-all-toggle').on('click', function(e){
    var link = $(e.target);
    if (link.html().match(/disable/)){
      $('form.api_call .input').attr('disabled', 'disabled');
      link.html('enable all');
      $('form.api_call .disable-field-toggle').html('enable');
    }
    else {
      $('form.api_call .input').removeAttr('disabled');
      link.html('disable all');
      $('form.api_call .disable-field-toggle').html('disable');
    }
  });

  // Execute the example API call form
  $('form.api_call .run_api_call').on('click', function(e) {
    try {
      var form = $(e.target).parents('form');
      var params = get_form_params(form);
      var format = params.format;
      delete params['format'];
      var uri = form.attr('action') + '.' + format;
      auth_settings = pop_auth_settings(params);
      // switch out url variables;
      var matches = uri.match(/\/(\:\w+)/g);
      if(matches) {
        $.each(matches, function(i, key) {
          param_name = key.replace("/:", "");
          var value = params[param_name];
          uri = uri.replace(key, "/" + value);
          delete params[param_name];
        });
      }
      if (params['_doc_post_data'] != null) {
        params = serialize_params(params);
        var query_string = [];
        for (var key in params)
          if (key != '_doc_post_data') {
            query_string.push(key + "=" + params[key]);
          }
        if (query_string.length > 0) {
          uri += "?" + query_string.join("&")
        }
        params = params['_doc_post_data'];
      } else {
        params = serialize_params(params);
      }

      var remote_method = form.attr('method');

      process_api_call(uri, remote_method, params, auth_settings, {'form': form, 'format': format});
    }
    catch(e) {
      alert("There was an error within the test harness: " + e.toString());
      throw(e);
    }
    return false;
  });

  // Disable a single field in the API example (prevents blank parameters being passed that aren't wanted to be filled out)
  $('form.api_call .disable-field-toggle').on('click', function(e){
    var link = $(e.target);
    var input = link.closest('tr').children().children('.input');

    if(input.attr('disabled')){
      input.removeAttr('disabled');
      link.html('disable');
    }
    else {
      input.attr('disabled', 'disabled')
      link.html('enable');
    }
    return false;
  });

  // Array data structure support:
  // appends fields using a hash structure with keys of '_array_0' ...
  $('.append-fields').on('click', function(e){
    var link = $(e.target);
    var input = link.parent().children('.input').first();

    new_node = input.clone();
    new_node.val(""); // blank contents
    new_node.addClass('additional');

    elem_to_insert_after = link.parent().children('.input, .append-fields').last();
    elem_to_insert_after.after(new_node);

    link.parent().children('.input').each(function(i, elem) {
      elem = $(elem);
      var field_name = elem.attr('name');
      field_name = field_name.replace(/\[(_array_)?\d*\]$/, "[_array_" + i + "]");
      elem.attr('name', field_name);
    });

    return false;
  });


  // Nested data structure list support: creates new form elements to add another
  // parameter of the same type, complete with all child elements (including further nested structures)
  $('.append-structure').on('click', function(e){
    var link = $(this);
    var target_structure_name = link.attr('name');
    $all_fields = $('*[data-group="' + target_structure_name + '"]');

    new_node = $all_fields.first().clone();
    $all_fields.parent().append(new_node);
    new_node.insertAfter($all_fields.last());
    return false;
  });

  $('.hide-authentication-section').on('click', function(e) {
    $('*[data-group="authentication_details"]').hide();
    $(this).hide();
    $('.show-authentication-section').show();
    $('.clear-authentication-section').hide();
    $.cookie("auth_hidden", true, { path: '/' });
    return false;
  });

  $('.show-authentication-section').click(function(e) {
    $('*[data-group="authentication_details"]').show();
    $(this).hide();
    $('.hide-authentication-section').show();
    $('.clear-authentication-section').show();
    $.cookie("auth_hidden", false, { path: '/' });
    return false;
  });

  $('.clear-authentication-section').click(function(e) {
    $('[name*="_doc_authentication"]').val("");
    $.cookie("auth_hidden", false, { path: '/' })
    return false;
  });
});

// Example of how to send an api call via jQuery. Note that there are issues running this from a separate domain
// when executed in a web browser, due to Cross-Site security constraints from browsers
// For basic auth, either use already encoded credentials, or you'll need a javascript Base64 library as used below
// See: http://ostermiller.org/calc/encode.html for an example Base64 encoding js library
function process_api_call(uri, method, data, auth_settings, options) {
  var form = options.form;
  $.ajax({
	  url: uri,
    type: method,
    data: data,
    error: function(xhr, data, ex) {
      response = xhr.responseText;
      if(response == null || response == '' || response.size == 0){
        response = data;
      }
      form_output(options.form, response, xhr.status, options.format);
    },
    beforeSend: function(xhr, settings) {
      form_output(options.form, '', '', options.format); // clear output
      form.children('.loading').show();

      auth_value = null;
      extra_settings = '';

      if (auth_settings && auth_settings.type.toLowerCase() == 'basic') {
        auth_value = "Basic " + encodeBase64(auth_settings.user + ":" + auth_settings.password);

      } else if (auth_settings && auth_settings.type.toLowerCase() == 'oauth_grant') {
        auth_value = "Basic " + encodeBase64(auth_settings.client_id + ":" + auth_settings.secret);

      } else if (auth_settings && auth_settings.type.toLowerCase() == 'oauth_bearer') {
        auth_value = "Bearer " + auth_settings.access_token;

      } else if (auth_settings && auth_settings.type.toLowerCase() == 'oauth') { // Oauth 1.0
        auth_value = 'OAuth oauth_version="' + auth_settings.oauth_version
          + '", oauth_signature_method="' + auth_settings.oauth_signature_method
          + '", oauth_consumer_key="' + auth_settings.oauth_consumer_key
          + '", oauth_signature="' + auth_settings.oauth_signature
          + '", oauth_timestamp="' + auth_settings.oauth_timestamp
          + '", oauth_nonce="' + auth_settings.oauth_nonce
          + '", oauth_token="' + auth_settings.oauth_token + '"';

        extra_settings = ', oauth_secret="' + auth_settings.oauth_secret + '"';
      }

      if (auth_value != null) {
        xhr.setRequestHeader("Authorization", auth_value.replace(/(\r\n|\n|\r)/gm,"")); // don't send through \n on headers or they will be ignored
      }
			return true;
    },
    success: function(data, textStatus, xhr) {
      response = xhr.responseText;
      form_output(options.form, response, xhr.status, options.format);
    },
    complete: function(xhr, textStatus){
      form.children('.loading').hide();
    }
  });
}

// Print the API response
function form_output(form, response, status, format) {
  form.children('.response').show();

  var pre = $(form.children('.response').children('.output'));
  if(format == 'json') {
    try {
      response = JSON.stringify(JSON.parse(response), null, 4);
    }
    catch(e) {
      // ignore formatting errors, and fall back to plain string response
    }
  }
  // pre.html(response);
  pre.val(response);

  if(status != null) {
    status_header = HTTP_STATUS_CODES[status.toString()[0] + 'XX'];
    status_message = HTTP_STATUS_CODES[status];
    if(status_header || status_message) {
      status = status.toString() + " - " + status_header + " (" + status_message + ")";
    }
    form.children('.response').children().children('.http_status').html(status);
  }
}

function pop_auth_settings(params){
  var myKeys;
  var my_auth_settings = {};

  if (params) {
    myKeys = Object.keys(params);
  }

  for (var k in myKeys) {
    var realKey = myKeys[k].match(/^_doc_authentication\[(\w+)\]/);
    if (realKey && realKey[1]) {
      var param_key = '_doc_authentication[' + realKey[1] + ']';
      my_auth_settings[realKey[1]] = params[param_key];
      delete params[param_key];
    }
  }
  return my_auth_settings;
}

// helper to map the html form parameters to a hash
function get_form_params(form) {
  var attrs = {};
  jQuery.map(form.serializeArray(), function(n, i){
      attrs[n['name']] = n['value'];
  });
  delete attrs['utf8']; // remove this jQuery param
  return attrs;
}

// This maps our pseudo array hash structure into a true javascript array value
function serialize_params(params) {
  formatted_params = {};
  jQuery.map(params, function(value, key){
    if(key.match(/\[\_array\_\d+\]$/)) {
      real_key_name = key.replace(/\[\_array\_\d+\]$/, '');
      if(formatted_params[real_key_name]){
        formatted_params[real_key_name].push(value);
      }
      else {
        formatted_params[real_key_name] = [value];
      }
    }
    else {
      formatted_params[key] = value;
    }
  });
  return formatted_params;
}
